"""
review_queue.py — F9 Human-in-the-Loop Review Queue & LLM Summarizer
======================================================================
Stores flagged transactions as review cases and generates intelligent case
summaries using LLM (OpenAI/Gemini/Anthropic if env key is available) with a
robust deterministic fallback.

Public API:
-----------
  ReviewQueue.add_case(scored_tx, merchant_profile, ring_evidence)
  ReviewQueue.list_cases(status, priority, limit)
  ReviewQueue.get_case(case_id)
  ReviewQueue.update_case_decision(case_id, decision, analyst, notes)
  generate_llm_case_summary(case_data)
"""

from __future__ import annotations

import json
import logging
import os
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class ReviewCase:
    def __init__(self, tx_id: str, case_data: dict) -> None:
        self.case_id = f"CASE-{tx_id}"
        self.tx_id = tx_id
        self.created_at = datetime.now().isoformat()
        self.status = "pending"  # pending | reviewing | resolved
        self.priority = "high" if case_data.get("band") == "danger" else "medium"
        self.case_data = case_data
        self.llm_summary: Optional[str] = None
        self.analyst_decision: Optional[str] = None  # false_positive | confirmed_fraud | needs_investigation
        self.analyst: Optional[str] = None
        self.notes: Optional[str] = None
        self.decided_at: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id,
            "tx_id": self.tx_id,
            "created_at": self.created_at,
            "status": self.status,
            "priority": self.priority,
            "case_data": self.case_data,
            "llm_summary": self.llm_summary or generate_fallback_summary(self.case_data),
            "analyst_decision": self.analyst_decision,
            "analyst": self.analyst,
            "notes": self.notes,
            "decided_at": self.decided_at,
        }


class ReviewQueue:
    def __init__(self) -> None:
        self.cases: dict[str, ReviewCase] = {}

    def add_case(self, scored_tx: dict, merchant_profile: Optional[dict] = None, ring_evidence: Optional[dict] = None) -> ReviewCase:
        tx_id = scored_tx.get("tx_id", f"TX-{int(datetime.now().timestamp())}")

        payload = dict(scored_tx)
        if merchant_profile:
            payload["merchant_profile"] = merchant_profile
        if ring_evidence:
            payload["ring_evidence"] = ring_evidence

        case = ReviewCase(tx_id, payload)

        # Generate initial summary (deterministic fast fallback or async LLM)
        case.llm_summary = generate_fallback_summary(payload)
        self.cases[case.case_id] = case
        return case

    def list_cases(self, status: Optional[str] = None, priority: Optional[str] = None, limit: int = 50) -> list[dict]:
        res = list(self.cases.values())
        if status:
            res = [c for c in res if c.status == status]
        if priority:
            res = [c for c in res if c.priority == priority]
        
        # Sort newest & highest priority first
        res.sort(key=lambda x: (x.priority == "high", x.created_at), reverse=True)
        return [c.to_dict() for c in res[:limit]]

    def get_case(self, case_id: str) -> Optional[dict]:
        c = self.cases.get(case_id)
        return c.to_dict() if c else None

    def update_case_decision(self, case_id: str, decision: str, analyst: str = "anonymous", notes: str = "") -> Optional[dict]:
        c = self.cases.get(case_id)
        if not c:
            return None

        c.status = "resolved"
        c.analyst_decision = decision
        c.analyst = analyst
        c.notes = notes
        c.decided_at = datetime.now().isoformat()
        return c.to_dict()


def generate_fallback_summary(case_data: dict) -> str:
    """Deterministic, structured fallback case summary when LLM API key is not present."""
    band = case_data.get("band", "safe").upper()
    score = case_data.get("composite_score", 0)
    tx_id = case_data.get("tx_id", "Unknown")
    amount = case_data.get("amount", 0)
    merchant = case_data.get("merchant_name", "Merchant")
    reasons = case_data.get("reasons", [])
    rule_flags = case_data.get("rule_flags", [])
    ring_evidence = case_data.get("ring_evidence", {})

    lines = [
        f"**Risk Level**: {band} (Score: {score}/100)",
        f"**Transaction Context**: Transaction {tx_id} for ₹{amount:,} at {merchant}.",
        "",
        "**Key Risk Drivers**:"
    ]

    for r in reasons[:4]:
        lines.append(f"• {r.get('label', 'Flagged factor')} (+{r.get('weight', 0)} pts)")

    if ring_evidence and ring_evidence.get("cluster_id"):
        lines.append(f"• Linked to suspicious collusion network cluster ({ring_evidence.get('cluster_id')})")

    if rule_flags:
        lines.append(f"• Hard rules triggered: {', '.join(rule_flags)}")

    lines.extend([
        "",
        "**Recommended Action**:",
        "Inspect associated entity identifiers (device/IP/VPA) and verify customer activity before approval."
    ])

    return "\n".join(lines)


def _load_env_file() -> None:
    """Load variables from .env file if present."""
    for p in (Path(__file__).parent.parent / ".env", Path(__file__).parent.parent.parent / ".env"):
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as fh:
                    for line in fh:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip('"').strip("'")
            except Exception:
                pass

def generate_llm_case_summary(case_data: dict) -> str:
    """
    Generate case summary using LLM if GEMINI_API_KEY or OPENAI_API_KEY is available.
    Otherwise returns fallback summary.
    """
    _load_env_file()

    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        return generate_fallback_summary(case_data)

    # 1. Try Gemini API
    if gemini_key:
        for model in ("gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"):
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                prompt = (
                    "You are a senior fraud analyst. Provide a brief 2-sentence summary of this transaction risk:\n"
                    f"{json.dumps(case_data, default=str)}"
                )
                req_payload = json.dumps({
                    "contents": [{"parts": [{"text": prompt}]}]
                }).encode("utf-8")

                req = urllib.request.Request(
                    url,
                    data=req_payload,
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=10.0) as resp:
                    res = json.loads(resp.read().decode("utf-8"))
                    text = res["candidates"][0]["content"]["parts"][0]["text"]
                    if text:
                        return text.strip()
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="ignore")
                logger.warning("[ReviewQueue] Gemini HTTP %s for model %s: %s", exc.code, model, body)
            except Exception as exc:
                logger.warning("[ReviewQueue] Gemini API call failed for model %s (%s)", model, exc)

    # 2. Try OpenAI API
    if openai_key:
        try:
            req_data = json.dumps({
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a senior fraud analyst assistant. Summarize transaction risk concisely."},
                    {"role": "user", "content": f"Summarize this fraud case:\n{json.dumps(case_data, default=str)}"}
                ],
                "max_tokens": 200,
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=req_data,
                headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                return res["choices"][0]["message"]["content"].strip()
        except Exception as exc:
            logger.warning("[ReviewQueue] OpenAI API call failed (%s) — using fallback", exc)

    return generate_fallback_summary(case_data)


# Singleton accessor
_QUEUE_SINGLETON: Optional[ReviewQueue] = None

def get_review_queue() -> ReviewQueue:
    global _QUEUE_SINGLETON
    if _QUEUE_SINGLETON is None:
        _QUEUE_SINGLETON = ReviewQueue()
    return _QUEUE_SINGLETON
