// components/ui/Official3DIcons.jsx
// ── Premium 3D SVG Icons — Full depth with gradients, bevels, highlights & shadows ──

// ── StatCard Icons ────────────────────────────────────────────────────────────

/** 3D Flag — Flagged Transactions */
export function Icon3DFlag({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(79,110,247,0.45))", overflow: "visible" }}>
      <defs>
        <linearGradient id="flag-face" x1="8" y1="7" x2="32" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="45%" stopColor="#4F6EF7" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="flag-pole" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="40%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id="flag-shadow" x1="8" y1="24" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </linearGradient>
        <filter id="flag-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="14" cy="37" rx="8" ry="2.5" fill="#3730A3" opacity="0.25" />
      {/* Pole — 3D cylinder illusion */}
      <rect x="10.5" y="9" width="3.5" height="27" rx="1.75" fill="url(#flag-pole)" />
      <rect x="10.5" y="9" width="1.2" height="27" rx="0.6" fill="#E0E7FF" fillOpacity="0.5" />
      {/* Flag body */}
      <path d="M13.5 9L30 13.5L13.5 20V9Z" fill="url(#flag-face)" />
      {/* Top-left highlight bevel */}
      <path d="M13.5 9L30 13.5L24 12L13.5 9Z" fill="#FFFFFF" fillOpacity="0.35" />
      {/* Inner shadow on flag bottom */}
      <path d="M13.5 20L30 13.5L28 15L13.5 20Z" fill="#000000" fillOpacity="0.12" />
      {/* Pole top ball */}
      <circle cx="12.25" cy="9" r="2.5" fill="#C7D2FE" />
      <circle cx="11.5" cy="8.2" r="0.9" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  );
}

/** 3D Shield — High Risk */
export function Icon3DShieldAlert({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 4px 12px rgba(239,68,68,0.5))", overflow: "visible" }}>
      <defs>
        <linearGradient id="shield-body" x1="5" y1="3" x2="35" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="40%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="shield-bevel" x1="5" y1="3" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="shield-rim" x1="5" y1="3" x2="7" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="20" cy="38.5" rx="10" ry="2.2" fill="#991B1B" opacity="0.3" />
      {/* Shield outer rim / bevel */}
      <path d="M20 3.5L33 8V19.5C33 27.5 27.5 33.5 20 36.5C12.5 33.5 7 27.5 7 19.5V8L20 3.5Z" fill="url(#shield-rim)" />
      {/* Shield body */}
      <path d="M20 5.5L31 9.8V19.5C31 26.5 26 32 20 34.5C14 32 9 26.5 9 19.5V9.8L20 5.5Z" fill="url(#shield-body)" />
      {/* Top-left bevel highlight */}
      <path d="M20 5.5L31 9.8V17L20 5.5Z" fill="url(#shield-bevel)" />
      <path d="M9 9.8L20 5.5V20L9 9.8Z" fill="#FFFFFF" fillOpacity="0.18" />
      {/* Exclamation mark — stem */}
      <rect x="18.5" y="14" width="3" height="10" rx="1.5" fill="#FFFFFF" />
      {/* Exclamation mark — dot */}
      <circle cx="20" cy="28" r="2" fill="#FFFFFF" />
    </svg>
  );
}

/** 3D Rising Chart — Avg Risk Score */
export function Icon3DChart({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(245,158,11,0.45))", overflow: "visible" }}>
      <defs>
        <linearGradient id="bar1-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="bar2-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bar3-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="bar4-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      {/* Ground / baseline shadow */}
      <rect x="5" y="31" width="30" height="2" rx="1" fill="#78350F" opacity="0.2" />
      {/* Bar 1 (short) */}
      <rect x="7"  y="24" width="5" height="9" rx="2" fill="url(#bar1-grad)" />
      <rect x="7"  y="24" width="2" height="9" rx="1" fill="#FFFFFF" fillOpacity="0.35" />
      {/* Bar top face (3D depth illusion) */}
      <rect x="7" y="23" width="5" height="2" rx="1" fill="#FDE68A" />
      {/* Bar 2 (mid) */}
      <rect x="16" y="17" width="5" height="16" rx="2" fill="url(#bar2-grad)" />
      <rect x="16" y="17" width="2" height="16" rx="1" fill="#FFFFFF" fillOpacity="0.35" />
      <rect x="16" y="16" width="5" height="2"  rx="1" fill="#FCD34D" />
      {/* Bar 3 (tall) */}
      <rect x="25" y="10" width="6" height="23" rx="2" fill="url(#bar3-grad)" />
      <rect x="25" y="10" width="2.2" height="23" rx="1" fill="#FFFFFF" fillOpacity="0.35" />
      <rect x="25" y="9"  width="6" height="2.5" rx="1" fill="#FDE68A" />
      {/* Trend sparkline */}
      <polyline points="9.5,24 21,17 28,10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 1.5" />
      {/* Arrow head */}
      <polygon points="28,8 31,12 25,11" fill="#FFFFFF" />
    </svg>
  );
}

/** 3D Coin — Volume Scanned */
export function Icon3DCoin({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 4px 12px rgba(16,185,129,0.5))", overflow: "visible" }}>
      <defs>
        <linearGradient id="coin-face" cx="50%" cy="35%" r="50%" gradientUnits="objectBoundingBox" id="coin-radial">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="coin-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id="coin-shine" cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Coin side/depth */}
      <ellipse cx="20" cy="26" rx="14" ry="4.5" fill="url(#coin-side)" />
      {/* Coin body */}
      <circle cx="20" cy="19" r="14" fill="#10B981" />
      {/* Radial gradient face */}
      <circle cx="20" cy="19" r="14">
        <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Top face */}
      <ellipse cx="20" cy="19" rx="14" ry="14" fill="url(#coin-radial)" />
      {/* Shine */}
      <ellipse cx="20" cy="19" rx="14" ry="14" fill="url(#coin-shine)" />
      {/* Rim ring */}
      <circle cx="20" cy="19" r="14" stroke="#34D399" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="20" cy="19" r="11" stroke="#6EE7B7" strokeWidth="0.8" fill="none" opacity="0.4" />
      {/* ₹ symbol */}
      <text x="20" y="24.5" textAnchor="middle"
        style={{ fontSize: 14, fontWeight: 700, fill: "#FFFFFF", fontFamily: "system-ui" }}>₹</text>
      {/* Inner shine spot */}
      <ellipse cx="16" cy="15" rx="4.5" ry="3" fill="#FFFFFF" fillOpacity="0.28" transform="rotate(-20 16 15)" />
    </svg>
  );
}

// ── Feature / Landing Icons ────────────────────────────────────────────────────

export function IconRealTimeScoring() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(56,189,248,0.5))", overflow: "visible" }}>
      <defs>
        <linearGradient id="bolt3d-a" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="45%" stopColor="#4F6EF7" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="bolt3d-b" x1="4" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="35" rx="8" ry="2" fill="#1D4ED8" opacity="0.3" />
      {/* Bolt shadow */}
      <path d="M20 3L7 21H17L15 33L29 15H18L20 3Z" fill="#1E3A8A" fillOpacity="0.45" transform="translate(1,1)" />
      {/* Bolt body */}
      <path d="M20 3L7 21H17L15 33L29 15H18L20 3Z" fill="url(#bolt3d-a)" />
      {/* Highlight */}
      <path d="M20 3L17 21H7L20 3Z" fill="url(#bolt3d-b)" />
      {/* Inner edge gleam */}
      <path d="M18 15L29 15L20 3L18 15Z" fill="#FFFFFF" fillOpacity="0.18" />
    </svg>
  );
}

export function IconMerchantProfile() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(16,185,129,0.45))", overflow: "visible" }}>
      <defs>
        <linearGradient id="store3d-wall" x1="4" y1="14" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="store3d-roof" x1="2" y1="4" x2="34" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="34" rx="10" ry="2" fill="#047857" opacity="0.25" />
      {/* Roof / awning */}
      <path d="M2 15L18 4L34 15H2Z" fill="url(#store3d-roof)" />
      <path d="M2 15L18 4L18 15H2Z" fill="#FFFFFF" fillOpacity="0.25" />
      {/* Wall body */}
      <rect x="4" y="15" width="28" height="17" rx="2" fill="url(#store3d-wall)" />
      {/* Door */}
      <rect x="14" y="21" width="8" height="11" rx="2" fill="#065F46" />
      <rect x="14" y="21" width="8" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.15" />
      <circle cx="21" cy="27" r="0.8" fill="#34D399" />
      {/* Windows */}
      <rect x="6"  y="18" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.8" />
      <rect x="24" y="18" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.8" />
      <line x1="9"  y1="18" x2="9"  y2="23" stroke="#059669" strokeWidth="0.8" />
      <line x1="27" y1="18" x2="27" y2="23" stroke="#059669" strokeWidth="0.8" />
    </svg>
  );
}

export function IconHybridEngine() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(139,92,246,0.5))", overflow: "visible" }}>
      <defs>
        <linearGradient id="brain3d-bg" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="brain3d-hl" x1="4" y1="4" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="34.5" rx="10" ry="2" fill="#4C1D95" opacity="0.3" />
      {/* Rounded square body */}
      <rect x="4" y="4" width="28" height="28" rx="8" fill="url(#brain3d-bg)" />
      <rect x="4" y="4" width="28" height="14" rx="8" fill="url(#brain3d-hl)" />
      {/* Neural nodes */}
      <circle cx="12" cy="14" r="3.5" fill="#FFFFFF" />
      <circle cx="24" cy="14" r="3.5" fill="#FFFFFF" />
      <circle cx="18" cy="24" r="3.5" fill="#FFFFFF" />
      <circle cx="12" cy="14" r="1.5" fill="#7C3AED" />
      <circle cx="24" cy="14" r="1.5" fill="#7C3AED" />
      <circle cx="18" cy="24" r="1.5" fill="#7C3AED" />
      {/* Connections */}
      <line x1="12" y1="14" x2="18" y2="24" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="14" x2="18" y2="24" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="14" x2="24" y2="14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconExplainableAI() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(245,158,11,0.5))", overflow: "visible" }}>
      <defs>
        <radialGradient id="lens3d-radial" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
        <linearGradient id="lens-handle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="35" rx="9" ry="2" fill="#78350F" opacity="0.25" />
      {/* Handle 3D */}
      <line x1="24" y1="24" x2="32" y2="32" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="32" stroke="url(#lens-handle)" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="32" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      {/* Lens outer ring */}
      <circle cx="14" cy="14" r="12" fill="#92400E" opacity="0.5" />
      <circle cx="14" cy="14" r="11" fill="url(#lens3d-radial)" />
      {/* Lens inner glass */}
      <circle cx="14" cy="14" r="7.5" fill="#FEF3C7" fillOpacity="0.35" />
      {/* Crosshair */}
      <line x1="14" y1="9"  x2="14" y2="19" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9"  y1="14" x2="19" y2="14" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" fill="#FFFFFF" fillOpacity="0.8" />
      {/* Top-left shine */}
      <ellipse cx="10" cy="10" rx="3.5" ry="2.5" fill="#FFFFFF" fillOpacity="0.4" transform="rotate(-30 10 10)" />
    </svg>
  );
}

export function IconRingDetection() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(20,184,166,0.5))", overflow: "visible" }}>
      <defs>
        <linearGradient id="teal3d-ring" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <radialGradient id="teal3d-node">
          <stop offset="0%" stopColor="#99F6E4" />
          <stop offset="100%" stopColor="#0D9488" />
        </radialGradient>
      </defs>
      <ellipse cx="18" cy="35" rx="9" ry="2" fill="#0F766E" opacity="0.25" />
      {/* Orbit ring with 3D perspective (ellipse) */}
      <ellipse cx="18" cy="19" rx="12" ry="8" stroke="url(#teal3d-ring)" strokeWidth="2.5" strokeDasharray="5 2.5" fill="none" />
      {/* Nodes */}
      {/* Top */}
      <circle cx="18" cy="7"  r="5" fill="#0D9488" />
      <circle cx="18" cy="7"  r="5" fill="url(#teal3d-node)" />
      <circle cx="16" cy="5.5" r="1.8" fill="#FFFFFF" fillOpacity="0.55" />
      {/* Right */}
      <circle cx="29" cy="23" r="4.5" fill="#14B8A6" />
      <circle cx="27.5" cy="21.5" r="1.5" fill="#FFFFFF" fillOpacity="0.5" />
      {/* Left */}
      <circle cx="7"  cy="23" r="4.5" fill="#2DD4BF" />
      <circle cx="5.5" cy="21.5" r="1.5" fill="#FFFFFF" fillOpacity="0.5" />
      {/* Connecting lines */}
      <line x1="18" y1="10" x2="27" y2="20" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="10" x2="9"  y2="20" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="21" x2="9"  y2="21" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconRiskAppetite() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(239,68,68,0.5))", overflow: "visible" }}>
      <defs>
        <radialGradient id="dial-face" cx="42%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
        <radialGradient id="dial-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF1F2" />
          <stop offset="100%" stopColor="#FCA5A5" />
        </radialGradient>
      </defs>
      <ellipse cx="18" cy="35" rx="10" ry="2.2" fill="#7F1D1D" opacity="0.3" />
      {/* Outer dial ring */}
      <circle cx="18" cy="18" r="14.5" fill="#7F1D1D" />
      <circle cx="18" cy="18" r="13.5" fill="url(#dial-face)" />
      {/* Inner dial face */}
      <circle cx="18" cy="18" r="9.5" fill="url(#dial-inner)" />
      {/* Scale arcs */}
      <path d="M8 24 A12 12 0 0 1 28 24" stroke="#B91C1C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M8 24 A12 12 0 0 1 18 6"  stroke="#FCA5A5" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Needle */}
      <line x1="18" y1="18" x2="26" y2="10" stroke="#7F1D1D" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="18" x2="26" y2="10" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      {/* Center cap */}
      <circle cx="18" cy="18" r="3.5" fill="#EF4444" />
      <circle cx="18" cy="18" r="2"   fill="#FFFFFF" />
      {/* Top-left shine */}
      <ellipse cx="13" cy="11" rx="4" ry="2.5" fill="#FFFFFF" fillOpacity="0.35" transform="rotate(-35 13 11)" />
    </svg>
  );
}

export function IconTransactionArrives() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(59,130,246,0.45))", overflow: "visible" }}>
      <defs>
        <linearGradient id="card3d-a" x1="3" y1="7" x2="35" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="card3d-hl" x1="3" y1="7" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="19" cy="36" rx="12" ry="2" fill="#1D4ED8" opacity="0.3" />
      {/* Card depth shadow */}
      <rect x="5" y="11" width="28" height="20" rx="4" fill="#1E3A8A" opacity="0.5" transform="translate(1,1)" />
      {/* Card body */}
      <rect x="4" y="9"  width="30" height="21" rx="4" fill="url(#card3d-a)" />
      {/* Card face highlight */}
      <rect x="4" y="9"  width="30" height="11" rx="4" fill="url(#card3d-hl)" />
      {/* Magnetic stripe */}
      <rect x="4" y="16" width="30" height="5" fill="#1E3A8A" fillOpacity="0.5" />
      {/* Chip */}
      <rect x="8" y="25" width="7" height="4" rx="1" fill="#FDE047" />
      <rect x="8" y="25" width="3" height="4" rx="0.5" fill="#D97706" fillOpacity="0.5" />
      {/* Card number dots */}
      <circle cx="20" cy="27" r="1" fill="#FFFFFF" fillOpacity="0.7" />
      <circle cx="23" cy="27" r="1" fill="#FFFFFF" fillOpacity="0.7" />
      <circle cx="26" cy="27" r="1" fill="#FFFFFF" fillOpacity="0.7" />
    </svg>
  );
}

export function IconDualScoring() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(147,51,234,0.45))", overflow: "visible" }}>
      <defs>
        <radialGradient id="gauge3d-face" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="55%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#4C1D95" />
        </radialGradient>
      </defs>
      <ellipse cx="19" cy="36.5" rx="12" ry="2" fill="#4C1D95" opacity="0.3" />
      {/* Circle body */}
      <circle cx="19" cy="18" r="15" fill="#4C1D95" opacity="0.6" />
      <circle cx="19" cy="18" r="14" fill="url(#gauge3d-face)" />
      {/* Gauge arc track */}
      <path d="M8 26 A13 13 0 0 1 30 26" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Gauge arc filled */}
      <path d="M8 26 A13 13 0 0 1 19 6"  stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Needle */}
      <line x1="19" y1="19" x2="28" y2="12" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" />
      <line x1="19" y1="19" x2="28" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center */}
      <circle cx="19" cy="19" r="4" fill="#7E22CE" />
      <circle cx="19" cy="19" r="2.2" fill="#FFFFFF" />
      {/* Shine */}
      <ellipse cx="13" cy="11" rx="4.5" ry="3" fill="#FFFFFF" fillOpacity="0.3" transform="rotate(-30 13 11)" />
    </svg>
  );
}

export function IconActionableVerdict() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none"
      style={{ filter: "drop-shadow(0 4px 10px rgba(16,185,129,0.5))", overflow: "visible" }}>
      <defs>
        <linearGradient id="verdict-body" x1="4" y1="3" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>
        <linearGradient id="verdict-hl" x1="4" y1="3" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="19" cy="36" rx="11" ry="2" fill="#065F46" opacity="0.3" />
      {/* Shield outer rim */}
      <path d="M19 4L33 8.5V20C33 28.5 26.8 33.8 19 36C11.2 33.8 5 28.5 5 20V8.5L19 4Z" fill="#065F46" opacity="0.7" />
      {/* Shield body */}
      <path d="M19 6L31 10.2V20C31 27.5 25.5 32.5 19 34.5C12.5 32.5 7 27.5 7 20V10.2L19 6Z" fill="url(#verdict-body)" />
      {/* Top bevel */}
      <path d="M19 6L31 10.2V19L19 6Z"  fill="url(#verdict-hl)" />
      <path d="M7 10.2L19 6V20L7 10.2Z" fill="#FFFFFF" fillOpacity="0.18" />
      {/* Check mark */}
      <path d="M13 20L17.5 24.5L25 16" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── 3D Tech Stack Icons ────────────────────────────────────────────────────────

export function Icon3DPython() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(59,130,246,0.4))" }}>
      <defs>
        <linearGradient id="py-top" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="py-bot" x1="2" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path d="M12 2C6.5 2 6 4 6 6V8H12V9H4C2 9 2 11.5 2 14C2 17 3.5 17 6 17H7V15C7 12.5 9 11 11.5 11H16.5C18.5 11 19 10 19 8C19 5.5 17.5 2 12 2Z" fill="url(#py-top)" />
      <path d="M12 22C17.5 22 18 20 18 18V16H12V15H20C22 15 22 12.5 22 10C22 7 20.5 7 18 7H17V9C17 11.5 15 13 12.5 13H7.5C5.5 13 5 14 5 16C5 18.5 6.5 22 12 22Z" fill="url(#py-bot)" />
      <circle cx="9.5" cy="5.5" r="1.2" fill="#FFFFFF" fillOpacity="0.9" />
      <circle cx="14.5" cy="18.5" r="1.2" fill="#FFFFFF" fillOpacity="0.9" />
    </svg>
  );
}

export function Icon3DFastAPI() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(16,185,129,0.45))" }}>
      <defs>
        <radialGradient id="fapi-grad" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="#047857" opacity="0.5" />
      <circle cx="12" cy="12" r="10" fill="url(#fapi-grad)" />
      <path d="M13 4L6 14H12L11 20L18 10H12L13 4Z" fill="#FFFFFF" />
      <ellipse cx="8" cy="7" rx="3" ry="2" fill="#FFFFFF" fillOpacity="0.25" transform="rotate(-30 8 7)" />
    </svg>
  );
}

export function Icon3DXGBoost() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(139,92,246,0.45))" }}>
      <defs>
        <linearGradient id="xgb-grad" x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      <rect x="3" y="5" width="18" height="14" rx="4" fill="url(#xgb-grad)" />
      <rect x="3" y="5" width="18" height="7" rx="4" fill="#FFFFFF" fillOpacity="0.2" />
      <text x="12" y="16" textAnchor="middle" style={{ fontSize: 9, fontWeight: 800, fill: "#FFFFFF", fontFamily: "monospace" }}>XGB</text>
    </svg>
  );
}

export function Icon3DSHAP() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(245,158,11,0.45))" }}>
      <defs>
        <radialGradient id="shap-bulb" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      <path d="M12 2A7 7 0 0 0 5 9C5 12.38 7.4 15.2 10.5 15.85V18.5H13.5V15.85C16.6 15.2 19 12.38 19 9A7 7 0 0 0 12 2Z" fill="url(#shap-bulb)" />
      <ellipse cx="9" cy="6" rx="2.5" ry="1.5" fill="#FFFFFF" fillOpacity="0.4" transform="rotate(-30 9 6)" />
      <rect x="10.5" y="18.5" width="3" height="1.5" rx="0.5" fill="#D97706" />
      <rect x="9.5"  y="20.5" width="5" height="1.5" rx="0.75" fill="#B45309" />
    </svg>
  );
}

export function Icon3DNetworkX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(16,185,129,0.45))" }}>
      <defs>
        <radialGradient id="nx-n1"><stop offset="0%" stopColor="#6EE7B7" /><stop offset="100%" stopColor="#065F46" /></radialGradient>
        <radialGradient id="nx-n2"><stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#047857" /></radialGradient>
        <radialGradient id="nx-n3"><stop offset="0%" stopColor="#A7F3D0" /><stop offset="100%" stopColor="#10B981" /></radialGradient>
      </defs>
      <line x1="6" y1="6" x2="18" y2="6"  stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="6" x2="12" y2="18" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18"y1="6" x2="12" y2="18" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="6"  cy="6"  r="4" fill="url(#nx-n1)" />
      <circle cx="18" cy="6"  r="4" fill="url(#nx-n2)" />
      <circle cx="12" cy="18" r="4" fill="url(#nx-n3)" />
      <circle cx="5.2" cy="5.2" r="1.2" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="17.2"cy="5.2" r="1.2" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="11.2"cy="17.2"r="1.2" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
}

export function Icon3DReact() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(56,189,248,0.45))" }}>
      <defs>
        <linearGradient id="react-orb" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="#38BDF8" strokeWidth="1.8" transform="rotate(30 12 12)" fill="none" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="#0EA5E9" strokeWidth="1.8" transform="rotate(90 12 12)" fill="none" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="#0284C7" strokeWidth="1.8" transform="rotate(150 12 12)" fill="none" />
      <circle cx="12" cy="12" r="3" fill="url(#react-orb)" />
      <circle cx="10.5" cy="10.5" r="1" fill="#FFFFFF" fillOpacity="0.7" />
    </svg>
  );
}

export function Icon3DRecharts() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(239,68,68,0.35))" }}>
      <defs>
        <linearGradient id="rc-bar1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FCA5A5" /><stop offset="100%" stopColor="#B91C1C" /></linearGradient>
        <linearGradient id="rc-bar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6EE7B7" /><stop offset="100%" stopColor="#047857" /></linearGradient>
        <linearGradient id="rc-bar3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#B45309" /></linearGradient>
      </defs>
      <rect x="3"  y="14" width="4.5" height="8"  rx="1.5" fill="url(#rc-bar1)" />
      <rect x="3"  y="14" width="1.8" height="8"  rx="0.8" fill="#FFFFFF" fillOpacity="0.3" />
      <rect x="9.5"y="8"  width="4.5" height="14" rx="1.5" fill="url(#rc-bar2)" />
      <rect x="9.5"y="8"  width="1.8" height="14" rx="0.8" fill="#FFFFFF" fillOpacity="0.3" />
      <rect x="16" y="3"  width="4.5" height="19" rx="1.5" fill="url(#rc-bar3)" />
      <rect x="16" y="3"  width="1.8" height="19" rx="0.8" fill="#FFFFFF" fillOpacity="0.3" />
    </svg>
  );
}

export function Icon3DVite() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(139,92,246,0.45))" }}>
      <defs>
        <linearGradient id="vite-outer" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <path d="M12 2L2.5 5.5L12 22L21.5 5.5L12 2Z" fill="url(#vite-outer)" />
      <path d="M2.5 5.5L12 22L12 2L2.5 5.5Z" fill="#FFFFFF" fillOpacity="0.15" />
      <path d="M14 6L9 14H13L12 19L17 11H13L14 6Z" fill="#FCD34D" />
    </svg>
  );
}

export function Icon3DPandas() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(16,185,129,0.4))" }}>
      <defs>
        <linearGradient id="pandas-bg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="url(#pandas-bg)" />
      <rect x="2.5" y="2.5" width="19" height="9"  rx="5" fill="#FFFFFF" fillOpacity="0.2" />
      <rect x="6" y="6" width="5" height="5" rx="1.5" fill="#FFFFFF" />
      <rect x="13"y="6" width="5" height="5" rx="1.5" fill="#FFFFFF" />
      <rect x="6" y="13"width="5" height="5" rx="1.5" fill="#FFFFFF" />
      <rect x="13"y="13"width="5" height="5" rx="1.5" fill="#34D399" />
    </svg>
  );
}

export function Icon3DScikit() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 5px rgba(245,158,11,0.45))" }}>
      <defs>
        <radialGradient id="scikit-grad" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="#92400E" opacity="0.5" />
      <circle cx="12" cy="12" r="10" fill="url(#scikit-grad)" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6"  y1="12"x2="18" y2="12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="8" cy="8" rx="3" ry="2" fill="#FFFFFF" fillOpacity="0.3" transform="rotate(-35 8 8)" />
    </svg>
  );
}

// ── Utility / Notification Icons ─────────────────────────────────────────────

/** 3D Alarm Bell — Fraud Alert */
export function Icon3DBell({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(239,68,68,0.5))" }}>
      <defs>
        <linearGradient id="bell3d" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>
      {/* Bell body */}
      <path d="M18 9A6 6 0 0 0 6 9c0 7-3 9-3 9h18s-3-2-3-9" fill="url(#bell3d)" />
      {/* Highlight */}
      <path d="M12 3a6 6 0 0 1 6 6c0 3.5-1.2 5.8-2 7.5H8c-.8-1.7-2-4-2-7.5A6 6 0 0 1 12 3z"
        fill="#FFFFFF" fillOpacity="0.18" />
      {/* Clapper */}
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Shine */}
      <ellipse cx="9" cy="8" rx="2.5" ry="1.5" fill="#FFFFFF" fillOpacity="0.35" transform="rotate(-25 9 8)" />
    </svg>
  );
}

/** 3D Confirmed Fraud icon — red shield with X */
export function Icon3DFraudConfirmed({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(239,68,68,0.5))" }}>
      <defs>
        <linearGradient id="cf3d" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>
      <path d="M12 2L21 6V13C21 17.97 16.97 21.6 12 23C7.03 21.6 3 17.97 3 13V6L12 2Z" fill="url(#cf3d)" />
      <path d="M12 2L21 6V13L12 2Z" fill="#FFFFFF" fillOpacity="0.22" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** 3D False Positive icon — green shield with check */
export function Icon3DFalsePositive({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.5))" }}>
      <defs>
        <linearGradient id="fp3d" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>
      <path d="M12 2L21 6V13C21 17.97 16.97 21.6 12 23C7.03 21.6 3 17.97 3 13V6L12 2Z" fill="url(#fp3d)" />
      <path d="M12 2L21 6V13L12 2Z" fill="#FFFFFF" fillOpacity="0.22" />
      <polyline points="8,13 11,16 16,10" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Ring Graph Node Type Icons ────────────────────────────────────────────────

/** 3D Merchant — storefront with awning */
export function Icon3DRingMerchant({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(79,110,247,0.55))" }}>
      <defs>
        <linearGradient id="rm-wall" x1="3" y1="10" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="rm-roof" x1="1" y1="4" x2="23" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      {/* Roof */}
      <path d="M1 11L12 3L23 11H1Z" fill="url(#rm-roof)" />
      <path d="M1 11L12 3V11H1Z" fill="#FFFFFF" fillOpacity="0.22" />
      {/* Wall */}
      <rect x="3" y="11" width="18" height="11" rx="1.5" fill="url(#rm-wall)" />
      {/* Door */}
      <rect x="9" y="15" width="6" height="7" rx="1" fill="#1E1B4B" />
      <rect x="9" y="15" width="6" height="3" rx="0.5" fill="#FFFFFF" fillOpacity="0.15" />
      {/* Windows */}
      <rect x="4"  y="13" width="4" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.75" />
      <rect x="16" y="13" width="4" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.75" />
    </svg>
  );
}

/** 3D Device — mobile phone with glow */
export function Icon3DRingDevice({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(139,92,246,0.55))" }}>
      <defs>
        <linearGradient id="rd-body" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="rd-screen" x1="6" y1="5" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      {/* Phone body */}
      <rect x="5" y="2" width="14" height="20" rx="3" fill="url(#rd-body)" />
      {/* Left bevel highlight */}
      <rect x="5" y="2" width="5" height="20" rx="3" fill="#FFFFFF" fillOpacity="0.2" />
      {/* Screen */}
      <rect x="7" y="5" width="10" height="13" rx="1.5" fill="url(#rd-screen)" />
      {/* Screen glow bars */}
      <rect x="9" y="8" width="6" height="1.2" rx="0.6" fill="#FFFFFF" fillOpacity="0.6" />
      <rect x="9" y="11" width="4" height="1.2" rx="0.6" fill="#FFFFFF" fillOpacity="0.4" />
      {/* Home button */}
      <circle cx="12" cy="20" r="1.2" fill="#7C3AED" stroke="#C4B5FD" strokeWidth="0.8" />
      {/* Camera notch */}
      <rect x="10" y="3" width="4" height="1" rx="0.5" fill="#7C3AED" />
    </svg>
  );
}

/** 3D IP Globe */
export function Icon3DRingIP({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(245,158,11,0.55))" }}>
      <defs>
        <radialGradient id="rip-face" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
      </defs>
      {/* Globe body */}
      <circle cx="12" cy="12" r="10.5" fill="#78350F" opacity="0.4" />
      <circle cx="12" cy="12" r="10" fill="url(#rip-face)" />
      {/* Latitude lines */}
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#FFFFFF" strokeWidth="0.8" fill="none" strokeOpacity="0.5" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Longitude arcs */}
      <ellipse cx="12" cy="12" rx="4.5" ry="10" stroke="#FFFFFF" strokeWidth="0.8" fill="none" strokeOpacity="0.5" />
      {/* Shine */}
      <ellipse cx="8.5" cy="8" rx="3.5" ry="2.2" fill="#FFFFFF" fillOpacity="0.38" transform="rotate(-25 8.5 8)" />
    </svg>
  );
}

/** 3D VPA — payment card */
export function Icon3DRingVPA({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.55))" }}>
      <defs>
        <linearGradient id="rv-body" x1="2" y1="5" x2="22" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
      </defs>
      {/* Card shadow */}
      <rect x="3" y="7" width="18" height="13" rx="3" fill="#064E3B" opacity="0.4" transform="translate(0.5,0.5)" />
      {/* Card body */}
      <rect x="2" y="5" width="20" height="14" rx="3" fill="url(#rv-body)" />
      {/* Top highlight */}
      <rect x="2" y="5" width="20" height="7" rx="3" fill="#FFFFFF" fillOpacity="0.2" />
      {/* Stripe */}
      <rect x="2" y="11" width="20" height="3.5" fill="#065F46" opacity="0.6" />
      {/* Chip */}
      <rect x="5" y="14" width="5" height="3" rx="0.8" fill="#FDE68A" />
      {/* UPI text */}
      <text x="17" y="17.5" textAnchor="middle"
        style={{ fontSize: 4, fontWeight: 800, fill: "#FFFFFF", fontFamily: "monospace" }}>UPI</text>
    </svg>
  );
}

/** 3D Tx — lightning bolt in glowing circle */
export function Icon3DRingTx({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: "drop-shadow(0 2px 8px rgba(239,68,68,0.6))" }}>
      <defs>
        <radialGradient id="rtx-bg" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="55%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
        <linearGradient id="rtx-bolt" x1="9" y1="3" x2="15" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="#7F1D1D" opacity="0.4" />
      <circle cx="12" cy="12" r="10" fill="url(#rtx-bg)" />
      <ellipse cx="9" cy="9" rx="4" ry="2.5" fill="#FFFFFF" fillOpacity="0.28" transform="rotate(-25 9 9)" />
      {/* Bolt */}
      <path d="M13 4L7 13H12L11 20L17 11H12L13 4Z" fill="url(#rtx-bolt)" />
    </svg>
  );
}

/** 3D Web / Ring empty state icon */
export function Icon3DWebRing({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ filter: "drop-shadow(0 3px 10px rgba(79,110,247,0.4))" }}>
      <defs>
        <radialGradient id="web3d-grad" cx="40%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="60%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
      </defs>
      {/* Outer glow ring */}
      <circle cx="20" cy="20" r="18" stroke="#4F6EF7" strokeWidth="0.8" fill="none" strokeOpacity="0.3" />
      {/* Web circle */}
      <circle cx="20" cy="20" r="16" fill="url(#web3d-grad)" />
      <ellipse cx="15" cy="14" rx="5" ry="3" fill="#FFFFFF" fillOpacity="0.22" transform="rotate(-25 15 14)" />
      {/* Spokes */}
      {[0,45,90,135,180,225,270,315].map((deg) => (
        <line key={deg}
          x1="20" y1="20"
          x2={20 + 14 * Math.cos((deg * Math.PI) / 180)}
          y2={20 + 14 * Math.sin((deg * Math.PI) / 180)}
          stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.4" />
      ))}
      {/* Rings */}
      <circle cx="20" cy="20" r="5"  stroke="#FFFFFF" strokeWidth="0.8" fill="none" strokeOpacity="0.5" />
      <circle cx="20" cy="20" r="10" stroke="#FFFFFF" strokeWidth="0.8" fill="none" strokeOpacity="0.35" />
      <circle cx="20" cy="20" r="14" stroke="#FFFFFF" strokeWidth="0.8" fill="none" strokeOpacity="0.2" />
      {/* Hub */}
      <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

/** 3D Lightning bolt — preset section label */
export function Icon3DPresetBolt({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      style={{ filter: "drop-shadow(0 1px 5px rgba(245,158,11,0.7))" }}>
      <defs>
        <linearGradient id="pb3d" x1="4" y1="1" x2="16" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <path d="M11 1L4 12H9.5L8.5 19L16 8H10.5L11 1Z" fill="url(#pb3d)" />
      <path d="M11 1L9.5 12H4L11 1Z" fill="#FFFFFF" fillOpacity="0.35" />
    </svg>
  );
}

/** 3D colored dot for preset safe/watch/danger */
export function Icon3DPresetDot({ color, size = 13 }) {
  const glow  = color === "#10B981" ? "rgba(16,185,129,0.6)"
              : color === "#F59E0B" ? "rgba(245,158,11,0.6)"
              : "rgba(239,68,68,0.6)";
  const light = color === "#10B981" ? "#6EE7B7"
              : color === "#F59E0B" ? "#FDE68A"
              : "#FCA5A5";
  const dark  = color === "#10B981" ? "#065F46"
              : color === "#F59E0B" ? "#78350F"
              : "#7F1D1D";

  const uid       = "pdot-" + color.replace("#", "");
  const filterStr = "drop-shadow(0 1px 4px " + glow + ")";
  const fillRef   = "url(#" + uid + ")";

  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none"
      style={{ filter: filterStr, flexShrink: 0 }}>
      <defs>
        <radialGradient id={uid} cx="35%" cy="28%" r="65%">
          <stop offset="0%"   stopColor={light} />
          <stop offset="55%"  stopColor={color} />
          <stop offset="100%" stopColor={dark}  />
        </radialGradient>
      </defs>
      <circle cx="7" cy="7" r="6.5" fill={dark}    opacity="0.4" />
      <circle cx="7" cy="7" r="6"   fill={fillRef} />
      <ellipse cx="5" cy="5" rx="2.2" ry="1.4"
        fill="#FFFFFF" fillOpacity="0.5" transform="rotate(-25 5 5)" />
    </svg>
  );
}

/** 3D Console Lightning Bolt Icon */
export function Icon3DConsole({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(245,158,11,0.4))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="bolt-3d-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#bolt-3d-grad)" stroke="#78350F" strokeWidth="0.5" />
      <path d="M13 2L3 14H12L11 22L13 2Z" fill="#FFFFFF" fillOpacity="0.3" />
    </svg>
  );
}

/** 3D Merchant Storefront Icon */
export function Icon3DStore({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(79,110,247,0.4))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="store-roof" x1="2" y1="4" x2="22" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="store-wall" x1="4" y1="10" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
      </defs>
      <rect x="4" y="10" width="16" height="11" rx="2" fill="url(#store-wall)" stroke="#4338CA" strokeWidth="0.5" />
      <path d="M2 5L4 10H20L22 5H2Z" fill="url(#store-roof)" />
      <rect x="8" y="14" width="4" height="7" rx="1" fill="#4F6EF7" />
      <rect x="14" y="14" width="4" height="4" rx="1" fill="#818CF8" />
    </svg>
  );
}

/** 3D Review Queue Clipboard Icon */
export function Icon3DQueue({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(245,158,11,0.35))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="clip-bg" x1="4" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="4" y="5" width="16" height="17" rx="2" fill="url(#clip-bg)" stroke="#B45309" strokeWidth="0.5" />
      <rect x="8" y="3" width="8" height="4" rx="1" fill="#78350F" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="14" x2="15" y2="14" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="18" x2="12" y2="18" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 3D Target Score Icon */
export function Icon3DTarget({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(239,68,68,0.4))", flexShrink: 0 }}>
      <defs>
        <radialGradient id="target-red" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="70%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#target-red)" />
      <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="4" fill="url(#target-red)" />
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

/** 3D Audit Notebook Icon */
export function Icon3DAudit({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(16,185,129,0.4))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="book-cover" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect x="4" y="3" width="16" height="18" rx="2" fill="url(#book-cover)" stroke="#064E3B" strokeWidth="0.5" />
      <line x1="7" y1="8" x2="17" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="16" x2="13" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 3D Home / House Icon */
export function Icon3DHome({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 5px rgba(139,92,246,0.4))", flexShrink: 0 }}>
      <defs>
        <linearGradient id="roof-3d" x1="2" y1="12" x2="12" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="house-wall" x1="4" y1="11" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="100%" stopColor="#DDD6FE" />
        </linearGradient>
      </defs>
      <path d="M12 3L2 11H5V21H19V11H22L12 3Z" fill="url(#roof-3d)" />
      <rect x="5" y="11" width="14" height="10" fill="url(#house-wall)" />
      <rect x="10" y="15" width="4" height="6" rx="1" fill="#7C3AED" />
    </svg>
  );
}
