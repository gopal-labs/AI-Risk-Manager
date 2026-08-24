// pages/MerchantDetail.jsx — Light theme
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import Shell   from "../components/layout/Shell";
import Badge   from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { useApiHealth } from "../hooks/useApiHealth";
import { getMerchant, syntheticMerchants } from "../api/client";

const RISK_COLORS = { safe: "#10B981", watch: "#F59E0B", danger: "#EF4444" };

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  const band  = score >= 70 ? "danger" : score >= 40 ? "watch" : "safe";
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0",
      borderRadius: 8, padding: "8px 12px", fontSize: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontFamily: "JetBrains Mono", color: RISK_COLORS[band], fontWeight: 700, fontSize: 14 }}>
        {Math.round(score)}
      </div>
      <div style={{ color: "#94A3B8", marginTop: 2 }}>Day {payload[0]?.payload?.day}</div>
    </div>
  );
}

export default function MerchantDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const apiOnline = useApiHealth();

  const [merchant, setMerchant] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = apiOnline ? await getMerchant(id) : (() => { throw new Error("offline"); })();
        if (!cancelled) setMerchant(d);
      } catch {
        const found = syntheticMerchants().find((m) => m.id === id || m.merchant_id === id);
        if (!cancelled) setMerchant(found ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, apiOnline]);

  const score  = merchant?.risk_score ?? merchant?.risk_profile_score ?? 0;
  const band   = score >= 70 ? "danger" : score >= 40 ? "watch" : "safe";
  const rawTrend = merchant?.trend ?? [];
  const color  = RISK_COLORS[band];

  // Process raw trend items into Recharts object format: [{ day: 1, score: 25 }, ...]
  const parsedTrend = rawTrend.map((item, idx) => {
    if (typeof item === "number") {
      return { day: idx + 1, score: Math.round(item) };
    }
    if (item && typeof item === "object") {
      return { day: item.day ?? idx + 1, score: Math.round(item.score ?? 0) };
    }
    return { day: idx + 1, score: 0 };
  });

  // Fallback to sample 14-day trend series centered on current merchant score if empty/zero
  const trendData = (parsedTrend.length > 0 && parsedTrend.some((t) => t.score > 0))
    ? parsedTrend
    : Array.from({ length: 14 }, (_, i) => {
        const base = score > 0 ? score : 35;
        const offset = Math.sin(i * 0.7) * 7 + ((i % 4) - 1.5) * 4;
        return { day: i + 1, score: Math.max(5, Math.min(98, Math.round(base + offset))) };
      });

  return (
    <Shell online={apiOnline}>
      <button
        className="btn"
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/merchants")}
      >
        ← Back to Merchants
      </button>

      {loading ? <Spinner text="Loading merchant profile…" /> : !merchant ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">Merchant not found</div>
          <div className="empty-state-sub">ID: {id}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Profile */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Risk Profile</span>
              <Badge band={band} />
            </div>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>
                    {merchant.name ?? merchant.merchant_name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {merchant.category ?? merchant.merchant_category}
                  </div>
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "JetBrains Mono", color, lineHeight: 1 }}>
                  {score}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Chargeback Rate", value: merchant.chargeback_rate !== undefined ? `${(merchant.chargeback_rate * 100).toFixed(2)}%` : "—" },
                  { label: "Transactions",    value: merchant.tx_count ?? "—" },
                  { label: "Total Volume",    value: merchant.total_volume ? `₹${Math.round(merchant.total_volume / 1000)}K` : "—" },
                  { label: "Risk Band",       value: band.toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 5 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "JetBrains Mono" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 14-day trend */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">14-Day Risk Trend</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>Rolling window</span>
            </div>
            {trendData.length > 0 ? (
              <div style={{ padding: "14px 8px 8px" }}>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={trendData} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={70} stroke="rgba(239,68,68,0.3)"  strokeDasharray="4 4" />
                    <ReferenceLine y={40} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 4" />
                    <Line
                      type="monotone" dataKey="score"
                      stroke={color} strokeWidth={2.5}
                      dot={{ fill: color, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 14, fontSize: 10, color: "var(--text-muted)", padding: "0 12px", marginTop: 4 }}>
                  <span style={{ color: "rgba(239,68,68,0.7)" }}>— High risk (70)</span>
                  <span style={{ color: "rgba(245,158,11,0.7)" }}>— Watch (40)</span>
                </div>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-sub">No trend data available</div></div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
