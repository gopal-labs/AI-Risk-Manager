// pages/Landing.jsx — Animated landing page
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useCountUp }      from "../hooks/useCountUp";
import { useState, useEffect } from "react";

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`reveal${visible ? " visible" : ""}${className ? " " + className : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Animated counter (fires on scroll) ───────────────────────────────────────
function AnimatedStat({ target, suffix = "", prefix = "" }) {
  const [ref, visible] = useScrollReveal(0.2);
  const [started, setStarted] = useState(false);
  useEffect(() => { if (visible && !started) setStarted(true); }, [visible]);
  const val = useCountUp(started ? target : 0);
  return (
    <span ref={ref} className="stats-val">
      {prefix}{val}{suffix}
    </span>
  );
}

import {
  IconRealTimeScoring,
  IconMerchantProfile,
  IconHybridEngine,
  IconExplainableAI,
  IconRingDetection,
  IconRiskAppetite,
  IconTransactionArrives,
  IconDualScoring,
  IconActionableVerdict,
} from "../components/ui/Official3DIcons";

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <IconRealTimeScoring />, cls: "fi-blue",
    tag: "F1",
    title: "Real-Time Transaction Scoring",
    desc: "Sub-200ms scoring pipeline combining rule engine + XGBoost ML. Every UPI payment evaluated before it settles.",
  },
  {
    icon: <IconMerchantProfile />, cls: "fi-green",
    tag: "F2",
    title: "Merchant Risk Profiling",
    desc: "Rolling 30-day behavioral profiles. Chargeback rates, velocity patterns, and category anomaly detection per merchant.",
  },
  {
    icon: <IconHybridEngine />, cls: "fi-purple",
    tag: "F3",
    title: "Hybrid Rule + ML Engine",
    desc: "Deterministic rule flags combined with a gradient-boosted model. Best of both worlds — auditable and adaptive.",
  },
  {
    icon: <IconExplainableAI />, cls: "fi-amber",
    tag: "F5",
    title: "Explainable AI (SHAP)",
    desc: "Every score comes with SHAP factor breakdowns. Analysts understand exactly why a transaction was flagged.",
  },
  {
    icon: <IconRingDetection />, cls: "fi-teal",
    tag: "F6",
    title: "Ring Detection (Graph)",
    desc: "NetworkX-powered ring fraud detection. Shared devices, VPAs, and IP clusters surface connected fraud rings.",
  },
  {
    icon: <IconRiskAppetite />, cls: "fi-red",
    tag: "F8",
    title: "Risk Appetite Control",
    desc: "Interactive precision-recall slider. Tune the threshold to balance fraud catch rate vs. false positive rate.",
  },
];

const HOW_STEPS = [
  {
    num: "1", icon: <IconTransactionArrives />,
    title: "Transaction Arrives",
    desc: "A UPI payment hits the scoring API. Merchant data, device fingerprint, IP, velocity — all extracted instantly.",
  },
  {
    num: "2", icon: <IconDualScoring />,
    title: "AI Scores It",
    desc: "Rule engine fires first (hard blocks), then XGBoost computes a 0–100 composite risk score in under 200ms.",
  },
  {
    num: "3", icon: <IconActionableVerdict />,
    title: "Analyst Decides",
    desc: "SHAP explanations surface contributing factors. Analyst confirms fraud or marks false positive — feeding the model.",
  },
];

import {
  Icon3DPython,
  Icon3DFastAPI,
  Icon3DXGBoost,
  Icon3DSHAP,
  Icon3DNetworkX,
  Icon3DReact,
  Icon3DRecharts,
  Icon3DVite,
  Icon3DPandas,
  Icon3DScikit,
} from "../components/ui/Official3DIcons";

const TECH = [
  { icon: <Icon3DPython />,   label: "Python 3.11"  },
  { icon: <Icon3DFastAPI />,  label: "FastAPI"      },
  { icon: <Icon3DXGBoost />,  label: "XGBoost"     },
  { icon: <Icon3DSHAP />,     label: "SHAP"        },
  { icon: <Icon3DNetworkX />, label: "NetworkX"    },
  { icon: <Icon3DReact />,    label: "React 18"    },
  { icon: <Icon3DRecharts />, label: "Recharts"    },
  { icon: <Icon3DVite />,     label: "Vite"        },
  { icon: <Icon3DPandas />,   label: "Pandas"      },
  { icon: <Icon3DScikit />,   label: "scikit-learn" },
];

import FraudShieldLogo from "../components/ui/FraudShieldLogo";

// ── Landing page ──────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="landing">
      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <FraudShieldLogo size={36} />
          <div>
            <div className="landing-nav-name">Risk Manager</div>
            <div className="landing-nav-sub">Fraud Intelligence</div>
          </div>
        </div>

        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how"      className="landing-nav-link">How It Works</a>
          <a href="#tech"     className="landing-nav-link">Tech Stack</a>
        </div>

        <Link to="/console" className="landing-btn-console">
          Open Console →
        </Link>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="hero-section" id="top">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-blob3" aria-hidden="true" />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, width: "100%" }}>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Razorpay AI Builder · Track 2 · v1.0
            </div>

            <h1 className="hero-title">
              AI-Powered Fraud &amp;<br />
              <span className="hero-title-gradient">Risk Intelligence</span>
            </h1>

            <p className="hero-subtitle">
              Real-time transaction scoring, merchant profiling, and
              explainable AI — purpose-built for India's UPI payment ecosystem.
              Sub-200ms decisions. Full auditability.
            </p>

            <div className="hero-ctas">
              <Link to="/console" className="btn-hero-primary">
                Open Dashboard →
              </Link>
              <a
                href="#features"
                className="btn-hero-secondary"
              >
                Explore Features ↓
              </a>
            </div>
          </div>

          {/* Mini dashboard mockup */}
          <div className="hero-mockup" aria-hidden="true">
            <div className="hero-mockup-bar">
              <span className="hero-mockup-dot" style={{ background: "#FF5F57" }} />
              <span className="hero-mockup-dot" style={{ background: "#FEBC2E" }} />
              <span className="hero-mockup-dot" style={{ background: "#28C840" }} />
              <span style={{ marginLeft: 12, fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono" }}>
                localhost:5173/console
              </span>
            </div>
            <div className="hero-mockup-inner">
              {[
                { label: "Flagged", val: "5",     sub: "Transactions",  col: "#4F6EF7" },
                { label: "High Risk", val: "2",   sub: "Transactions",  col: "#EF4444" },
                { label: "Avg Score", val: "55",  sub: "Out of 100",    col: "#F59E0B" },
                { label: "Volume",    val: "₹244K",sub: "Total Amount", col: "#10B981" },
              ].map(({ label, val, sub, col }) => (
                <div key={label} className="hero-mockup-card">
                  <div className="hero-mockup-card-title">{label}</div>
                  <div className="hero-mockup-card-val" style={{ color: col }}>{val}</div>
                  <div className="hero-mockup-card-sub">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll" aria-hidden="true">
          <span>scroll</span>
          <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
            <rect x="5" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="4.5" r="1.5" fill="currentColor" />
            <path d="M8 14 L8 20 M5 17 L8 20 L11 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { val: 200,  suffix: "ms",  prefix: "<", label: "Scoring Latency",       sub: "Per transaction end-to-end" },
            { val: 95,   suffix: "%",              label: "Model Precision",          sub: "At threshold=0.6 on test set" },
            { val: 10,   suffix: "+",              label: "Risk Signals",             sub: "Device, geo, velocity, rules" },
            { val: 100,  suffix: "%",              label: "Explainability Coverage",  sub: "Every score has SHAP factors" },
          ].map(({ val, suffix, prefix, label, sub }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="stats-item">
                <AnimatedStat target={val} suffix={suffix} prefix={prefix} />
                <div className="stats-label">{label}</div>
                <div className="stats-sub">{sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">Platform Capabilities</div>
            <h2 className="section-title">Every layer of fraud protection,<br />in one platform</h2>
            <p className="section-subtitle">
              From raw transaction data to an analyst-ready decision — completely automated, fully transparent.
            </p>
          </Reveal>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="feature-card">
                  <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                  <div className="feature-tag">{f.tag}</div>
                  <div className="feature-title" style={{ marginTop: 10 }}>{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────────── */}
      <section className="how-section" id="how">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div className="section-label">The Process</div>
            <h2 className="section-title">From payment to decision<br />in under 200ms</h2>
          </Reveal>

          <div className="how-steps">
            {HOW_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 150}>
                <div className="how-step">
                  <div className="how-step-num">{s.num}</div>
                  <span className="how-step-icon">{s.icon}</span>
                  <div className="how-step-title">{s.title}</div>
                  <div className="how-step-desc">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech stack ──────────────────────────────────────────── */}
      <section className="tech-section" id="tech">
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div className="section-label">Technology</div>
            <h2 className="section-title">Built on battle-tested tools</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Open-source, production-ready components chosen for performance and interpretability.
            </p>
          </Reveal>
          <div className="tech-pills">
            {TECH.map((t, i) => (
              <Reveal key={t.label} delay={i * 50}>
                <div className="tech-pill">
                  <span className="tech-pill-icon">{t.icon}</span>
                  {t.label}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="cta-section">
        <Reveal>
          <h2 className="cta-title">
            Smarter Decisions.<br />
            <span className="hero-title-gradient">Stronger Protection.</span>
          </h2>
          <p className="cta-subtitle">
            Real-time monitoring, intelligent analytics, and proactive risk management — ready to explore now.
          </p>
          <div className="cta-buttons">
            <Link to="/console" className="btn-hero-primary">
              Open Dashboard →
            </Link>
            <Link to="/score" className="btn-hero-secondary">
              Score a Transaction
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-left">
          <FraudShieldLogo size={28} />
          <div className="landing-footer-name">AI Risk Manager · Fraud Intelligence</div>
        </div>
        <div className="landing-footer-right">
          Razorpay AI Builder · Track 2 · v1.0 · Built with React + FastAPI
        </div>
      </footer>
    </div>
  );
}
