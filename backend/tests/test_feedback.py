"""
test_feedback.py — Unit Tests for F10 Feedback Loop & Retraining Pipeline
"""

from models.feedback_pipeline import FeedbackPipeline


def test_feedback_logging_and_metrics(tmp_path):
    pipeline = FeedbackPipeline()

    pipeline.log_decision(
        tx_id="TX-FB-01",
        decision="confirmed_fraud",
        predicted_score=85.0,
        analyst="analyst_1",
    )
    pipeline.log_decision(
        tx_id="TX-FB-02",
        decision="false_positive",
        predicted_score=72.0,
        analyst="analyst_2",
    )

    metrics = pipeline.get_metrics()
    assert metrics["total_reviewed"] >= 2
    assert metrics["confirmed_fraud"] >= 1
    assert metrics["false_positives"] >= 1
    assert "precision_after_feedback" in metrics


def test_retraining_pipeline():
    pipeline = FeedbackPipeline()
    res = pipeline.retrain_model()
    assert res["status"] == "success"
    assert res["accuracy"] > 50.0
    assert "model_path" in res
