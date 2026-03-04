import s from './PageShell.module.css';

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className={s.shell}>
      <div className={s.topbar}>
        <div>
          <h1 className={s.title}>{title}</h1>
          {subtitle && <p className={s.sub}>{subtitle}</p>}
        </div>
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
      <div className={s.body}>{children}</div>
    </div>
  );
}