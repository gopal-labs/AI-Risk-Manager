// components/ui/StatCard.jsx — 3D SVG icons replacing emoji
import { useCountUp } from "../../hooks/useCountUp";
import {
  Icon3DFlag,
  Icon3DShieldAlert,
  Icon3DChart,
  Icon3DCoin,
} from "./Official3DIcons";

const ICON_CONFIG = {
  flagged:  { icon: <Icon3DFlag size={38} />,        cls: "flagged"  },
  highrisk: { icon: <Icon3DShieldAlert size={38} />, cls: "highrisk" },
  avgscore: { icon: <Icon3DChart size={38} />,       cls: "avgscore" },
  volume:   { icon: <Icon3DCoin size={38} />,        cls: "volume"   },
};

export default function StatCard({ label, value, format, colorClass, iconKey, sub }) {
  const animated = useCountUp(typeof value === "number" ? value : 0);
  const display  = format ? format(animated) : animated;
  const cfg      = ICON_CONFIG[iconKey] ?? { icon: <Icon3DFlag size={38} />, cls: "flagged" };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${cfg.cls}`}>{cfg.icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className={`stat-value${colorClass ? " " + colorClass : ""}`}>{display}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
