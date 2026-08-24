// pages/ReviewQueue.jsx — Light theme
import { useState, useMemo } from "react";
import Shell         from "../components/layout/Shell";
import Badge, { BAND_COLOR } from "../components/ui/Badge";
import TxDetailSlide from "../components/panels/TxDetailSlide";
import { useApiHealth } from "../hooks/useApiHealth";
import { useApiPoll }   from "../hooks/useApiPoll";
import { getFeed, normaliseTx, makeSyntheticTx, POLL_FEED_MS } from "../api/client";

const FILTERS = [
  { key: "all",    label: "All Flagged" },
  { key: "danger", label: "High Risk"   },
  { key: "watch",  label: "Watch"       },
];

export default function ReviewQueue() {
  const apiOnline = useApiHealth();
  const [apiData, , loading] = useApiPoll(
    () => getFeed(50), POLL_FEED_MS, [apiOnline]
  );

  const rawFeed = (apiOnline && apiData)
    ? apiData
    : Array.from({ length: 15 }, () => normaliseTx(makeSyntheticTx()));

  const flaggedFeed = rawFeed.filter((t) => t.band !== "safe");

  const [filterBand, setFilterBand] = useState("all");
  const [sortBy,     setSortBy]     = useState("score_desc");
  const [selected,   setSelected]   = useState(null);

  const displayed = useMemo(() => {
    let list = filterBand === "all" ? flaggedFeed : flaggedFeed.filter((t) => t.band === filterBand);
    return [...list].sort((a, b) => {
      if (sortBy === "score_desc")  return b.composite_score - a.composite_score;
      if (sortBy === "score_asc")   return a.composite_score - b.composite_score;
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "newest")      return new Date(b.timestamp) - new Date(a.timestamp);
      return 0;
    });
  }, [flaggedFeed, filterBand, sortBy]);

  return (
    <Shell online={apiOnline}>
      <div className="page-header">
        <div className="page-title">Review Queue</div>
        <div className="page-desc">{displayed.length} cases awaiting analyst decision</div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="queue-filters">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn${filterBand === key ? " active" : ""}`}
              onClick={() => setFilterBand(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          className="form-select"
          style={{ padding: "6px 10px", fontSize: 12 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="score_desc">Highest Score</option>
          <option value="score_asc">Lowest Score</option>
          <option value="amount_desc">Highest Amount</option>
          <option value="newest">Newest First</option>
        </select>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
          {displayed.length} cases
        </span>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Flagged Transactions</span>
          {loading && apiOnline && <span style={{ color: "var(--text-muted)", fontSize: 10 }}>updating…</span>}
        </div>
        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">Queue is empty</div>
            <div className="empty-state-sub">All transactions are within acceptable risk thresholds</div>
          </div>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th>TX ID</th><th>Merchant</th><th>Amount</th>
                <th>Score</th><th>Band</th><th>Time</th><th>Flags</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((tx) => (
                <tr key={tx.tx_id} style={{ cursor: "pointer" }} onClick={() => setSelected(tx)}>
                  <td className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{tx.tx_id}</td>
                  <td style={{ fontWeight: 500 }}>{tx.merchant_name}</td>
                  <td className="mono">₹{tx.amount.toLocaleString("en-IN")}</td>
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
        )}
      </div>

      <TxDetailSlide tx={selected} apiOnline={apiOnline} onClose={() => setSelected(null)} />
    </Shell>
  );
}
