// components/layout/Shell.jsx — Mounts ToastStack, CommandPalette, and wires alert bell
import { useState, useEffect, useCallback } from "react";
import TopNav        from "./TopNav";
import ToastStack    from "../ui/ToastStack";
import CommandPalette from "../ui/CommandPalette";

export default function Shell({ online, children, alerts = [], toasts = [], unreadCount = 0, onDismissToast, onInspectToast, onMarkAlertsRead }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeP = useCallback(() => setPaletteOpen(false), []);

  return (
    <div className="app-shell-nosidebar">
      <TopNav
        online={online}
        alerts={alerts}
        unreadCount={unreadCount}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      <main className="page-content-full page-transition-enter">
        {children}
      </main>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <ToastStack
          toasts={toasts}
          onDismiss={onDismissToast || (() => {})}
          onInspect={onInspectToast || (() => {})}
        />
      )}

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={closeP} />
    </div>
  );
}
