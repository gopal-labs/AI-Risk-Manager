// hooks/useAlerts.js — Global alert/notification state manager
// Stores incoming danger transactions as dismissable alerts and toast notifications

import { useState, useCallback, useRef } from "react";

let _idCounter = 0;

/**
 * useAlerts()
 * Returns:
 *   alerts      — array of alert objects { id, tx, timestamp, read }
 *   toasts      — array of toast objects { id, tx, timestamp } (auto-expire)
 *   addAlert    — fn(tx) — push a new danger tx alert
 *   markAllRead — fn() — clear unread count
 *   dismissToast— fn(id) — remove a toast
 *   unreadCount — number of unread alerts
 */
export function useAlerts() {
  const [alerts, setAlerts]   = useState([]);
  const [toasts, setToasts]   = useState([]);
  const seenIds               = useRef(new Set());

  const addAlert = useCallback((tx) => {
    // Deduplicate by tx_id
    if (seenIds.current.has(tx.tx_id)) return;
    seenIds.current.add(tx.tx_id);

    const id        = ++_idCounter;
    const timestamp = new Date().toISOString();
    const entry     = { id, tx, timestamp, read: false };

    // Push to persistent alert list (max 50)
    setAlerts((prev) => [entry, ...prev].slice(0, 50));

    // Push to toasts (max 3 visible, auto-dismiss after 5s)
    setToasts((prev) => {
      const next = [{ id, tx, timestamp }, ...prev].slice(0, 3);
      return next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return { alerts, toasts, addAlert, markAllRead, dismissToast, unreadCount };
}
