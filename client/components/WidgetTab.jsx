import { useState } from 'react';
import s from './WidgetTab.module.css';

const WIDGET_TYPES = [
  { id: 'countdown',  icon: '⏳', label: 'Décompte',     desc: 'Temps écoulé depuis une date' },
  { id: 'age',        icon: '🎂', label: 'Âge exact',    desc: 'Années, mois, jours précis' },
  { id: 'quote',      icon: '💬', label: 'Citation',      desc: 'Texte mis en valeur' },
  { id: 'memories',   icon: '📅', label: 'Souvenir',     desc: 'Depuis combien de temps vous vous connaissez' },
];

const DEFAULT_WIDGETS = {
  countdown:  { type: 'countdown',  date: '',      label: 'Ensemble depuis', unit: 'auto'  },
  age:        { type: 'age',        date: '',      label: 'Elle a'                         },
  quote:      { type: 'quote',      text: '',      author: ''                               },
  memories:   { type: 'memories',   date: '',      label: 'Vous vous connaissez depuis'     },
};

export default function WidgetTab({ widgets = [], onChange }) {
  const [adding, setAdding] = useState(null); // widget type being configured

  const addWidget = (cfg) => {
    onChange([...widgets, { ...cfg, id: Date.now().toString() }]);
    setAdding(null);
  };

  const updateWidget = (id, patch) => {
    onChange(widgets.map(w => w.id === id ? { ...w, ...patch } : w));
  };

  const removeWidget = (id) => onChange(widgets.filter(w => w.id !== id));

  return (
    <div className={s.root}>
      {/* Active widgets */}
      {widgets.length > 0 && (
        <div className={s.section}>
          <div className={s.sectionTitle}>Widgets actifs</div>
          {widgets.map(w => (
            <WidgetEditor key={w.id} widget={w} onUpdate={p => updateWidget(w.id, p)} onRemove={() => removeWidget(w.id)} />
          ))}
        </div>
      )}

      {/* Add new */}
      {adding ? (
        <WidgetConfigurator
          type={adding}
          defaults={DEFAULT_WIDGETS[adding]}
          onConfirm={addWidget}
          onCancel={() => setAdding(null)}
        />
      ) : (
        <div className={s.section}>
          <div className={s.sectionTitle}>➕ Ajouter un widget</div>
          <div className={s.typeGrid}>
            {WIDGET_TYPES.map(t => (
              <button key={t.id} className={s.typeCard} onClick={() => setAdding(t.id)}>
                <span className={s.typeIcon}>{t.icon}</span>
                <span className={s.typeLabel}>{t.label}</span>
                <span className={s.typeDesc}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WidgetConfigurator({ type, defaults, onConfirm, onCancel }) {
  const [cfg, setCfg] = useState({ ...defaults });
  const t = WIDGET_TYPES.find(t => t.id === type);

  return (
    <div className={s.configurator}>
      <div className={s.cfgHeader}>
        <span>{t.icon} {t.label}</span>
        <button className={s.btnCancel} onClick={onCancel}>✕</button>
      </div>

      {(type === 'countdown' || type === 'age' || type === 'memories') && (
        <>
          <label className={s.label}>Label</label>
          <input className={s.input} value={cfg.label || ''} onChange={e => setCfg({...cfg, label: e.target.value})} placeholder={defaults.label} />
          <label className={s.label}>Date de référence</label>
          <input className={s.input} type="date" value={cfg.date || ''} onChange={e => setCfg({...cfg, date: e.target.value})} />
          {type === 'countdown' && (
            <>
              <label className={s.label}>Unité affichée</label>
              <div className={s.unitRow}>
                {['auto','years','months','days','hours'].map(u => (
                  <button key={u} className={`${s.unitBtn} ${cfg.unit===u ? s.unitActive : ''}`} onClick={() => setCfg({...cfg, unit: u})}>
                    {u === 'auto' ? '🔄 Auto' : u === 'years' ? '📆 Années' : u === 'months' ? '🗓 Mois' : u === 'days' ? '📅 Jours' : '⏰ Heures'}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {type === 'quote' && (
        <>
          <label className={s.label}>Citation</label>
          <textarea className={s.textarea} rows={3} value={cfg.text || ''} onChange={e => setCfg({...cfg, text: e.target.value})} placeholder="Écris la citation ici…" />
          <label className={s.label}>Auteur (optionnel)</label>
          <input className={s.input} value={cfg.author || ''} onChange={e => setCfg({...cfg, author: e.target.value})} placeholder="— Quelqu'un de sage" />
        </>
      )}

      <button className={s.btnAdd} onClick={() => onConfirm(cfg)} disabled={type !== 'quote' && !cfg.date}>
        Ajouter ce widget
      </button>
    </div>
  );
}

function WidgetEditor({ widget, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const t = WIDGET_TYPES.find(t => t.id === widget.type);

  return (
    <div className={s.widgetCard}>
      <div className={s.widgetHeader} onClick={() => setOpen(!open)}>
        <span>{t?.icon} {t?.label}</span>
        <span className={s.widgetMeta}>
          {widget.date ? new Date(widget.date).toLocaleDateString('fr-FR') : widget.text?.slice(0,20)}
        </span>
        <div className={s.widgetActions}>
          <button className={s.chevron}>{open ? '▲' : '▼'}</button>
          <button className={s.btnRemove} onClick={e => { e.stopPropagation(); onRemove(); }}>🗑</button>
        </div>
      </div>
      {open && (
        <div className={s.widgetBody}>
          {widget.label !== undefined && (
            <>
              <label className={s.label}>Label</label>
              <input className={s.input} value={widget.label} onChange={e => onUpdate({label: e.target.value})} />
            </>
          )}
          {widget.date !== undefined && (
            <>
              <label className={s.label}>Date</label>
              <input className={s.input} type="date" value={widget.date} onChange={e => onUpdate({date: e.target.value})} />
            </>
          )}
          {widget.unit !== undefined && (
            <>
              <label className={s.label}>Unité</label>
              <div className={s.unitRow}>
                {['auto','years','months','days','hours'].map(u => (
                  <button key={u} className={`${s.unitBtn} ${widget.unit===u ? s.unitActive : ''}`} onClick={() => onUpdate({unit: u})}>
                    {u==='auto'?'🔄':u==='years'?'📆':u==='months'?'🗓':u==='days'?'📅':'⏰'}
                  </button>
                ))}
              </div>
            </>
          )}
          {widget.text !== undefined && (
            <>
              <label className={s.label}>Citation</label>
              <textarea className={s.textarea} rows={3} value={widget.text} onChange={e => onUpdate({text: e.target.value})} />
              <label className={s.label}>Auteur</label>
              <input className={s.input} value={widget.author||''} onChange={e => onUpdate({author: e.target.value})} />
            </>
          )}
        </div>
      )}
    </div>
  );
}