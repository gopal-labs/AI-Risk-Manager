// components/ui/FactorBar.jsx
import { useState, useEffect } from "react";

export default function FactorBar({ label, weight, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(weight), 60 + delay);
    return () => clearTimeout(t);
  }, [weight, delay]);

  return (
    <div className="factor-bar">
      <div className="factor-bar-label">
        <span>{label}</span>
        <span>+{weight}</span>
      </div>
      <div className="factor-bar-track">
        <div className="factor-bar-fill" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}
