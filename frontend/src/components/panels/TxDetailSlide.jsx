// components/panels/TxDetailSlide.jsx — Enhanced with donut chart & animated score banner
import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Badge, { BAND_COLOR } from "../ui/Badge";
import FactorBar from "../ui/FactorBar";
import { submitFeedback } from "../../api/client";

// ── Rule vs ML donut chart ────────────────────────────────────────────────────
function ScoreDonut({ ruleScore, mlScore, band }) {
  if (ruleScore === undefined && mlScore === undefined) return null;

  const r    = ruleScore ?? 0;
  const m    = Math.round(mlScore ?? 0);
  const data = [
    { name: "Rule Score", value: r, color: "#4F6EF7" },
    { name: "ML Score",   value: m, color: "#8B5CF6" },
  ];

  return (
    <div className="slide-donut-wrap">
      <div className="slide-donut-chart">
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={28} outerRadius={42}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [val, name]}
              contentStyle={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 11,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="slide-donut-legend">
        {data.map((d) => (
          <div key={d.name} className="slide-donut-legend-item">
            <span className="slide-donut-dot" style={{ background: d.color }} />
            <span className="slide-donut-name">{d.name}</span>
            <span className="slide-donut-val" style={{ color: d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TxDetailSlide({ tx, apiOnline, onClose }) {
  const [status, setStatus] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch real Gemini LLM case summary from backend if online
  useEffect(() => {
    if (!tx || !apiOnline) {
      setAiSummary(null);
      return;
    }
    let cancelled = false;
    setLoadingSummary(true);
    fetch(`http://localhost:8000/queue/${tx.tx_id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && data.ai_summary) {
          setAiSummary(data.ai_summary);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingSummary(false);
      });
    return () => { cancelled = true; };
  }, [tx, apiOnline]);

  const handleFeedback = useCallback(async (decision) => {
    if (!tx) return;
    setStatus("submitting");
    try {
      if (apiOnline) {
        await submitFeedback(tx.tx_id, decision);
      } else {
        await new Promise((r) => setTimeout(r, 400));
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
    setTimeout(() => { setStatus(null); onClose(); }, 1400);
  }, [tx, apiOnline, onClose]);

  const isOpen  = Boolean(tx);
  const band    = tx?.band ?? "safe";
  const bandCol = BAND_COLOR[band];

  // Display text: either real Gemini AI summary or fallback string
  const summaryText = aiSummary || tx?.ai_summary || tx?.summary || (
    tx?.composite_score >= 70
      ? `• High Risk (${tx?.composite_score}/100) — Transaction flagged for abnormal velocity, VPA / Device patterns.\n• Recommended Action: Verify entity identity and history before approval.`
      : `• Watch Risk (${tx?.composite_score}/100) — Transaction exhibits mild risk signals.\n• Recommended Action: Monitor account velocity.`
  );

  const isRealLLM = Boolean(aiSummary || tx?.ai_summary || tx?.summary);

  return (
    <>
      <div className={`slide-overlay${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`slide-panel${isOpen ? " open" : ""}`}>
        {tx && (
          <>
            {/* Animated score banner */}
            <div
              className="slide-score-banner"
              style={{
                background: `linear-gradient(135deg, ${bandCol}18, ${bandCol}08)`,
                borderBottom: `2px solid ${bandCol}44`,
              }}
            >
              <button className="slide-close" onClick={onClose}>✕ Close</button>

              <div className="slide-banner-score" style={{ color: bandCol }}>
                {tx.composite_score}
              </div>
              <div className="slide-banner-meta">
                <Badge band={band} />
                {tx.hard_block && (
                  <span className="risk-badge danger" style={{ marginLeft: 6 }}>HARD BLOCK</span>
                )}
              </div>
              <div className="slide-tx-id mono">{tx.tx_id}</div>
            </div>

            {/* Content */}
            <div className="slide-content">
              <div className="slide-merchant">{tx.merchant_name}</div>
              <div className="slide-amount mono">
                ₹{tx.amount.toLocaleString("en-IN")}
                {tx.timestamp && (
                  <span style={{ marginLeft: 10, fontSize: 10, color: "var(--text-muted)" }}>
                    {new Date(tx.timestamp).toLocaleTimeString("en-IN")}
                  </span>
                )}
              </div>

              {/* Rule vs ML donut */}
              <ScoreDonut ruleScore={tx.rule_score} mlScore={tx.ml_score} band={band} />

              {tx.rule_flags?.length > 0 && (
                <div className="flag-chips">
                  {tx.rule_flags.map((f) => (
                    <span key={f} className="flag-chip">{f.replace(/_/g, " ")}</span>
                  ))}
                </div>
              )}

              <div className="factors-label">Contributing Factors</div>
              {tx.reasons.length > 0
                ? tx.reasons.map((r, i) => (
                    <FactorBar key={r.label} label={r.label} weight={r.weight} delay={i * 90} />
                  ))
                : <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>
                    No significant factors detected.
                  </div>
              }

              {/* Case Summary Panel */}
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🤖 AI Case Summary</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: isRealLLM ? "rgba(16, 185, 129, 0.15)" : "var(--bg-app)",
                    color: isRealLLM ? "#10B981" : "var(--text-muted)",
                  }}>
                    {loadingSummary ? "Generating…" : isRealLLM ? "✨ Gemini 3.6 Flash" : "F9 Fallback Generator"}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                  {loadingSummary ? "Connecting to Gemini 3.6 Flash model for real-time risk synthesis…" : summaryText}
                </div>
              </div>

              <div className="action-row" style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="btn"
                  style={{ fontSize: 11, padding: "6px 10px" }}
                  disabled={status === "submitting"}
                  onClick={() => handleFeedback("false_positive")}
                >
                  False Positive
                </button>
                <button
                  className="btn"
                  style={{ fontSize: 11, padding: "6px 10px", borderColor: "#F59E0B", color: "#F59E0B" }}
                  disabled={status === "submitting"}
                  onClick={() => handleFeedback("needs_investigation")}
                >
                  Investigate
                </button>
                <button
                  className="btn primary"
                  style={{ fontSize: 11, padding: "6px 10px" }}
                  disabled={status === "submitting"}
                  onClick={() => handleFeedback("confirmed_fraud")}
                >
                  Confirm Fraud
                </button>
              </div>

              {status === "done"  && <div className="feedback-status done">✓ Feedback logged</div>}
              {status === "error" && <div className="feedback-status error">⚠ Failed to log</div>}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
