// pages/RiskConsole.jsx — Console dashboard with sparkline, alert system, and AI Insights
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Shell          from "../components/layout/Shell";
import StatCard       from "../components/ui/StatCard";
import RiskGauge      from "../components/ui/RiskGauge";
import PrecisionRecall from "../components/ui/PrecisionRecall";
import TxFeed         from "../components/panels/TxFeed";
import TxDetailSlide  from "../components/panels/TxDetailSlide";
import AiInsights     from "../components/panels/AiInsights";
import Badge, { BAND_COLOR } from "../components/ui/Badge";
import RiskSparkline  from "../components/ui/RiskSparkline";
import { useApiHealth } from "../hooks/useApiHealth";
import { useApiPoll }   from "../hooks/useApiPoll";
import { useAlerts }    from "../hooks/useAlerts";
import {
  getFeed, getStats,
  makeSyntheticTx, normaliseTx,
  POLL_FEED_MS, POLL_STATS_MS,
} from "../api/client";

// Max sparkline history points (one per poll cycle)
const MAX_HISTORY = 40;

// ── Review Queue Preview ──────────────────────────────────────────────────────
const QUEUE_FILTERS = [
  { key: "all",    label: "All Flagged" },
  { key: "danger", label: "High Risk"   },
  { key: "watch",  label: "Watch"       },
];

function ReviewQueuePreview({ feed, onSelect }) {
  const [filter, setFilter] = useState("all");
  const [sort,   setSort]   = useState("score_desc");

  const flagged = feed.filter((t) => t.band !== "safe");

  const displayed = useMemo(() => {
    let list = filter === "all" ? flagged : flagged.filter((t) => t.band === filter);
    return [...list]
      .sort((a, b) => {
        if (sort === "score_desc")  return b.composite_score - a.composite_score;
        if (sort === "amount_desc") return b.amount - a.amount;
        return 0;
      })
      .slice(0, 8);
  }, [flagged, filter, sort]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Review Queue</div>
          <div className="card-sub">{flagged.length} cases awaiting analyst decision</div>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {flagged.length} cases
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", flexWrap: "wrap" }}>
        <div className="queue-filters">
          {QUEUE_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn${filter === key ? " active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          className="form-select"
          style={{ padding: "4px 10px", fontSize: 11.5, marginLeft: "auto" }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="score_desc">Highest Score</option>
          <option value="amount_desc">Highest Amount</option>
        </select>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state" style={{ padding: 24 }}>
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-text">Queue is clear</div>
        </div>
      ) : (
        <>
          <table className="queue-table">
            <thead>
              <tr>
                <th>TX ID</th><th>Merchant</th><th>Amount</th>
                <th>Score</th><th>Band</th><th>Time</th><th>Flags</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((tx) => (
                <tr key={tx.tx_id} style={{ cursor: "pointer" }} onClick={() => onSelect(tx)}>
                  <td className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{tx.tx_id}</td>
                  <td style={{ fontWeight: 500 }}>{tx.merchant_name}</td>
                  <td className="mono" style={{ fontSize: 12 }}>₹{tx.amount.toLocaleString("en-IN")}</td>
                  <td className="mono" style={{ fontWeight: 700, color: BAND_COLOR[tx.band] }}>
                    {tx.composite_score}
                  </td>
                  <td><Badge band={tx.band} /></td>
                  <td style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString("en-IN") : "—"}
                  </td>
                  <td>
                    {tx.rule_flags?.length > 0 ? (
                      <div className="flag-chips" style={{ margin: 0 }}>
                        {tx.rule_flags.slice(0, 2).map((f) => (
                          <span key={f} className="flag-chip" style={{ fontSize: 8 }}>
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                        {tx.rule_flags.length > 2 && (
                          <span className="flag-chip" style={{ fontSize: 8 }}>+{tx.rule_flags.length - 2}</span>
                        )}
                      </div>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/queue" className="queue-view-all">View All Cases →</Link>
        </>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RiskConsole() {
  const apiOnline = useApiHealth();

  // Feed
  const [feed, setFeed] = useState(() =>
    Array.from({ length: 7 }, () => normaliseTx(makeSyntheticTx()))
  );
  const [selected,  setSelected]  = useState(null);
  const [threshold, setThreshold] = useState(60);

  // Alerts hook
  const { alerts, toasts, addAlert, markAllRead, dismissToast, unreadCount } = useAlerts();

  // Sparkline history (rolling score over time)
  const [scoreHistory, setScoreHistory] = useState([]);

  // Real API polling
  useEffect(() => {
    if (!apiOnline) return;
    const poll = async () => {
      try {
        const res = await getFeed(35);
        const incoming = Array.isArray(res) ? res : [];
        setFeed((prev) => {
          const ids     = new Set(prev.map((t) => t.tx_id));
          const newRows = incoming
            .filter((t) => t && t.tx_id && !ids.has(t.tx_id))
            .map((t)    => ({ ...t, fresh: true }));
          if (newRows.length === 0) return prev;

          // Trigger alerts for new danger rows
          newRows.filter((t) => t.band === "danger").forEach(addAlert);

          return [...newRows, ...prev].slice(0, 35);
        });
      } catch { /* silent */ }
    };
    poll();
    const iv = setInterval(poll, POLL_FEED_MS);
    return () => clearInterval(iv);
  }, [apiOnline, addAlert]);

  // Synthetic fallback
  useEffect(() => {
    if (apiOnline !== false) return;
    const iv = setInterval(() => {
      const newTx = { ...normaliseTx(makeSyntheticTx()), fresh: true };
      if (newTx.band === "danger") addAlert(newTx);
      setFeed((prev) => [newTx, ...prev.slice(0, 34)]);
    }, 4200);
    return () => clearInterval(iv);
  }, [apiOnline, addAlert]);

  // Stats
  const [apiStats] = useApiPoll(getStats, POLL_STATS_MS, [apiOnline]);
  const stats = apiOnline && apiStats ? apiStats : null;

  const flaggedCount  = stats ? stats.flagged      : feed.filter((t) => t.band !== "safe").length;
  const highRiskCount = stats ? stats.high_risk    : feed.filter((t) => t.band === "danger").length;
  const avgScore      = stats ? stats.avg_score    : Math.round(feed.reduce((s, t) => s + t.composite_score, 0) / (feed.length || 1));
  const totalVolume   = stats ? stats.total_volume : feed.reduce((s, t) => s + t.amount, 0);

  // Record avgScore into sparkline history on every change
  useEffect(() => {
    setScoreHistory((prev) => {
      const next = [...prev, { t: Date.now(), score: avgScore }].slice(-MAX_HISTORY);
      return next;
    });
  }, [avgScore]);

  return (
    <Shell
      online={apiOnline}
      alerts={alerts}
      toasts={toasts}
      unreadCount={unreadCount}
      onDismissToast={dismissToast}
      onInspectToast={(tx) => setSelected(tx)}
      onMarkAlertsRead={markAllRead}
    >
      {/* ── Stat cards ── */}
      <div className="stat-row">
        <StatCard label="Flagged (Visible)"  value={flaggedCount}  sub="Transactions" iconKey="flagged"  />
        <StatCard label="High Risk"          value={highRiskCount} sub="Transactions" iconKey="highrisk" colorClass="danger" />
        <StatCard label="Avg. Risk Score"    value={avgScore}      sub="Out of 100"   iconKey="avgscore" />
        <StatCard
          label="Volume Scanned"
          value={Math.round(totalVolume / 1000)}
          format={(v) => `₹${v}K`}
          sub="Total Amount"
          iconKey="volume"
        />
      </div>

      {/* ── Live Risk Sparkline ── */}
      <div className="card sparkline-card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <span className="card-title">Live Risk Trend</span>
          <span className="sparkline-legend">
            <span style={{ color: "#10B981" }}>— Safe</span>
            <span style={{ color: "#F59E0B" }}>— Watch</span>
            <span style={{ color: "#EF4444" }}>— Danger</span>
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
            Rolling {scoreHistory.length} points
          </span>
        </div>
        <RiskSparkline history={scoreHistory} />
      </div>

      {/* ── Feed + Gauge/Appetite ── */}
      <div className="feed-gauge-row" style={{ marginBottom: 18 }}>
        {/* Live feed */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="card-header">
            <span className="card-title">Live Transaction Feed</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {feed.length} shown
            </span>
          </div>
          <TxFeed feed={feed} onSelect={(tx) => setSelected(tx)} />
        </div>

        {/* Gauge + Risk Appetite stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Composite Risk Index</span>
            </div>
            <RiskGauge value={avgScore} />
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Risk Appetite</span>
            </div>
            <PrecisionRecall
              apiOnline={apiOnline}
              threshold={threshold}
              onThresholdChange={setThreshold}
            />
          </div>
        </div>
      </div>

      {/* ── AI Insights Hero Section ── */}
      <div style={{ marginBottom: 18 }}>
        <AiInsights />
      </div>

      {/* ── Embedded review queue preview ── */}
      <ReviewQueuePreview feed={feed} onSelect={(tx) => setSelected(tx)} />

      {/* Slide-over */}
      <TxDetailSlide
        tx={selected}
        apiOnline={apiOnline}
        onClose={() => setSelected(null)}
      />
    </Shell>
  );
}
