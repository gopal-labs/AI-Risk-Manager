// components/ui/RiskSparkline.jsx
// Live rolling area chart showing avg risk score evolution in real-time
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

function SparkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const val  = Math.round(payload[0]?.value ?? 0);
  const band = val >= 70 ? "danger" : val >= 40 ? "watch" : "safe";
  const col  = { danger: "#EF4444", watch: "#F59E0B", safe: "#10B981" }[band];
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "6px 12px", fontSize: 12,
      boxShadow: "var(--shadow-md)",
    }}>
      <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: col, fontSize: 15 }}>
        {val}
      </span>
      <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>avg risk</span>
    </div>
  );
}

export default function RiskSparkline({ history }) {
  if (!history || history.length < 2) {
    return (
      <div className="sparkline-empty">
        <span>Collecting data…</span>
      </div>
    );
  }

  // Determine gradient color based on latest value
  const latest = history[history.length - 1]?.score ?? 0;
  const strokeColor = latest >= 70 ? "#EF4444" : latest >= 40 ? "#F59E0B" : "#10B981";
  const fillStart   = latest >= 70 ? "rgba(239,68,68,0.25)" : latest >= 40 ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)";

  return (
    <div className="sparkline-wrap">
      <ResponsiveContainer width="100%" height={88}>
        <AreaChart data={history} margin={{ top: 6, right: 8, left: -32, bottom: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={strokeColor} stopOpacity={0.28} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0}  />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<SparkTooltip />} />
          <ReferenceLine y={70} stroke="rgba(239,68,68,0.25)"  strokeDasharray="3 3" />
          <ReferenceLine y={40} stroke="rgba(245,158,11,0.25)" strokeDasharray="3 3" />
          <Area
            type="monotone" dataKey="score"
            stroke={strokeColor} strokeWidth={2}
            fill="url(#sparkGrad)"
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
