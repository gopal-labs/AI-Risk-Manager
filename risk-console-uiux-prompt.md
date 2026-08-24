# Frontend UI/UX Prompt — Composite Risk Console
### AI Risk Manager · Razorpay AI Builder Project

Standalone brief for this dashboard — covers what F4 (Risk Dashboard), F5 (Explainable Flags), and F8 (Risk Appetite / False-Positive Cost) look like as one working screen.

---

## 1. Design Goal

A live risk-operations console for a fraud/risk analyst: monitor incoming transactions, see system-wide risk posture at a glance, adjust risk appetite and see the trade-off in real time, and drill into any flagged case to see *why* it was flagged. Built to feel like control-room instrumentation, not a generic admin panel — this is the visual identity that should read as distinctive to a reviewer.

## 2. Typography

- **Data/scores (display role):** JetBrains Mono — monospaced, tabular, used for every number: risk scores, transaction IDs, amounts, precision/recall figures, the gauge readout. Chosen because a monitoring instrument's numbers should feel measured, not decorative.
- **Headers/labels/body:** Space Grotesk — geometric, technical, restrained. Used for titles, panel headers, labels, buttons, merchant names.
- Two typefaces only, each doing one clear job — no third face introduced for "variety."

## 3. Motion — used deliberately, not decoratively

This build intentionally uses **more** motion than a strict-budget piece, because the brief asked for an animated, high-impact showcase. Each animation still has a job:

1. **Live status pulse** (ambient, looping) — a single pulsing ring around the "System Live" dot. Justified because the subject *is* a live monitoring system; this is the one ambient loop allowed, and it's small and quiet.
2. **Count-up stat animation on load** — the four header stats (flagged count, high-risk count, avg score, volume) animate from 0 to their value once on mount, easing out. Signals "this is measuring something," not just displaying a static number.
3. **Gauge arc draw-in** — the Composite Risk Index semicircle fills from empty to its value on load via `stroke-dashoffset` transition, colored by risk band (teal/amber/red).
4. **Staggered feed entrance** — transaction rows fade/slide in with a per-row stagger on initial load.
5. **Live feed insertion** — a new synthetic transaction slides in at the top of the feed periodically, with a brief brand-colored left border to mark it as new. This is the "real-time" moment of the demo.
6. **Threshold slider → live bar transition** — moving the risk-appetite slider smoothly animates the precision/recall bar widths, making the trade-off tangible rather than a static before/after.
7. **Explainability bars animate in** — when a case is opened, each contributing-factor bar grows from 0 to its weight with a slight stagger, so the "why" reads as being computed in front of you rather than pre-rendered.
8. **Slide-over panel transition** — the case detail panel slides in from the right with a backdrop fade, same easing family as everything else for cohesion.

All easing uses the same curve (`cubic-bezier(0.16, 1, 0.3, 1)`) so the motion feels like one system, not eight unrelated effects. Hover states use fast (140ms) color transitions only.

## 4. Palette

| Token | Hex | Use |
|---|---|---|
| `--bg-void` | `#0A0D12` | Page background |
| `--bg-panel` | `#10151C` | Panels |
| `--bg-card` | `#161C25` | Stat cards, transaction rows |
| `--line` | `#232B36` | Borders |
| `--text-primary` | `#EAEFF5` | Primary text |
| `--text-muted` | `#7E8A9A` | Secondary text |
| `--text-faint` | `#4E5866` | IDs, captions |
| `--brand` (violet) | `#7B6EF6` | Interactive/system accent — slider, precision bar, factor bars, new-row marker, primary button |
| `--safe` | `#2FD9A8` | Low-risk signal |
| `--watch` | `#FFC857` | Mid-risk signal |
| `--danger` | `#FF4D6A` | High-risk signal |

Semantic risk colors (safe/watch/danger) are reserved strictly for risk-band meaning. The violet brand color is reserved for "system/interactive" elements so it never collides with a risk-severity read.

## 5. Layout Concept

```
COMPOSITE RISK CONSOLE                              ● System Live

[ Flagged ] [ High Risk ] [ Avg Score ] [ Volume Scanned ]   ← count-up stats

┌───────────────────────────────┐   ┌─────────────────────┐
│ LIVE TRANSACTION FEED          │   │ COMPOSITE RISK INDEX │
│ TX-4001  Merchant   ₹amt  82 ▮ │   │      (gauge arc)      │
│ TX-4002  Merchant   ₹amt  41 ▮ │   └─────────────────────┘
│ ...rows stream in...           │   ┌─────────────────────┐
│                                 │   │ RISK APPETITE         │
│                                 │   │ [====slider====]      │
│                                 │   │ Precision ▬▬▬▬░░      │
│                                 │   │ Recall    ▬▬▬░░░      │
└───────────────────────────────┘   └─────────────────────┘
                                                click row →
                                     ┌──────────────────────┐
                                     │ TX-4001 · Merchant     │
                                     │ Score 82  HIGH RISK    │
                                     │ Velocity spike   +28   │
                                     │ Geo mismatch     +22   │
                                     │ [Mark FP] [Confirm]    │
                                     └──────────────────────┘
```

- Left: live feed (widest panel — this is the operational focus).
- Right: gauge (system-level read) stacked above the risk-appetite control (policy-level read).
- Slide-over: case-level read, with explainability and analyst actions.

This top-to-bottom structure (system → policy → case) mirrors how a risk analyst actually thinks: overall posture, then the lever they control, then the individual decision.

## 6. Signature Element

**The Composite Risk Index gauge.** A single semicircular instrument reading, colored by risk band, that draws itself in on load — the one place the design borrows directly from physical control-room/dashboard instrumentation (an aircraft or plant-monitoring gauge) rather than a generic donut chart. It's the visual anchor a reviewer will remember.

## 7. Content & Copy Rules

- Risk bands use plain operational labels: LOW / WATCH / HIGH RISK — not vague terms like "concerning."
- Contributing factors are named as the actual signal ("Velocity spike," "Geo mismatch"), each with its point contribution, so the explanation is legible without extra prose.
- Analyst actions are named by what they do: "Mark False Positive," "Confirm Fraud" — not "Submit" or "Yes/No."

## 8. Accessibility / Quality Floor

- Risk bands are distinguished by color **and** text label (LOW/WATCH/HIGH RISK) and left-border accent — not color alone.
- The ambient pulse and count-up/entrance animations should respect `prefers-reduced-motion`: reduce to an instant state change or a single short fade for users with that preference.
- Slider is a native `<input type="range">` for full keyboard operability.
- Text contrast on all backgrounds meets WCAG AA at the sizes used.
