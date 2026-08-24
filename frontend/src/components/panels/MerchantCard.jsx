// components/panels/MerchantCard.jsx — Compact 3-col, light theme
import { useNavigate } from "react-router-dom";
import { BAND_COLOR } from "../ui/Badge";

export default function MerchantCard({ merchant }) {
  const navigate  = useNavigate();
  const score     = merchant.risk_score ?? merchant.risk_profile_score ?? 0;
  const band      = score >= 70 ? "danger" : score >= 40 ? "watch" : "safe";
  const color     = BAND_COLOR[band];
  const id        = merchant.id ?? merchant.merchant_id;

  return (
    <div
      className="merchant-card"
      onClick={() => navigate(`/merchants/${id}`)}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/merchants/${id}`)}
    >
      <div className="mc-header">
        <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
          <div className="mc-name truncate">{merchant.name ?? merchant.merchant_name}</div>
          <div className="mc-category">{merchant.category ?? merchant.merchant_category}</div>
        </div>
        <div className="mc-score" style={{ color }}>{score}</div>
      </div>

      {/* Risk bar */}
      <div className="mc-bar-track">
        <div className="mc-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>

      <div className="mc-stats">
        {merchant.chargeback_rate !== undefined && (
          <div className="mc-stat">CB Rate <b>{(merchant.chargeback_rate * 100).toFixed(1)}%</b></div>
        )}
        {merchant.tx_count !== undefined && (
          <div className="mc-stat">Txs <b>{merchant.tx_count}</b></div>
        )}
        {merchant.total_volume !== undefined && (
          <div className="mc-stat">Vol <b>₹{Math.round(merchant.total_volume / 1000)}K</b></div>
        )}
      </div>
    </div>
  );
}
