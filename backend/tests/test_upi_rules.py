"""
test_upi_rules.py — Unit Tests for F7 UPI Fraud Detection Rules
"""

from models.upi_detector import (
    UPI_CONFIG,
    evaluate_upi_signals,
    update_upi_config,
)


def test_collect_request_abuse_signal():
    features = {
        "vpa": "scammer@ybl",
        "collect_request": True,
        "amount": 25000,
        "velocity_count": 4,
    }

    res = evaluate_upi_signals(features)
    assert res.triggered is True
    assert "upi_collect_abuse_high_val" in res.flags or "upi_collect_low_trust_vpa" in res.flags
    assert res.score_addition > 0.0


def test_sim_change_velocity_account_takeover():
    features = {
        "is_new_device": True,
        "sim_change_velocity": True,
    }

    res = evaluate_upi_signals(features)
    assert res.triggered is True
    assert "upi_account_takeover_pattern" in res.flags
    assert res.score_addition >= 30.0


def test_upi_toggle_configuration():
    update_upi_config({"upi_collect_rule_enabled": False})

    features = {
        "vpa": "scammer@ybl",
        "collect_request": True,
        "amount": 25000,
    }

    res = evaluate_upi_signals(features)
    assert "upi_collect_abuse_high_val" not in res.flags

    # Re-enable
    update_upi_config({"upi_collect_rule_enabled": True})
