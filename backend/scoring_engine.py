"""
scoring_engine.py — F1-F10 Composite Scoring Orchestrator
=========================================================
Ties together:
  1. Rule Engine       (F3) — deterministic hard filters & UPI signals (F7)
  2. Ring Detector     (F6) — graph-based fraud ring detection boost
  3. ML Scorer         (F1) — XGBoost probabilistic score
  4. Explainer         (F5) — SHAP feature attributions
  5. Merchant Profiler (F2) — updates rolling profile after scoring
  6. Review Queue      (F9) — auto-populates review queue for flagged cases

Score formula
-------------
  rule_score  = sum of rule weights (0–100 clamped)
  ml_score    = xgb_proba × 100          (0–100)
  ring_boost  = graph collusion risk contribution (0–30)
  composite   = 0.40 × rule_score + 0.45 × ml_score + ring_boost
              — hard-block rules set a floor of 88

Band mapping  composite → band:
  ≥ 70  →  danger   (HIGH RISK)
  ≥ 40  →  watch    (WATCH)
  <  40  →  safe    (LOW)
"""

from __future__ import annotations

import logging
import math
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


def score_transaction(
    tx_id: str,
    merchant_id: str,
    merchant_name: str,
    merchant_category: str,
    amount: float,
    ip: str,
    vpa: str,
    device_id: str,
    velocity_count: int,
    is_new_device: bool,
    geo_mismatch: bool,
    collect_request: bool,
    sim_change_velocity: bool,
    category_anomaly: bool,
    chargeback_rate: float = 0.0,
    timestamp: Optional[datetime] = None,
    user_id: Optional[str] = None,
    is_synthetic: bool = True,
    **kwargs,
) -> dict:
    """
    Score a single transaction and return the full result dict.
    """
    ts = timestamp or datetime.now()

    # ── 1. Build feature dict ───────────────────────────────────────────────
    features = {
        "tx_id":               tx_id,
        "merchant_id":         merchant_id,
        "merchant_name":       merchant_name,
        "merchant_category":   merchant_category,
        "user_id":             user_id or f"U-{tx_id}",
        "ip":                 ip,
        "vpa":                vpa,
        "device_id":          device_id,
        "amount":             amount,
        "amount_log":         math.log1p(amount),
        "velocity_count":     velocity_count,
        "velocity_spike":     int(velocity_count >= 3),
        "is_new_device":      int(is_new_device),
        "geo_mismatch":       int(geo_mismatch),
        "blacklisted_ip":     0,
        "collect_request":    int(collect_request),
        "sim_change_velocity":int(sim_change_velocity),
        "category_anomaly":   int(category_anomaly),
        "chargeback_rate":    chargeback_rate,
    }

    # ── 2. Rule engine (F3 + F7 UPI) ────────────────────────────────────────
    from models.rule_engine import run_rules
    from models.upi_detector import evaluate_upi_signals

    rule_result = run_rules(features)
    upi_result = evaluate_upi_signals(features)

    # Combine rules + UPI
    combined_flags = list(set(rule_result.flags + upi_result.flags))
    combined_reasons = list(rule_result.reasons) + list(upi_result.reasons)
    rule_score = min(100, rule_result.score_addition + int(upi_result.score_addition))

    if "blacklist_ip" in combined_flags:
        features["blacklisted_ip"] = 1

    # ── 3. Graph Ring Detection (F6) ────────────────────────────────────────
    from models.ring_detector import get_ring_detector
    ring_detector = get_ring_detector()
    ring_boost, ring_reasons = ring_detector.get_ring_risk_boost(features)

    # ── 4. ML scorer (F1) ───────────────────────────────────────────────────
    from models.ml_scorer import get_scorer
    try:
        ml_proba = get_scorer().score(features)
    except Exception as exc:
        logger.warning("[ScoringEngine] ML scorer failed: %s — using rule score only", exc)
        ml_proba = rule_score / 100.0

    ml_score = round(ml_proba * 100, 1)

    # ── 5. Composite blend ──────────────────────────────────────────────────
    composite = 0.40 * rule_score + 0.45 * ml_score + ring_boost
    if rule_result.hard_block:
        composite = max(composite, 88.0)
    composite = round(min(100.0, max(0.0, composite)))

    band = "danger" if composite >= 70 else ("watch" if composite >= 40 else "safe")

    # ── 6. Explainability (F5) ──────────────────────────────────────────────
    from models.explainer import get_explainer
    try:
        ml_reasons = get_explainer().explain(features)
    except Exception as exc:
        logger.warning("[ScoringEngine] SHAP explain failed: %s", exc)
        ml_reasons = []

    # Merge reasons: deterministic rules & graph evidence first, then SHAP
    all_reasons = combined_reasons + ring_reasons + [
        r for r in ml_reasons if r["label"] not in {cr["label"] for cr in combined_reasons}
    ]
    all_reasons.sort(key=lambda x: x["weight"], reverse=True)
    top_reasons = all_reasons[:6]

    # ── 7. Update merchant profile (F2) ─────────────────────────────────────
    from models.merchant_profiler import get_or_create
    profile = get_or_create(
        merchant_id     = merchant_id,
        name            = merchant_name,
        category        = merchant_category,
        chargeback_rate = chargeback_rate,
    )
    profile.record_transaction(float(composite), float(amount), ts)

    res = {
        "tx_id":           tx_id,
        "merchant_id":     merchant_id,
        "merchant_name":   merchant_name,
        "amount":          int(amount),
        "timestamp":       ts.isoformat(),
        "rule_score":      rule_score,
        "ml_score":        ml_score,
        "ring_boost":      round(ring_boost, 1),
        "composite_score": composite,
        "band":            band,
        "reasons":         top_reasons,
        "rule_flags":      combined_flags,
        "hard_block":      rule_result.hard_block,
        "vpa":             vpa,
        "device_id":       device_id,
        "ip":              ip,
        "is_synthetic":    is_synthetic,
    }

    # Add transaction to ring detector graph
    ring_detector.add_transaction(res)

    # ── 8. HITL Review Queue auto-creation (F9) ─────────────────────────────
    if band in ("danger", "watch"):
        from models.review_queue import get_review_queue
        rq = get_review_queue()
        rq.add_case(res, merchant_profile=profile.to_dict())

    return res
