"""
test_review_queue.py — Unit Tests for F9 HITL Review Queue & LLM Summaries
"""

from models.review_queue import (
    ReviewQueue,
    generate_fallback_summary,
    get_review_queue,
)


def test_review_case_creation_and_listing():
    rq = get_review_queue()
    scored_tx = {
        "tx_id": "TX-RQ-001",
        "merchant_name": "Test Merchant",
        "amount": 45000,
        "composite_score": 88,
        "band": "danger",
        "reasons": [{"label": "New device", "weight": 18}],
        "rule_flags": ["new_device"],
    }

    case = rq.add_case(scored_tx)
    assert case.case_id == "CASE-TX-RQ-001"
    assert case.priority == "high"
    assert case.status == "pending"

    cases = rq.list_cases(status="pending")
    assert any(c["case_id"] == "CASE-TX-RQ-001" for c in cases)


def test_deterministic_fallback_summary():
    case_data = {
        "tx_id": "TX-RQ-002",
        "merchant_name": "Koshur Traders",
        "amount": 32000,
        "composite_score": 75,
        "band": "danger",
        "reasons": [
            {"label": "Collect-request from low-trust VPA", "weight": 20},
            {"label": "Geo mismatch", "weight": 22},
        ],
        "rule_flags": ["upi_low_trust_vpa", "geo_mismatch"],
        "ring_evidence": {"cluster_id": "RING-001"},
    }

    summary = generate_fallback_summary(case_data)
    assert "DANGER" in summary
    assert "Risk Level" in summary
    assert "TX-RQ-002" in summary
    assert "RING-001" in summary
    assert "Recommended Action" in summary
