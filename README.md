# AI Risk Manager — Fraud & Risk Intelligence Platform

> **Razorpay AI Builder Internship — Track 2: AI Risk Manager**
> A full-stack, real-time transaction and merchant risk scoring intelligence platform combining deterministic rules, NetworkX graph collusion detection, India UPI fraud signals, XGBoost ML, SHAP explainability, human-in-the-loop review queue with LLM summaries, false-positive business cost modeling, and an analyst feedback loop.

---

## 📋 PRD Feature Coverage

| Feature | Description | Status |
|---|---|:---:|
| **F1 Real-Time Risk Scoring** | Sub-200ms composite risk scoring engine blending rules, ML, and graph risk | ✅ |
| **F2 Merchant Risk Profiling** | 30-day rolling risk profile, chargeback rate, and sparkline trend series | ✅ |
| **F3 Hybrid Rule + ML Engine** | Hard filters (IP blacklist, high amount, velocity spike) + XGBoost binary classifier | ✅ |
| **F4 Risk Dashboard** | Real-time console feed, 4s polling stream, header aggregates, and risk index gauge | ✅ |
| **F5 Explainable Risk Flags** | SHAP TreeExplainer feature attributions & factor bars with clear source labeling | ✅ |
| **F6 Collusion / Ring Fraud Detection** | NetworkX entity graph, connected components, shared identifiers & ring boost | ✅ |
| **F7 UPI-Specific Fraud Detection** | India-specific collect request abuse & SIM swap velocity rules with runtime toggles | ✅ |
| **F8 Risk Appetite + FP Cost** | Dynamic threshold tuning slider with false-positive friction cost & net financial impact | ✅ |
| **F9 HITL Review + LLM Summary** | Flagged case queue with structured LLM summary generator & deterministic fallback | ✅ |
| **F10 Feedback Loop** | Analyst decision system (`confirmed_fraud`, `false_positive`, `needs_investigation`), agreement metrics & offline retraining | ✅ |

---

## 🏗️ Architecture Overview

```
                                    ┌───────────────────────────┐
                                    │   Landing Page (/)        │
                                    │   Animated SaaS Overview  │
                                    └─────────────┬─────────────┘
                                                  │
┌─────────────────────────────────────────────────┴─────────────────────────────────────────────────┐
│                                    Vite + React SPA Dashboard                                     │
│  /console        /merchants        /merchants/:id       /queue       /score       /ring-graph     │
└─────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                  │  REST API (JSON)
                                                  ▼
                                   ┌─────────────────────────────┐
                                   │   FastAPI Backend (:8000)   │
                                   └──────────────┬──────────────┘
                                                  │
    ┌───────────────────────────┬─────────────────┴─────────┬───────────────────────────┐
    ▼                           ▼                           ▼                           ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   Rule Engine     │ │  UPI Detector     │ │   Ring Detector   │ │   ML Scorer       │
│ deterministic     │ │ collect abuse &   │ │ NetworkX entity   │ │ XGBoost proba     │
│ hard filters (F3) │ │ SIM swaps (F7)    │ │ graph rings (F6)  │ │ model (F1)        │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
          │                     │                     │                     │
          └─────────────────────┴──────────┬──────────┴─────────────────────┘
                                           ▼
                             ┌───────────────────────────┐
                             │ Composite Risk Scoring    │
                             │ 0.4 Rule + 0.45 ML + Ring │
                             └─────────────┬─────────────┘
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
 ┌───────────────────────┐    ┌─────────────────────────┐    ┌───────────────────────┐
 │    SHAP Explainer     │    │   HITL Review Queue     │    │ Feedback & Retraining │
 │ feature attributions  │    │ LLM summary / fallback  │    │ analyst decisions &   │
 │ (F5)                  │    │ (F9)                    │    │ model retraining (F10)│
 └───────────────────────┘    └─────────────────────────┘    └───────────────────────┘
```

---

## 🔬 Core Feature Specifications

### 1. F1–F3 Composite Scoring Pipeline
- **Scoring Formula**:
  $$\text{Composite Score} = 0.40 \times \text{Rule Score} + 0.45 \times \text{ML Score} + \text{Ring Risk Boost}$$
- **Hard Block Floor**: Hard-block rule triggers set a floor of `88.0`.
- **Band Mapping**:
  - `composite >= 70` $\rightarrow$ **DANGER (High Risk)**
  - `composite >= 40` $\rightarrow$ **WATCH (Medium Risk)**
  - `composite < 40` $\rightarrow$ **SAFE (Low Risk)**

### 2. F6 Collusion / Ring Fraud Detection
- Built on NetworkX entity-bipartite graph using nodes: `merchant`, `user`, `device`, `ip`, `vpa`.
- Automatically connects shared identifiers between transactions and identifies connected component clusters.
- Calculates `cluster_risk_score`, entity count, shared identifiers, and applies a `ring_boost` (up to +30 pts) to incoming member transactions.

### 3. F7 UPI-Specific Fraud Detection
- **Collect Request Abuse**: Detects collect requests from low-trust VPA suffixes (`@ybl`, `@paytm`, `@ibl`), high transaction amounts, and velocity spikes.
- **Device & SIM Change Velocity**: Detects account takeover patterns combining SIM swap velocity with unrecognised device bindings.
- **Runtime Toggles**: Configurable via `/upi/config` API endpoint.

### 4. F8 Risk Appetite & False-Positive Cost Dashboard
- Dynamic threshold slider ($20 \le \text{Threshold} \le 80$).
- Computes real-time **Precision**, **Recall**, **False Positives**, **True Positives**, **False Negatives**, **FP Friction Cost** (default ₹500/friction), **Fraud Loss Prevented** (default ₹12,500/true positive), and **Net Financial Impact**.

### 5. F9 Human-in-the-Loop Review Queue & LLM Summarizer
- Automatically populates the review queue for transactions landing in `danger` or `watch` risk bands.
- Generates structured LLM case summaries explaining risk drivers and recommended analyst actions (uses OpenAI/Gemini if API key present in `.env`, otherwise runs a deterministic fallback generator).

### 6. F10 Feedback Loop & Retraining Pipeline
- Analyst actions: `Confirmed Fraud`, `False Positive`, `Needs Investigation`.
- Computes analyst agreement rate, post-feedback precision, and recall.
- Provides an explicit model retraining pipeline (`POST /feedback/retrain`) to build updated model artifacts (`xgb_model_v2.pkl`) safely.

---

## ⚡ Quick Start

### 1. Start Backend (FastAPI)

```powershell
# From project root
cd "backend"

# Activate environment (Windows PowerShell)
.venv\Scripts\activate

# Start backend server
python run.py
```

- API Base URL: **http://localhost:8000**
- Interactive Swagger Docs: **http://localhost:8000/docs**

---

### 2. Start Frontend (Vite + React SPA)

```powershell
# Open a new terminal from project root
cd "frontend"

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev
```

- Web Dashboard & Landing Page: **http://localhost:5173**

---

## 🧪 Test Suite & Verification

Run the full pytest suite covering all backend models, rule engines, graph ring detection, UPI rules, review queue, feedback pipeline, and API endpoints:

```powershell
cd "backend"
.venv\Scripts\python.exe -m pytest
```

- **Pass Rate**: **37/37 passed (100%)**
- **Frontend Build**: `npm run build` passes with 0 errors.
- **Scoring Latency**: `POST /score` sub-200ms average latency verified (average ~12ms).

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check & system timestamp |
| `POST` | `/score` | Score a single transaction (< 200 ms) |
| `GET` | `/feed?limit=35` | Real-time scored transaction feed |
| `GET` | `/stats` | Aggregate dashboard statistics |
| `GET` | `/merchants` | List all rolling merchant risk profiles |
| `GET` | `/merchants/{id}` | Single merchant risk profile & 14-day trend |
| `GET` | `/rings` | Active suspicious collusion rings (NetworkX) |
| `GET` | `/rings/{id}` | Single ring cluster detail & evidence list |
| `GET` | `/graph/{entity_id}` | Ego network graph for an entity |
| `GET` | `/upi/config` | Get UPI fraud rule toggles |
| `POST` | `/upi/config` | Update UPI fraud rule toggles |
| `GET` | `/precision-recall` | Real P/R + false positive cost & net business impact |
| `GET` | `/queue` | Human-in-the-loop review queue cases |
| `GET` | `/queue/{id}` | Review case detail with LLM summary |
| `POST` | `/queue/{id}/summary` | Regenerate LLM summary |
| `POST` | `/feedback` | Log analyst decision (`confirmed_fraud`, `false_positive`, `needs_investigation`) |
| `GET` | `/feedback/metrics` | Analyst agreement rate & post-feedback precision/recall |
| `POST` | `/feedback/retrain` | Trigger offline model retraining job on validated feedback |
| `GET` | `/audit` | Chronological decision history |

---

## 📂 Project Directory Structure

```text
Risk Management/
├── AI_Risk_Manager_PRD.md     # Product Requirements Document
├── README.md                  # Complete Platform Documentation
├── backend/
│   ├── run.py                 # Backend runner entry point
│   ├── main.py                # FastAPI endpoints & lifespan
│   ├── scoring_engine.py      # F1-F10 composite scoring orchestrator
│   ├── data_generator.py      # Synthetic dataset generator (seed 42)
│   ├── simulator.py           # Background transaction stream generator
│   ├── models/
│   │   ├── rule_engine.py     # Deterministic hard filter rules
│   │   ├── upi_detector.py    # F7 UPI collect & SIM swap detectors
│   │   ├── ring_detector.py   # F6 NetworkX collusion ring detector
│   │   ├── ml_scorer.py       # F1 XGBoost probabilistic scorer & P/R cost model
│   │   ├── explainer.py       # F5 SHAP TreeExplainer feature attributions
│   │   ├── merchant_profiler.py # F2 Rolling merchant risk profiler
│   │   ├── review_queue.py    # F9 HITL queue & LLM summary generator
│   │   └── feedback_pipeline.py # F10 Analyst feedback & retraining pipeline
│   └── tests/                 # 37/37 passing Pytest test suite
└── frontend/
    ├── src/
    │   ├── App.jsx            # React Router SPA routes
    │   ├── api/client.js      # REST API client helpers
    │   ├── components/        # UI components, cards, 3D icons & slide-over panels
    │   └── pages/             # Console, Merchants, Queue, Score, Audit, RingGraph, Landing
    └── vite.config.js         # Vite configuration
```
