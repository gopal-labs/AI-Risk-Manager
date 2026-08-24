# Product Requirements Document
## AI Risk Manager — Fraud & Risk Intelligence Platform
**Prepared for:** Razorpay AI Builder Internship — Track 2: AI Risk Manager
**Author:** Gopal
**Version:** 1.0

---

## 1. Overview

AI Risk Manager is a real-time transaction and merchant risk scoring platform that combines rule-based logic, machine learning classification, graph-based collusion detection, and explainable AI to flag fraud while explicitly managing the cost of false positives. It is designed around three high-impact, underserved risk categories: **collusion/ring fraud**, **UPI-specific fraud**, and **false-positive/over-blocking risk** — layered on top of a solid transaction and merchant scoring foundation.

## 2. Problem Statement

Payment platforms like Razorpay process millions of transactions where fraud takes many forms: single-transaction fraud (stolen cards, account takeover), coordinated fraud rings operating across "unrelated" accounts, and India-specific attack patterns like UPI collect-request scams and SIM-swap takeovers. Most fraud systems optimize purely for catch rate, ignoring that every false positive blocks a legitimate merchant transaction and erodes trust and revenue. There is no single open, explainable system that scores transactions, detects coordinated fraud rings, addresses UPI-specific patterns, and exposes the precision/recall trade-off as a business-facing control.

## 3. Goals & Objectives

- Build a hybrid rule + ML risk scoring engine for transactions and merchants
- Detect coordinated fraud rings via graph analysis, not just isolated transaction scoring
- Model India-specific UPI fraud patterns (collect-request abuse, device/SIM anomalies)
- Make false-positive cost explicit and controllable, not a hidden side effect
- Ensure every risk flag is explainable, not a black-box score
- Demonstrate deployment-readiness (API-first design) rather than a standalone notebook demo

## 4. Target Users

- **Primary:** Risk/fraud operations analysts who review flagged transactions and merchants
- **Secondary:** Platform/product teams who configure risk appetite and monitor system-level trade-offs
- **Tertiary (indirect):** Merchants and end customers, who benefit from fewer false blocks and faster fraud catch

## 5. Scope

**In scope:** transaction risk scoring, merchant risk profiling, ring/collusion detection, UPI-specific fraud rules, explainability layer, false-positive cost dashboard, review queue, feedback loop, REST API.

**Out of scope (v1):** real production data integration (uses simulated/synthetic data modeled on known fraud patterns), multi-currency support, mobile app, live production deployment.

---

## 6. Features

### 6.1 Core Features

#### F1 — Real-Time Transaction Risk Scoring
- **Description:** Every transaction receives a 0–100 composite risk score combining rule-based signals (velocity, geo-mismatch, blacklists) and an ML classifier (XGBoost/Logistic Regression) trained on labeled fraud/legit examples.
- **User story:** As a risk analyst, I want each transaction scored instantly so I can prioritize review.
- **Acceptance criteria:** Score computed and returned in under 200ms per transaction; score decomposes into rule-based and ML-based sub-scores.

#### F2 — Merchant Risk Profiling
- **Description:** Rolling risk score per merchant aggregating chargeback rate, volume trend, and category-consistency over time, not just point-in-time transactions.
- **User story:** As a risk analyst, I want to see a merchant's risk trend, not just today's snapshot.
- **Acceptance criteria:** Profile updates on a rolling window (e.g., 30-day); historical trend chart available.

#### F3 — Hybrid Rule + ML Engine
- **Description:** Deterministic rules (blacklist IP, velocity cap) run first as hard filters; ML model scores everything else for subtler anomalies.
- **User story:** As a platform owner, I want known fraud patterns caught deterministically and novel patterns caught probabilistically.
- **Acceptance criteria:** Rule engine and ML engine are independently swappable/configurable modules.

#### F4 — Risk Dashboard
- **Description:** Recharts-based dashboard showing flagged transaction volume, risk score distribution, and trend over time.
- **User story:** As an analyst, I want a visual overview before diving into individual cases.
- **Acceptance criteria:** Dashboard reflects data updates within one refresh cycle; filterable by date range and risk band.

### 6.2 Unique/Differentiating Features

#### F5 — Explainable Risk Flags ⭐
- **Description:** Every flagged transaction shows a feature-attribution breakdown (e.g., "new device +15, geo mismatch +20, velocity spike +30") instead of a bare score.
- **User story:** As an analyst, I need to justify a block/flag to a merchant or compliance team, not just cite a number.
- **Acceptance criteria:** Every score ≥ threshold displays a ranked list of contributing factors with point values.

#### F6 — Collusion / Ring Fraud Detection ⭐
- **Description:** Models merchants/users as a graph (nodes) connected by shared device ID, IP, bank account, or phone number (edges). Runs connected-components/community detection to surface suspicious clusters, boosted further by synchronized transaction timing or circular money flow.
- **User story:** As an analyst, I want to catch coordinated fraud rings that look clean at the individual-transaction level.
- **Acceptance criteria:** System identifies clusters above a configurable shared-identifier threshold; cluster view shows the graph visually; cluster membership boosts individual risk scores.

#### F7 — UPI-Specific Fraud Detection ⭐
- **Description:** Flags anomalous UPI collect-requests from low-trust/new VPAs, and detects device/SIM-change velocity patterns consistent with takeover, using synthetic UPI transaction data modeled on known fraud patterns.
- **User story:** As a risk analyst, I want India-specific UPI fraud patterns covered, not just generic card fraud logic.
- **Acceptance criteria:** Collect-request anomaly rule and device/SIM-change rule both implemented and independently toggleable; documented as simulated data with fraud-pattern basis noted.

#### F8 — Configurable Risk Appetite & False-Positive Cost Dashboard ⭐
- **Description:** A slider/config lets a user choose stricter vs. lenient thresholds and see the resulting precision/recall trade-off live, alongside an estimated ₹ cost of false positives (blocked legitimate transactions) vs. ₹ benefit of true positives (fraud caught).
- **User story:** As a platform owner, I want to see the business cost of my risk threshold choice, not just an abstract accuracy number.
- **Acceptance criteria:** Adjusting the slider updates precision/recall and cost estimates in real time on the dashboard.

#### F9 — Human-in-the-Loop Review Queue with LLM Summaries ⭐
- **Description:** Flagged cases enter a review queue; an LLM (via LangGraph-based agent) drafts a plain-English summary of why the case was flagged, speeding up analyst review.
- **User story:** As an analyst, I want a quick summary instead of reading raw scores and logs for every case.
- **Acceptance criteria:** Every queued case has an auto-generated summary within a few seconds of being flagged; analyst can accept/override the flag.

#### F10 — Feedback Loop for Model Improvement
- **Description:** Analyst decisions (confirmed fraud / false positive) are logged and used to periodically reweight or retrain the scoring model.
- **User story:** As a platform owner, I want the system to improve from analyst corrections over time.
- **Acceptance criteria:** Feedback is stored per case; a retraining/reweighting job can consume this feedback (batch, not necessarily live for v1).

### 6.3 Nice-to-Have (Stretch)

#### F11 — Unsupervised Anomaly Detection
- Isolation Forest/Autoencoder layer to catch fraud patterns not present in labeled training data.

#### F12 — API-First Design
- Clean documented REST endpoint (`POST /score`) with defined latency budget, so the engine could be integrated into a live payment flow.

---

## 7. Tech Stack

| Layer | Choice |
|---|---|
| Backend / Scoring API | FastAPI (Python) |
| ML models | XGBoost / Logistic Regression (scikit-learn) |
| Graph analysis | NetworkX |
| Explainability | SHAP |
| Frontend dashboard | React 18 + Recharts |
| Agentic review summaries | LangGraph |
| Database | PostgreSQL (transactions, merchants, feedback) |
| Data | Synthetic/simulated dataset modeled on known fraud patterns |

## 8. Data Schema (High-Level)

- **transactions:** id, merchant_id, user_id, amount, device_id, ip, vpa (for UPI), timestamp, risk_score, flagged (bool)
- **merchants:** id, category, onboarding_date, rolling_chargeback_rate, rolling_volume, risk_profile_score
- **shared_identifiers:** device_id/ip/bank_account/phone mapped to merchant_id/user_id (feeds the graph)
- **review_queue:** transaction_id, llm_summary, analyst_decision, decision_timestamp
- **feedback:** case_id, predicted_label, actual_label, used_in_retrain (bool)

## 9. Success Metrics

- Model precision/recall on held-out synthetic test set
- % of flagged cases with a clear, human-readable explanation
- Ring detection: number of synthetic "planted" collusion rings correctly identified
- False-positive cost delta shown at at least 3 different threshold settings
- API response latency under 200ms per scoring call

## 10. Risks Addressed (Coverage Summary)

| Risk category | Feature(s) covering it |
|---|---|
| Collusion / ring fraud | F6 |
| UPI-specific fraud (collect-request scams, SIM-swap/device takeover) | F7 |
| Over-blocking / false-positive harm | F8 |
| Generic transaction fraud (foundation) | F1, F2, F3 |
| Model opacity | F5 |
| Analyst workload | F9 |
| Model staleness | F10, F11 (stretch) |

## 11. Timeline (Suggested)

| Phase | Duration | Deliverable |
|---|---|---|
| Phase 1 | Week 1 | Data simulation + core scoring engine (F1–F4) |
| Phase 2 | Week 2 | Explainability + ring detection (F5, F6) |
| Phase 3 | Week 3 | UPI fraud rules + false-positive dashboard (F7, F8) |
| Phase 4 | Week 4 | Review queue, feedback loop, polish, write-up (F9, F10) |

## 12. Out of Scope / Assumptions

- Real Razorpay production data is not available; all data is synthetic and explicitly labeled as such in the write-up, with fraud patterns modeled on publicly documented UPI/payment fraud typologies.
- No live payment integration; this is a scoring/decision-support system, not a production blocker in this version.
