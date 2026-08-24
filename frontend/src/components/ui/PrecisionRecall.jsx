// components/ui/PrecisionRecall.jsx — F8 Risk Appetite & FP Cost Dashboard
import { useState, useEffect, useCallback, useRef } from "react";
import { getPrecisionRecall, PR_DEBOUNCE } from "../../api/client";

export default function PrecisionRecall({ apiOnline, threshold, onThresholdChange }) {
  const [pr, setPr] = useState(null);
  const timerRef = useRef(null);

  const fetchPR = useCallback((t) => {
    if (!apiOnline) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const d = await getPrecisionRecall(t);
        setPr(d);
      } catch { /* ignore */ }
    }, PR_DEBOUNCE);
  }, [apiOnline]);

  useEffect(() => { if (apiOnline) fetchPR(threshold); }, [apiOnline, fetchPR, threshold]);

  const precision = pr ? Math.round(pr.precision ?? 0) : Math.min(97, Math.round(48 + threshold * 0.48));
  const recall = pr ? Math.round(pr.recall ?? 0) : Math.max(28, Math.round(96 - threshold * 0.5));
  const fpCount = pr ? (pr.fp ?? 0) : Math.round((100 - threshold) * 1.8);
  const tpCount = pr ? (pr.tp ?? 0) : Math.round(threshold * 2.2);
  const fpCost = pr ? (pr.fp_cost ?? 0) : fpCount * 500;
  const fraudPrevented = pr ? (pr.fraud_prevented ?? 0) : tpCount * 12500;
  const netImpact = pr ? (pr.net_impact ?? 0) : (fraudPrevented - fpCost);

  return (
    <div className="pr-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
        <span>Risk Appetite</span>
        <span className="mono" style={{ color: "var(--brand)" }}>
          Threshold: {threshold}/100 ({threshold < 40 ? "Strict" : threshold > 70 ? "Lenient" : "Balanced"})
        </span>
      </div>

      <div className="pr-slider-row">
        <span style={{ fontSize: 10, color: "var(--danger)" }}>Strict (20)</span>
        <input
          type="range" min="20" max="80" value={threshold}
          className="pr-slider"
          style={{ flex: 1, margin: "0 10px" }}
          onChange={(e) => {
            const v = Number(e.target.value);
            onThresholdChange(v);
            fetchPR(v);
          }}
        />
        <span style={{ fontSize: 10, color: "var(--safe)" }}>Lenient (80)</span>
      </div>

      <div className="pr-bar-row" style={{ marginTop: 12 }}>
        <div className="pr-bar-label">
          <span>Precision</span>
          <span>{precision}%</span>
        </div>
        <div className="pr-bar-track">
          <div className="pr-bar-fill precision" style={{ width: `${precision}%` }} />
        </div>
      </div>

      <div className="pr-bar-row">
        <div className="pr-bar-label">
          <span>Recall</span>
          <span>{recall}%</span>
        </div>
        <div className="pr-bar-track">
          <div className="pr-bar-fill recall" style={{ width: `${recall}%` }} />
        </div>
      </div>

      {/* Cost & Financial Impact Modeling */}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px dashed var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>False Positives ({fpCount})</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>
            -₹{(fpCost || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-faint)" }}>@ ₹500 cost/friction</div>
        </div>

        <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Fraud Loss Prevented</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--safe)" }}>
            +₹{(fraudPrevented || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-faint)" }}>{tpCount} true positives caught</div>
        </div>
      </div>

      <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "linear-gradient(135deg, rgba(79,110,247,0.1), rgba(139,92,246,0.1))", border: "1px solid var(--brand-alpha)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Net Financial Impact</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: netImpact >= 0 ? "var(--safe)" : "var(--danger)" }}>
            {netImpact >= 0 ? "+" : ""}₹{Math.round(netImpact || 0).toLocaleString("en-IN")}
          </span>
        </div>
        <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>
          Estimated value based on configurable business assumptions
        </div>
      </div>
    </div>
  );
}
