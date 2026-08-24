"""
merchant_profiler.py — F2 Rolling Merchant Risk Profile
========================================================
Maintains a rolling 30-day aggregated risk profile per merchant and a
7-point trend series (one point per 4-day window) for the frontend chart.

State is kept in-memory (dict keyed by merchant_id).
In a production system this would read from PostgreSQL.
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# How many trend data points to show in the frontend chart
TREND_POINTS = 7

# Risk-weight coefficients (tunable)
_CB_WEIGHT     = 60.0   # chargeback rate contribution
_VOL_WEIGHT    = 20.0   # volume anomaly contribution (normalised)
_FLAG_WEIGHT   = 20.0   # proportion of flagged transactions


class MerchantProfile:
    """Per-merchant rolling statistics."""

    def __init__(self, merchant_id: str, name: str, category: str, chargeback_rate: float = 0.0) -> None:
        self.merchant_id        = merchant_id
        self.name               = name
        self.category           = category
        self.base_chargeback    = chargeback_rate

        # Transaction ring buffers — 30 days
        self._tx_window: deque[dict] = deque()
        # Initialize 14-day rolling trend with realistic initial series
        base_score = max(12.0, min(88.0, chargeback_rate * 100))
        import random
        self._trend: list[float] = [
            round(max(5.0, min(98.0, base_score + (i * 0.4 - 2.8) + (random.random() * 8.0 - 4.0))), 1)
            for i in range(14)
        ]
        self._session_scores: list[float] = []

        self.total_tx_count      = 0
        self.flagged_tx_count    = 0
        self.total_volume        = 0.0
        self.last_updated: Optional[datetime] = None

    # ------------------------------------------------------------------
    def record_transaction(self, tx_score: float, amount: float, ts: Optional[datetime] = None) -> None:
        """Add a scored transaction to the rolling window."""
        ts = ts or datetime.now()
        self._tx_window.append({"score": tx_score, "amount": amount, "ts": ts})
        self._prune_window(ts)

        self.total_tx_count += 1
        if tx_score >= 70:
            self.flagged_tx_count += 1
        self.total_volume += amount
        self.last_updated = ts

        # Accumulate this session's score for trend
        self._session_scores.append(tx_score)
        if len(self._session_scores) >= 3:
            # Rotate trend
            session_avg = sum(self._session_scores) / len(self._session_scores)
            self._trend = (self._trend + [round(session_avg, 1)])[-14:]
            self._session_scores = []

    def _prune_window(self, now: datetime) -> None:
        cutoff = now - timedelta(days=30)
        while self._tx_window and self._tx_window[0]["ts"] < cutoff:
            self._tx_window.popleft()

    # ------------------------------------------------------------------
    @property
    def risk_score(self) -> float:
        """Rolling composite risk score 0–100."""
        if not self._tx_window:
            return round(self.base_chargeback * 100, 1)

        txs = list(self._tx_window)
        flagged_rate = sum(1 for t in txs if t["score"] >= 70) / len(txs)
        avg_score    = sum(t["score"] for t in txs) / len(txs)

        score = (
            self.base_chargeback * _CB_WEIGHT
            + flagged_rate        * _FLAG_WEIGHT
            + (avg_score / 100)   * _VOL_WEIGHT
        )
        return round(min(100.0, score), 1)

    @property
    def trend(self) -> list[dict]:
        """14-day trend series formatted for frontend Recharts line chart."""
        return [
            {"day": i + 1, "score": round(v, 1)}
            for i, v in enumerate(self._trend)
        ]

    def to_dict(self) -> dict:
        return {
            "merchant_id":    self.merchant_id,
            "name":           self.name,
            "category":       self.category,
            "risk_score":     self.risk_score,
            "chargeback_rate": round(self.base_chargeback * 100, 2),
            "flagged_count":  self.flagged_tx_count,
            "total_tx_count": self.total_tx_count,
            "total_volume":   round(self.total_volume, 2),
            "trend":          self.trend,
            "last_updated":   self.last_updated.isoformat() if self.last_updated else None,
        }


# ---------------------------------------------------------------------------
# Module-level registry
# ---------------------------------------------------------------------------
_registry: dict[str, MerchantProfile] = {}


def get_or_create(merchant_id: str, name: str = "", category: str = "", chargeback_rate: float = 0.0) -> MerchantProfile:
    if merchant_id not in _registry:
        _registry[merchant_id] = MerchantProfile(merchant_id, name, category, chargeback_rate)
    return _registry[merchant_id]


def _ensure_seeded() -> None:
    """Ensure registry has merchant profiles loaded."""
    if _registry:
        return
    from pathlib import Path
    data_dir = Path(__file__).parent.parent / "data"
    csv_path = data_dir / "merchants.csv"
    if csv_path.exists():
        seed_from_csv(str(csv_path))
    if not _registry:
        # Fallback 12 default merchants if CSV not yet created
        defaults = [
            ("M1001", "Aravali Retail Pvt Ltd", "Retail", 0.015),
            ("M1002", "Koshur Traders", "Handicrafts", 0.042),
            ("M1003", "NimbusPay Merchant", "Digital Services", 0.088),
            ("M1004", "Trishul Electronics", "Electronics", 0.021),
            ("M1005", "Deccan Fresh Mart", "Grocery", 0.008),
            ("M1006", "Orbit Mobility", "Travel & Taxi", 0.065),
            ("M1007", "Vertex Apparel Co.", "Fashion", 0.019),
            ("M1008", "Sundarban Exports", "Logistics", 0.034),
            ("M1009", "Nilgiri Foods", "F&B", 0.011),
            ("M1010", "Copper Kettle Café", "Hospitality", 0.005),
            ("M1011", "Zenith Fintech Services", "Financials", 0.075),
            ("M1012", "Bhairav Hardware", "Hardware", 0.014),
        ]
        for mid, name, cat, cb in defaults:
            get_or_create(mid, name, cat, cb)


def get_profile(merchant_id: str) -> Optional[MerchantProfile]:
    _ensure_seeded()
    return _registry.get(merchant_id)


def all_profiles() -> list[dict]:
    _ensure_seeded()
    return [p.to_dict() for p in _registry.values()]


def seed_from_csv(path: str) -> None:
    """Pre-populate registry from merchants.csv (called at startup)."""
    import pandas as pd
    try:
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            get_or_create(
                merchant_id    = row["merchant_id"],
                name           = row.get("name", row["merchant_id"]),
                category       = row.get("category", ""),
                chargeback_rate= float(row.get("rolling_chargeback_rate", 0.0)),
            )
        logger.info("[MerchantProfiler] Seeded %d merchant profiles.", len(_registry))
    except Exception as exc:
        logger.warning("[MerchantProfiler] Could not seed from CSV: %s", exc)
