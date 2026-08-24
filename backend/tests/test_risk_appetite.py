"""
test_risk_appetite.py — Unit Tests for F8 Risk Appetite & Cost Model
"""

from models.ml_scorer import get_scorer


def test_precision_recall_at_threshold():
    scorer = get_scorer()
    res = scorer.precision_recall_at_threshold(
        threshold=50.0,
        fp_cost=500.0,
        tp_benefit=12500.0,
        fn_cost=12500.0,
    )

    assert "precision" in res
    assert "recall" in res
    assert "tp" in res
    assert "fp" in res
    assert "net_impact" in res
    assert res["fp_cost"] == round(res["fp"] * 500.0, 2)
    assert res["fraud_prevented"] == round(res["tp"] * 12500.0, 2)


def test_threshold_sensitivity():
    scorer = get_scorer()
    strict_res = scorer.precision_recall_at_threshold(threshold=20.0)
    lenient_res = scorer.precision_recall_at_threshold(threshold=80.0)

    # Strict threshold (lower cutoff) captures more fraud (higher recall or TP)
    assert strict_res["tp"] >= lenient_res["tp"]
