// components/layout/TopBar.jsx

function ApiStatusBadge({ online }) {
  if (online === null)
    return <div className="api-badge checking"><span className="api-dot" />Connecting…</div>;
  return (
    <div className={`api-badge ${online ? "connected" : "offline"}`}>
      <span className="api-dot" />
      {online ? "API Connected" : "Offline — Demo Mode"}
    </div>
  );
}

export default function TopBar({ title, subtitle, online }) {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-breadcrumb">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="topbar-right">
        <div className="live-badge">
          <span className="live-dot" />
          System Live
        </div>
        <ApiStatusBadge online={online} />
      </div>
    </header>
  );
}
