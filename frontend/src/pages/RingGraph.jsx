// pages/RingGraph.jsx — Fraud Ring Visualizer
// Interactive SVG node-link graph showing shared identifiers between transactions
// Renders connections between merchants, devices, VPAs, and IPs

import { useState, useEffect, useRef, useCallback } from "react";
import Shell from "../components/layout/Shell";
import { useApiHealth } from "../hooks/useApiHealth";
import { getRingGraph } from "../api/client";
import {
  Icon3DRingMerchant,
  Icon3DRingDevice,
  Icon3DRingIP,
  Icon3DRingVPA,
  Icon3DRingTx,
  Icon3DWebRing,
} from "../components/ui/Official3DIcons";

// ── Synthetic ring data generator ─────────────────────────────────────────────
function makeSyntheticGraph() {
  const nodes = [
    { id: "M1001", label: "Aravali Retail",    type: "merchant", risk: 62 },
    { id: "M1003", label: "NimbusPay",         type: "merchant", risk: 81 },
    { id: "M1008", label: "Sundarban Exports", type: "merchant", risk: 72 },
    { id: "M1011", label: "Zenith Fintech",    type: "merchant", risk: 88 },
    { id: "DEV-007", label: "DEV-007",         type: "device",   risk: 85 },
    { id: "DEV-012", label: "DEV-012",         type: "device",   risk: 70 },
    { id: "ip-203.0.113.42", label: "203.0.113.42", type: "ip", risk: 90 },
    { id: "vpa-fraud@upi",   label: "fraud@upi",    type: "vpa", risk: 92 },
    { id: "TX-4001", label: "₹48,200",         type: "tx",       risk: 94 },
    { id: "TX-4002", label: "₹31,500",         type: "tx",       risk: 78 },
    { id: "TX-4003", label: "₹22,100",         type: "tx",       risk: 82 },
    { id: "TX-4004", label: "₹15,800",         type: "tx",       risk: 71 },
    { id: "M1002", label: "Koshur Traders",    type: "merchant", risk: 44 },
    { id: "DEV-020", label: "DEV-020",         type: "device",   risk: 45 },
    { id: "TX-4005", label: "₹9,400",          type: "tx",       risk: 55 },
  ];

  const edges = [
    { source: "TX-4001", target: "M1003",          label: "merchant" },
    { source: "TX-4001", target: "DEV-007",         label: "device"   },
    { source: "TX-4001", target: "ip-203.0.113.42", label: "ip"       },
    { source: "TX-4001", target: "vpa-fraud@upi",   label: "vpa"      },
    { source: "TX-4002", target: "M1011",           label: "merchant" },
    { source: "TX-4002", target: "DEV-007",         label: "device"   },
    { source: "TX-4002", target: "ip-203.0.113.42", label: "ip"       },
    { source: "TX-4003", target: "M1008",           label: "merchant" },
    { source: "TX-4003", target: "DEV-012",         label: "device"   },
    { source: "TX-4003", target: "vpa-fraud@upi",   label: "vpa"      },
    { source: "TX-4004", target: "M1001",           label: "merchant" },
    { source: "TX-4004", target: "DEV-012",         label: "device"   },
    { source: "TX-4005", target: "M1002",           label: "merchant" },
    { source: "TX-4005", target: "DEV-020",         label: "device"   },
    { source: "M1003",   target: "M1011",           label: "category" },
  ];

  return { nodes, edges };
}

// ── Force-directed layout (simple spring simulation) ─────────────────────────
function useForceLayout(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!nodes || !nodes.length) return;

    const w = width || 800;
    const h = height || 560;
    const pos = {};

    const typeRadius = {
      merchant: Math.min(w, h) * 0.38,
      device:   Math.min(w, h) * 0.28,
      ip:       Math.min(w, h) * 0.20,
      vpa:      Math.min(w, h) * 0.14,
      tx:       Math.min(w, h) * 0.32,
    };

    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const r = typeRadius[n.type] || Math.min(w, h) * 0.25;
      pos[n.id] = {
        x: w / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: h / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });

    let frame = 0;
    let animId;

    const simulate = () => {
      const K_REPEL = 3600, K_ATTRACT = 0.05, DAMP = 0.80, IDEAL = 90;

      nodes.forEach((a) => {
        if (!pos[a.id]) return;
        let fx = 0, fy = 0;

        nodes.forEach((b) => {
          if (a.id === b.id || !pos[b.id]) return;
          const dx = pos[a.id].x - pos[b.id].x;
          const dy = pos[a.id].y - pos[b.id].y;
          const d2 = dx * dx + dy * dy + 1;
          const f  = K_REPEL / d2;
          fx += (f * dx) / Math.sqrt(d2);
          fy += (f * dy) / Math.sqrt(d2);
        });

        edges.forEach((e) => {
          const otherId = e.source === a.id ? e.target : e.target === a.id ? e.source : null;
          if (!otherId || !pos[otherId]) return;
          const dx = pos[otherId].x - pos[a.id].x;
          const dy = pos[otherId].y - pos[a.id].y;
          const d  = Math.sqrt(dx * dx + dy * dy) || 1;
          const f  = K_ATTRACT * (d - IDEAL);
          fx += (f * dx) / d;
          fy += (f * dy) / d;
        });

        fx += (w / 2 - pos[a.id].x) * 0.005;
        fy += (h / 2 - pos[a.id].y) * 0.005;

        pos[a.id].vx = (pos[a.id].vx + fx) * DAMP;
        pos[a.id].vy = (pos[a.id].vy + fy) * DAMP;
        pos[a.id].x  = Math.max(35, Math.min(w - 35, pos[a.id].x + pos[a.id].vx));
        pos[a.id].y  = Math.max(35, Math.min(h - 35, pos[a.id].y + pos[a.id].vy));
      });

      if (frame++ < 90) {
        setPositions({ ...pos });
        animId = requestAnimationFrame(simulate);
      } else {
        setPositions({ ...pos });
      }
    };

    simulate();
    return () => cancelAnimationFrame(animId);
  }, [nodes, edges, width, height]);

  return positions;
}

// ── Node visuals ──────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  merchant: "#4F6EF7",
  device:   "#8B5CF6",
  ip:       "#F59E0B",
  vpa:      "#10B981",
  tx:       "#EF4444",
};

// 3D SVG icon components per node type
const TYPE_ICON_COMPONENTS = {
  merchant: Icon3DRingMerchant,
  device:   Icon3DRingDevice,
  ip:       Icon3DRingIP,
  vpa:      Icon3DRingVPA,
  tx:       Icon3DRingTx,
};

// Helper to render a 3D node icon
function NodeTypeIcon({ type, size = 18 }) {
  const Cmp = TYPE_ICON_COMPONENTS[type];
  return Cmp ? <Cmp size={size} /> : null;
}

const TYPE_R = { merchant: 22, device: 18, ip: 18, vpa: 18, tx: 20 };

function riskColor(risk) {
  if (risk >= 70) return "#EF4444";
  if (risk >= 40) return "#F59E0B";
  return "#10B981";
}

export default function RingGraph() {
  const apiOnline = useApiHealth();
  const svgRef    = useRef(null);
  const [svgSize, setSvgSize] = useState({ w: 800, h: 560 });
  const [graph,   setGraph]   = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSvgSize({ w: Math.max(400, width), h: Math.max(300, height) });
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  // Load graph data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = apiOnline ? await getRingGraph() : makeSyntheticGraph();
        if (!cancelled) setGraph(d);
      } catch {
        if (!cancelled) setGraph(makeSyntheticGraph());
      }
    })();
    return () => { cancelled = true; };
  }, [apiOnline]);

  const nodes    = graph?.nodes ?? [];
  const edges    = graph?.edges ?? [];
  const positions = useForceLayout(nodes, edges, svgSize.w, svgSize.h);

  // Identify ring clusters (nodes connected to same shared identifier)
  const sharedNodes = nodes.filter((n) => {
    const degree = edges.filter((e) => e.source === n.id || e.target === n.id).length;
    return degree >= 3;
  });

  const focusNode = selected ?? hovered;

  return (
    <Shell online={apiOnline}>
      <div className="page-header">
        <div className="page-title">Fraud Ring Visualizer</div>
        <div className="page-desc">
          NetworkX-powered shared-identifier clustering — {nodes.length} nodes · {edges.length} connections
        </div>
      </div>

      {/* Legend */}
      <div className="ring-legend">
        {Object.entries(TYPE_COLORS).map(([type, col]) => (
          <div key={type} className="ring-legend-item">
            <NodeTypeIcon type={type} size={18} />
            <span style={{ fontWeight: 500, fontSize: 12 }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
        ))}
        {sharedNodes.length > 0 && (
          <div className="ring-legend-item" style={{ marginLeft: "auto" }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <circle cx="5" cy="5" r="4.5" fill="#EF4444" opacity="0.3" />
              <circle cx="5" cy="5" r="3.5" fill="#EF4444" />
              <ellipse cx="3.5" cy="3.5" rx="1.2" ry="0.8" fill="#FFFFFF" fillOpacity="0.5" transform="rotate(-25 3.5 3.5)" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: 12, color: "#EF4444" }}>
              Ring Hub ({sharedNodes.length} detected)
            </span>
          </div>
        )}
      </div>

      <div className="ring-container">
        {/* Graph SVG */}
        <div className="ring-svg-wrap" ref={svgRef}>
          <svg
            width={svgSize.w}
            height={svgSize.h}
            style={{ display: "block" }}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(100,116,139,0.5)" />
              </marker>
              {nodes.map((n) => (
                <radialGradient key={n.id} id={`grad-${n.id}`} cx="50%" cy="30%" r="70%">
                  <stop offset="0%"   stopColor={TYPE_COLORS[n.type] || "#888"} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={TYPE_COLORS[n.type] || "#888"} stopOpacity="0.5" />
                </radialGradient>
              ))}
            </defs>

            {/* Edges */}
            {edges.map((e, i) => {
              const s = positions[e.source];
              const t = positions[e.target];
              if (!s || !t) return null;
              const isFocused = focusNode && (e.source === focusNode.id || e.target === focusNode.id);
              return (
                <line
                  key={i}
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={isFocused ? "rgba(79,110,247,0.7)" : "rgba(100,116,139,0.25)"}
                  strokeWidth={isFocused ? 2.5 : 1.5}
                  strokeDasharray={e.label === "category" ? "5 4" : "none"}
                  style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const p = positions[n.id];
              if (!p) return null;
              const r        = TYPE_R[n.type] || 18;
              const col      = TYPE_COLORS[n.type] || "#888";
              const isHub    = sharedNodes.some((s) => s.id === n.id);
              const isFocus  = focusNode?.id === n.id;
              const isLinked = focusNode && edges.some(
                (e) => (e.source === focusNode.id && e.target === n.id) ||
                       (e.target === focusNode.id && e.source === n.id)
              );
              const dimmed   = focusNode && !isFocus && !isLinked;

              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x},${p.y})`}
                  style={{ cursor: "pointer", transition: "opacity 0.2s", opacity: dimmed ? 0.25 : 1 }}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(selected?.id === n.id ? null : n)}
                >
                  {/* Hub pulse ring */}
                  {isHub && (
                    <circle r={r + 8} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeOpacity="0.4"
                      style={{ animation: "hub-pulse 2s ease-in-out infinite" }} />
                  )}
                  {/* Main circle */}
                  <circle
                    r={isFocus ? r + 3 : r}
                    fill={`url(#grad-${n.id})`}
                    stroke={isFocus ? "#fff" : col}
                    strokeWidth={isFocus ? 2.5 : 1.5}
                    strokeOpacity={isFocus ? 1 : 0.6}
                    style={{ transition: "r 0.2s, stroke 0.2s" }}
                  />
                  {/* Risk indicator dot */}
                  <circle cx={r - 4} cy={-(r - 4)} r={5}
                    fill={riskColor(n.risk)} stroke="var(--bg-card)" strokeWidth="1.5" />
                  {/* Label */}
                  <text
                    y={r + 13}
                    textAnchor="middle"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 10, fontWeight: 600,
                      fill: "var(--text-primary)", pointerEvents: "none",
                    }}
                  >
                    {n.label.length > 14 ? n.label.slice(0, 13) + "…" : n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="ring-detail-panel">
          {focusNode ? (
            <>
              <div className="ring-detail-header">
                <span className="ring-detail-icon">
                  <NodeTypeIcon type={focusNode.type} size={28} />
                </span>
                <div>
                  <div className="ring-detail-title">{focusNode.label}</div>
                  <div className="ring-detail-type">{focusNode.type}</div>
                </div>
                {selected && (
                  <button className="ring-detail-close" onClick={() => setSelected(null)}>✕</button>
                )}
              </div>
              <div className="ring-detail-score" style={{ color: riskColor(focusNode.risk) }}>
                {focusNode.risk}
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}> / 100 risk</span>
              </div>
              <div className="ring-detail-connections">
                <div className="ring-detail-conn-label">Connected to:</div>
                {edges
                  .filter((e) => e.source === focusNode.id || e.target === focusNode.id)
                  .map((e, i) => {
                    const otherId = e.source === focusNode.id ? e.target : e.source;
                    const other   = nodes.find((n) => n.id === otherId);
                    return other ? (
                      <div key={i} className="ring-detail-conn-item">
                        <NodeTypeIcon type={other.type} size={16} />
                        <span>{other.label}</span>
                        <span className="ring-conn-via">via {e.label}</span>
                      </div>
                    ) : null;
                  })}
              </div>
            </>
          ) : (
            <div className="ring-detail-empty">
            <div style={{ marginBottom: 12 }}><Icon3DWebRing size={52} /></div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Select a node</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Click any node to inspect its connections and risk score
            </div>
          </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
