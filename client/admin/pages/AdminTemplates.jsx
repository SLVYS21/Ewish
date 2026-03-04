import { useState, useEffect } from 'react';
import { getTemplates, getPromos, createPromo, updatePromo, deletePromo } from '../../utils/api';
import api from '../../utils/api';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import s from './AdminTemplates.module.css';

const THUMB_BG    = { birthday:'linear-gradient(135deg,#ff69b4,#ffb347)', special:'linear-gradient(135deg,#4285F4,#34A853)', 'collective-family':'linear-gradient(135deg,#ff69b4,#a78bfa)', 'collective-pro':'linear-gradient(135deg,#1e3a5f,#c9a84c)' };
const THUMB_EMOJI = { birthday:'🎂', special:'🔍', 'collective-family':'🎉', 'collective-pro':'🏆' };
function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p || 0) + ' FCFA'; }

// ── Default promo form state ──
const PROMO_DEFAULTS = { code:'', type:'percent', value:'', minOrder:'', maxUses:'', expiresAt:'', description:'' };

export default function AdminTemplates() {
  const [tab, setTab]               = useState('templates');
  const [templates, setTemplates]   = useState([]);
  const [promos, setPromos]         = useState([]);
  const [loadingT, setLoadingT]     = useState(true);
  const [loadingP, setLoadingP]     = useState(true);
  const [tmplModal, setTmplModal]   = useState(null);   // template being edited
  const [promoModal, setPromoModal] = useState(null);   // null | 'new' | promoObj
  const [promoForm, setPromoForm]   = useState(PROMO_DEFAULTS);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');

  useEffect(() => { loadTemplates(); loadPromos(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadTemplates = async () => {
    setLoadingT(true);
    try { const r = await getTemplates(); setTemplates(r.data || []); }
    catch {} finally { setLoadingT(false); }
  };
  const loadPromos = async () => {
    setLoadingP(true);
    try { const r = await getPromos(); setPromos(r.data || []); }
    catch {} finally { setLoadingP(false); }
  };

  // ── TEMPLATE EDIT ──
  const openTmpl = (t) => setTmplModal({ ...t, highlightsText: (t.highlights||[]).join('\n') });
  const saveTmpl = async () => {
    setSaving(true);
    try {
      await api.patch(`/templates/${tmplModal.name}`, {
        label:       tmplModal.label,
        price:       Number(tmplModal.price) || 0,
        description: tmplModal.description,
        priceLabel:  tmplModal.priceLabel,
        active:      tmplModal.active,
        featured:    tmplModal.featured,
        highlights:  tmplModal.highlightsText.split('\n').map(s=>s.trim()).filter(Boolean),
      }, { withCredentials: true });
      showToast('Template mis à jour');
      setTmplModal(null);
      loadTemplates();
    } catch(e) { showToast(e.response?.data?.error || 'Erreur'); }
    finally { setSaving(false); }
  };

  // ── PROMO CRUD ──
  const openNewPromo = () => { setPromoForm(PROMO_DEFAULTS); setPromoModal('new'); };
  const openEditPromo = (p) => {
    setPromoForm({ code:p.code, type:p.type, value:p.value, minOrder:p.minOrder||'', maxUses:p.maxUses||'', expiresAt:p.expiresAt?p.expiresAt.substring(0,10):'', description:p.description||'' });
    setPromoModal(p);
  };
  const savePromo = async () => {
    if (!promoForm.code || !promoForm.value) { showToast('Code et valeur requis', 'error'); return; }
    setSaving(true);
    try {
      const body = { ...promoForm, value: Number(promoForm.value), minOrder: Number(promoForm.minOrder)||0, maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : null, expiresAt: promoForm.expiresAt || null, active: true, code: promoForm.code.toUpperCase() };
      if (promoModal === 'new') await createPromo(body);
      else                      await updatePromo(promoModal._id, body);
      showToast(promoModal === 'new' ? 'Code créé' : 'Code mis à jour');
      setPromoModal(null);
      loadPromos();
    } catch(e) { showToast(e.response?.data?.error || 'Erreur'); }
    finally { setSaving(false); }
  };
  const removePromo = async (id) => {
    if (!confirm('Supprimer ce code ?')) return;
    try { await deletePromo(id); setPromos(p=>p.filter(x=>x._id!==id)); showToast('Code supprimé'); }
    catch { showToast('Erreur'); }
  };

  return (
    <PageShell title="Templates & Promos" subtitle="Prix, descriptions et codes promo">
      {/* ── Tabs ── */}
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab==='templates'?s.active:''}`} onClick={()=>setTab('templates')}>Templates & Prix</button>
        <button className={`${s.tab} ${tab==='promos'?s.active:''}`} onClick={()=>setTab('promos')}>Codes promo ({promos.filter(p=>p.active).length})</button>
      </div>

      {/* ── Templates tab ── */}
      {tab === 'templates' && (
        <div className={s.tableWrap}>
          {loadingT ? <div className={s.loadingWrap}><div className={s.spinner}/></div>
           : templates.map(t => {
            const bg    = THUMB_BG[t.name]    || '#333';
            const emoji = THUMB_EMOJI[t.name] || '🎁';
            return (
              <div key={t.name} className={s.tmplRow}>
                <div className={s.tmplThumb} style={{ background: bg }}>{emoji}</div>
                <div className={s.tmplInfo}>
                  <div className={s.tmplName}>{t.label}</div>
                  <div className={s.tmplMeta}>
                    {t.active ? <span className={s.visOk}>Visible</span> : <span className={s.visNo}>Masqué</span>}
                    {t.featured && <span className={s.featured}>· Featured</span>}
                    <span> · {t.collectEnabled ? 'Collectif' : 'Individuel'}</span>
                  </div>
                </div>
                <div className={s.tmplPrice}>{fmtPrice(t.price)}</div>
                <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={()=>openTmpl(t)}>✏ Modifier</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Promos tab ── */}
      {tab === 'promos' && (
        <>
          <div className={s.sectionHead}>
            <span className={s.sectionTitle}>Codes actifs</span>
            <button className={`${s.btn} ${s.btnGold} ${s.btnSm}`} onClick={openNewPromo}>+ Nouveau code</button>
          </div>
          <div className={s.tableWrap}>
            {loadingP ? <div className={s.loadingWrap}><div className={s.spinner}/></div>
             : !promos.length ? <div className={s.emptyWrap}><span>🏷️</span><p>Aucun code promo</p></div>
             : promos.map(p => {
              const expired   = p.expiresAt && new Date(p.expiresAt) < new Date();
              const exhausted = p.maxUses !== null && p.usedCount >= p.maxUses;
              const ok = p.active && !expired && !exhausted;
              return (
                <div key={p._id} className={s.promoRow}>
                  <div className={s.promoCode}>{p.code}</div>
                  <div className={s.promoDesc}>
                    {p.type==='percent'?`−${p.value}%`:`−${fmtPrice(p.value)}`}
                    {p.description ? ` · ${p.description}` : ''}
                    {p.minOrder>0 ? ` · min ${fmtPrice(p.minOrder)}` : ''}
                  </div>
                  <div className={s.promoUses}>{p.usedCount} utilisation{p.usedCount>1?'s':''}{p.maxUses?` / ${p.maxUses}`:''}</div>
                  <span className={`${s.badge} ${ok?s.badgeApproved:expired?s.badgeCancelled:s.badgeHidden}`}>{ok?'Actif':expired?'Expiré':'Inactif'}</span>
                  <div className={s.promoActions}>
                    <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={()=>openEditPromo(p)}>✏</button>
                    <button className={`${s.btn} ${s.btnDanger} ${s.btnSm} ${s.btnIcon}`} onClick={()=>removePromo(p._id)}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Template modal ── */}
      <Modal open={!!tmplModal} onClose={()=>setTmplModal(null)} title="Modifier le template"
        footer={<>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={()=>setTmplModal(null)}>Annuler</button>
          <button className={`${s.btn} ${s.btnGold}`} onClick={saveTmpl} disabled={saving}>{saving?'Enregistrement…':'Enregistrer'}</button>
        </>}
      >
        {tmplModal && (
          <div className={s.formStack}>
            <div className={s.formGrid2}>
              <div className={s.formGroup}><label className={s.formLabel}>Nom affiché</label>
                <input className={s.formInput} value={tmplModal.label||''} onChange={e=>setTmplModal(m=>({...m,label:e.target.value}))} />
              </div>
              <div className={s.formGroup}><label className={s.formLabel}>Prix (FCFA)</label>
                <input type="number" className={s.formInput} value={tmplModal.price||''} onChange={e=>setTmplModal(m=>({...m,price:e.target.value}))} />
              </div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Description</label>
              <textarea className={s.formTextarea} value={tmplModal.description||''} onChange={e=>setTmplModal(m=>({...m,description:e.target.value}))} />
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Label prix</label>
              <input className={s.formInput} value={tmplModal.priceLabel||''} onChange={e=>setTmplModal(m=>({...m,priceLabel:e.target.value}))} placeholder="livraison en 24h" />
            </div>
            <div className={s.formGrid2}>
              <div className={s.formGroup}><label className={s.formLabel}>Visible en boutique</label>
                <select className={s.formSelect} value={String(tmplModal.active!==false)} onChange={e=>setTmplModal(m=>({...m,active:e.target.value==='true'}))}>
                  <option value="true">Oui</option><option value="false">Non</option>
                </select>
              </div>
              <div className={s.formGroup}><label className={s.formLabel}>Featured</label>
                <select className={s.formSelect} value={String(!!tmplModal.featured)} onChange={e=>setTmplModal(m=>({...m,featured:e.target.value==='true'}))}>
                  <option value="false">Non</option><option value="true">Oui</option>
                </select>
              </div>
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Points forts (un par ligne)</label>
              <textarea className={s.formTextarea} value={tmplModal.highlightsText||''} onChange={e=>setTmplModal(m=>({...m,highlightsText:e.target.value}))} placeholder={"Animation complète\nPhotos personnalisées\nLivraison en 24h"} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Promo modal ── */}
      <Modal open={!!promoModal} onClose={()=>setPromoModal(null)} title={promoModal==='new'?'Nouveau code promo':'Modifier le code'}
        footer={<>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={()=>setPromoModal(null)}>Annuler</button>
          <button className={`${s.btn} ${s.btnGold}`} onClick={savePromo} disabled={saving}>{saving?'Enregistrement…':'Enregistrer'}</button>
        </>}
      >
        <div className={s.formStack}>
          <div className={s.formGrid2}>
            <div className={s.formGroup}><label className={s.formLabel}>Code *</label>
              <input className={s.formInput} value={promoForm.code} onChange={e=>setPromoForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="EWISH20" />
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Type</label>
              <select className={s.formSelect} value={promoForm.type} onChange={e=>setPromoForm(f=>({...f,type:e.target.value}))}>
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
              </select>
            </div>
          </div>
          <div className={s.formGrid2}>
            <div className={s.formGroup}><label className={s.formLabel}>Valeur *</label>
              <input type="number" className={s.formInput} value={promoForm.value} onChange={e=>setPromoForm(f=>({...f,value:e.target.value}))} placeholder="20" />
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Montant min (FCFA)</label>
              <input type="number" className={s.formInput} value={promoForm.minOrder} onChange={e=>setPromoForm(f=>({...f,minOrder:e.target.value}))} placeholder="0" />
            </div>
          </div>
          <div className={s.formGrid2}>
            <div className={s.formGroup}><label className={s.formLabel}>Utilisations max</label>
              <input type="number" className={s.formInput} value={promoForm.maxUses} onChange={e=>setPromoForm(f=>({...f,maxUses:e.target.value}))} placeholder="Illimité" />
            </div>
            <div className={s.formGroup}><label className={s.formLabel}>Expire le</label>
              <input type="date" className={s.formInput} value={promoForm.expiresAt} onChange={e=>setPromoForm(f=>({...f,expiresAt:e.target.value}))} />
            </div>
          </div>
          <div className={s.formGroup}><label className={s.formLabel}>Description interne</label>
            <input className={s.formInput} value={promoForm.description} onChange={e=>setPromoForm(f=>({...f,description:e.target.value}))} placeholder="Promo lancement…" />
          </div>
        </div>
      </Modal>

      {toast && <div className={s.toast}>{toast}</div>}
    </PageShell>
  );
}