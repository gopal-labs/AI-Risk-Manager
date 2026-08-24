// components/ui/FraudShieldLogo.jsx — Ultra 3D premium security shield logo
export default function FraudShieldLogo({ size = 34 }) {
  const uid = "fsl"; // stable ID
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      style={{ filter: "drop-shadow(0 3px 14px rgba(16,185,129,0.55))", flexShrink: 0, overflow: "visible" }}
    >
      <defs>
        {/* Main body gradient — top-lit */}
        <linearGradient id={`${uid}-body`} x1="6" y1="3" x2="34" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6EE7B7" />
          <stop offset="38%"  stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        {/* Left-face highlight bevel */}
        <linearGradient id={`${uid}-lbevel`} x1="6" y1="3" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"    />
        </linearGradient>
        {/* Rim / outer edge */}
        <linearGradient id={`${uid}-rim`} x1="6" y1="3" x2="8" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        {/* Inner glow overlay */}
        <radialGradient id={`${uid}-inner`} cx="45%" cy="28%" r="55%">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Ground shadow ellipse */}
      <ellipse cx="20" cy="39" rx="10" ry="2.2" fill="#064E3B" opacity="0.35" />

      {/* Outer rim (gives 3D edge depth) */}
      <path
        d="M20 3.5L34 8.5V20C34 29 27.5 34.5 20 37C12.5 34.5 6 29 6 20V8.5L20 3.5Z"
        fill="url(#fsl-rim)"
      />

      {/* Main shield body */}
      <path
        d="M20 6L32 10.5V20C32 27.5 26.5 32.5 20 35C13.5 32.5 8 27.5 8 20V10.5L20 6Z"
        fill="url(#fsl-body)"
      />

      {/* Top-left face bevel highlight */}
      <path
        d="M20 6L32 10.5V20L20 6Z"
        fill="url(#fsl-lbevel)"
      />
      <path
        d="M8 10.5L20 6V21L8 10.5Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />

      {/* Inner radial shine */}
      <path
        d="M20 6L32 10.5V20C32 27.5 26.5 32.5 20 35C13.5 32.5 8 27.5 8 20V10.5L20 6Z"
        fill="url(#fsl-inner)"
      />

      {/* AI Sentinel radar ring — dashed */}
      <circle
        cx="20" cy="19.5" r="7"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeOpacity="0.5"
        strokeDasharray="3.5 2"
      />

      {/* Crosshair lines */}
      <line x1="20" y1="13" x2="20" y2="26"  stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="13" y1="19.5" x2="27" y2="19.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.9" />

      {/* Center dot */}
      <circle cx="20" cy="19.5" r="3" fill="#FFFFFF" fillOpacity="0.95" />
      <circle cx="20" cy="19.5" r="1.5" fill="#10B981" />
    </svg>
  );
}
