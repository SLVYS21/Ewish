import { Sparkles, Wrench, Zap, Package } from 'lucide-react';
import versions from '../../changelog/versions.json';
import s from './AdminReleaseNotes.module.css';

const TYPE_META = {
  feature: { Icon: Sparkles, label: 'Nouveau',      color: '#FF5470' },
  improve: { Icon: Zap,      label: 'Amélioration', color: '#FFC145' },
  fix:     { Icon: Wrench,   label: 'Correctif',    color: '#7CE0C1' },
};

/* Regroupe par mois — améliore la lecture d'un long historique sans avoir
   à naviguer version par version. Ex: "Juillet 2026" contient v1.1.0 et
   v1.0.0 le cas échéant. */
function groupByMonth(list) {
  const groups = new Map();
  for (const v of list) {
    const d = new Date(v.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key).items.push(v);
  }
  return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

export default function AdminReleaseNotes() {
  const groups = groupByMonth(versions);
  const current = versions[0]?.version;

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.hLeft}>
          <Package size={22} />
          <div>
            <h1 className={s.title}>Nouveautés</h1>
            <p className={s.sub}>L'historique des mises à jour de myKado.</p>
          </div>
        </div>
        {current && (
          <div className={s.currentPill}>
            Version installée <strong>{current}</strong>
          </div>
        )}
      </header>

      {groups.length === 0 && (
        <div className={s.empty}>
          Aucune release note pour l'instant.
        </div>
      )}

      <div className={s.timeline}>
        {groups.map((group) => (
          <section key={group.key} className={s.group}>
            <h2 className={s.month}>{group.label}</h2>
            {group.items.map((v) => (
              <article key={v.version} className={s.release}>
                <div className={s.releaseHead}>
                  <span className={s.version}>v{v.version}</span>
                  <span className={s.date}>{formatDate(v.date)}</span>
                </div>
                <h3 className={s.releaseTitle}>{v.title}</h3>
                {v.summary && <p className={s.summary}>{v.summary}</p>}
                {v.highlights && v.highlights.length > 0 && (
                  <ul className={s.list}>
                    {v.highlights.map((h, i) => {
                      const meta = TYPE_META[h.type] || TYPE_META.feature;
                      const { Icon } = meta;
                      return (
                        <li key={i} className={s.item}>
                          <span className={s.pill} style={{ background: meta.color + '22', color: meta.color }}>
                            <Icon size={11} /> {meta.label}
                          </span>
                          <span className={s.text}>{h.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
