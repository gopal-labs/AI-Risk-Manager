"""
main.py — FastAPI Application Entry Point
==========================================
AI Risk Manager Scoring API

Endpoints
---------
GET  /health                      — liveness check
POST /score                       — score a single transaction (F1/F3)
GET  /feed?limit=N                — recent scored transactions for dashboard (F4)
GET  /stats                       — aggregate dashboard header stats (F4)
GET  /merchants                   — all merchant profiles (F2)
GET  /merchants/{merchant_id}     — single merchant profile + trend (F2)
GET  /precision-recall?threshold= — real P/R from held-out test set (F8)
POST /feedback                    — log analyst decision: FP or confirmed fraud (F10)

CORS is open to localhost for development.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("risk_api")

FEEDBACK_LOG = Path(__file__).parent / "data" / "feedback_log.jsonl"

# ── Lifespan: startup/shutdown ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup:
      1. Generate dataset if missing
      2. Train / load ML model (synchronous — fast after first run)
      3. Seed merchant profiles
      4. Background task: SHAP warm-up (in thread pool) + simulator loop
         → server accepts requests immediately without waiting for SHAP
    """
    logger.info("=== AI Risk Manager API — Starting Up ===")

    # Ensure data dir exists
    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)

    # 1. Dataset
    txn_csv = data_dir / "transactions.csv"
    if not txn_csv.exists():
        logger.info("Generating synthetic dataset…")
        from data_generator import generate_and_save
        generate_and_save()

    # 2. ML model (trains if pkl missing — usually <5 s after first run)
    logger.info("Loading / training ML scorer…")
    from models.ml_scorer import get_scorer
    scorer = get_scorer()

    # 3. Merchant profiles
    merchant_csv = data_dir / "merchants.csv"
    if merchant_csv.exists():
        from models.merchant_profiler import seed_from_csv
        seed_from_csv(str(merchant_csv))

    # 4. Fire-and-forget background task
    async def _bg_warmup_and_simulate():
        loop = asyncio.get_event_loop()
        # SHAP init is CPU-bound — run in thread pool so we don't block the event loop
        logger.info("Warming up SHAP explainer in background…")
        try:
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                def _init_shap():
                    from models.explainer import get_explainer
                    return get_explainer(scorer.model)
                await loop.run_in_executor(pool, _init_shap)
            logger.info("SHAP explainer ready.")
        except Exception as exc:
            logger.warning("SHAP warmup error (fallback will be used): %s", exc)

        # Start the transaction simulator
        from simulator import simulation_loop
        try:
            await simulation_loop(interval=4.0)
        except asyncio.CancelledError:
            pass

    bg_task = asyncio.create_task(_bg_warmup_and_simulate())
    logger.info("=== API Ready — http://0.0.0.0:8000 ===  (SHAP warming in background)")

    yield  # ← app serves requests from here

    bg_task.cancel()
    try:
        await bg_task
    except (asyncio.CancelledError, Exception):
        pass
    logger.info("=== AI Risk Manager API — Shutting Down ===")


# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Risk Manager — Scoring API",
    description="Real-time transaction and merchant risk scoring engine (F1–F3, F5, F8, F10).",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic schemas ───────────────────────────────────────────────────────

class TransactionIn(BaseModel):
    tx_id:               Optional[str]  = None
    merchant_id:         str            = Field(default="M1000")
    merchant_name:       str            = Field(default="Unknown Merchant")
    merchant_category:   str            = Field(default="Retail")
    amount:              float          = Field(..., gt=0)
    ip:                  str            = Field(default="0.0.0.0")
    vpa:                 str            = Field(default="")
    device_id:           str            = Field(default="DEV-000")
    velocity_count:      int            = Field(default=0, ge=0)
    is_new_device:       bool           = False
    geo_mismatch:        bool           = False
    collect_request:     bool           = False
    sim_change_velocity: bool           = False
    category_anomaly:    bool           = False
    chargeback_rate:     float          = Field(default=0.01, ge=0.0, le=1.0)


class FeedbackIn(BaseModel):
    tx_id:     str
    decision:  str   = Field(..., pattern="^(false_positive|confirmed_fraud|needs_investigation)$")
    analyst:   Optional[str] = "anonymous"
    notes:     Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/score", tags=["Scoring"])
def score_transaction_endpoint(tx: TransactionIn):
    """F1/F3 — Score a single transaction synchronously."""
    import time
    from scoring_engine import score_transaction

    t0 = time.perf_counter()

    result = score_transaction(
        tx_id              = tx.tx_id or f"TX-{int(time.time()*1000)}",
        merchant_id        = tx.merchant_id,
        merchant_name      = tx.merchant_name,
        merchant_category  = tx.merchant_category,
        amount             = tx.amount,
        ip                 = tx.ip,
        vpa                = tx.vpa,
        device_id          = tx.device_id,
        velocity_count     = tx.velocity_count,
        is_new_device      = tx.is_new_device,
        geo_mismatch       = tx.geo_mismatch,
        collect_request    = tx.collect_request,
        sim_change_velocity= tx.sim_change_velocity,
        category_anomaly   = tx.category_anomaly,
        chargeback_rate    = tx.chargeback_rate,
    )

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)
    result["latency_ms"] = elapsed_ms
    return result


@app.get("/feed", tags=["Dashboard"])
def get_feed(limit: int = Query(default=20, ge=1, le=200)):
    """F4 — Return the most-recent `limit` scored transactions for the live feed."""
    from simulator import FEED
    items = list(FEED)[:limit]
    return {"transactions": items, "count": len(items)}


@app.get("/stats", tags=["Dashboard"])
def get_stats():
    """F4 — Aggregate header statistics for the dashboard."""
    from simulator import FEED
    txs = list(FEED)
    if not txs:
        return {"flagged": 0, "high_risk": 0, "avg_score": 0, "total_volume": 0}

    flagged    = sum(1 for t in txs if t["band"] != "safe")
    high_risk  = sum(1 for t in txs if t["band"] == "danger")
    avg_score  = round(sum(t["composite_score"] for t in txs) / len(txs))
    total_vol  = sum(t["amount"] for t in txs)

    return {
        "flagged":      flagged,
        "high_risk":    high_risk,
        "avg_score":    avg_score,
        "total_volume": total_vol,
        "tx_count":     len(txs),
    }


@app.get("/merchants", tags=["Merchants"])
def list_merchants():
    """F2 — Return all merchant risk profiles."""
    from models.merchant_profiler import all_profiles
    return {"merchants": all_profiles()}


@app.get("/merchants/{merchant_id}", tags=["Merchants"])
def get_merchant(merchant_id: str):
    """F2 — Return a single merchant's risk profile + trend."""
    from models.merchant_profiler import get_profile
    profile = get_profile(merchant_id)
    if profile is None:
        raise HTTPException(status_code=404, detail=f"Merchant {merchant_id!r} not found")
    return profile.to_dict()


@app.get("/precision-recall", tags=["Risk Appetite"])
def precision_recall(
    threshold: float = Query(default=60.0, ge=0.0, le=100.0),
    fp_cost: float = Query(default=500.0, ge=0.0),
    tp_benefit: float = Query(default=12500.0, ge=0.0),
    fn_cost: float = Query(default=12500.0, ge=0.0),
):
    """
    F8 — Real precision/recall & business cost impact at the given threshold.
    """
    from models.ml_scorer import get_scorer
    result = get_scorer().precision_recall_at_threshold(
        threshold=threshold,
        fp_cost=fp_cost,
        tp_benefit=tp_benefit,
        fn_cost=fn_cost,
    )
    result["threshold"] = threshold
    return result


@app.post("/feedback", status_code=200, tags=["Feedback"])
def submit_feedback(fb: FeedbackIn):
    """F10 — Log analyst decision for model improvement and update review queue."""
    from models.feedback_pipeline import get_feedback_pipeline
    from models.review_queue import get_review_queue

    pipeline = get_feedback_pipeline()
    entry = pipeline.log_decision(
        tx_id=fb.tx_id,
        decision=fb.decision,
        analyst=fb.analyst or "anonymous",
        notes=fb.notes or "",
    )

    # Also update review queue if case exists
    rq = get_review_queue()
    case_id = f"CASE-{fb.tx_id}"
    rq.update_case_decision(
        case_id=case_id,
        decision=fb.decision,
        analyst=fb.analyst or "anonymous",
        notes=fb.notes or "",
    )

    return {"status": "logged", "entry": entry}


@app.get("/feedback/metrics", tags=["Feedback"])
def get_feedback_metrics():
    """F10 — Analyst feedback metrics, agreement rate, and post-feedback P/R."""
    from models.feedback_pipeline import get_feedback_pipeline
    return get_feedback_pipeline().get_metrics()


@app.post("/feedback/retrain", tags=["Feedback"])
def trigger_model_retrain():
    """F10 — Trigger offline model retraining job on validated feedback."""
    from models.feedback_pipeline import get_feedback_pipeline
    res = get_feedback_pipeline().retrain_model()
    return res


@app.get("/audit", tags=["Audit"])
def get_audit_log(limit: int = Query(default=100, ge=1, le=500)):
    """Return analyst decision history from feedback pipeline."""
    from models.feedback_pipeline import get_feedback_pipeline
    entries = get_feedback_pipeline().load_feedback_entries()
    entries = list(reversed(entries))[:limit]
    return {"entries": entries, "count": len(entries)}


@app.get("/rings", tags=["Ring Detection"])
def get_fraud_rings():
    """F6 — Return list of active suspicious collusion rings."""
    from models.ring_detector import get_ring_detector
    rings = get_ring_detector().detect_rings()
    return {"rings": rings, "count": len(rings)}


@app.get("/rings/{cluster_id}", tags=["Ring Detection"])
def get_fraud_ring_detail(cluster_id: str):
    """F6 — Return detailed information for a single fraud ring cluster."""
    from models.ring_detector import get_ring_detector
    rings = get_ring_detector().detect_rings()
    ring = next((r for r in rings if r["cluster_id"] == cluster_id), None)
    if not ring:
        raise HTTPException(status_code=404, detail=f"Ring cluster {cluster_id!r} not found")
    return ring


@app.get("/graph/{entity_id}", tags=["Ring Detection"])
def get_entity_subgraph_endpoint(entity_id: str):
    """F6 — Return ego network graph around a specific entity."""
    from models.ring_detector import get_ring_detector
    return get_ring_detector().get_entity_subgraph(entity_id)


@app.get("/graph", tags=["Ring Detection"])
def get_fraud_graph():
    """F6 — Node-link graph visualization endpoint."""
    from simulator import FEED
    txs = list(FEED)

    nodes_map = {}
    edges = []
    seen_edges = set()

    def add_node(nid, label, ntype, risk):
        if nid not in nodes_map:
            nodes_map[nid] = {"id": nid, "label": label, "type": ntype, "risk": risk}

    def add_edge(src, tgt, label):
        key = tuple(sorted([src, tgt])) + (label,)
        if key not in seen_edges:
            seen_edges.add(key)
            edges.append({"source": src, "target": tgt, "label": label})

    for tx in txs:
        if tx.get("band") not in ("danger", "watch"):
            continue
        tid = tx["tx_id"]
        add_node(tid, f"₹{int(tx.get('amount', 0)):,}", "tx", tx.get("composite_score", 50))

        mid = tx.get("merchant_id")
        if mid:
            add_node(mid, tx.get("merchant_name", mid)[:18], "merchant", min(99, int(tx.get("composite_score", 50))))
            add_edge(tid, mid, "merchant")

        dev = tx.get("device_id")
        if dev and dev != "DEV-000":
            add_node(dev, dev, "device", min(99, int(tx.get("composite_score", 50))))
            add_edge(tid, dev, "device")

        ip = tx.get("ip")
        if ip and ip not in ("0.0.0.0", ""):
            nid = f"ip-{ip}"
            add_node(nid, ip, "ip", min(99, int(tx.get("composite_score", 50))))
            add_edge(tid, nid, "ip")

        vpa = tx.get("vpa")
        if vpa:
            nid = f"vpa-{vpa}"
            add_node(nid, vpa[:20], "vpa", min(99, int(tx.get("composite_score", 50))))
            add_edge(tid, nid, "vpa")

    return {
        "nodes": list(nodes_map.values())[:60],
        "edges": edges[:120],
        "tx_count": len(txs),
    }


@app.get("/upi/config", tags=["UPI Intelligence"])
def get_upi_rules_config():
    """F7 — Get current runtime config for UPI fraud rules."""
    from models.upi_detector import UPI_CONFIG
    return UPI_CONFIG


@app.post("/upi/config", tags=["UPI Intelligence"])
def set_upi_rules_config(config: dict):
    """F7 — Update runtime config for UPI fraud rules."""
    from models.upi_detector import update_upi_config
    return update_upi_config(config)


@app.get("/queue", tags=["Review Queue"])
def list_review_queue(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=200),
):
    """F9 — List flagged cases in human-in-the-loop review queue."""
    from models.review_queue import get_review_queue
    cases = get_review_queue().list_cases(status=status, priority=priority, limit=limit)
    return {"cases": cases, "count": len(cases)}


@app.get("/queue/{case_id}", tags=["Review Queue"])
def get_review_case_detail(case_id: str):
    """F9 — Return case details and LLM summary for a review queue case."""
    from models.review_queue import get_review_queue
    c = get_review_queue().get_case(case_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Case {case_id!r} not found")
    return c


@app.post("/queue/{case_id}/summary", tags=["Review Queue"])
def regenerate_case_summary(case_id: str):
    """F9 — Generate or refresh LLM summary for a review case."""
    from models.review_queue import generate_llm_case_summary, get_review_queue
    rq = get_review_queue()
    case = rq.cases.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id!r} not found")
    
    summary = generate_llm_case_summary(case.case_data)
    case.llm_summary = summary
    return {"case_id": case_id, "llm_summary": summary}

