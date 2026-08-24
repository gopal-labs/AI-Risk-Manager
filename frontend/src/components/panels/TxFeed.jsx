// components/panels/TxFeed.jsx — Light theme
import { useEffect, useState } from "react";
import Badge, { BAND_COLOR } from "../ui/Badge";

export default function TxFeed({ feed, onSelect }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const list = Array.isArray(feed) ? feed : [];

  return (
    <div className="tx-feed-body">
      {list.map((tx, idx) => (
        <div
          key={tx.tx_id}
          className={`tx-row${mounted ? " mounted" : ""}${tx.fresh ? " fresh" : ""}`}
          style={{
            animationDelay: tx.fresh ? "0ms" : `${idx * 45}ms`,
            borderLeftColor: BAND_COLOR[tx.band],
          }}
          onClick={() => onSelect(tx)}
          role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSelect(tx)}
        >
          <div className="tx-row-id mono">{tx.tx_id}</div>
          <div className="tx-row-merchant truncate">{tx.merchant_name}</div>
          <div className="tx-row-amount mono">₹{(tx.amount || 0).toLocaleString("en-IN")}</div>
          <div className="tx-row-score mono" style={{ color: BAND_COLOR[tx.band] }}>
            {tx.composite_score}
          </div>
          <Badge band={tx.band} />
        </div>
      ))}
    </div>
  );
}
