import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Loader2, ExternalLink, Share2,
  Upload, X, Eye, Inbox, ShieldCheck, Shield, Lock, Gift,
  Trash2, RotateCcw, Clock, LockKeyhole, Zap,
} from 'lucide-react';
import {
  updatePublication, publishPublication, uploadFile, getPublicationById,
  getWishes, updateWish, deleteWish,
  getContributions, getContributionStats,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import NotoEmoji from '../components/NotoEmoji';
import WallStyle from '../components/WallStyle';
import WallPublishModal from '../components/WallPublishModal';
import { getEvent } from '../wall-wizard/constants';
import WallShareTab from './WallShareTab';

const TEMPLATE_LABELS = {
  'wall-of-wishes':        'Mur Classique',
  'wall-of-wishes-3d':     'Mur 3D',
  'wall-of-wishes-modern': 'Mur Moderne',
  'wall-of-wishes-space':  'Mur Spatial',
};

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} disabled={disabled}
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 99, flexShrink: 0,
        background: on ? '#1E1A2D' : '#E5E0E8',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background .2s', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.18)', transition: 'left .2s', display: 'block',
      }} />
    </button>
  );
}

function IconBubble({ children, bg, color }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 'var(--mk-r-xs)', flexShrink: 0,
      background: 'transparent', color: '#1E1A2D', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `il y a ${days} j`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

function fmtFCFA(n) {
  return (n || 0).toLocaleString('fr-FR') + ' FCFA';
}

/* ─────────────────────────────────────────────────────────── */
/* Réglages tab                                                */
/* ─────────────────────────────────────────────────────────── */
function WallSettings({ pub, id, onSave }) {
  const cc  = pub.cagnotteConfig || {};
  const d   = pub.data || {};

  const [wallTitle, setWallTitle]     = useState(d.recipient || d.titleName || pub.title || '');
  const [phrase, setPhrase]           = useState(d.subtitle || d.phrase || '');
  const [bannerImage, setBannerImage] = useState(d.bannerImage || '');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileRef = useRef(null);

  const [reception, setReception]           = useState(cc.wishesEnabled !== false && d.wishesEnabled !== false);
  const [moderation, setModeration]         = useState(cc.requireModeration || false);
  const [isPrivate, setIsPrivate]           = useState(cc.isPrivate || d.isPrivate || false);
  const [accessCode, setAccessCode]         = useState(cc.accessCode || d.accessCode || '');

  const inited = useRef(false);

  /* Auto-save info — wallTitle = destinataire ; on rebâtit pub.title depuis l'événement,
     et on propage aux champs consommés par le template (data.titleName, data.recipient). */
  const infoTimer = useRef(null);
  useEffect(() => {
    if (!inited.current) return;
    onSave('unsaved');
    clearTimeout(infoTimer.current);
    infoTimer.current = setTimeout(async () => {
      onSave('saving');
      try {
        const recipient = (wallTitle || '').trim();
        const ev = getEvent(d.occasion);
        const rebuiltTitle = recipient ? ev.title(recipient) : (pub.title || '');
        await updatePublication(id, {
          title: rebuiltTitle,
          data: {
            titleName: recipient,
            recipient,
            subtitle: phrase,
            phrase,
            bannerImage,
            coverImage: bannerImage,   // legacy alias attendu par applyCover
            wallCover: bannerImage,    // idem
          },
        });
        onSave('saved');
      } catch { onSave('unsaved'); }
    }, 800);
  }, [wallTitle, phrase, bannerImage]);

  /* Auto-save basic config */
  const ccTimer = useRef(null);
  useEffect(() => {
    if (!inited.current) return;
    onSave('unsaved');
    clearTimeout(ccTimer.current);
    ccTimer.current = setTimeout(async () => {
      onSave('saving');
      try {
        await updatePublication(id, {
          cagnotteConfig: {
            ...pub.cagnotteConfig,
            wishesEnabled: reception, requireModeration: moderation,
            isPrivate, accessCode,
          },
        });
        onSave('saved');
      } catch { onSave('unsaved'); }
    }, 800);
  }, [reception, moderation, isPrivate, accessCode]);

  useEffect(() => { inited.current = true; }, []);

  const handleBannerUpload = async (file) => {
    if (!file) return;
    setUploadingBanner(true);
    try {
      const res = await uploadFile(file, { background: true });
      setBannerImage(res.data.url);
    } catch { /* ignore */ }
    finally { setUploadingBanner(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap)' }}>
      {/* Infos card */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>Les infos du mur</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div className="field">
              <label className="field-label">Pour qui est ce mur ?</label>
              <input className="mk-input" value={wallTitle} onChange={e => setWallTitle(e.target.value)}
                placeholder="ex : Sarah, l'équipe RH, Léa & Karim…" />
            </div>
            <div className="field">
              <label className="field-label">La phrase d'accueil</label>
              <div className="field-hint" style={{ marginBottom: 4 }}>Affichée en grand, elle donne envie de laisser un mot.</div>
              <textarea className="mk-textarea" rows={2} value={phrase} maxLength={140}
                placeholder="Laisse un mot doux pour Maman…"
                onChange={e => setPhrase(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Bannière (en-tête du mur)</label>
              {bannerImage ? (
                <div style={{ position: 'relative', borderRadius: 'var(--mk-r-xs)', overflow: 'hidden', height: 86 }}>
                  <img src={bannerImage} alt="Bannière" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button
                    className="btn btn-sm"
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,.9)', padding: '4px 10px' }}
                    onClick={() => setBannerImage('')}
                  >
                    <Trash2 size={12} /> Retirer
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={uploadingBanner}
                    onClick={() => bannerFileRef.current?.click()}
                  >
                    {uploadingBanner
                      ? <><Loader2 size={13} style={{ animation: 'mk-spin .75s linear infinite' }} /> Chargement…</>
                      : <><Upload size={13} /> Ajouter une image</>}
                  </button>
                  <input
                    ref={bannerFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingBanner}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleBannerUpload(f);
                      e.target.value = '';
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reception card */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div className="section-label" style={{ marginBottom: 4 }}>Réception des mots</div>

          <div className="setting-row" style={{ paddingTop: 8 }}>
            <IconBubble bg="var(--mk-accent-pale)" color="var(--mk-accent)"><Inbox size={16} /></IconBubble>
            <div className="body">
              <div className="t">Accepter les nouveaux mots</div>
              <div className="s">Désactive pour figer le mur (le jour J par exemple).</div>
            </div>
            <Toggle on={reception} onChange={setReception} />
          </div>

          <div className="setting-row">
            <IconBubble bg="var(--mk-mint-soft)" color="var(--mk-mint)"><ShieldCheck size={16} /></IconBubble>
            <div className="body">
              <div className="t">Vérifier avant publication</div>
              <div className="s">Chaque mot passe par toi avant d'être collé au mur  onglet « Mots ».</div>
            </div>
            <Toggle on={moderation} onChange={setModeration} />
          </div>

          <div className="setting-row">
            <IconBubble bg="var(--mk-lilac-soft)" color="var(--mk-lilac)"><Lock size={16} /></IconBubble>
            <div className="body">
              <div className="t">Mur privé</div>
              <div className="s">Accessible uniquement avec un code.</div>
              {isPrivate && (
                <input
                  className="mk-input"
                  style={{ marginTop: 9, width: 170, textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', letterSpacing: '.08em' }}
                  value={accessCode}
                  placeholder="CODE"
                  maxLength={12}
                  onChange={e => setAccessCode(e.target.value.toUpperCase())}
                />
              )}
            </div>
            <Toggle on={isPrivate} onChange={setIsPrivate} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Mots tab                                                    */
/* ─────────────────────────────────────────────────────────── */
function WallWords({ id, moderation: moderationEnabled, isPaid, onRequestPay }) {
  const [words, setWords]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWishes(id);
      setWords(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* approve / refuse / restore using real server fields */
  const accept = async (wordId) => {
    try {
      await updateWish(wordId, { approved: true, hidden: false });
      setWords(prev => prev.map(w => w._id === wordId ? { ...w, approved: true, hidden: false } : w));
      showToast('Mot collé au mur ✓');
    } catch (e) {
      if (e.response?.status === 402) {
        showToast('Ce mot est verrouillé  publie le mur pour le débloquer');
      }
    }
  };

  const refuse = async (wordId) => {
    try {
      await updateWish(wordId, { hidden: true });
      setWords(prev => prev.map(w => w._id === wordId ? { ...w, hidden: true, approved: false } : w));
      showToast('Mot refusé');
    } catch { /* ignore */ }
  };

  const removeFromWall = async (wordId) => {
    try {
      await updateWish(wordId, { approved: false, hidden: false });
      setWords(prev => prev.map(w => w._id === wordId ? { ...w, approved: false, hidden: false } : w));
      showToast('Mot retiré du mur');
    } catch { /* ignore */ }
  };

  const restore = async (wordId) => {
    try {
      await updateWish(wordId, { hidden: false, approved: true });
      setWords(prev => prev.map(w => w._id === wordId ? { ...w, hidden: false, approved: true } : w));
      showToast('Mot remis sur le mur');
    } catch { /* ignore */ }
  };

  const remove = async (wordId) => {
    try {
      await deleteWish(wordId);
      setWords(prev => prev.filter(w => w._id !== wordId));
      showToast('Mot supprimé');
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite', margin: '0 auto' }} />
    </div>
  );

  /* server: approved=bool, hidden=bool, pendingPayment=bool */
  const locked   = words.filter(w =>  w.pendingPayment && !w.hidden);
  const pending  = words.filter(w => !w.approved && !w.hidden && !w.pendingPayment);
  const approved = words.filter(w =>  w.approved && !w.hidden && !w.pendingPayment);
  const hidden   = words.filter(w =>  w.hidden);

  const wordName = (w) => [w.firstName, w.role].filter(Boolean).join(' · ') || 'Anonyme';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--d-gap) + 6px)' }}>
      {toast && <div className="mk-toast">{toast}</div>}

      {/* Verrouillés  au-delà des 10 mots gratuits, ou avec média sur mur non-payé */}
      {locked.length > 0 && (
        <div>
          <div className="section-label" style={{ color: 'var(--mk-accent)', marginBottom: 10 }}>
            <LockKeyhole size={13} /> Verrouillés  {locked.length}
          </div>
          <div className="card" style={{
            padding: '16px 18px', marginBottom: 12,
            background: 'var(--mk-accent-pale)', borderColor: 'var(--mk-accent-soft)',
            display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <NotoEmoji name="wrapped-gift" size={44} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 3 }}>
                {locked.length} {locked.length > 1 ? 'mots attendent' : 'mot attend'} d'être révélé{locked.length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', lineHeight: 1.5 }}>
                Les contributeurs ont pu écrire librement. Publie ton mur pour que tous ces mots apparaissent d'un coup.
              </div>
            </div>
            <button className="btn btn-primary" onClick={onRequestPay}>
              <Zap size={14} /> Publier le mur
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {locked.map(word => (
              <div key={word._id} className="card word-card" style={{ opacity: .8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="word-msg" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <LockKeyhole size={13} style={{ flexShrink: 0, marginTop: 3, color: 'var(--mk-accent)' }} />
                    <span>{word.message}</span>
                  </div>
                  <div className="word-by">{wordName(word)} · {timeAgo(word.createdAt)}</div>
                </div>
                <button className="btn-icon" title="Supprimer" onClick={() => remove(word._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending  only show when moderation is on */}
      {moderationEnabled && pending.length > 0 && (
        <div>
          <div className="section-label" style={{ color: 'var(--mk-accent)', marginBottom: 10 }}>
            <Clock size={13} /> En attente de ta validation  {pending.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {pending.map(word => (
              <div key={word._id} className="card word-card" style={{ borderColor: 'var(--mk-accent-soft)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="word-msg">{word.message}</div>
                  <div className="word-by">{wordName(word)} · {timeAgo(word.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => refuse(word._id)}>
                    <X size={13} /> Refuser
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => accept(word._id)}>
                    <Check size={13} /> Accepter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On the wall */}
      <div>
        <div className="section-label" style={{ marginBottom: 10 }}>Sur le mur  {approved.length}</div>
        {approved.length === 0 ? (
          <div className="empty-state card" style={{ padding: '28px 20px', textAlign: 'center' }}>
            <NotoEmoji name="writing-hand" size={56} style={{ marginBottom: 10 }} />
            <div className="e-title">Pas encore de mots</div>
            <p style={{ fontSize: 13 }}>Partage le lien du mur pour recevoir les premiers.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {approved.map(word => (
              <div key={word._id} className="card word-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="word-msg">{word.message}</div>
                  <div className="word-by">{wordName(word)} · {timeAgo(word.createdAt)}</div>
                </div>
                <button className="btn-icon" title="Retirer du mur" onClick={() => removeFromWall(word._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden/refused */}
      {hidden.length > 0 && (
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Masqués  {hidden.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {hidden.map(word => (
              <div key={word._id} className="card word-card" style={{ opacity: .6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="word-msg" style={{ textDecoration: 'line-through' }}>
                    {word.message}
                  </div>
                  <div className="word-by">{wordName(word)}</div>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => restore(word._id)}>
                    <RotateCcw size={13} /> Repêcher
                  </button>
                  <button className="btn-icon" title="Supprimer" onClick={() => remove(word._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Cagnotte tab                                                */
/* ─────────────────────────────────────────────────────────── */
function WallCagnotte({ pub, id, onSave }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);

  const cc = pub.cagnotteConfig || {};

  const [cagnotteEnabled, setCagnotteEnabled]         = useState(cc.enabled || false);
  const [collectTitle, setCollectTitle]               = useState(cc.collectTitle || '');
  const [cagnotteDescription, setCagnotteDescription] = useState(cc.description || '');
  const [cagnotteGoal, setCagnotteGoal]               = useState(cc.goal || 250000);
  const [cagnotteDeadline, setCagnotteDeadline]       = useState(cc.deadline ? cc.deadline.slice(0, 10) : '');
  const [minContrib, setMinContrib]                   = useState(cc.minContribution || 0);
  const [maxContrib, setMaxContrib]                   = useState(cc.maxContribution || 0);

  const inited = useRef(false);
  const ccTimer = useRef(null);

  useEffect(() => {
    if (!inited.current) return;
    if (onSave) onSave('unsaved');
    clearTimeout(ccTimer.current);
    ccTimer.current = setTimeout(async () => {
      if (onSave) onSave('saving');
      try {
        await updatePublication(id, {
          cagnotteConfig: {
            ...pub.cagnotteConfig,
            enabled: cagnotteEnabled, description: cagnotteDescription,
            goal: cagnotteGoal, deadline: cagnotteDeadline || null,
            collectTitle, minContribution: minContrib, maxContribution: maxContrib,
          },
        });
        if (onSave) onSave('saved');
      } catch { if (onSave) onSave('unsaved'); }
    }, 800);
  }, [cagnotteEnabled, cagnotteGoal, cagnotteDescription, cagnotteDeadline, minContrib, maxContrib, collectTitle]);

  useEffect(() => { inited.current = true; }, []);

  useEffect(() => {
    if (!cagnotteEnabled) { setLoading(false); return; }
    Promise.all([getContributions(id), getContributionStats(id)])
      .then(([cRes, sRes]) => {
        setContributions(cRes.data || []);
        setStats(sRes.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, cagnotteEnabled]);

  if (!cagnotteEnabled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap)' }}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div className="section-label" style={{ marginBottom: 4 }}>La cagnotte</div>
          <div className="setting-row" style={{ paddingTop: 8 }}>
            <IconBubble bg="var(--mk-accent-pale)" color="var(--mk-accent)"><Gift size={16} /></IconBubble>
            <div className="body">
              <div className="t">Activer la cagnotte</div>
              <div className="s">Les visiteurs participent via Kkiapay. Sur le mur, seule la progression est visible  jamais les montants individuels.</div>
            </div>
            <Toggle on={cagnotteEnabled} onChange={setCagnotteEnabled} />
          </div>
        </div>
        <div className="empty-state card" style={{ padding: '40px 20px' }}>
          <div className="e-title">La cagnotte est désactivée</div>
          <p style={{ fontSize: 13 }}>Active-la ci-dessus pour collecter des fonds avec Kkiapay.</p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite', margin: '0 auto' }} />
    </div>
  );

  const raised = stats?.total || contributions.reduce((s, t) => s + (t.amount || 0), 0);
  const goal   = cc.goal || 0;
  const pct    = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const isKycVerified = user?.kyc === 'verified';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap)' }}>

      <div className="card" style={{ padding: '20px 22px' }}>
        <div className="section-label" style={{ marginBottom: 4 }}>La cagnotte</div>
        <div className="setting-row" style={{ paddingTop: 8 }}>
          <IconBubble bg="var(--mk-accent-pale)" color="var(--mk-accent)"><Gift size={16} /></IconBubble>
          <div className="body">
            <div className="t">Activer la cagnotte</div>
            <div className="s">Les visiteurs participent via Kkiapay. Sur le mur, seule la progression est visible  jamais les montants individuels.</div>
          </div>
          <Toggle on={cagnotteEnabled} onChange={setCagnotteEnabled} />
        </div>

        {cagnotteEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--mk-line)' }}>
            <div className="field">
              <label className="field-label">Titre de la collecte</label>
              <input className="mk-input" value={collectTitle} placeholder="Le vélo de Marc"
                onChange={e => setCollectTitle(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Pour quoi ?</label>
              <textarea className="mk-textarea" rows={2} value={cagnotteDescription}
                placeholder="Explique l'objectif en une phrase."
                onChange={e => setCagnotteDescription(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div className="field">
                <label className="field-label">Objectif (FCFA)</label>
                <input className="mk-input" type="number" value={cagnotteGoal} placeholder="250 000"
                  onChange={e => setCagnotteGoal(Number(e.target.value))} min={0} step={1000} />
              </div>
              <div className="field">
                <label className="field-label">Date limite</label>
                <input className="mk-input" type="date" value={cagnotteDeadline}
                  onChange={e => setCagnotteDeadline(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Participation min.</label>
                <input className="mk-input" type="number" value={minContrib} placeholder="500"
                  onChange={e => setMinContrib(Number(e.target.value))} min={0} step={500} />
              </div>
              <div className="field">
                <label className="field-label">Participation max.</label>
                <div className="field-hint" style={{ marginBottom: 4 }}>0 = illimité</div>
                <input className="mk-input" type="number" value={maxContrib} placeholder="0"
                  onChange={e => setMaxContrib(Number(e.target.value))} min={0} step={1000} />
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--mk-ink-3)', display: 'flex', gap: 7, alignItems: 'flex-start', lineHeight: 1.5 }}>
              <Shield size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              Encaissement sécurisé par Kkiapay. Retrait des fonds après vérification d'identité (KYC).
            </p>
          </div>
        )}
      </div>

      {/* Progress + transactions */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div className="section-label" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <span>{cc.collectTitle || 'Cagnotte'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--mk-mint)', textTransform: 'none', letterSpacing: 0, fontSize: 11.5, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--mk-mint)', animation: 'mk-pulse-soft 1.8s infinite' }} />
            En direct
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--mk-display)', fontSize: 34, letterSpacing: '-.01em' }}>{fmtFCFA(raised)}</span>
          {goal > 0 && <span style={{ fontSize: 13, color: 'var(--mk-ink-3)', fontWeight: 600 }}>sur {fmtFCFA(goal)} · {pct} %</span>}
        </div>
        {goal > 0 && (
          <div className="progress-track" style={{ marginBottom: 10 }}>
            <div className="progress-fill" style={{ width: pct + '%' }} />
          </div>
        )}
        <p style={{ fontSize: 11.5, color: 'var(--mk-ink-3)', margin: '8px 0 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Eye size={13} /> Les visiteurs du mur voient cette progression  toi seul vois le détail ci-dessous.
        </p>

        <div className="section-label" style={{ marginBottom: 4 }}>Participations  {contributions.length}</div>
        <div>
          {contributions.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--mk-ink-3)', padding: '12px 0' }}>Pas encore de contributions.</p>
          ) : (
            contributions.map(t => (
              <div className="tx-row" key={t._id || t.id}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mk-accent-pale)', color: 'var(--mk-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>
                  {(t.contributor || t.name || '?').slice(0, 2).toUpperCase()}
                </span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{t.contributor || t.name || 'Anonyme'}</span>
                <span style={{ color: 'var(--mk-ink-3)', fontSize: 11.5 }}>{t.method || 'Kkiapay'} · {timeAgo(t.createdAt)}</span>
                <span style={{ fontWeight: 800 }}>{fmtFCFA(t.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw / transfer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap)' }}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Récupérer les fonds</div>
          <p style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', lineHeight: 1.6, marginBottom: 14 }}>
            Avant tout retrait ou transfert, une vérification d'identité (KYC) est demandée  une seule fois.
          </p>
          {isKycVerified ? (
            <div className="badge badge-live" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={12} /> Identité vérifiée <NotoEmoji name="sparkles" size={14} />
            </div>
          ) : (
            <div className="badge badge-draft" style={{ marginBottom: 12 }}>
              <Shield size={12} /> Identité non vérifiée
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button
              className="btn btn-ink"
              onClick={() => isKycVerified ? null : navigate('/ewish-admin/profile')}
            >
              <Gift size={15} /> Récupérer les fonds
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => isKycVerified ? null : navigate('/ewish-admin/profile')}
            >
              <Share2 size={15} /> Transférer la cagnotte
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--mk-ink-3)', marginTop: 12, lineHeight: 1.5 }}>
            Le transfert confie la cagnotte à une autre personne (le destinataire fera son propre KYC).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main WallSetup page                                         */
/* ─────────────────────────────────────────────────────────── */
export default function WallSetup() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pub, setPub]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pubError, setPubError] = useState('');
  const [toast, setToast]       = useState('');
  const [tab, setTab]           = useState('settings');
  const [wordCounts, setWordCounts] = useState({ pending: 0, ok: 0, locked: 0 });
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [previewRole, setPreviewRole] = useState('guest');

  const pubRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getPublicationById(id);
        let data = res.data;
        /* Backfill : anciens murs créés avant bannerTint — hydrate depuis l'occasion. */
        const dd = data?.data || {};
        if (!dd.bannerTint && dd.occasion) {
          const ev = getEvent(dd.occasion);
          if (ev?.tint) {
            try {
              await updatePublication(id, {
                data: { bannerTint: ev.tint, bannerInk: ev.bannerInk || '#2B2440' },
              });
              data = { ...data, data: { ...dd, bannerTint: ev.tint, bannerInk: ev.bannerInk || '#2B2440' } };
            } catch { /* silent */ }
          }
        }
        pubRef.current = data;
        setPub(data);
      } catch {
        navigate('/ewish-admin/ewish');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    getWishes(id).then(r => {
      const ws = r.data || [];
      setWordCounts({
        pending: ws.filter(w => !w.approved && !w.hidden && !w.pendingPayment).length,
        ok:      ws.filter(w =>  w.approved && !w.hidden && !w.pendingPayment).length,
        locked:  ws.filter(w =>  w.pendingPayment && !w.hidden).length,
      });
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePublishClick = () => {
    setShowPublishModal(true);
  };

  const handlePublishConfirm = async (planType) => {
    setPublishing(true);
    setPubError('');
    try {
      const res = await publishPublication(id, { planType });
      setPub(res.data);
      setToast('Mur publié avec succès !');
      setTimeout(() => setToast(''), 3000);
      setShowPublishModal(false);
    } catch (err) {
      setPubError(err.response?.data?.error || 'Erreur lors de la publication');
    } finally { setPublishing(false); }
  };

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite' }} />
    </div>
  );

  if (!pub) return null;

  const isPublished  = pub?.published;
  const cc           = pub?.cagnotteConfig || {};
  const moderation   = cc.requireModeration || false;
  const VITE_SITE    = import.meta.env.VITE_API_URL || '';
  const siteUrl      = isPublished ? `${VITE_SITE}/site/${pub.templateName}/${pub.customName}` : null;

  const tabs = [
    { id: 'settings', label: 'Réglages' },
    { id: 'style',    label: 'Style' },
    { id: 'words',    label: 'Mots', count: wordCounts.pending + wordCounts.locked },
    { id: 'cagnotte', label: 'Cagnotte' },
    { id: 'share',    label: 'Partager' },
  ];

  const styleTouched = !!(
    pub?.style?.styleBgPreset ||
    pub?.style?.stylePalettePreset ||
    pub?.style?.styleConfettiPreset ||
    pub?.style?.styleCustomBgUrl
  );

  const getIconForTab = (tid) => {
    if (tid === 'style') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="14" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="14.5" r="2.5"/><path d="M12 22a10 10 0 1 1 0-20"/></svg>;
    if (tid === 'settings') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
    if (tid === 'words') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>;
    if (tid === 'cagnotte') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    if (tid === 'share') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
    return null;
  };

  const renderActiveTabContent = () => (
    <div className="mk-anim-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {tab === 'style' && (
        <WallStyle
          pub={pub}
          id={id}
          onSave={setSaveStatus}
          onPubUpdated={(next) => {
            if (next) { pubRef.current = next; setPub(next); }
          }}
        />
      )}
      {tab === 'settings' && (
        <>
          <WallSettings pub={pub} id={id} onSave={setSaveStatus} />
          {pubError && (
            <div style={{ marginTop: 12, color: 'var(--mk-accent)', fontSize: 13, fontWeight: 600, padding: '10px 14px', background: 'var(--mk-accent-pale)', borderRadius: 'var(--mk-r-xs)' }}>
              {pubError}
            </div>
          )}
        </>
      )}
      {tab === 'words' && (
        <WallWords
          id={id}
          moderation={moderation}
          isPaid={pub?.isPaid}
          onRequestPay={handlePublishClick}
        />
      )}
      {tab === 'cagnotte' && <WallCagnotte pub={pub} id={id} onSave={setSaveStatus} />}
    </div>
  );

  return (
    <div className="wall-editor-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: isMobile ? '#FAF7F0' : '#fff', overflow: 'hidden' }}>

      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {/* Mobile Header */}
          <div style={{ flex: '0 0 auto', background: '#fff', borderBottom: '1px solid #F0EBDE', padding: '16px 18px 0', paddingTop: 'env(safe-area-inset-top, 16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => navigate('/ewish-admin/ewish')} style={{ width: '36px', height: '36px', borderRadius: '11px', background: '#FAF7F0', border: '1px solid #ECE6D8', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#453E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 10px Inter', letterSpacing: '.14em', textTransform: 'uppercase', color: '#9F6D22' }}>
                  {pub?.templateName === 'wall-of-wishes' ? 'Mur Classique' : 'Mur'}
                </div>
                <div style={{ fontFamily: 'Fraunces', fontSize: '19px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#161311' }}>
                  {pub?.title || 'Mur sans titre'}
                </div>
              </div>
              <button onClick={() => setMobilePreviewOpen(true)} style={{ font: '600 11px Inter', color: '#1E2952', display: 'inline-flex', alignItems: 'center', gap: '4px', flex: '0 0 auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E2952" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                Aperçu
              </button>
            </div>
            
            <div className="mk-scroll" style={{ display: 'flex', gap: '4px', marginTop: '14px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
              {tabs.map(t => {
                const active = tab === t.id;
                return (
                  <span 
                    key={t.id} 
                    onClick={() => setTab(t.id)} 
                    style={{ 
                      padding: '11px 14px', 
                      font: active ? '700 13px Inter' : '600 13px Inter', 
                      color: active ? '#1E2952' : '#8C8570', 
                      borderBottom: active ? '2px solid #1E2952' : '2px solid transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Mobile Content */}
          {tab === 'share' ? (
            <div className="mk-scroll" style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
              <WallShareTab pub={pub} setPub={(fn) => { const next = fn(pub); setPub(next); pubRef.current = next; }} />
            </div>
          ) : (
            <div className="mk-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FAF7F0' }}>
              {renderActiveTabContent()}
            </div>
          )}

          {/* Mobile Preview Modal */}
          {mobilePreviewOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#161311', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#161311', color: '#fff' }}>
                
                <div style={{ display: 'inline-flex', gap: 0, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '11px', overflow: 'hidden' }}>
                  <button onClick={() => setPreviewRole('guest')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: previewRole === 'guest' ? '#fff' : 'transparent', color: previewRole === 'guest' ? '#161311' : '#fff', padding: '7px 12px', font: '700 11px Inter', borderRight: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', border: 'none' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    Invités
                  </button>
                  <button onClick={() => setPreviewRole('recipient')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: previewRole === 'recipient' ? '#FBF3E4' : 'transparent', color: previewRole === 'recipient' ? '#9F6D22' : '#fff', padding: '7px 12px', font: '700 11px Inter', cursor: 'pointer', border: 'none' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                    Destinataire
                  </button>
                </div>

                <button onClick={() => setMobilePreviewOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe 
                  id="wall-preview-iframe"
                  src={previewRole === 'recipient' && pub?.customName ? `${VITE_SITE}/m/${pub.customName}?preview=1` : pub?.customName ? `${VITE_SITE}/site/${pub.templateName}/${pub.customName}?preview=1` : ''} 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Aperçu du mur"
                />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Desktop Layout */
        <>
          {/* Header */}
          <div style={{ height: '64px', borderBottom: '1px solid #F0EBDE', background: '#fff', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 22px', flexShrink: 0 }}>
            <button onClick={() => navigate('/ewish-admin/ewish')} style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #E5DDC9', display: 'grid', placeItems: 'center', flex: '0 0 auto', background: '#fff', cursor: 'pointer' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#453E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f382/512.gif" alt="" style={{ width: '26px', height: '26px' }} />
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: '19px', lineHeight: 1, color: '#161311' }}>{pub?.title || 'Mur sans titre'}</div>
                <div style={{ font: '500 11px var(--body)', color: '#8C8570', marginTop: '3px' }}>
                  Mur collectif · {wordCounts.ok} mot{wordCounts.ok > 1 ? 's' : ''}
                </div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B0A88E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div style={{ flex: 1 }}></div>

            <div style={{ display: 'inline-flex', alignItems: 'center', font: '700 12px Inter', color: '#7D7156', marginRight: '6px' }}>Aperçu :</div>
            <div style={{ display: 'inline-flex', gap: 0, border: '1.5px solid #E5DDC9', borderRadius: '11px', overflow: 'hidden', marginRight: '16px' }}>
              <button onClick={() => setPreviewRole('guest')} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: previewRole === 'guest' ? '#fff' : 'transparent', color: previewRole === 'guest' ? '#453E2E' : '#8C8570', padding: '9px 14px', font: '700 12.5px Inter', borderRight: '1.5px solid #E5DDC9', cursor: 'pointer', border: 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                Vu par les invités
              </button>
              <button onClick={() => setPreviewRole('recipient')} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: previewRole === 'recipient' ? '#FBF3E4' : 'transparent', color: previewRole === 'recipient' ? '#9F6D22' : '#8C8570', padding: '9px 14px', font: '700 12.5px Inter', cursor: 'pointer', border: 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                Déballage destinataire
              </button>
            </div>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', font: '600 12.5px var(--body)', color: saveStatus === 'saved' ? '#3FA98A' : '#E8B84B' }}>
              {saveStatus === 'saved' ? (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Enregistré</>
              ) : saveStatus === 'saving' ? (
                <><Loader2 size={13} style={{ animation: 'mk-spin .75s linear infinite' }} />Sauvegarde…</>
              ) : (
                'Non sauvegardé'
              )}
            </span>

            {isPublished && siteUrl && (
              <button onClick={() => navigate(`/ewish-admin/share/${id}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1.5px solid #E5DDC9', color: '#453E2E', borderRadius: '11px', padding: '9px 15px', font: '700 13px var(--body)', cursor: 'pointer' }}>
                <Share2 size={15} /> Partager
              </button>
            )}
            {!isPublished && (
              <button onClick={handlePublishClick} disabled={publishing} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#1E2952', color: '#fff', borderRadius: '11px', padding: '9px 17px', font: '700 13px var(--body)', boxShadow: '0 10px 22px -10px rgba(30,41,82,.55)', cursor: 'pointer', border: 'none' }}>
                {publishing ? <Loader2 size={15} style={{ animation: 'mk-spin .75s linear infinite' }} /> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>}
                Publier
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr 340px', flex: 1, overflow: 'hidden' }}>
            
            {/* Left Sidebar */}
            <aside style={{ borderRight: '1px solid #F0EBDE', background: '#fff', display: 'flex', flexDirection: 'column', padding: '20px 14px 14px' }}>
              <div style={{ font: '700 10.5px var(--body)', letterSpacing: '.12em', textTransform: 'uppercase', color: '#B0A88E', padding: '0 10px 12px' }}>Sections</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {tabs.map(t => {
                  const active = tab === t.id;
                  return (
                    <div key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '11px', cursor: 'pointer', transition: 'all .2s', background: active ? '#FDF7EA' : 'transparent', color: active ? '#9F6D22' : '#453E2E', font: active ? '700 13.5px var(--body)' : '600 13.5px var(--body)' }}>
                      {getIconForTab(t.id)}
                      {t.label}
                      <span style={{ flex: 1 }}></span>
                      {t.count > 0 && <span style={{ font: '800 9px var(--body)', background: '#C13B3B', color: '#fff', padding: '2px 7px', borderRadius: '999px' }}>{t.count}</span>}
                      {active && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C6A15A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>}
                    </div>
                  );
                })}
              </nav>
              <div style={{ flex: 1 }}></div>
              <div style={{ background: '#F6F1E6', borderRadius: '14px', padding: '14px', display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a1/512.gif" alt="" style={{ width: '26px', height: '26px', flex: '0 0 auto' }} />
                <div>
                  <div style={{ font: '700 12px var(--body)', color: '#161311' }}>Astuce</div>
                  <div style={{ font: '400 11.5px var(--body)', color: '#7D7156', lineHeight: 1.5, marginTop: '2px' }}>
                    Tu peux modifier tous ces paramètres même après la publication.
                  </div>
                </div>
              </div>
            </aside>

            {tab === 'share' ? (
              <div className="mk-scroll" style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
                <WallShareTab pub={pub} setPub={(fn) => { const next = fn(pub); setPub(next); pubRef.current = next; }} />
              </div>
            ) : (
              <>
                {/* Center Preview */}
                <div style={{ position: 'relative', background: '#EDE7DA', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '48px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <div style={{ display: 'inline-flex', gap: '3px', background: '#fff', border: '1px solid #E5DDC9', borderRadius: '999px', padding: '3px' }}>
                      <button onClick={() => setPreviewMode('desktop')} style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 13px', borderRadius: '999px', background: previewMode === 'desktop' ? '#1E2952' : 'transparent', color: previewMode === 'desktop' ? '#fff' : '#7D7156', font: previewMode === 'desktop' ? '700 12px var(--body)' : '600 12px var(--body)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>Bureau
                      </button>
                      <button onClick={() => setPreviewMode('mobile')} style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 13px', borderRadius: '999px', background: previewMode === 'mobile' ? '#1E2952' : 'transparent', color: previewMode === 'mobile' ? '#fff' : '#7D7156', font: previewMode === 'mobile' ? '700 12px var(--body)' : '600 12px var(--body)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>Mobile
                      </button>
                    </div>
                    <span style={{ font: '600 12px var(--body)', color: '#8C8570' }}>Aperçu en direct</span>
                  </div>
                  
                  <div className="mk-scroll" style={{ flex: 1, overflowY: 'auto', padding: previewMode === 'desktop' ? '26px 30px 32px' : '26px 0', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      width: '100%',
                      maxWidth: previewMode === 'desktop' ? '1200px' : '390px',
                      height: previewMode === 'desktop' ? '800px' : '844px',
                      borderRadius: previewMode === 'desktop' ? '20px' : '40px',
                      overflow: 'hidden',
                      boxShadow: '0 24px 50px -24px rgba(22,19,17,.4)',
                      border: previewMode === 'mobile' ? '12px solid #161311' : 'none',
                      background: '#fff',
                      transition: 'all .3s ease'
                    }}>
                      <iframe 
                        id="wall-preview-iframe"
                        src={previewRole === 'recipient' && pub?.customName ? `${VITE_SITE}/m/${pub.customName}?preview=1` : pub?.customName ? `${VITE_SITE}/site/${pub.templateName}/${pub.customName}?preview=1` : ''} 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Aperçu du mur"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Inspector */}
                <aside className="mk-scroll" style={{ borderLeft: '1px solid #F0EBDE', background: '#fff', overflowY: 'auto', padding: '22px 20px 26px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '20px', color: '#161311', marginBottom: '4px' }}>
                    {tabs.find(t => t.id === tab)?.label}
                  </div>
                  <div style={{ font: '400 12.5px var(--body)', color: '#8C8570', marginBottom: '20px', lineHeight: 1.5 }}>
                    {tab === 'style' && "L'aspect du mur et de son ouverture."}
                    {tab === 'settings' && "Les paramètres de base de ton mur."}
                    {tab === 'words' && "Gère les mots laissés par tes proches."}
                    {tab === 'cagnotte' && "Suis la collecte de fonds en direct."}
                  </div>

                  {renderActiveTabContent()}
                </aside>
              </>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <div className="mk-toast">{toast}</div>}

      {/* Pricing Modal */}
      {showPublishModal && (
        <WallPublishModal 
          onClose={() => setShowPublishModal(false)}
          onConfirm={handlePublishConfirm}
          loading={publishing}
        />
      )}
    </div>
  );
}
