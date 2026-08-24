"""
data_generator.py
=================
Generates synthetic labeled transaction and merchant datasets modeled on
known India payment-fraud typologies (UPI collect scams, velocity fraud,
geo-mismatch, device-change SIM-swap patterns).

Outputs
-------
data/transactions.csv   — ~2 000 rows, fraud prevalence ~15 %
data/merchants.csv      — ~60 merchant profiles

Run standalone:
    python data_generator.py
"""

from __future__ import annotations

import os
import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from faker import Faker

fake = Faker("en_IN")
rng = np.random.default_rng(42)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Merchant catalogue
# ---------------------------------------------------------------------------
CATEGORIES = [
    "Retail", "Electronics", "Food & Beverage", "Travel", "Fintech",
    "Healthcare", "Apparel", "Exports", "Logistics", "Entertainment",
]

MERCHANT_NAMES = [
    "Aravali Retail Pvt Ltd", "Koshur Traders", "NimbusPay Merchant",
    "Trishul Electronics", "Deccan Fresh Mart", "Orbit Mobility",
    "Vertex Apparel Co.", "Sundarban Exports", "Nilgiri Foods",
    "Copper Kettle Café", "Zenith Fintech Services", "Bhairav Hardware",
    "Malabar Gold Traders", "Sahyadri Organics", "Vega Mobility",
    "IndoStar Logistics", "CrestWave Healthcare", "Pratap Jewellers",
    "Skyline Hospitality", "DeltaX Fintech", "Nandini Dairy Co.",
    "Ravi Exports", "Chakra Electronics", "SunRise Travels",
    "UrbanNest Furniture",
]

LOW_TRUST_VPA_SUFFIXES = ["@ybl", "@paytm", "@ibl", "@axl", "@oksbi"]
TRUSTED_VPA_SUFFIXES   = ["@okhdfcbank", "@okicici", "@okaxis", "@upi"]

IP_BLACKLIST = {
    "185.220.101.42", "45.142.212.100", "104.244.78.32",
    "91.108.4.0", "198.98.51.189",
}


def make_merchants(n: int = 25) -> pd.DataFrame:
    rows = []
    for i, name in enumerate(MERCHANT_NAMES[:n]):
        cat = random.choice(CATEGORIES)
        onboard = fake.date_between(start_date="-3y", end_date="-30d")
        # Risky merchants: high chargeback, category anomaly flag
        is_risky = rng.random() < 0.18
        cb_rate = round(float(rng.beta(2, 25) if not is_risky else rng.beta(5, 10)), 4)
        rows.append(
            {
                "merchant_id": f"M{1000 + i:04d}",
                "name": name,
                "category": cat,
                "onboarding_date": onboard.isoformat(),
                "rolling_chargeback_rate": cb_rate,
                "rolling_volume_30d": int(rng.integers(50_000, 5_000_000)),
                "is_risky_seed": is_risky,
            }
        )
    return pd.DataFrame(rows)


def make_transactions(
    merchants: pd.DataFrame,
    n: int = 2000,
    fraud_rate: float = 0.15,
) -> pd.DataFrame:
    """Generate n synthetic transactions with realistic fraud patterns."""
    rows = []
    base_time = datetime.now() - timedelta(hours=4)

    # Pre-allocate fraud indices
    n_fraud = int(n * fraud_rate)
    fraud_idx = set(rng.choice(n, size=n_fraud, replace=False).tolist())

    # Velocity tracker: merchant_id → list[timestamps] for last 5 min
    velocity_map: dict[str, list[datetime]] = {}

    for i in range(n):
        is_fraud = i in fraud_idx
        m = merchants.sample(1).iloc[0]
        mid = m["merchant_id"]
        uid = f"U{rng.integers(1000, 9999)}"

        # Time — fraudulent transactions cluster tightly
        if is_fraud:
            tx_time = base_time + timedelta(seconds=int(rng.integers(0, 14_000)))
        else:
            tx_time = base_time + timedelta(seconds=int(rng.integers(0, 14_400)))

        # Amount — fraud skews higher
        amount = int(
            rng.integers(800, 75_000) if is_fraud else rng.integers(200, 48_000)
        )

        # Device & IP — plant fraud ring clusters
        is_ring = is_fraud and (rng.random() < 0.35)
        if is_ring:
            device_id = f"DEV-RING-0{rng.integers(1, 4)}"
            ip = f"103.211.45.{rng.integers(10, 15)}"
        else:
            device_id = f"DEV-{rng.integers(100, 999)}"
            ip = random.choice(list(IP_BLACKLIST)) if (is_fraud and rng.random() < 0.25) else fake.ipv4()

        is_new_device = (rng.random() < 0.6) if is_fraud else (rng.random() < 0.1)
        geo_mismatch = (rng.random() < 0.7) if is_fraud else (rng.random() < 0.05)

        # UPI VPA
        if rng.random() < 0.6:  # UPI transaction
            if is_fraud:
                vpa = f"{fake.user_name()}{random.choice(LOW_TRUST_VPA_SUFFIXES)}"
                collect_request = rng.random() < 0.55
                sim_change = rng.random() < 0.45
            else:
                vpa = f"{fake.user_name()}{random.choice(TRUSTED_VPA_SUFFIXES)}"
                collect_request = False
                sim_change = False
        else:
            vpa = ""
            collect_request = False
            sim_change = False

        # Velocity (txns per 5-min window for this merchant)
        window_start = tx_time - timedelta(minutes=5)
        velocity_map.setdefault(mid, [])
        velocity_map[mid] = [t for t in velocity_map[mid] if t > window_start]
        velocity_count = len(velocity_map[mid])
        velocity_map[mid].append(tx_time)
        velocity_spike = velocity_count >= 3

        # Category anomaly — txn category doesn't match merchant
        category_anomaly = (rng.random() < 0.5) if is_fraud else False

        # Blacklisted IP
        blacklisted_ip = ip in IP_BLACKLIST

        rows.append(
            {
                "tx_id": f"TX-{4000 + i}",
                "merchant_id": mid,
                "merchant_name": m["name"],
                "user_id": uid,
                "amount": amount,
                "device_id": device_id,
                "ip": ip,
                "vpa": vpa,
                "timestamp": tx_time.isoformat(),
                # Features used by ML model
                "is_new_device": int(is_new_device),
                "geo_mismatch": int(geo_mismatch),
                "velocity_count": velocity_count,
                "velocity_spike": int(velocity_spike),
                "blacklisted_ip": int(blacklisted_ip),
                "collect_request": int(collect_request),
                "sim_change_velocity": int(sim_change),
                "category_anomaly": int(category_anomaly),
                "amount_log": float(np.log1p(amount)),
                "chargeback_rate": float(m["rolling_chargeback_rate"]),
                # Label
                "is_fraud": int(is_fraud),
            }
        )

    df = pd.DataFrame(rows)
    return df


def generate_and_save() -> tuple[pd.DataFrame, pd.DataFrame]:
    merchants = make_merchants(25)
    transactions = make_transactions(merchants, n=2000, fraud_rate=0.15)
    merchants.to_csv(DATA_DIR / "merchants.csv", index=False)
    transactions.to_csv(DATA_DIR / "transactions.csv", index=False)
    print(f"[data_generator] Saved {len(merchants)} merchants and {len(transactions)} transactions.")
    print(f"  Fraud prevalence: {transactions['is_fraud'].mean():.1%}")
    return transactions, merchants


if __name__ == "__main__":
    generate_and_save()
