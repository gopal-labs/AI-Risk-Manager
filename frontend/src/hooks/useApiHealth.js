// hooks/useApiHealth.js
import { useState, useEffect } from "react";
import { checkHealth } from "../api/client";

export function useApiHealth() {
  const [online, setOnline] = useState(null);
  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then(() => { if (!cancelled) setOnline(true); })
      .catch(() => { if (!cancelled) setOnline(false); });
    return () => { cancelled = true; };
  }, []);
  return online;
}
