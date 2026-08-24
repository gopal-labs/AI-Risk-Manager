// components/ui/CommandPalette.jsx — Ctrl+K spotlight-style command palette
// Glassmorphism overlay with fuzzy page/action/merchant search + keyboard navigation

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Icon3DConsole,
  Icon3DStore,
  Icon3DQueue,
  Icon3DTarget,
  Icon3DAudit,
  Icon3DWebRing,
  Icon3DHome,
  Icon3DRingMerchant,
} from "./Official3DIcons";

const STATIC_COMMANDS = [
  { id: "go-console",   label: "Open Console",          icon: Icon3DConsole,      path: "/console",    group: "Navigate"  },
  { id: "go-merchants", label: "Merchants Overview",    icon: Icon3DStore,        path: "/merchants",  group: "Navigate"  },
  { id: "go-queue",     label: "Review Queue",          icon: Icon3DQueue,        path: "/queue",      group: "Navigate"  },
  { id: "go-score",     label: "Score a Transaction",   icon: Icon3DTarget,       path: "/score",      group: "Navigate"  },
  { id: "go-audit",     label: "Audit Log",             icon: Icon3DAudit,        path: "/audit",      group: "Navigate"  },
  { id: "go-ring",      label: "Fraud Ring Visualizer", icon: Icon3DWebRing,      path: "/ring-graph", group: "Navigate"  },
  { id: "go-home",      label: "Landing Page",          icon: Icon3DHome,         path: "/",           group: "Navigate"  },
];

const MERCHANTS_STATIC = [
  { id: "M1001", name: "Aravali Retail Pvt Ltd"   },
  { id: "M1002", name: "Koshur Traders"            },
  { id: "M1003", name: "NimbusPay Merchant"        },
  { id: "M1004", name: "Trishul Electronics"       },
  { id: "M1005", name: "Deccan Fresh Mart"         },
  { id: "M1006", name: "Orbit Mobility"            },
  { id: "M1007", name: "Vertex Apparel Co."        },
  { id: "M1008", name: "Sundarban Exports"         },
  { id: "M1009", name: "Nilgiri Foods"             },
  { id: "M1010", name: "Copper Kettle Café"        },
  { id: "M1011", name: "Zenith Fintech Services"  },
  { id: "M1012", name: "Bhairav Hardware"          },
];

function fuzzy(str, query) {
  if (!query) return true;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  let si = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = s.indexOf(q[qi], si);
    if (idx === -1) return false;
    si = idx + 1;
  }
  return true;
}

export default function CommandPalette({ open, onClose }) {
  const [query,   setQuery]   = useState("");
  const [cursor,  setCursor]  = useState(0);
  const inputRef              = useRef(null);
  const navigate              = useNavigate();

  // Build results
  const merchantCmds = MERCHANTS_STATIC.map((m) => ({
    id:    `merchant-${m.id}`,
    label: m.name,
    icon:  Icon3DRingMerchant,
    path:  `/merchants/${m.id}`,
    group: "Merchants",
  }));

  const allCmds = [...STATIC_COMMANDS, ...merchantCmds];
  const results = query
    ? allCmds.filter((c) => fuzzy(c.label, query) || fuzzy(c.group, query))
    : STATIC_COMMANDS;

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard handler
  const handleKey = useCallback((e) => {
    if (!open) return;
    if (e.key === "Escape")     { onClose(); return; }
    if (e.key === "ArrowDown")  { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) {
      navigate(results[cursor].path);
      onClose();
    }
  }, [open, cursor, results, navigate, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Group results
  const groups = results.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  let flatIdx = 0;

  if (!open) return null;

  return (
    <>
      <div className="palette-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="palette-modal" role="dialog" aria-label="Command palette" aria-modal="true">
        {/* Search input */}
        <div className="palette-search-row">
          <svg className="palette-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Search pages, merchants, actions…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            aria-label="Command palette search"
          />
          <kbd className="palette-esc">ESC</kbd>
        </div>

        {/* Results */}
        <div className="palette-results" role="listbox">
          {results.length === 0 ? (
            <div className="palette-empty">No results for "{query}"</div>
          ) : (
            Object.entries(groups).map(([group, cmds]) => (
              <div key={group}>
                <div className="palette-group-label">{group}</div>
                {cmds.map((cmd) => {
                  const idx = flatIdx++;
                  const active = idx === cursor;
                  const IconComp = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      className={`palette-item${active ? " active" : ""}`}
                      role="option"
                      aria-selected={active}
                      onClick={() => { navigate(cmd.path); onClose(); }}
                      onMouseEnter={() => setCursor(idx)}
                    >
                      <span className="palette-item-icon">
                        {typeof IconComp === "function" ? <IconComp size={20} /> : IconComp}
                      </span>
                      <span className="palette-item-label">{cmd.label}</span>
                      {active && <span className="palette-item-hint">↵ Enter</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}
