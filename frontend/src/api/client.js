// ─────────────────────────────────────────────────────────────────────────────
// api/client.js — AI Risk Manager · Centralized fetch helpers
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";
export const POLL_FEED_MS  = 4000;
export const POLL_STATS_MS = 5000;
export const PR_DEBOUNCE   = 350;

// ── Synthetic fallback data ───────────────────────────────────────────────────

const REASON_LIBRARY = [
  { label: "Velocity spike",                  weight: 28 },
  { label: "Geo mismatch",                    weight: 22 },
  { label: "New device",                      weight: 18 },
  { label: "Category anomaly",                weight: 15 },
  { label: "Shared identifier cluster",       weight: 24 },
  { label: "Collect-request from low-trust VPA", weight: 20 },
  { label: "SIM/device change velocity",      weight: 26 },
];

const MERCHANTS = [
  { id: "M1001", name: "Aravali Retail Pvt Ltd",   category: "Retail",      risk_score: 62 },
  { id: "M1002", name: "Koshur Traders",            category: "Wholesale",   risk_score: 44 },
  { id: "M1003", name: "NimbusPay Merchant",         category: "Fintech",     risk_score: 81 },
  { id: "M1004", name: "Trishul Electronics",        category: "Electronics", risk_score: 33 },
  { id: "M1005", name: "Deccan Fresh Mart",          category: "Grocery",     risk_score: 21 },
  { id: "M1006", name: "Orbit Mobility",             category: "Transport",   risk_score: 55 },
  { id: "M1007", name: "Vertex Apparel Co.",         category: "Fashion",     risk_score: 39 },
  { id: "M1008", name: "Sundarban Exports",          category: "Export",      risk_score: 72 },
  { id: "M1009", name: "Nilgiri Foods",              category: "F&B",         risk_score: 28 },
  { id: "M1010", name: "Copper Kettle Café",         category: "F&B",         risk_score: 17 },
  { id: "M1011", name: "Zenith Fintech Services",   category: "Fintech",     risk_score: 88 },
  { id: "M1012", name: "Bhairav Hardware",           category: "Hardware",    risk_score: 46 },
];

let _counter = 4000;
export function makeSyntheticTx() {
  _counter += 1;
  const score      = Math.floor(20 + Math.random() * 78);
  const numReasons = score > 70 ? 3 : score > 45 ? 2 : 1;
  const reasons    = [...REASON_LIBRARY]
    .sort(() => Math.random() - 0.5)
    .slice(0, numReasons)
    .map((r) => ({ ...r, weight: Math.max(6, r.weight + Math.floor(Math.random() * 10 - 5)) }));
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  return {
    tx_id:           `TX-${_counter}`,
    merchant_id:     merchant.id,
    merchant_name:   merchant.name,
    amount:          Math.floor(400 + Math.random() * 48000),
    composite_score: score,
    band:            score >= 70 ? "danger" : score >= 40 ? "watch" : "safe",
    rule_flags:      score > 70 ? ["velocity_cap", "geo_mismatch"] : [],
    reasons,
    timestamp:       new Date().toISOString(),
    fresh:           false,
  };
}

export function normaliseTx(raw) {
  return {
    tx_id:           raw.tx_id,
    merchant_id:     raw.merchant_id   || "",
    merchant_name:   raw.merchant_name,
    amount:          raw.amount,
    composite_score: raw.composite_score,
    band:            raw.band,
    rule_score:      raw.rule_score,
    ml_score:        raw.ml_score,
    rule_flags:      raw.rule_flags    || [],
    hard_block:      raw.hard_block    || false,
    reasons:         raw.reasons       || [],
    timestamp:       raw.timestamp,
    fresh:           raw.fresh         || false,
  };
}

export function syntheticMerchants() {
  return MERCHANTS.map((m) => ({
    ...m,
    chargeback_rate:    parseFloat((Math.random() * 0.12).toFixed(3)),
    tx_count:           Math.floor(20 + Math.random() * 500),
    total_volume:       Math.floor(50000 + Math.random() * 5000000),
    band:               m.risk_score >= 70 ? "danger" : m.risk_score >= 40 ? "watch" : "safe",
    trend:              Array.from({ length: 14 }, (_, i) => ({
      day:   i + 1,
      score: Math.max(5, Math.min(100, m.risk_score + (Math.random() * 20 - 10))),
    })),
  }));
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    signal: AbortSignal.timeout(3000),
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function checkHealth() {
  return apiFetch("/health");
}

export async function getFeed(limit = 20) {
  const d = await apiFetch(`/feed?limit=${limit}`);
  return (d.transactions || []).map(normaliseTx);
}

export async function getStats() {
  return apiFetch("/stats");
}

export async function getMerchants() {
  const d = await apiFetch("/merchants");
  return d.merchants || [];
}

export async function getMerchant(id) {
  return apiFetch(`/merchants/${id}`);
}

export async function getPrecisionRecall(threshold, fp_cost = 500, tp_benefit = 12500, fn_cost = 12500) {
  return apiFetch(`/precision-recall?threshold=${threshold}&fp_cost=${fp_cost}&tp_benefit=${tp_benefit}&fn_cost=${fn_cost}`);
}

export async function scoreTransaction(payload) {
  return apiFetch("/score", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
}

export async function submitFeedback(tx_id, decision, analyst = "anonymous", notes = "") {
  return apiFetch("/feedback", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ tx_id, decision, analyst, notes }),
  });
}

export async function getAuditLog(limit = 100) {
  return apiFetch(`/audit?limit=${limit}`);
}

export async function getRingGraph() {
  return apiFetch("/graph");
}

export async function getFraudRings() {
  return apiFetch("/rings");
}

export async function getFraudRingDetail(clusterId) {
  return apiFetch(`/rings/${clusterId}`);
}

export async function getUpiConfig() {
  return apiFetch("/upi/config");
}

export async function setUpiConfig(config) {
  return apiFetch("/upi/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
}

export async function getReviewQueue(status = null, priority = null, limit = 50) {
  let url = `/queue?limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (priority) url += `&priority=${priority}`;
  return apiFetch(url);
}

export async function getReviewCase(caseId) {
  return apiFetch(`/queue/${caseId}`);
}

export async function regenerateCaseSummary(caseId) {
  return apiFetch(`/queue/${caseId}/summary`, { method: "POST" });
}

export async function getFeedbackMetrics() {
  return apiFetch("/feedback/metrics");
}

export async function triggerModelRetrain() {
  return apiFetch("/feedback/retrain", { method: "POST" });
}
