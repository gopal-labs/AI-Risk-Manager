"""
feedback_pipeline.py — F10 Model Feedback Loop & Retraining Pipeline
======================================================================
Logs analyst decisions, computes analyst agreement metrics, builds retraining
datasets, and executes offline model retraining.

Public API:
-----------
  FeedbackPipeline.log_decision(...)
  FeedbackPipeline.get_metrics() -> dict
  FeedbackPipeline.build_training_dataset() -> pd.DataFrame
  FeedbackPipeline.retrain_model() -> dict
"""

from __future__ import annotations

import json
import logging
import pickle
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"
FEEDBACK_LOG = DATA_DIR / "feedback_log.jsonl"
RETRAINED_MODEL_PATH = DATA_DIR / "xgb_model_v2.pkl"


class FeedbackPipeline:
    def __init__(self) -> None:
        DATA_DIR.mkdir(exist_ok=True)

    def log_decision(
        self,
        tx_id: str,
        decision: str,  # confirmed_fraud | false_positive | needs_investigation
        predicted_score: float = 50.0,
        analyst: str = "anonymous",
        notes: Optional[str] = None,
        tx_features: Optional[dict] = None,
    ) -> dict:
        entry = {
            "tx_id": tx_id,
            "decision": decision,
            "predicted_score": predicted_score,
            "predicted_label": 1 if predicted_score >= 60.0 else 0,
            "actual_label": 1 if decision == "confirmed_fraud" else (0 if decision == "false_positive" else None),
            "analyst": analyst,
            "notes": notes or "",
            "logged_at": datetime.now().isoformat(),
            "used_in_retrain": False,
            "features": tx_features or {},
        }

        with open(FEEDBACK_LOG, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")

        return entry

    def load_feedback_entries(self) -> list[dict]:
        entries = []
        if FEEDBACK_LOG.exists():
            with open(FEEDBACK_LOG, "r", encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if line:
                        try:
                            entries.append(json.loads(line))
                        except json.JSONDecodeError:
                            pass
        return entries

    def get_metrics(self) -> dict:
        entries = self.load_feedback_entries()
        total = len(entries)
        if total == 0:
            return {
                "total_reviewed": 0,
                "confirmed_fraud": 0,
                "false_positives": 0,
                "false_negatives": 0,
                "analyst_agreement_rate": 0.0,
                "precision_after_feedback": 0.0,
                "recall_after_feedback": 0.0,
            }

        confirmed = sum(1 for e in entries if e.get("decision") == "confirmed_fraud")
        false_positives = sum(1 for e in entries if e.get("decision") == "false_positive")
        needs_inv = sum(1 for e in entries if e.get("decision") == "needs_investigation")

        # Agreement: predicted_label == actual_label
        evaluated = [e for e in entries if e.get("actual_label") is not None]
        agreed = sum(1 for e in evaluated if e.get("predicted_label") == e.get("actual_label"))
        agreement_rate = round((agreed / len(evaluated) * 100), 1) if evaluated else 100.0

        # Post-feedback Precision & Recall
        tp = confirmed
        fp = false_positives
        precision = round((tp / (tp + fp) * 100), 1) if (tp + fp) > 0 else 100.0
        fn = sum(1 for e in evaluated if e.get("predicted_label") == 0 and e.get("actual_label") == 1)
        recall = round((tp / (tp + fn) * 100), 1) if (tp + fn) > 0 else 100.0

        return {
            "total_reviewed": total,
            "confirmed_fraud": confirmed,
            "false_positives": false_positives,
            "needs_investigation": needs_inv,
            "false_negatives": fn,
            "analyst_agreement_rate": agreement_rate,
            "precision_after_feedback": precision,
            "recall_after_feedback": recall,
        }

    def build_training_dataset(self) -> pd.DataFrame:
        """Combine base synthetic transactions CSV with logged analyst feedback labels."""
        txn_csv = DATA_DIR / "transactions.csv"
        if not txn_csv.exists():
            from data_generator import generate_and_save
            generate_and_save()

        base_df = pd.read_csv(txn_csv)
        entries = self.load_feedback_entries()

        # Update base labels where analyst feedback exists
        feedback_map = {}
        for e in entries:
            if e.get("actual_label") is not None:
                feedback_map[e["tx_id"]] = e["actual_label"]

        if feedback_map:
            for idx, row in base_df.iterrows():
                tx_id = row.get("tx_id")
                if tx_id in feedback_map:
                    base_df.at[idx, "is_fraud"] = feedback_map[tx_id]

        return base_df

    def retrain_model(self) -> dict:
        """Explicit offline model retraining pipeline."""
        df = self.build_training_dataset()

        from sklearn.model_selection import train_test_split
        from xgboost import XGBClassifier
        from models.ml_scorer import FEATURE_COLS

        X = df[FEATURE_COLS].fillna(0.0)
        y = df["is_fraud"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        model = XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

        # Evaluate performance
        y_pred = model.predict(X_test)
        acc = float(np.mean(y_pred == y_test))

        payload = {
            "model": model,
            "X_test": X_test,
            "y_test": y_test,
            "trained_at": datetime.now().isoformat(),
            "accuracy": round(acc * 100, 2),
            "training_samples": len(df),
        }

        with open(RETRAINED_MODEL_PATH, "wb") as fh:
            pickle.dump(payload, fh)

        return {
            "status": "success",
            "model_path": str(RETRAINED_MODEL_PATH),
            "accuracy": round(acc * 100, 2),
            "samples_used": len(df),
            "timestamp": payload["trained_at"],
        }


# Singleton accessor
_PIPELINE_SINGLETON: Optional[FeedbackPipeline] = None

def get_feedback_pipeline() -> FeedbackPipeline:
    global _PIPELINE_SINGLETON
    if _PIPELINE_SINGLETON is None:
        _PIPELINE_SINGLETON = FeedbackPipeline()
    return _PIPELINE_SINGLETON
