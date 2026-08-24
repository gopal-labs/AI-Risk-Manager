// pages/Audit.jsx — Analyst Decision Timeline / Feedback & Retraining Pipeline
import { useState, useEffect } from "react";
import Shell from "../components/layout/Shell";
import { useApiHealth } from "../hooks/useApiHealth";
import { useApiPoll }   from "../hooks/useApiPoll";
import { getAuditLog, getFeedbackMetrics, triggerModelRetrain } from "../api/client";
import {
  Icon3DFraudConfirmed,
  Icon3DFalsePositive,
} from "../components/ui/Official3DIcons";

const BAND_COL = { confirmed_fraud: "#EF4444", false_positive: "#10B981", needs_investigation: "#F59E0B" };
const ICONS    = {
  confirmed_fraud: <Icon3DFraudConfirmed size={18} />,
  false_positive:  <Icon3DFalsePositive  size={18} />,
  needs_investigation: <span style={{ fontSize: 14 }}>🔍</span>,
};
const LABELS   = { confirmed_fraud: "Confirmed Fraud", false_positive: "False Positive", needs_investigation: "Needs Investigation" };

function makeSyntheticAudit(n = 20) {
  const decisions = ["confirmed_fraud", "false_positive"];
  const merchants = [
    "Aravali Retail Pvt Ltd", "NimbusPay Merchant", "Trishul Electronics",
    "Sundarban Exports", "Zenith Fintech Services", "Koshur Traders",
  ];
  return Array.from({ length: n }, (_, i) => {
    const decision = decisions[Math.floor(Math.random() * decisions.length)];
    const d = new Date(Date.now() - (n - i) * 7 * 60000 + Math.random() * 60000);
    return {
      id:         `${i + 1}`,
      tx_id:      `TX-${4000 + i + 1}`,
      decision,
      analyst:    ["analyst_1", "analyst_2", "sanjay.k", "priya.r"][i % 4],
      merchant:   merchants[i % merchants.length],
      amount:     Math.floor(500 + Math.random() * 45000),
      score:      decision === "confirmed_fraud"
                    ? Math.floor(70 + Math.random() * 29)
                    : Math.floor(40 + Math.random() * 29),
      logged_at:  d.toISOString(),
      notes:      decision === "confirmed_fraud" ? "Pattern matched ring detection" : null,
    };
  }).reverse();
}

function TimelineEntry({ entry, idx }) {
  const col  = BAND_COL[entry.decision] || "#6B7280";
  const icon = ICONS[entry.decision] || "📋";
  const label= LABELS[entry.decision] || entry.decision;

  return (
    <div className="audit-entry" style={{ animationDelay: `${idx * 40}ms` }}>
      <div className="audit-line-wrap">
        <div className="audit-dot" style={{ background: col, boxShadow: `0 0 8px ${col}55` }} />
        <div className="audit-line" />
      </div>

      <div className="audit-card">
        <div className="audit-card-top">
          <span className="audit-icon">{icon}</span>
          <span className="audit-decision" style={{ color: col }}>{label}</span>
          <span className="audit-tx-id mono">{entry.tx_id}</span>
          <span className="audit-time">
            {new Date(entry.logged_at).toLocaleString("en-IN", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
        <div className="audit-card-body">
          <span className="audit-merchant">{entry.merchant || "—"}</span>
          {entry.amount && (
            <span className="audit-amount mono">₹{entry.amount.toLocaleString("en-IN")}</span>
          )}
          {entry.score && (
            <span className="audit-score mono" style={{ color: col }}>Score {entry.score}</span>
          )}
          <span className="audit-analyst">by {entry.analyst}</span>
        </div>
        {entry.notes && (
          <div className="audit-notes">📎 {entry.notes}</div>
        )}
      </div>
    </div>
  );
}

export default function Audit() {
  const apiOnline = useApiHealth();
  const [filter, setFilter] = useState("all");
  const [retrainState, setRetrainState] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const [apiData] = useApiPoll(() => getAuditLog(100), 15000, [apiOnline]);

  useEffect(() => {
    if (apiOnline) {
      getFeedbackMetrics().then(setMetrics).catch(() => {});
    }
  }, [apiOnline]);

  const handleRetrain = async () => {
    setRetrainState("running");
    try {
      const res = await triggerModelRetrain();
      setRetrainState({ success: true, accuracy: res.accuracy, samples: res.samples_used });
    } catch {
      setRetrainState({ error: true });
    }
  };

  const raw = (apiOnline && apiData?.entries?.length)
    ? apiData.entries
    : makeSyntheticAudit(22);

  const displayed = filter === "all"
    ? raw
    : raw.filter((e) => e.decision === filter);

  const fraudCount = raw.filter((e) => e.decision === "confirmed_fraud").length;
  const fpCount    = raw.filter((e) => e.decision === "false_positive").length;
  const agreement  = metrics ? metrics.analyst_agreement_rate : Math.round((fraudCount / Math.max(1, raw.length)) * 100);

  return (
    <Shell online={apiOnline}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="page-title">Audit & Model Feedback Loop</div>
          <div className="page-desc">Chronological analyst decisions and retraining pipeline</div>
        </div>
        <button
          className="btn primary"
          style={{ fontSize: 12, padding: "8px 14px" }}
          disabled={retrainState === "running"}
          onClick={handleRetrain}
        >
          {retrainState === "running" ? "⚙ Retraining Model…" : "🚀 Retrain Model on Feedback"}
        </button>
      </div>

      {typeof retrainState === "object" && retrainState?.success && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.15)", border: "1px solid var(--safe)", color: "var(--safe)", fontSize: 12, marginBottom: 16 }}>
          ✓ Model successfully retrained on {retrainState.samples} samples! Accuracy: <strong>{retrainState.accuracy}%</strong>
        </div>
      )}

      {/* Summary stats */}
      <div className="audit-summary">
        <div className="audit-stat-chip fraud">
          <span className="audit-stat-icon"><Icon3DFraudConfirmed size={22} /></span>
          <span className="audit-stat-val">{fraudCount}</span>
          <span className="audit-stat-label">Confirmed Fraud</span>
        </div>
        <div className="audit-stat-chip fp">
          <span className="audit-stat-icon"><Icon3DFalsePositive size={22} /></span>
          <span className="audit-stat-val">{fpCount}</span>
          <span className="audit-stat-label">False Positives</span>
        </div>
        <div className="audit-stat-chip total">
          <span className="audit-stat-val">{raw.length}</span>
          <span className="audit-stat-label">Total Decisions</span>
        </div>
        <div className="audit-stat-chip accuracy">
          <span className="audit-stat-val">{agreement}%</span>
          <span className="audit-stat-label">Analyst Agreement Rate</span>
        </div>
      </div>

      {/* Filter controls */}
      <div className="audit-filters">
        {[
          { key: "all",             label: "All Decisions" },
          { key: "confirmed_fraud", label: "Confirmed Fraud" },
          { key: "false_positive",  label: "False Positives" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`filter-btn${filter === key ? " active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
        <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
          {displayed.length} entries
        </span>
      </div>

      {/* Timeline */}
      <div className="audit-timeline">
        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No decisions recorded yet</div>
            <div className="empty-state-sub">Analyst actions from the Review Queue will appear here</div>
          </div>
        ) : (
          displayed.map((entry, idx) => (
            <TimelineEntry key={(entry.tx_id || idx) + (entry.logged_at || idx)} entry={entry} idx={idx} />
          ))
        )}
      </div>
    </Shell>
  );
}
