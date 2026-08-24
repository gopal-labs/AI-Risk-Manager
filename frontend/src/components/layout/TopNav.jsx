// components/layout/TopNav.jsx — Full-width navigation with alert bell, Ctrl+K hint, new links
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useState } from "react";
import FraudShieldLogo from "../ui/FraudShieldLogo";
import { Icon3DBell } from "../ui/Official3DIcons";

const TABS = [
  { to: "/",           label: "Home",              end: true  },
  { to: "/console",    label: "Console",            end: true  },
  { to: "/merchants",  label: "Merchants"                      },
  { to: "/queue",      label: "Review Queue"                   },
  { to: "/score",      label: "Score Tx"                       },
  { to: "/audit",      label: "Audit Log"                      },
  { to: "/ring-graph", label: "Ring Graph"                     },
];

function ApiStatusBadge({ online }) {
  if (online === null)
    return <div className="api-badge checking"><span className="api-dot" />Connecting…</div>;
  return (
    <div className={`api-badge ${online ? "connected" : "offline"}`}>
      <span className="api-dot" />
      {online ? "API Connected" : "Offline — Demo"}
    </div>
  );
}

// Alert Bell with animated badge
function AlertBell({ count, alerts, onOpenPalette }) {
  const [open, setOpen] = useState(false);
  const hasNew          = count > 0;

  return (
    <div className="alert-bell-wrap">
      <button
        className={`alert-bell-btn${hasNew ? " has-alerts" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={`${count} unread alerts`}
        title="Alerts"
      >
        <Icon3DBell size={hasNew ? 20 : 17} />
        {hasNew && (
          <span className="alert-bell-badge">{count > 9 ? "9+" : count}</span>
        )}
      </button>

      {open && (
        <>
          <div className="alert-dropdown-backdrop" onClick={() => setOpen(false)} />
          <div className="alert-dropdown">
            <div className="alert-dropdown-header">
              <span className="alert-dropdown-title">Alerts</span>
              {hasNew && <span className="alert-dropdown-count">{count} new</span>}
            </div>
            <div className="alert-dropdown-list">
              {alerts.length === 0 ? (
                <div className="alert-dropdown-empty">No alerts yet</div>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className={`alert-dropdown-item${a.read ? "" : " unread"}`}>
                    <div className="alert-item-dot" style={{
                      background: a.tx.band === "danger" ? "#EF4444" : "#F59E0B"
                    }} />
                    <div className="alert-item-body">
                      <div className="alert-item-merchant">{a.tx.merchant_name}</div>
                      <div className="alert-item-meta">
                        Score {a.tx.composite_score} · ₹{(a.tx.amount || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="alert-item-score" style={{
                      color: a.tx.band === "danger" ? "#EF4444" : "#F59E0B"
                    }}>
                      {a.tx.composite_score}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TopNav({ online, alerts = [], unreadCount = 0, onOpenPalette }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="topnav-full">
      {/* Logo */}
      <div
        className="topnav-logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
        role="button"
        aria-label="Go to home"
      >
        <FraudShieldLogo size={34} />
        <div>
          <div className="topnav-logo-name">Risk Manager</div>
          <div className="topnav-logo-sub">Fraud Intelligence</div>
        </div>
      </div>

      {/* Divider */}
      <div className="topnav-divider" />

      {/* Tabs */}
      <div className="topnav-tabs">
        {TABS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `topnav-tab${isActive ? " active" : ""}`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right */}
      <div className="topnav-right">
        {/* Ctrl+K hint */}
        {onOpenPalette && (
          <button
            className="palette-trigger-btn"
            onClick={onOpenPalette}
            title="Open command palette (Ctrl+K)"
            aria-label="Open command palette"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
        )}

        {/* Alert bell */}
        <AlertBell count={unreadCount} alerts={alerts} />

        {/* Theme toggle */}
        <button
          className="official-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          <div className={`toggle-track ${theme}`}>
            <span className="toggle-thumb">
              {theme === "dark" ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </span>
          </div>
        </button>

        <div className="live-badge">
          <span className="live-dot" />
          SYSTEM LIVE
        </div>
        <ApiStatusBadge online={online} />
      </div>
    </nav>
  );
}
