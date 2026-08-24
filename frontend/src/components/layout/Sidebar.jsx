// components/layout/Sidebar.jsx — Sidebar with 3D Navigation Icons
import { NavLink } from "react-router-dom";
import {
  Icon3DConsole,
  Icon3DStore,
  Icon3DQueue,
  Icon3DTarget,
  Icon3DAudit,
  Icon3DWebRing,
} from "../ui/Official3DIcons";

const NAV_ITEMS = [
  { to: "/console",    icon: Icon3DConsole, label: "Risk Console"      },
  { to: "/merchants",  icon: Icon3DStore,   label: "Merchants"         },
  { to: "/queue",      icon: Icon3DQueue,   label: "Review Queue"      },
  { to: "/score",      icon: Icon3DTarget,  label: "Score Transaction" },
  { to: "/audit",      icon: Icon3DAudit,   label: "Audit Log"         },
  { to: "/ring-graph", icon: Icon3DWebRing, label: "Ring Visualizer"   },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">AI</div>
        <div>
          <div className="sidebar-logo-name">Risk Manager</div>
          <div className="sidebar-logo-sub">Fraud Intelligence</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Operations</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: IconComp, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/console"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-item-icon" style={{ display: "inline-flex", alignItems: "center" }}>
              {typeof IconComp === "function" ? <IconComp size={18} /> : IconComp}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        Razorpay AI Builder<br />
        Track 2 · v1.0
      </div>
    </aside>
  );
}
