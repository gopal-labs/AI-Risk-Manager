// components/ui/RiskGauge.jsx — Light theme semicircular gauge
import { useEffect, useState } from "react";

const R    = 80;
const CIRC = Math.PI * R;

export default function RiskGauge({ value, animated = true }) {
  const [drawn, setDrawn] = useState(!animated);
  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setDrawn(true), 80);
    return () => clearTimeout(t);
  }, [animated]);

  const clamped = Math.min(100, Math.max(0, value ?? 0));
  const offset  = CIRC - (clamped / 100) * CIRC;
  // Color by band — light theme uses same semantic colors
  const color   = clamped >= 70 ? "var(--danger)" : clamped >= 40 ? "var(--watch)" : "var(--safe)";

  return (
    <div className="gauge-wrap">
      <svg width="190" height="106" viewBox="0 0 190 106">
        {/* Track */}
        <path
          d="M 15 95 A 80 80 0 0 1 175 95"
          fill="none" stroke="#E2E8F0" strokeWidth="13" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 15 95 A 80 80 0 0 1 175 95"
          fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={drawn ? offset : CIRC}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1), stroke 400ms ease",
            filter: `drop-shadow(0 0 6px ${color}55)`,
          }}
        />
      </svg>
      <div className="gauge-value mono" style={{ color }}>{Math.round(clamped)}</div>
      <div className="gauge-caption">OUT OF 100</div>
    </div>
  );
}
