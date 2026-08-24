"""
test_api.py — End-to-End Test Suite for FastAPI Endpoints (F1–F10)
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_score_endpoint():
    payload = {
        "merchant_id": "M1001",
        "merchant_name": "Aravali Retail",
        "amount": 25000,
        "vpa": "user@ybl",
        "collect_request": True,
        "is_new_device": True,
    }
    # Warmup call
    client.post("/score", json=payload)

    # Measured call
    resp = client.post("/score", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "composite_score" in data
    assert "band" in data
    assert "reasons" in data
    assert "latency_ms" in data
    assert data["latency_ms"] < 200.0


def test_precision_recall_endpoint():
    resp = client.get("/precision-recall?threshold=65")
    assert resp.status_code == 200
    data = resp.json()
    assert data["threshold"] == 65.0
    assert "precision" in data
    assert "recall" in data
    assert "net_impact" in data


def test_ring_endpoints():
    resp = client.get("/rings")
    assert resp.status_code == 200
    assert "rings" in resp.json()

    resp_graph = client.get("/graph")
    assert resp_graph.status_code == 200
    assert "nodes" in resp_graph.json()


def test_review_queue_endpoints():
    resp = client.get("/queue")
    assert resp.status_code == 200
    assert "cases" in resp.json()


def test_feedback_and_metrics_endpoints():
    fb_payload = {
        "tx_id": "TX-API-TEST-99",
        "decision": "confirmed_fraud",
        "analyst": "tester",
        "notes": "Verified fraud pattern",
    }
    resp = client.post("/feedback", json=fb_payload)
    assert resp.status_code == 200

    resp_metrics = client.get("/feedback/metrics")
    assert resp_metrics.status_code == 200
    assert "total_reviewed" in resp_metrics.json()
