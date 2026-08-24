"""
upi_detector.py — F7 UPI-Specific Fraud Signals & Detection Rules
==================================================================
India-specific UPI fraud detectors:
  1. Collect Request Abuse Detector
  2. Device & SIM Swap Velocity Anomaly Detector

Rules are toggleable dynamically at runtime.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)

# Configurable switches
UPI_CONFIG = {
    "upi_collect_rule_enabled": True,
    "sim_change_rule_enabled": True,
}

LOW_TRUST_VPA_SUFFIXES = {"@ybl", "@paytm", "@ibl", "@axl", "@oksbi"}


@dataclass
class UPIRuleResult:
    triggered: bool = False
    flags: list[str] = field(default_factory=list)
    reasons: list[dict] = field(default_factory=list)
    score_addition: float = 0.0


def evaluate_upi_signals(features: dict) -> UPIRuleResult:
    """
    Evaluate UPI-specific fraud signals on transaction features.
    
    Parameters:
    -----------
    features : dict containing keys:
      vpa, collect_request, amount, is_new_device, sim_change_velocity, velocity_count, category_anomaly
    """
    res = UPIRuleResult()

    vpa = str(features.get("vpa", "") or "")
    is_collect = bool(features.get("collect_request", False))
    is_new_dev = bool(features.get("is_new_device", False))
    sim_velocity = bool(features.get("sim_change_velocity", False))
    amount = float(features.get("amount", 0.0))
    velocity_cnt = int(features.get("velocity_count", 0))

    vpa_suffix = "@" + vpa.split("@")[-1] if "@" in vpa else ""

    # 1. Collect Request Abuse Rules
    if UPI_CONFIG.get("upi_collect_rule_enabled", True):
        if is_collect:
            # Signal: High amount collect request from low-trust VPA
            if vpa_suffix in LOW_TRUST_VPA_SUFFIXES and amount >= 15_000:
                res.triggered = True
                res.flags.append("upi_collect_abuse_high_val")
                res.reasons.append({
                    "label": "High-value UPI collect-request from unverified VPA",
                    "weight": 24,
                    "source": "upi",
                })
                res.score_addition += 24.0
            elif vpa_suffix in LOW_TRUST_VPA_SUFFIXES:
                res.triggered = True
                res.flags.append("upi_collect_low_trust_vpa")
                res.reasons.append({
                    "label": "Collect-request from low-trust VPA suffix",
                    "weight": 16,
                    "source": "upi",
                })
                res.score_addition += 16.0

            # Signal: Rapid collect request velocity
            if velocity_cnt >= 3:
                res.triggered = True
                res.flags.append("upi_collect_velocity_spike")
                res.reasons.append({
                    "label": "Unusual UPI collect-request frequency",
                    "weight": 20,
                    "source": "upi",
                })
                res.score_addition += 20.0

    # 2. Device & SIM Change Detection (Account Takeover)
    if UPI_CONFIG.get("sim_change_rule_enabled", True):
        # Compound signal: SIM swap velocity combined with new device
        if sim_velocity and is_new_dev:
            res.triggered = True
            res.flags.append("upi_account_takeover_pattern")
            res.reasons.append({
                "label": "Critical: SIM change combined with unrecognised device",
                "weight": 32,
                "source": "upi",
            })
            res.score_addition += 32.0
        elif sim_velocity:
            res.triggered = True
            res.flags.append("upi_sim_change_velocity")
            res.reasons.append({
                "label": "High SIM/device binding change velocity",
                "weight": 22,
                "source": "upi",
            })
            res.score_addition += 22.0

    return res


def update_upi_config(config: dict) -> dict:
    """Update runtime config for UPI detection rules."""
    for k in ("upi_collect_rule_enabled", "sim_change_rule_enabled"):
        if k in config:
            UPI_CONFIG[k] = bool(config[k])
    return dict(UPI_CONFIG)
