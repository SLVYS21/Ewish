import { useState } from 'react';
import { Hourglass, Cake, Quote, Calendar, Plus, X, Trash2, ChevronUp, ChevronDown, RefreshCw, CalendarDays, Clock } from 'lucide-react';
import s from './WidgetTab.module.css';

const WIDGET_TYPES = [
  { id: 'countdown',  icon: <Hourglass size={16} />, label: 'Décompte',     desc: 'Temps écoulé depuis une date' },
  { id: 'age',        icon: <Cake size={16} />, label: 'Âge exact',    desc: 'Années, mois, jours précis' },
  { id: 'quote',      icon: <Quote size={16} />, label: 'Citation',      desc: 'Texte mis en valeur' },
  { id: 'memories',   icon: <Calendar size={16} />, label: 'Souvenir',     desc: 'Depuis combien de temps vous vous connaissez' },
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
          <div className={s.sectionTitle} style={{display:'flex', alignItems:'center', gap:'6px'}}><Plus size={16} /> Ajouter un widget</div>
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
        <span style={{display:'flex', alignItems:'center', gap:'6px'}}>{t.icon} {t.label}</span>
        <button className={s.btnCancel} onClick={onCancel} style={{display:'flex', alignItems:'center', justifyContent:'center'}}><X size={14} /></button>
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
                  <button key={u} className={`${s.unitBtn} ${cfg.unit===u ? s.unitActive : ''}`} onClick={() => setCfg({...cfg, unit: u})} style={{display:'flex', alignItems:'center', gap:'4px'}}>
                    {u === 'auto' ? <><RefreshCw size={14} /> Auto</> : u === 'years' ? <><CalendarDays size={14} /> Années</> : u === 'months' ? <><CalendarDays size={14} /> Mois</> : u === 'days' ? <><Calendar size={14} /> Jours</> : <><Clock size={14} /> Heures</>}
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
        <span style={{display:'flex', alignItems:'center', gap:'6px'}}>{t?.icon} {t?.label}</span>
        <span className={s.widgetMeta}>
          {widget.date ? new Date(widget.date).toLocaleDateString('fr-FR') : widget.text?.slice(0,20)}
        </span>
        <div className={s.widgetActions}>
          <button className={s.chevron} style={{display:'flex', alignItems:'center', justifyContent:'center'}}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
          <button className={s.btnRemove} onClick={e => { e.stopPropagation(); onRemove(); }} style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Trash2 size={14} /></button>
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
                  <button key={u} className={`${s.unitBtn} ${widget.unit===u ? s.unitActive : ''}`} onClick={() => onUpdate({unit: u})} style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {u==='auto'?<RefreshCw size={14} />:u==='years'?<CalendarDays size={14} />:u==='months'?<CalendarDays size={14} />:u==='days'?<Calendar size={14} />:<Clock size={14} />}
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