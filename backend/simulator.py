"""
simulator.py — Background Transaction Stream
=============================================
Runs in a background asyncio task (started by FastAPI lifespan).
Every ~4 seconds it:
  1. Generates a new synthetic transaction (India-locale)
  2. Scores it via scoring_engine
  3. Appends the result to a shared in-memory deque (maxlen=200)

The /feed endpoint reads from this deque, giving the dashboard
a real-time stream of scored transactions.
"""

from __future__ import annotations

import asyncio
import logging
import math
import random
from collections import deque
from datetime import datetime
from typing import Optional

from faker import Faker

logger = logging.getLogger(__name__)
fake = Faker("en_IN")

# ── Shared in-memory feed ──────────────────────────────────────────────────
FEED: deque[dict] = deque(maxlen=200)

# ── Counters ───────────────────────────────────────────────────────────────
_tx_counter = 4000

# ── Merchant catalogue (loaded at startup) ─────────────────────────────────
_MERCHANTS: list[dict] = []
_DEFAULT_MERCHANTS = [
    {"merchant_id": "M1000", "name": "Aravali Retail Pvt Ltd",  "category": "Retail",          "chargeback_rate": 0.012},
    {"merchant_id": "M1001", "name": "Koshur Traders",           "category": "Exports",         "chargeback_rate": 0.008},
    {"merchant_id": "M1002", "name": "NimbusPay Merchant",       "category": "Fintech",         "chargeback_rate": 0.030},
    {"merchant_id": "M1003", "name": "Trishul Electronics",      "category": "Electronics",     "chargeback_rate": 0.015},
    {"merchant_id": "M1004", "name": "Deccan Fresh Mart",        "category": "Food & Beverage", "chargeback_rate": 0.005},
    {"merchant_id": "M1005", "name": "Orbit Mobility",           "category": "Logistics",       "chargeback_rate": 0.009},
    {"merchant_id": "M1006", "name": "Vertex Apparel Co.",       "category": "Apparel",         "chargeback_rate": 0.011},
    {"merchant_id": "M1007", "name": "Sundarban Exports",        "category": "Exports",         "chargeback_rate": 0.022},
    {"merchant_id": "M1008", "name": "Nilgiri Foods",            "category": "Food & Beverage", "chargeback_rate": 0.004},
    {"merchant_id": "M1009", "name": "Copper Kettle Café",       "category": "Food & Beverage", "chargeback_rate": 0.003},
    {"merchant_id": "M1010", "name": "Zenith Fintech Services",  "category": "Fintech",         "chargeback_rate": 0.040},
    {"merchant_id": "M1011", "name": "Bhairav Hardware",         "category": "Retail",          "chargeback_rate": 0.007},
]

LOW_TRUST_VPA_SUFFIXES = ["@ybl", "@paytm", "@ibl", "@axl", "@oksbi"]
TRUSTED_VPA_SUFFIXES   = ["@okhdfcbank", "@okicici", "@okaxis", "@upi"]
IP_BLACKLIST_SAMPLE    = ["185.220.101.42", "45.142.212.100", "104.244.78.32"]


def _load_merchants() -> None:
    global _MERCHANTS
    from pathlib import Path
    csv_path = Path(__file__).parent / "data" / "merchants.csv"
    if csv_path.exists():
        import pandas as pd
        df = pd.read_csv(csv_path)
        _MERCHANTS = df[["merchant_id", "name", "category", "rolling_chargeback_rate"]].rename(
            columns={"rolling_chargeback_rate": "chargeback_rate"}
        ).to_dict("records")
        logger.info("[Simulator] Loaded %d merchants from CSV.", len(_MERCHANTS))
    else:
        _MERCHANTS = _DEFAULT_MERCHANTS
        logger.info("[Simulator] Using %d default merchants.", len(_MERCHANTS))


# Planted fraud ring entity pools
RING_DEVICES = ["DEV-RING-01", "DEV-RING-02", "DEV-RING-03"]
RING_IPS = ["103.211.45.12", "185.220.101.42", "45.142.212.100"]

def _make_synthetic_tx() -> dict:
    """Generate a single random transaction feature set with planted fraud rings."""
    global _tx_counter
    _tx_counter += 1

    m = random.choice(_MERCHANTS or _DEFAULT_MERCHANTS)

    # Fraud injection rate: ~18% of simulated transactions
    is_fraud_sim = random.random() < 0.18
    is_ring_sim = is_fraud_sim and (random.random() < 0.40)

    amount = (
        random.randint(800, 75_000) if is_fraud_sim else random.randint(200, 48_000)
    )

    if is_ring_sim:
        ip = random.choice(RING_IPS)
        device_id = random.choice(RING_DEVICES)
    else:
        ip = (
            random.choice(IP_BLACKLIST_SAMPLE) if (is_fraud_sim and random.random() < 0.20)
            else fake.ipv4()
        )
        device_id = f"DEV-{random.randint(100, 999)}"

    is_new_device    = (random.random() < 0.6)  if is_fraud_sim else (random.random() < 0.08)
    geo_mismatch     = (random.random() < 0.65) if is_fraud_sim else (random.random() < 0.05)
    collect_request  = (random.random() < 0.50) if is_fraud_sim else False
    sim_change       = (random.random() < 0.40) if is_fraud_sim else False
    category_anomaly = (random.random() < 0.45) if is_fraud_sim else False
    velocity_count   = random.randint(3, 7)      if is_fraud_sim else random.randint(0, 2)

    if random.random() < 0.6:
        suffix = random.choice(LOW_TRUST_VPA_SUFFIXES if is_fraud_sim else TRUSTED_VPA_SUFFIXES)
        vpa = f"{fake.user_name()}{suffix}"
    else:
        vpa = ""

    return {
        "tx_id":              f"TX-{_tx_counter}",
        "merchant_id":        m["merchant_id"],
        "merchant_name":      m["name"],
        "merchant_category":  m["category"],
        "amount":             amount,
        "ip":                 ip,
        "vpa":                vpa,
        "device_id":          device_id,
        "user_id":            f"U-{random.randint(1000, 1050)}" if is_ring_sim else f"U-{random.randint(2000, 9999)}",
        "velocity_count":     velocity_count,
        "is_new_device":      is_new_device,
        "geo_mismatch":       geo_mismatch,
        "collect_request":    collect_request,
        "sim_change_velocity":sim_change,
        "category_anomaly":   category_anomaly,
        "chargeback_rate":    float(m.get("chargeback_rate", 0.01)),
        "is_synthetic":       True,
    }


async def simulation_loop(interval: float = 4.0) -> None:
    """Async loop that generates + scores a transaction every `interval` seconds."""
    _load_merchants()
    logger.info("[Simulator] Starting transaction stream (interval=%.1fs)", interval)

    # Pre-populate feed with 8 transactions
    from scoring_engine import score_transaction
    for _ in range(8):
        tx_features = _make_synthetic_tx()
        try:
            result = score_transaction(**tx_features)
            FEED.appendleft(result)
        except Exception as exc:
            logger.warning("[Simulator] Pre-populate error: %s", exc)

    while True:
        await asyncio.sleep(interval)
        tx_features = _make_synthetic_tx()
        try:
            from scoring_engine import score_transaction
            result = score_transaction(**tx_features)
            result["fresh"] = True
            FEED.appendleft(result)
            logger.debug("[Simulator] Scored %s → %s (band=%s)",
                         result["tx_id"], result["composite_score"], result["band"])
        except Exception as exc:
            logger.warning("[Simulator] Scoring error: %s", exc)
