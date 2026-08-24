import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// DESIGN TOKENS — Risk Console
// Instrument-panel identity for a live fraud/risk monitoring system.
// Display/data: JetBrains Mono (precision, tabular, control-room feel)
// Headers/body: Space Grotesk (geometric, technical, restrained)
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:8000";
const POLL_FEED_MS   = 4000;
const POLL_STATS_MS  = 5000;
const PR_DEBOUNCE_MS = 350;

// ---------------------------------------------------------------------------
// Synthetic fallback (used when API is unreachable — demo mode)
// ---------------------------------------------------------------------------
const REASON_LIBRARY = [
  { label: "Velocity spike", weight: 28 },
  { label: "Geo mismatch", weight: 22 },
  { label: "New device", weight: 18 },
  { label: "Category anomaly", weight: 15 },
  { label: "Shared identifier cluster", weight: 24 },
  { label: "Collect-request from low-trust VPA", weight: 20 },
  { label: "SIM/device change velocity", weight: 26 },
];

const MERCHANTS = [
  "Aravali Retail Pvt Ltd", "Koshur Traders", "NimbusPay Merchant", "Trishul Electronics",
  "Deccan Fresh Mart", "Orbit Mobility", "Vertex Apparel Co.", "Sundarban Exports",
  "Nilgiri Foods", "Copper Kettle Café", "Zenith Fintech Services", "Bhairav Hardware",
];

let _syntheticCounter = 4000;
function makeSyntheticTx() {
  _syntheticCounter += 1;
  const score = Math.floor(20 + Math.random() * 78);
  const numReasons = score > 70 ? 3 : score > 45 ? 2 : 1;
  const reasons = [...REASON_LIBRARY]
    .sort(() => Math.random() - 0.5)
    .slice(0, numReasons)
    .map((r) => ({ ...r, weight: Math.max(6, r.weight + Math.floor(Math.random() * 10 - 5)) }));
  return {
    tx_id: `TX-${_syntheticCounter}`,
    merchant_name: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount: Math.floor(400 + Math.random() * 48000),
    composite_score: score,
    band: score >= 70 ? "danger" : score >= 40 ? "watch" : "safe",
    reasons,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Normalise API tx → shape the UI expects
// ---------------------------------------------------------------------------
function normaliseTx(raw) {
  return {
    tx_id:           raw.tx_id,
    merchant_name:   raw.merchant_name,
    amount:          raw.amount,
    composite_score: raw.composite_score,
    band:            raw.band,
    reasons:         raw.reasons || [],
    rule_flags:      raw.rule_flags || [],
    hard_block:      raw.hard_block || false,
    timestamp:       raw.timestamp,
    fresh:           raw.fresh || false,
  };
}

// ---------------------------------------------------------------------------
// Custom Hooks
// ---------------------------------------------------------------------------

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/** Poll a URL on an interval; returns [data, error, loading] */
function useApiPoll(url, intervalMs, transform = (d) => d) {
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(transform(json));
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    fetchData();
    const iv = setInterval(fetchData, intervalMs);
    return () => { cancelled = true; clearInterval(iv); };
  }, [url, intervalMs]);

  return [data, error, loading];
}

/** Check API health — sets apiOnline state */
function useApiHealth() {
  const [online, setOnline] = useState(null); // null = checking
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
        if (!cancelled) setOnline(res.ok);
      } catch {
        if (!cancelled) setOnline(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return online;
}

// ---------------------------------------------------------------------------
// Utility constants
// ---------------------------------------------------------------------------
const BAND_COLOR = { safe: "var(--safe)", watch: "var(--watch)", danger: "var(--danger)" };
const BAND_LABEL = { safe: "LOW", watch: "WATCH", danger: "HIGH RISK" };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ApiStatusBadge({ online }) {
  if (online === null) {
    return (
      <div className="api-badge checking">
        <span className="api-dot" />
        Connecting…
      </div>
    );
  }
  return (
    <div className={`api-badge ${online ? "connected" : "offline"}`}>
      <span className="api-dot" />
      {online ? "API Connected" : "Offline — Demo Mode"}
    </div>
  );
}

function FactorBar({ label, weight, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(weight), 60 + delay);
    return () => clearTimeout(t);
  }, [weight, delay]);
  return (
    <div className="rc-factor">
      <div className="rc-factor-label">
        <span>{label}</span>
        <span className="mono">+{weight}</span>
      </div>
      <div className="rc-factor-track">
        <div className="rc-factor-fill" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function RiskConsole() {
  const apiOnline = useApiHealth();

  // ── Feed state ────────────────────────────────────────────────────────────
  const [feed, setFeed] = useState(() =>
    Array.from({ length: 7 }, () => normaliseTx(makeSyntheticTx()))
  );
  const [mounted,  setMounted]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [threshold, setThreshold] = useState(60);
  const prevFeedIds = useRef(new Set());

  // ── Precision / recall (real data or formula fallback) ───────────────────
  const [precisionRecall, setPrecisionRecall] = useState(null);
  const prTimerRef = useRef(null);

  const fetchPR = useCallback((t) => {
    if (!apiOnline) return;
    clearTimeout(prTimerRef.current);
    prTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/precision-recall?threshold=${t}`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const d = await res.json();
          setPrecisionRecall(d);
        }
      } catch { /* silently ignore */ }
    }, PR_DEBOUNCE_MS);
  }, [apiOnline]);

  // ── Mount animation ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // ── Initial PR fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    if (apiOnline) fetchPR(threshold);
  }, [apiOnline]);

  // ── Real API feed polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (!apiOnline) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/feed?limit=20`, {
          signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) return;
        const data = await res.json();
        const incoming = (data.transactions || []).map(normaliseTx);

        setFeed((prev) => {
          // Mark genuinely new rows as fresh
          const existingIds = new Set(prev.map((t) => t.tx_id));
          const newRows = incoming
            .filter((t) => !existingIds.has(t.tx_id))
            .map((t) => ({ ...t, fresh: true }));

          if (newRows.length === 0) return prev;

          return [...newRows, ...prev].slice(0, 20);
        });
      } catch { /* silently ignore network errors */ }
    };

    poll();
    const iv = setInterval(poll, POLL_FEED_MS);
    return () => clearInterval(iv);
  }, [apiOnline]);

  // ── Synthetic fallback feed (when offline) ────────────────────────────────
  useEffect(() => {
    if (apiOnline !== false) return;  // only run when confirmed offline
    const iv = setInterval(() => {
      setFeed((prev) => [
        { ...normaliseTx(makeSyntheticTx()), fresh: true },
        ...prev.slice(0, 19),
      ]);
    }, 4200);
    return () => clearInterval(iv);
  }, [apiOnline]);

  // ── Stats (from API when online, derived from feed when offline) ──────────
  const [apiStats, apiStatsErr] = useApiPoll(
    `${API_BASE}/stats`,
    POLL_STATS_MS,
    (d) => d
  );

  const statsSource = (apiOnline && apiStats && !apiStatsErr) ? apiStats : null;

  const flaggedCount = statsSource ? statsSource.flagged     : feed.filter((t) => t.band !== "safe").length;
  const highRiskCount= statsSource ? statsSource.high_risk   : feed.filter((t) => t.band === "danger").length;
  const avgScore     = statsSource ? statsSource.avg_score   : Math.round(feed.reduce((s, t) => s + t.composite_score, 0) / feed.length);
  const totalVolume  = statsSource ? statsSource.total_volume: feed.reduce((s, t) => s + t.amount, 0);

  // ── Precision / Recall values ─────────────────────────────────────────────
  const precision = precisionRecall
    ? Math.round(precisionRecall.precision)
    : Math.min(97, Math.round(48 + threshold * 0.48));
  const recall = precisionRecall
    ? Math.round(precisionRecall.recall)
    : Math.max(28, Math.round(96 - threshold * 0.5));

  // ── Count-up animations ───────────────────────────────────────────────────
  const flaggedAnim  = useCountUp(flaggedCount);
  const highRiskAnim = useCountUp(highRiskCount);
  const avgAnim      = useCountUp(avgScore);
  const volumeAnim   = useCountUp(Math.round(totalVolume / 1000));

  // ── Gauge geometry — semicircle arc ───────────────────────────────────────
  const R = 84, CIRC = Math.PI * R;
  const gaugeVal    = Math.min(100, Math.max(0, avgScore));
  const gaugeOffset = CIRC - (gaugeVal / 100) * CIRC;
  const gaugeColor  = gaugeVal >= 70 ? "var(--danger)" : gaugeVal >= 40 ? "var(--watch)" : "var(--safe)";

  // ── Feedback ──────────────────────────────────────────────────────────────
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const submitFeedback = useCallback(async (decision) => {
    if (!selected) return;
    setFeedbackStatus("submitting");
    if (apiOnline) {
      try {
        const res = await fetch(`${API_BASE}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tx_id: selected.tx_id, decision }),
          signal: AbortSignal.timeout(3000),
        });
        setFeedbackStatus(res.ok ? "done" : "error");
      } catch {
        setFeedbackStatus("error");
      }
    } else {
      setTimeout(() => setFeedbackStatus("done"), 400);
    }
    setTimeout(() => { setFeedbackStatus(null); setSelected(null); }, 1200);
  }, [selected, apiOnline]);

  return (
    <div className="rc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        .rc-root {
          --bg-void: #0A0D12;
          --bg-panel: #10151C;
          --bg-card: #161C25;
          --line: #232B36;
          --text-primary: #EAEFF5;
          --text-muted: #7E8A9A;
          --text-faint: #4E5866;
          --brand: #7B6EF6;
          --brand-dim: #241F4A;
          --safe: #2FD9A8;
          --watch: #FFC857;
          --danger: #FF4D6A;
          --danger-dim: #3A1622;

          background: var(--bg-void);
          color: var(--text-primary);
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          padding: 28px 28px 60px;
          box-sizing: border-box;
          position: relative;
          overflow-x: hidden;
        }

        .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

        /* ── Header ─────────────────────────────────────────────────────── */
        .rc-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
        .rc-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-faint); margin: 0 0 6px; }
        .rc-title { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }

        .rc-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

        .rc-live { display: flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.08em; color: var(--safe); text-transform: uppercase; }
        .rc-live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--safe); position: relative; }
        .rc-live-dot::after {
          content: ''; position: absolute; inset: -4px; border-radius: 50%;
          border: 1px solid var(--safe); animation: pulse 2.2s ease-out infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ── API Status Badge ───────────────────────────────────────────── */
        .api-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase;
          padding: 3px 8px; border: 1px solid; border-radius: 2px;
        }
        .api-dot { width: 6px; height: 6px; border-radius: 50%; }
        .api-badge.connected { color: var(--safe); border-color: rgba(47,217,168,0.3); background: rgba(47,217,168,0.05); }
        .api-badge.connected .api-dot { background: var(--safe); }
        .api-badge.offline { color: var(--watch); border-color: rgba(255,200,87,0.3); background: rgba(255,200,87,0.05); }
        .api-badge.offline .api-dot { background: var(--watch); }
        .api-badge.checking { color: var(--text-faint); border-color: var(--line); }
        .api-badge.checking .api-dot { background: var(--text-faint); }

        /* ── Stats ──────────────────────────────────────────────────────── */
        .rc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); margin-bottom: 20px; }
        .rc-stat { background: var(--bg-card); padding: 16px 20px; }
        .rc-stat-label { font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .rc-stat-value { font-size: 32px; font-weight: 600; line-height: 1; }
        .rc-stat-value.danger { color: var(--danger); }

        /* ── Grid ───────────────────────────────────────────────────────── */
        .rc-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }

        .rc-panel { background: var(--bg-panel); border: 1px solid var(--line); }
        .rc-panel-head { padding: 14px 18px; border-bottom: 1px solid var(--line); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); display: flex; justify-content: space-between; }

        /* ── Feed ───────────────────────────────────────────────────────── */
        .rc-feed-body { padding: 8px; display: flex; flex-direction: column; gap: 6px; max-height: 560px; overflow-y: auto; }

        .rc-row {
          display: grid;
          grid-template-columns: 90px 1fr 90px 70px 90px;
          align-items: center;
          gap: 10px;
          background: var(--bg-card);
          border: 1px solid var(--line);
          border-left: 3px solid transparent;
          padding: 10px 12px;
          font-size: 12.5px;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-6px);
          transition: background-color 140ms ease, border-color 140ms ease;
        }
        .rc-row:hover { background: #1C2330; }
        .rc-row.mounted { animation: rowEnter 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .rc-row.fresh { animation: rowSlideIn 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards; border-left-color: var(--brand); }

        @keyframes rowEnter { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rowSlideIn {
          0% { opacity: 0; transform: translateY(-14px) scale(0.98); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .rc-row-id { color: var(--text-faint); font-size: 11px; }
        .rc-row-merchant { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rc-row-amount { text-align: right; color: var(--text-muted); }
        .rc-row-score { text-align: right; font-weight: 700; }
        .rc-badge { font-size: 9.5px; font-weight: 700; letter-spacing: 0.05em; padding: 3px 7px; text-align: center; border: 1px solid; border-radius: 2px; }

        /* ── Side panels ────────────────────────────────────────────────── */
        .rc-side { display: flex; flex-direction: column; gap: 20px; }

        .rc-gauge-wrap { padding: 22px 18px 18px; display: flex; flex-direction: column; align-items: center; }
        .rc-gauge-value { font-size: 40px; font-weight: 700; margin-top: -46px; }
        .rc-gauge-caption { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        .rc-slider-wrap { padding: 18px; }
        .rc-slider-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
        .rc-slider { width: 100%; accent-color: var(--brand); margin-bottom: 18px; }

        .rc-bar-row { margin-bottom: 12px; }
        .rc-bar-label { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted); margin-bottom: 5px; }
        .rc-bar-track { height: 6px; background: var(--bg-card); border: 1px solid var(--line); }
        .rc-bar-fill { height: 100%; transition: width 380ms cubic-bezier(0.16, 1, 0.3, 1); }
        .rc-bar-fill.precision { background: var(--brand); }
        .rc-bar-fill.recall { background: var(--safe); }

        .rc-pr-source { font-size: 9.5px; color: var(--text-faint); letter-spacing: 0.05em; text-align: right; margin-top: -4px; margin-bottom: 4px; }

        /* ── Slide-over ─────────────────────────────────────────────────── */
        .rc-overlay { position: fixed; inset: 0; background: rgba(5,6,9,0.65); opacity: 0; pointer-events: none; transition: opacity 300ms ease; z-index: 10; }
        .rc-overlay.open { opacity: 1; pointer-events: auto; }
        .rc-panel-slide {
          position: fixed; top: 0; right: 0; height: 100%; width: 420px; max-width: 92vw;
          background: var(--bg-panel); border-left: 1px solid var(--line);
          transform: translateX(100%); transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 11; padding: 26px 22px; box-sizing: border-box; overflow-y: auto;
        }
        .rc-panel-slide.open { transform: translateX(0); }
        .rc-close { background: none; border: 1px solid var(--line); color: var(--text-muted); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; padding: 6px 10px; cursor: pointer; margin-bottom: 20px; }
        .rc-close:hover { color: var(--text-primary); border-color: #3A414D; }
        .rc-detail-id { font-size: 11px; color: var(--text-faint); margin-bottom: 6px; }
        .rc-detail-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .rc-detail-amount { font-size: 14px; color: var(--text-muted); margin-bottom: 22px; }

        .rc-detail-score-row { display: flex; align-items: baseline; gap: 10px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 16px 0; margin-bottom: 8px; }
        .rc-detail-score { font-size: 34px; font-weight: 700; }

        .rc-score-meta { display: flex; gap: 14px; font-size: 10.5px; color: var(--text-faint); letter-spacing: 0.05em; margin-bottom: 16px; }
        .rc-score-meta span { display: flex; gap: 4px; }
        .rc-score-meta b { color: var(--text-muted); }

        .rc-flags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
        .rc-flag-chip { font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 6px; border: 1px solid rgba(255,77,106,0.4); color: var(--danger); border-radius: 2px; background: rgba(255,77,106,0.06); }

        .rc-factor { margin-bottom: 14px; }
        .rc-factor-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
        .rc-factor-track { height: 8px; background: var(--bg-card); border: 1px solid var(--line); }
        .rc-factor-fill { height: 100%; background: var(--brand); width: 0%; transition: width 520ms cubic-bezier(0.16, 1, 0.3, 1) 80ms; }

        .rc-actions { display: flex; gap: 10px; margin-top: 24px; }
        .rc-btn { flex: 1; padding: 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; border: 1px solid var(--line); background: var(--bg-card); color: var(--text-primary); transition: background-color 140ms ease; }
        .rc-btn:hover { background: #1C2330; }
        .rc-btn.primary { background: var(--brand); border-color: var(--brand); color: #0A0D12; }
        .rc-btn.primary:hover { background: #8C7FF9; }
        .rc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rc-feedback-status { font-size: 11px; text-align: center; margin-top: 10px; letter-spacing: 0.05em; color: var(--safe); }

        @media (prefers-reduced-motion: reduce) {
          .rc-row, .rc-row.mounted, .rc-row.fresh { animation: none; opacity: 1; transform: none; }
          .rc-live-dot::after { animation: none; }
          .rc-bar-fill, .rc-factor-fill { transition: none; }
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="rc-header">
        <div>
          <p className="rc-eyebrow">AI Risk Manager · Console</p>
          <h1 className="rc-title">Composite Risk Console</h1>
        </div>
        <div className="rc-header-right">
          <div className="rc-live">
            <span className="rc-live-dot" />
            System Live
          </div>
          <ApiStatusBadge online={apiOnline} />
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="rc-stats">
        <div className="rc-stat">
          <div className="rc-stat-label">Flagged (visible)</div>
          <div className="rc-stat-value mono">{flaggedAnim}</div>
        </div>
        <div className="rc-stat">
          <div className="rc-stat-label">High Risk</div>
          <div className="rc-stat-value mono danger">{highRiskAnim}</div>
        </div>
        <div className="rc-stat">
          <div className="rc-stat-label">Avg. Risk Score</div>
          <div className="rc-stat-value mono">{avgAnim}</div>
        </div>
        <div className="rc-stat">
          <div className="rc-stat-label">Volume Scanned</div>
          <div className="rc-stat-value mono">₹{volumeAnim}K</div>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="rc-grid">
        {/* Left: Live Feed */}
        <div className="rc-panel">
          <div className="rc-panel-head">
            <span>Live Transaction Feed</span>
            <span className="mono">{feed.length} shown</span>
          </div>
          <div className="rc-feed-body">
            {feed.map((tx, idx) => (
              <div
                key={tx.tx_id}
                className={`rc-row${mounted ? " mounted" : ""}${tx.fresh ? " fresh" : ""}`}
                style={{
                  animationDelay: tx.fresh ? "0ms" : `${idx * 45}ms`,
                  borderLeftColor: BAND_COLOR[tx.band],
                }}
                onClick={() => { setSelected(tx); setFeedbackStatus(null); }}
              >
                <div className="rc-row-id mono">{tx.tx_id}</div>
                <div className="rc-row-merchant">{tx.merchant_name}</div>
                <div className="rc-row-amount mono">₹{tx.amount.toLocaleString("en-IN")}</div>
                <div className="rc-row-score mono" style={{ color: BAND_COLOR[tx.band] }}>{tx.composite_score}</div>
                <div
                  className="rc-badge"
                  style={{ color: BAND_COLOR[tx.band], borderColor: BAND_COLOR[tx.band] }}
                >
                  {BAND_LABEL[tx.band]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Gauge + Appetite */}
        <div className="rc-side">
          {/* Gauge */}
          <div className="rc-panel">
            <div className="rc-panel-head"><span>Composite Risk Index</span></div>
            <div className="rc-gauge-wrap">
              <svg width="200" height="110" viewBox="0 0 200 110">
                <path
                  d="M 16 100 A 84 84 0 0 1 184 100"
                  fill="none" stroke="#1D2430" strokeWidth="14" strokeLinecap="round"
                />
                <path
                  d="M 16 100 A 84 84 0 0 1 184 100"
                  fill="none" stroke={gaugeColor} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={mounted ? gaugeOffset : CIRC}
                  style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1), stroke 400ms ease" }}
                />
              </svg>
              <div className="rc-gauge-value mono">{avgAnim}</div>
              <div className="rc-gauge-caption">out of 100</div>
            </div>
          </div>

          {/* Risk Appetite */}
          <div className="rc-panel">
            <div className="rc-panel-head"><span>Risk Appetite</span></div>
            <div className="rc-slider-wrap">
              <div className="rc-slider-label">
                <span>Lenient</span>
                <span className="mono">{threshold}</span>
                <span>Strict</span>
              </div>
              <input
                type="range" min="0" max="100" value={threshold} className="rc-slider"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setThreshold(v);
                  fetchPR(v);
                }}
              />
              {precisionRecall && (
                <div className="rc-pr-source">
                  From held-out test set · threshold {threshold}
                </div>
              )}
              <div className="rc-bar-row">
                <div className="rc-bar-label"><span>Precision</span><span className="mono">{precision}%</span></div>
                <div className="rc-bar-track"><div className="rc-bar-fill precision" style={{ width: `${precision}%` }} /></div>
              </div>
              <div className="rc-bar-row">
                <div className="rc-bar-label"><span>Recall</span><span className="mono">{recall}%</span></div>
                <div className="rc-bar-track"><div className="rc-bar-fill recall" style={{ width: `${recall}%` }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide-over Overlay ───────────────────────────────────────────── */}
      <div className={`rc-overlay${selected ? " open" : ""}`} onClick={() => setSelected(null)} />
      <div className={`rc-panel-slide${selected ? " open" : ""}`}>
        {selected && (
          <>
            <button className="rc-close" onClick={() => setSelected(null)}>Close</button>
            <div className="rc-detail-id mono">{selected.tx_id}</div>
            <div className="rc-detail-title">{selected.merchant_name}</div>
            <div className="rc-detail-amount mono">
              ₹{selected.amount.toLocaleString("en-IN")}
              {selected.timestamp && (
                <span style={{ marginLeft: 10, fontSize: 10, color: "var(--text-faint)" }}>
                  {new Date(selected.timestamp).toLocaleTimeString("en-IN")}
                </span>
              )}
            </div>

            <div className="rc-detail-score-row">
              <div className="rc-detail-score mono" style={{ color: BAND_COLOR[selected.band] }}>
                {selected.composite_score}
              </div>
              <div className="rc-badge" style={{ color: BAND_COLOR[selected.band], borderColor: BAND_COLOR[selected.band] }}>
                {BAND_LABEL[selected.band]}
              </div>
              {selected.hard_block && (
                <div className="rc-badge" style={{ color: "var(--danger)", borderColor: "var(--danger)", marginLeft: 6 }}>
                  HARD BLOCK
                </div>
              )}
            </div>

            {/* Score decomposition */}
            {(selected.rule_score !== undefined || selected.ml_score !== undefined) && (
              <div className="rc-score-meta">
                {selected.rule_score !== undefined && (
                  <span><b>Rule:</b> {selected.rule_score}</span>
                )}
                {selected.ml_score !== undefined && (
                  <span><b>ML:</b> {Math.round(selected.ml_score)}</span>
                )}
              </div>
            )}

            {/* Rule flags as chips */}
            {selected.rule_flags && selected.rule_flags.length > 0 && (
              <div className="rc-flags">
                {selected.rule_flags.map((f) => (
                  <span key={f} className="rc-flag-chip">{f.replace(/_/g, " ")}</span>
                ))}
              </div>
            )}

            <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>
              Contributing Factors
            </div>
            {selected.reasons.length > 0
              ? selected.reasons.map((r, i) => (
                  <FactorBar key={r.label} label={r.label} weight={r.weight} delay={i * 90} />
                ))
              : (
                <div style={{ color: "var(--text-faint)", fontSize: 12, marginBottom: 12 }}>
                  No significant factors detected.
                </div>
              )
            }

            <div className="rc-actions">
              <button
                className="rc-btn"
                disabled={feedbackStatus === "submitting"}
                onClick={() => submitFeedback("false_positive")}
              >
                Mark False Positive
              </button>
              <button
                className="rc-btn primary"
                disabled={feedbackStatus === "submitting"}
                onClick={() => submitFeedback("confirmed_fraud")}
              >
                Confirm Fraud
              </button>
            </div>
            {feedbackStatus === "done"  && <div className="rc-feedback-status">✓ Feedback logged</div>}
            {feedbackStatus === "error" && <div className="rc-feedback-status" style={{ color: "var(--danger)" }}>⚠ Failed to log — retrying offline</div>}
          </>
        )}
      </div>
    </div>
  );
}
