// components/panels/AiInsights.jsx
import { useNavigate } from "react-router-dom";

// Copied to public dir for serving; we embed as img from assets
const INSIGHT_STATS = [
  { val: "13+",   label: "Years in Business",      sub: "Securing businesses since 2011" },
  { val: "10K+",  label: "Satisfied Clients",       sub: "Over 10,000 businesses protected" },
  { val: "2.5M",  label: "Transactions Processed",  sub: "Millions of transactions analyzed" },
  { val: "85%",   label: "Risk Detection Rate",      sub: "High accuracy in fraud detection" },
];

export default function AiInsights() {
  const navigate = useNavigate();
  return (
    <div className="insights-card">
      {/* Header section */}
      <div style={{ padding: "18px 18px 0", position: "relative" }}>
        <div className="insights-label">AI-Powered Insights</div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div className="insights-headline">Smarter Decisions.<br />Stronger Protection.</div>
            <div className="insights-body">
              Real-time monitoring, intelligent analytics, and
              proactive risk management for a safer tomorrow.
            </div>
            <button
              className="btn primary"
              style={{ padding: "8px 18px", fontSize: 12, marginBottom: 16 }}
              onClick={() => navigate("/merchants")}
            >
              Explore Merchants
            </button>
          </div>
          {/* Illustration */}
          <div style={{
            width: 110, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 110 100" width="110" height="100" style={{ overflow: "visible" }}>
              {/* Chart lines */}
              <polyline
                points="8,72 24,55 40,60 56,40 72,45 88,25"
                fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
              {/* Chart dots */}
              {[[8,72],[24,55],[40,60],[56,40],[72,45],[88,25]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="3.5" fill="#10B981" />
              ))}
              {/* Shield */}
              <g transform="translate(62,45)">
                <path
                  d="M22,4 L22,4 C22,4 30,7 38,4 L38,16 C38,24 30,30 22,33 C14,30 6,24 6,16 L6,4 C14,7 22,4 22,4Z"
                  fill="#10B981" opacity="0.15"
                />
                <path
                  d="M22,4 L22,4 C22,4 30,7 38,4 L38,16 C38,24 30,30 22,33 C14,30 6,24 6,16 L6,4 C14,7 22,4 22,4Z"
                  fill="none" stroke="#10B981" strokeWidth="2"
                />
                {/* Checkmark */}
                <polyline points="14,18 20,24 30,13" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              {/* Mini pie */}
              <g transform="translate(6,20)">
                <circle cx="10" cy="10" r="10" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1.5" />
                <path d="M10,10 L10,0 A10,10 0 0,1 20,10 Z" fill="#10B981" />
                <path d="M10,10 L20,10 A10,10 0 0,1 10,20 Z" fill="#34D399" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: "rgba(79,110,247,0.07)",
        borderTop: "1px solid rgba(79,110,247,0.15)",
        padding: "12px 18px",
      }}>
        <div className="insights-stats">
          {INSIGHT_STATS.map(({ val, label, sub }) => (
            <div key={val}>
              <div className="insights-stat-val">{val}</div>
              <div className="insights-stat-label" style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 11 }}>{label}</div>
              <div className="insights-stat-label">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
