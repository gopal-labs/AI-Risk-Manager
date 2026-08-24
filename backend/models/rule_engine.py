"""
rule_engine.py — F3 Hard-filter Rule Engine
============================================
Deterministic rules run first, before the ML scorer.
Each rule either:
  - Hard-blocks (returns a flag that sets score floor = 85+)
  - Adds a score increment and a labelled reason

Rules are independently toggleable via the RULES dict.
"""

from __future__ import annotations

from dataclasses import dataclass, field

# Shared IP blacklist (in production this would be loaded from a DB / threat feed)
_IP_BLACKLIST = {
    "185.220.101.42", "45.142.212.100", "104.244.78.32",
    "91.108.4.0", "198.98.51.189",
}

# Low-trust UPI VPA suffixes (simulated; in prod: a registry lookup)
_LOW_TRUST_VPA_SUFFIXES = {"@ybl", "@paytm", "@ibl", "@axl", "@oksbi"}

# Rules toggle — set False to disable a rule without removing it
RULES = {
    "blacklist_ip":         True,
    "velocity_cap":         True,
    "high_amount":          True,
    "new_device":           True,
    "geo_mismatch":         True,
    "upi_low_trust_vpa":    True,  # F7 — UPI-specific
    "upi_collect_request":  True,  # F7
    "sim_change_velocity":  True,  # F7
    "category_anomaly":     True,
}


@dataclass
class RuleResult:
    triggered: bool = False
    flags: list[str] = field(default_factory=list)
    reasons: list[dict] = field(default_factory=list)   # [{label, weight}]
    score_addition: int = 0
    hard_block: bool = False   # If True, score is floored at 88


def run_rules(features: dict) -> RuleResult:
    """
    Parameters
    ----------
    features : dict
        Keys (all optional — defaults to False/0):
          ip, velocity_count, amount, is_new_device, geo_mismatch,
          vpa, collect_request, sim_change_velocity, category_anomaly
    """
    result = RuleResult()

    def add(flag: str, label: str, weight: int, hard: bool = False) -> None:
        result.triggered = True
        result.flags.append(flag)
        result.reasons.append({"label": label, "weight": weight})
        result.score_addition += weight
        if hard:
            result.hard_block = True

    # ── Rule 1: Blacklisted IP ──────────────────────────────────────────────
    if RULES["blacklist_ip"] and features.get("ip") in _IP_BLACKLIST:
        add("blacklist_ip", "Blacklisted IP address", 32, hard=True)

    # ── Rule 2: Velocity cap (>3 txns in 5 min from same merchant) ─────────
    if RULES["velocity_cap"] and int(features.get("velocity_count", 0)) >= 3:
        add("velocity_cap", "Velocity spike", 28)

    # ── Rule 3: Unusually high amount ─────────────────────────────────────
    if RULES["high_amount"] and int(features.get("amount", 0)) >= 50_000:
        add("high_amount", "High transaction amount", 14)

    # ── Rule 4: New / unrecognised device ──────────────────────────────────
    if RULES["new_device"] and features.get("is_new_device"):
        add("new_device", "New device", 18)

    # ── Rule 5: Geo mismatch ───────────────────────────────────────────────
    if RULES["geo_mismatch"] and features.get("geo_mismatch"):
        add("geo_mismatch", "Geo mismatch", 22)

    # ── Rule 6 (F7): UPI collect-request from low-trust VPA ───────────────
    vpa: str = features.get("vpa", "") or ""
    vpa_suffix = "@" + vpa.split("@")[-1] if "@" in vpa else ""
    if RULES["upi_low_trust_vpa"] and vpa_suffix in _LOW_TRUST_VPA_SUFFIXES:
        add("upi_low_trust_vpa", "Collect-request from low-trust VPA", 20)

    if RULES["upi_collect_request"] and features.get("collect_request"):
        add("upi_collect_request", "UPI collect-request anomaly", 16)

    # ── Rule 7 (F7): SIM / device change velocity ──────────────────────────
    if RULES["sim_change_velocity"] and features.get("sim_change_velocity"):
        add("sim_change_velocity", "SIM/device change velocity", 26)

    # ── Rule 8: Category anomaly ───────────────────────────────────────────
    if RULES["category_anomaly"] and features.get("category_anomaly"):
        add("category_anomaly", "Category anomaly", 15)

    return result
