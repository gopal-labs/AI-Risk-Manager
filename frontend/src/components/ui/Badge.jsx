// components/ui/Badge.jsx — Light theme
export const BAND_COLOR = {
  safe:   "var(--safe)",
  watch:  "var(--watch)",
  danger: "var(--danger)",
};
export const BAND_LABEL = { safe: "LOW", watch: "WATCH", danger: "HIGH RISK" };

export default function Badge({ band }) {
  return (
    <span className={`risk-badge ${band}`}>
      {BAND_LABEL[band] ?? band}
    </span>
  );
}
