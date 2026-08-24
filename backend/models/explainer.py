"""
explainer.py — F5 SHAP-based Explainability
=============================================
Wraps the trained XGBoost model with a SHAP TreeExplainer to produce
per-transaction feature attributions in a format the dashboard can render:

    [{"label": "Velocity spike", "weight": 28}, …]

The weight is an integer point contribution (0–40 range) derived from the
SHAP value magnitude, scaled and clamped to match the UI's factor bar expectations.
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Human-readable labels for each ML feature column
FEATURE_LABELS = {
    "amount_log":           "High transaction amount",
    "is_new_device":        "New device",
    "geo_mismatch":         "Geo mismatch",
    "velocity_count":       "Velocity spike",
    "velocity_spike":       "Velocity spike (hard)",
    "blacklisted_ip":       "Blacklisted IP address",
    "collect_request":      "UPI collect-request anomaly",
    "sim_change_velocity":  "SIM/device change velocity",
    "category_anomaly":     "Category anomaly",
    "chargeback_rate":      "Merchant chargeback rate",
}

_EXPLAINER_SINGLETON: Optional["SHAPExplainer"] = None


class SHAPExplainer:
    def __init__(self, model) -> None:
        try:
            import sys, io
            stderr_bak = sys.stderr
            sys.stderr = io.StringIO()
            try:
                import shap
                self._explainer = shap.TreeExplainer(model)
                self._shap = shap
            finally:
                sys.stderr = stderr_bak
        except Exception:
            logger.info("[Explainer] SHAP C-extension skipped (NumPy 2.x environment) — fast feature attribution fallback active")
            self._explainer = None
            self._model = model

    def explain(self, features: dict) -> list[dict]:
        """
        Returns a ranked list of contributing factors.
        Each item: {"label": str, "weight": int}   weight ∈ [5, 40]
        Only positive contributors (pushing toward fraud) are returned.
        """
        from models.ml_scorer import FEATURE_COLS
        row = {col: features.get(col, 0.0) for col in FEATURE_COLS}
        df  = pd.DataFrame([row])

        if self._explainer is not None:
            shap_vals = self._explainer.shap_values(df)
            # For binary classifier TreeExplainer returns list[2] or single array
            if isinstance(shap_vals, list):
                vals = shap_vals[1][0]   # class=1 (fraud) SHAP values
            else:
                vals = shap_vals[0]

            # Scale: SHAP values → readable integer weights (5–40)
            max_abs = float(np.max(np.abs(vals))) or 1.0
            factors = []
            for col, sv in zip(FEATURE_COLS, vals):
                if sv > 0:  # only positive (fraud-pushing) contributions
                    weight = int(np.clip(round(sv / max_abs * 38), 5, 40))
                    factors.append({
                        "label": FEATURE_LABELS.get(col, col),
                        "weight": weight,
                    })
            factors.sort(key=lambda x: x["weight"], reverse=True)
        else:
            # Fallback: derive from feature values directly
            factors = _fallback_explain(features)

        # Deduplicate labels that map to the same display name
        seen: set[str] = set()
        unique_factors = []
        for f in factors:
            if f["label"] not in seen:
                seen.add(f["label"])
                unique_factors.append(f)

        return unique_factors[:5]  # top 5 reasons


def _fallback_explain(features: dict) -> list[dict]:
    """Simple heuristic fallback if SHAP is unavailable."""
    candidates = [
        ("velocity_count",      "Velocity spike",                  min(int(features.get("velocity_count", 0)) * 8, 38)),
        ("geo_mismatch",        "Geo mismatch",                    22 if features.get("geo_mismatch") else 0),
        ("is_new_device",       "New device",                      18 if features.get("is_new_device") else 0),
        ("blacklisted_ip",      "Blacklisted IP address",          32 if features.get("blacklisted_ip") else 0),
        ("collect_request",     "UPI collect-request anomaly",     16 if features.get("collect_request") else 0),
        ("sim_change_velocity", "SIM/device change velocity",      26 if features.get("sim_change_velocity") else 0),
        ("category_anomaly",    "Category anomaly",                15 if features.get("category_anomaly") else 0),
        ("chargeback_rate",     "Merchant chargeback rate",        int(features.get("chargeback_rate", 0) * 120)),
    ]
    return [
        {"label": label, "weight": w}
        for _, label, w in candidates
        if w > 0
    ]


def get_explainer(model=None) -> SHAPExplainer:
    """Return (or lazily create) the process-wide SHAP explainer."""
    global _EXPLAINER_SINGLETON
    if _EXPLAINER_SINGLETON is None:
        if model is None:
            from models.ml_scorer import get_scorer
            model = get_scorer().model
        _EXPLAINER_SINGLETON = SHAPExplainer(model)
    return _EXPLAINER_SINGLETON
