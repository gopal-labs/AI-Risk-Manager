import { useState, useEffect, useRef } from "react";
import Shell    from "../components/layout/Shell";
import Badge, { BAND_COLOR } from "../components/ui/Badge";
import FactorBar from "../components/ui/FactorBar";
import RiskGauge from "../components/ui/RiskGauge";
import { useApiHealth }    from "../hooks/useApiHealth";
import { scoreTransaction } from "../api/client";
import { Icon3DPresetBolt, Icon3DPresetDot } from "../components/ui/Official3DIcons";

const DEFAULT_FORM = {
  merchant_id:       "M1001",
  merchant_name:     "Test Merchant",
  merchant_category: "Retail",
  amount:            "5000",
  ip:                "203.0.113.42",
  vpa:               "test@upi",
  device_id:         "DEV-001",
  velocity_count:    "2",
};

const BOOL_FLAGS = [
  { key: "is_new_device",       label: "New Device"           },
  { key: "geo_mismatch",        label: "Geo Mismatch"         },
  { key: "collect_request",     label: "Collect Request"      },
  { key: "sim_change_velocity", label: "SIM Change Velocity"  },
  { key: "category_anomaly",    label: "Category Anomaly"     },
];

// ── Scenario presets ─────────────────────────────────────────────────────────
const PRESETS = [
  {
    key:   "clean",
    label: "Normal Txn",
    dot:   "#10B981",
    form: { merchant_id: "M1005", merchant_name: "Deccan Fresh Mart", merchant_category: "Grocery",
            amount: "850", ip: "10.0.0.1", vpa: "customer@paytm", device_id: "DEV-KNOWN", velocity_count: "1" },
    flags: { is_new_device: false, geo_mismatch: false, collect_request: false, sim_change_velocity: false, category_anomaly: false },
  },
  {
    key:   "overnight",
    label: "High-Value Night",
    dot:   "#F59E0B",
    form: { merchant_id: "M1003", merchant_name: "NimbusPay Merchant", merchant_category: "Fintech",
            amount: "47500", ip: "203.0.113.99", vpa: "highval@upi", device_id: "DEV-007", velocity_count: "8" },
    flags: { is_new_device: true, geo_mismatch: true, collect_request: false, sim_change_velocity: false, category_anomaly: false },
  },
  {
    key:   "collect_ring",
    label: "Collect Request Ring",
    dot:   "#EF4444",
    form: { merchant_id: "M1011", merchant_name: "Zenith Fintech Services", merchant_category: "Fintech",
            amount: "22000", ip: "203.0.113.42", vpa: "fraud@upi", device_id: "DEV-007", velocity_count: "15" },
    flags: { is_new_device: true, geo_mismatch: true, collect_request: true, sim_change_velocity: true, category_anomaly: true },
  },
  {
    key:   "velocity",
    label: "Velocity Bomb",
    dot:   "#EF4444",
    form: { merchant_id: "M1008", merchant_name: "Sundarban Exports", merchant_category: "Export",
            amount: "5000", ip: "198.51.100.77", vpa: "rapid@upi", device_id: "DEV-NEW", velocity_count: "42" },
    flags: { is_new_device: true, geo_mismatch: false, collect_request: false, sim_change_velocity: true, category_anomaly: true },
  },
];

function simulateResult(form, flags) {
  const score = Math.min(99, Math.floor(
    30
    + (flags.is_new_device       ? 18 : 0)
    + (flags.geo_mismatch        ? 22 : 0)
    + (flags.collect_request     ? 20 : 0)
    + (flags.sim_change_velocity ? 26 : 0)
    + (flags.category_anomaly    ? 15 : 0)
    + Math.floor(Math.random() * 15)
  ));
  const band    = score >= 70 ? "danger" : score >= 40 ? "watch" : "safe";
  const reasons = BOOL_FLAGS.filter((f) => flags[f.key])
    .map((f) => ({ label: f.label, weight: Math.floor(12 + Math.random() * 20) }));
  return { composite_score: score, band, reasons, rule_flags: [], latency_ms: null };
}

export default function ScoreTransaction() {
  const apiOnline = useApiHealth();

  const [form,    setForm]    = useState({ ...DEFAULT_FORM });
  const [flags,   setFlags]   = useState({
    is_new_device: false, geo_mismatch: false,
    collect_request: false, sim_change_velocity: false, category_anomaly: false,
  });
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  // What-If: live score estimate (debounced)
  const [liveScore, setLiveScore] = useState(null);
  const whatIfTimer = useRef(null);

  // Compute live estimate whenever form/flags change (client-side only)
  useEffect(() => {
    clearTimeout(whatIfTimer.current);
    whatIfTimer.current = setTimeout(() => {
      setLiveScore(simulateResult(form, flags));
    }, 250);
    return () => clearTimeout(whatIfTimer.current);
  }, [form.amount, form.velocity_count, flags]);

  const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggle = (k)    => setFlags((p) => ({ ...p, [k]: !p[k] }));

  const applyPreset = (preset) => {
    setForm({ ...preset.form });
    setFlags({ ...preset.flags });
    setActivePreset(preset.key);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    const payload = { ...form, ...flags, amount: Number(form.amount), velocity_count: Number(form.velocity_count) };
    try {
      if (apiOnline) {
        setResult(await scoreTransaction(payload));
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setResult(simulateResult(form, flags));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreToShow = result ?? liveScore;
  const color       = scoreToShow ? BAND_COLOR[scoreToShow.band] : undefined;

  return (
    <Shell online={apiOnline}>
      <div style={{ maxWidth: result ? "100%" : 780, margin: "0 auto" }}>
        <div className="page-header" style={{ textAlign: result ? "left" : "center", marginBottom: 20 }}>
          <div className="page-title">Score Transaction</div>
          <div className="page-desc">Manual scoring with AI scenario presets</div>
        </div>

        {/* ── Presets ── */}
        <div className="preset-row">
          <span className="preset-label">
            <Icon3DPresetBolt size={15} />
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={`preset-btn${activePreset === p.key ? " active" : ""}`}
              onClick={() => applyPreset(p)}
              type="button"
            >
              <Icon3DPresetDot color={p.dot} size={12} />
              {p.label}
            </button>
          ))}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: result ? "1fr 1fr" : "1fr",
          gap: 18,
          justifyContent: "center",
        }}>
          {/* Form */}
          <div className="card">
            <div className="card-header"><span className="card-title">Transaction Details</span></div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="score-form-grid">
                  <div className="form-group">
                    <label className="form-label">Merchant ID</label>
                    <input className="form-input" value={form.merchant_id} onChange={(e) => set("merchant_id", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Merchant Name</label>
                    <input className="form-input" value={form.merchant_name} onChange={(e) => set("merchant_name", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" value={form.merchant_category} onChange={(e) => set("merchant_category", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input className="form-input" type="number" min="1" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IP Address</label>
                    <input className="form-input" value={form.ip} onChange={(e) => set("ip", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">VPA (UPI)</label>
                    <input className="form-input" value={form.vpa} onChange={(e) => set("vpa", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Device ID</label>
                    <input className="form-input" value={form.device_id} onChange={(e) => set("device_id", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Velocity Count</label>
                    <input className="form-input" type="number" min="0" value={form.velocity_count} onChange={(e) => set("velocity_count", e.target.value)} />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Risk Signals</label>
                    <div className="toggle-row">
                      {BOOL_FLAGS.map(({ key, label }) => (
                        <button key={key} type="button"
                          className={`toggle-chip${flags[key] ? " on" : ""}`}
                          onClick={() => toggle(key)}
                        >
                          <span className="toggle-chip-dot" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* What-If live preview */}
                {!result && liveScore && (
                  <div className="whatif-preview">
                    <div className="whatif-label">What-If Preview</div>
                    <div className="whatif-score" style={{ color: BAND_COLOR[liveScore.band] }}>
                      {liveScore.composite_score}
                    </div>
                    <Badge band={liveScore.band} />
                    <div className="whatif-hint">Updates live as you change inputs</div>
                  </div>
                )}

                <button type="submit" className="btn primary full" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? "Scoring…" : "⚡ Score Transaction"}
                </button>
                {error && <div style={{ marginTop: 10, fontSize: 12, color: "var(--danger)", textAlign: "center" }}>⚠ {error}</div>}
              </form>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="score-result-card">
              <div className="card-header">
                <span className="card-title">Score Result</span>
                {result.latency_ms && <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{result.latency_ms} ms</span>}
              </div>
              <div className="card-body">
                {/* Score Gauge */}
                <div style={{ marginBottom: 16 }}>
                  <RiskGauge value={result.composite_score} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 60, fontWeight: 700, fontFamily: "JetBrains Mono", color, lineHeight: 1 }}>
                    {result.composite_score}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{form.merchant_name}</div>
                    <Badge band={result.band} />
                    {result.hard_block && <span className="risk-badge danger" style={{ marginLeft: 6 }}>HARD BLOCK</span>}
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontFamily: "JetBrains Mono" }}>
                      {result.latency_ms ? `Scored in ${result.latency_ms} ms` : "Demo mode"}
                    </div>
                  </div>
                </div>

                {result.rule_flags?.length > 0 && (
                  <div className="flag-chips" style={{ marginBottom: 14 }}>
                    {result.rule_flags.map((f) => <span key={f} className="flag-chip">{f.replace(/_/g, " ")}</span>)}
                  </div>
                )}

                {(result.rule_score !== undefined || result.ml_score !== undefined) && (
                  <div className="slide-meta" style={{ marginBottom: 14 }}>
                    {result.rule_score !== undefined && <span><b>Rule:</b> {result.rule_score}</span>}
                    {result.ml_score   !== undefined && <span><b>ML:</b>   {Math.round(result.ml_score)}</span>}
                  </div>
                )}

                {result.reasons?.length > 0 && (
                  <>
                    <div className="factors-label">Contributing Factors</div>
                    {result.reasons.map((r, i) => <FactorBar key={r.label} label={r.label} weight={r.weight} delay={i * 80} />)}
                  </>
                )}

                <button className="btn full" style={{ marginTop: 16 }} onClick={() => setResult(null)}>
                  Clear Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
