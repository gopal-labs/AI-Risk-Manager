// hooks/useApiPoll.js
import { useState, useEffect } from "react";

export function useApiPoll(fetcher, intervalMs, deps = []) {
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const d = await fetcher();
        if (!cancelled) { setData(d); setError(null); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    };
    run();
    const iv = setInterval(run, intervalMs);
    return () => { cancelled = true; clearInterval(iv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return [data, error, loading];
}
