export function PanelHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="panel-header">
      <div className="panel-title">
        <span>
          <Icon size={18} />
        </span>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
