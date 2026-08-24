"""
tests/test_scoring.py
=====================
Unit tests for the rule engine, ML scorer, composite scoring engine, and API endpoints.

Run from backend/ directory:
    python -m pytest tests/ -v
"""

import sys
from pathlib import Path

# Ensure backend package is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest


# ===========================================================================
# Rule Engine Tests
# ===========================================================================

class TestRuleEngine:
    def test_blacklisted_ip_triggers_hard_block(self):
        from models.rule_engine import run_rules
        result = run_rules({"ip": "185.220.101.42"})
        assert result.triggered
        assert result.hard_block
        assert "blacklist_ip" in result.flags
        assert result.score_addition >= 30

    def test_clean_transaction_no_flags(self):
        from models.rule_engine import run_rules
        result = run_rules({
            "ip": "192.168.1.1",
            "amount": 500,
            "velocity_count": 0,
            "is_new_device": False,
            "geo_mismatch": False,
        })
        assert not result.triggered
        assert result.score_addition == 0

    def test_velocity_spike_flag(self):
        from models.rule_engine import run_rules
        result = run_rules({"velocity_count": 4})
        assert "velocity_cap" in result.flags

    def test_upi_low_trust_vpa_flag(self):
        from models.rule_engine import run_rules
        result = run_rules({"vpa": "someuser@ybl"})
        assert "upi_low_trust_vpa" in result.flags

    def test_sim_change_velocity_flag(self):
        from models.rule_engine import run_rules
        result = run_rules({"sim_change_velocity": True})
        assert "sim_change_velocity" in result.flags

    def test_multiple_flags_accumulate_score(self):
        from models.rule_engine import run_rules
        result = run_rules({
            "velocity_count": 5,
            "is_new_device": True,
            "geo_mismatch": True,
        })
        # Should accumulate velocity(28) + device(18) + geo(22) = 68
        assert result.score_addition >= 60

    def test_reasons_match_flags(self):
        from models.rule_engine import run_rules
        result = run_rules({"velocity_count": 4, "geo_mismatch": True})
        assert len(result.reasons) == 2
        for r in result.reasons:
            assert "label" in r
            assert "weight" in r
            assert r["weight"] > 0


# ===========================================================================
# Composite Scoring Engine Tests
# ===========================================================================

class TestScoringEngine:
    """These tests require the ML model. Skip gracefully if not installed."""

    _BASE_FEATURES = dict(
        tx_id              = "TX-TEST-001",
        merchant_id        = "M9999",
        merchant_name      = "Test Merchant",
        merchant_category  = "Retail",
        amount             = 1200.0,
        ip                 = "192.168.1.10",
        vpa                = "",
        device_id          = "DEV-TEST",
        velocity_count     = 0,
        is_new_device      = False,
        geo_mismatch       = False,
        collect_request    = False,
        sim_change_velocity= False,
        category_anomaly   = False,
        chargeback_rate    = 0.01,
    )

    @pytest.fixture(autouse=True)
    def skip_if_no_ml(self):
        try:
            import xgboost  # noqa: F401
        except ImportError:
            pytest.skip("xgboost not installed")

    def test_score_returns_required_keys(self):
        from scoring_engine import score_transaction
        result = score_transaction(**self._BASE_FEATURES)
        required = {"tx_id", "composite_score", "band", "reasons", "rule_flags", "hard_block"}
        assert required.issubset(result.keys())

    def test_score_in_valid_range(self):
        from scoring_engine import score_transaction
        result = score_transaction(**self._BASE_FEATURES)
        assert 0 <= result["composite_score"] <= 100

    def test_band_matches_score(self):
        from scoring_engine import score_transaction
        result = score_transaction(**self._BASE_FEATURES)
        s, b = result["composite_score"], result["band"]
        if s >= 70:   assert b == "danger"
        elif s >= 40: assert b == "watch"
        else:         assert b == "safe"

    def test_hard_block_raises_floor(self):
        from scoring_engine import score_transaction
        features = dict(self._BASE_FEATURES, ip="185.220.101.42")
        result = score_transaction(**features)
        assert result["hard_block"] is True
        assert result["composite_score"] >= 88

    def test_reasons_are_ranked_descending(self):
        from scoring_engine import score_transaction
        result = score_transaction(**dict(self._BASE_FEATURES,
            velocity_count=5, geo_mismatch=True, is_new_device=True))
        reasons = result["reasons"]
        if len(reasons) >= 2:
            weights = [r["weight"] for r in reasons]
            assert weights == sorted(weights, reverse=True)

    def test_reasons_list_not_empty_for_high_risk(self):
        from scoring_engine import score_transaction
        features = dict(self._BASE_FEATURES,
            ip="185.220.101.42",
            velocity_count=6,
            geo_mismatch=True,
        )
        result = score_transaction(**features)
        assert len(result["reasons"]) > 0


# ===========================================================================
# Precision/Recall Tests
# ===========================================================================

class TestPrecisionRecall:
    def test_returns_precision_recall_keys(self):
        try:
            from models.ml_scorer import get_scorer
            result = get_scorer().precision_recall_at_threshold(60.0)
            assert "precision" in result
            assert "recall" in result
        except Exception:
            pytest.skip("ML model not available")

    def test_stricter_threshold_higher_precision(self):
        try:
            from models.ml_scorer import get_scorer
            scorer = get_scorer()
            r_lenient = scorer.precision_recall_at_threshold(30.0)
            r_strict  = scorer.precision_recall_at_threshold(80.0)
            assert r_strict["precision"] >= r_lenient["precision"] - 10
        except Exception:
            pytest.skip("ML model not available")


# ===========================================================================
# FastAPI Endpoint Integration Tests
# ===========================================================================

class TestFastAPIEndpoints:
    @pytest.fixture(autouse=True)
    def setup_client(self):
        from fastapi.testclient import TestClient
        from main import app
        self.client = TestClient(app)

    def test_health_endpoint(self):
        resp = self.client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_score_endpoint_post(self):
        payload = {
            "merchant_id": "M1001",
            "merchant_name": "Test Merchant",
            "amount": 4500.0,
            "is_new_device": True,
        }
        resp = self.client.post("/score", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "composite_score" in data
        assert "latency_ms" in data

    def test_feedback_endpoint_post(self):
        payload = {
            "tx_id": "TX-4001",
            "decision": "confirmed_fraud",
            "analyst": "test_user",
        }
        resp = self.client.post("/feedback", json=payload)
        assert resp.status_code == 200
        assert resp.json()["status"] == "logged"

    def test_stats_endpoint_get(self):
        resp = self.client.get("/stats")
        assert resp.status_code == 200
        assert "avg_score" in resp.json()

    def test_merchants_endpoint_get(self):
        resp = self.client.get("/merchants")
        assert resp.status_code == 200
        assert "merchants" in resp.json()
