"""
test_ring_detection.py — Unit Tests for F6 Fraud Ring Detection
"""

from models.ring_detector import RingDetector, get_ring_detector


def test_graph_construction_and_ring_detection():
    detector = RingDetector(min_cluster_size=2, min_shared_identifiers=1)
    detector.clear()

    # Add transactions sharing device DEV-RING-99 and IP 1.2.3.4
    tx1 = {
        "tx_id": "TX-TEST-01",
        "merchant_id": "M1001",
        "user_id": "U-100",
        "device_id": "DEV-RING-99",
        "ip": "1.2.3.4",
        "vpa": "user1@ybl",
        "amount": 50000,
        "composite_score": 85,
    }
    tx2 = {
        "tx_id": "TX-TEST-02",
        "merchant_id": "M1002",
        "user_id": "U-101",
        "device_id": "DEV-RING-99",
        "ip": "1.2.3.4",
        "vpa": "user2@paytm",
        "amount": 42000,
        "composite_score": 78,
    }

    detector.add_transaction(tx1)
    detector.add_transaction(tx2)

    rings = detector.detect_rings()
    assert len(rings) >= 1
    ring = rings[0]
    assert ring["risk_score"] >= 60.0
    assert ring["merchant_count"] == 2
    assert "DEV-RING-99" in ring["shared_identifiers"] or "1.2.3.4" in ring["shared_identifiers"]


def test_ring_risk_boost():
    detector = get_ring_detector()
    detector.clear()

    tx1 = {
        "tx_id": "TX-BOOST-01",
        "merchant_id": "M1001",
        "user_id": "U-BOOST",
        "device_id": "DEV-RING-BOOST",
        "ip": "10.0.0.1",
        "amount": 60000,
        "composite_score": 90,
    }
    tx2 = {
        "tx_id": "TX-BOOST-02",
        "merchant_id": "M1003",
        "user_id": "U-BOOST-2",
        "device_id": "DEV-RING-BOOST",
        "ip": "10.0.0.1",
        "amount": 45000,
        "composite_score": 85,
    }

    detector.add_transaction(tx1)
    detector.add_transaction(tx2)
    detector.detect_rings()

    # Test boost for new transaction with same device
    new_tx = {
        "device_id": "DEV-RING-BOOST",
        "ip": "10.0.0.1",
        "user_id": "U-BOOST-3",
    }
    boost, reasons = detector.get_ring_risk_boost(new_tx)
    assert boost > 0.0
    assert len(reasons) > 0
    assert "Suspicious fraud ring" in reasons[0]["label"]
