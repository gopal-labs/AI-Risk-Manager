// components/ui/ToastStack.jsx — Slide-in toast notifications for danger transactions
import { BAND_COLOR } from "./Badge";

function ScoreRing({ score, band }) {
  const color  = BAND_COLOR[band] || "#EF4444";
  const r      = 18;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke={color} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: "stroke-dashoffset 0.6s var(--ease-out)" }}
      />
      <text x="22" y="27" textAnchor="middle"
        style={{ fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 700, fill: color }}>
        {score}
      </text>
    </svg>
  );
}

export default function ToastStack({ toasts, onDismiss, onInspect }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-label="Alert notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-item toast-danger"
          role="alert"
        >
          {/* Animated accent bar */}
          <div className="toast-accent" />

          <ScoreRing score={toast.tx.composite_score} band={toast.tx.band} />

          <div className="toast-body">
            <div className="toast-title">
              <span className="toast-badge">⚠ HIGH RISK</span>
            </div>
            <div className="toast-merchant">{toast.tx.merchant_name}</div>
            <div className="toast-meta">
              ₹{toast.tx.amount.toLocaleString("en-IN")} · Score {toast.tx.composite_score}
            </div>
          </div>

          <div className="toast-actions">
            <button
              className="toast-btn-inspect"
              onClick={() => { onInspect(toast.tx); onDismiss(toast.id); }}
              aria-label="Inspect transaction"
            >
              View
            </button>
            <button
              className="toast-btn-dismiss"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
