// pages/Merchants.jsx — Light theme
import { useState, useMemo } from "react";
import Shell        from "../components/layout/Shell";
import MerchantCard from "../components/panels/MerchantCard";
import Spinner      from "../components/ui/Spinner";
import { useApiHealth } from "../hooks/useApiHealth";
import { useApiPoll }   from "../hooks/useApiPoll";
import { getMerchants, syntheticMerchants } from "../api/client";

const SORT_OPTIONS = [
  { value: "risk_desc",   label: "Highest Risk" },
  { value: "risk_asc",    label: "Lowest Risk"  },
  { value: "name_asc",    label: "Name A–Z"     },
  { value: "volume_desc", label: "Highest Volume"},
];
const BANDS = ["all", "danger", "watch", "safe"];
const BAND_LABELS = { all: "All", danger: "High Risk", watch: "Watch", safe: "Safe" };

export default function Merchants() {
  const apiOnline = useApiHealth();
  const [apiMerchants, err, loading] = useApiPoll(getMerchants, 30000, [apiOnline]);

  const apiList = Array.isArray(apiMerchants)
    ? apiMerchants
    : Array.isArray(apiMerchants?.merchants)
    ? apiMerchants.merchants
    : null;

  const raw = (apiOnline && apiList && !err) ? apiList : syntheticMerchants();

  const merchants = (Array.isArray(raw) ? raw : []).map((m) => ({
    id:              m.merchant_id   ?? m.id ?? `M-${Math.random()}`,
    name:            m.merchant_name ?? m.name ?? "Merchant",
    category:        m.merchant_category ?? m.category ?? "General",
    risk_score:      m.risk_profile_score ?? m.risk_score ?? 0,
    chargeback_rate: m.chargeback_rate ?? 0.01,
    tx_count:        m.tx_count ?? 50,
    total_volume:    m.total_volume ?? 100000,
  }));

  const [sort,   setSort]   = useState("risk_desc");
  const [band,   setBand]   = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = merchants;
    if (band !== "all") {
      list = list.filter((m) => {
        const b = m.risk_score >= 70 ? "danger" : m.risk_score >= 40 ? "watch" : "safe";
        return b === band;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) =>
        m.name?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "risk_desc")   return b.risk_score - a.risk_score;
      if (sort === "risk_asc")    return a.risk_score - b.risk_score;
      if (sort === "name_asc")    return (a.name ?? "").localeCompare(b.name ?? "");
      if (sort === "volume_desc") return (b.total_volume ?? 0) - (a.total_volume ?? 0);
      return 0;
    });
  }, [merchants, sort, band, search]);

  return (
    <Shell online={apiOnline}>
      <div className="page-header">
        <div className="page-title">Merchant Intelligence</div>
        <div className="page-desc">Rolling 30-day risk profiles · F2</div>
      </div>

      {/* Toolbar */}
      <div className="merchant-toolbar">
        <div className="queue-filters">
          {BANDS.map((b) => (
            <button
              key={b}
              className={`filter-btn${band === b ? " active" : ""}`}
              onClick={() => setBand(b)}
            >
              {BAND_LABELS[b]}
            </button>
          ))}
        </div>
        <select
          className="form-select"
          style={{ padding: "6px 12px", fontSize: 12 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          className="form-input"
          style={{ padding: "6px 12px", fontSize: 12, minWidth: 200 }}
          placeholder="Search merchant or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
          {filtered.length} merchants
        </span>
      </div>

      {loading && apiOnline ? (
        <Spinner text="Loading merchant profiles…" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-text">No merchants match your filters</div>
          <div className="empty-state-sub">Try adjusting the band or search</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 16 }}>
          <div className="merchant-grid">
            {filtered.map((m) => <MerchantCard key={m.id} merchant={m} />)}
          </div>
        </div>
      )}
    </Shell>
  );
}
