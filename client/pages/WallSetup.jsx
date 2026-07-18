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
        background: on ? 'var(--mk-accent)' : 'var(--mk-line-strong)',
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
      background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
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

  const [wallTitle, setWallTitle]     = useState(pub.title || '');
  const [phrase, setPhrase]           = useState(d.subtitle || d.phrase || '');
  const [bannerImage, setBannerImage] = useState(d.bannerImage || '');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileRef = useRef(null);

  const [reception, setReception]           = useState(cc.wishesEnabled !== false && d.wishesEnabled !== false);
  const [moderation, setModeration]         = useState(cc.requireModeration || false);
  const [isPrivate, setIsPrivate]           = useState(cc.isPrivate || d.isPrivate || false);
  const [accessCode, setAccessCode]         = useState(cc.accessCode || d.accessCode || '');

  const [cagnotteEnabled, setCagnotteEnabled]         = useState(cc.enabled || false);
  const [collectTitle, setCollectTitle]               = useState(cc.collectTitle || '');
  const [cagnotteDescription, setCagnotteDescription] = useState(cc.description || '');
  const [cagnotteGoal, setCagnotteGoal]               = useState(cc.goal || 250000);
  const [cagnotteDeadline, setCagnotteDeadline]       = useState(cc.deadline ? cc.deadline.slice(0, 10) : '');
  const [minContrib, setMinContrib]                   = useState(cc.minContribution || 0);
  const [maxContrib, setMaxContrib]                   = useState(cc.maxContribution || 0);

  const inited = useRef(false);

  /* Auto-save info */
  const infoTimer = useRef(null);
  useEffect(() => {
    if (!inited.current) return;
    onSave('unsaved');
    clearTimeout(infoTimer.current);
    infoTimer.current = setTimeout(async () => {
      onSave('saving');
      try {
        await updatePublication(id, {
          title: wallTitle,
          data: { subtitle: phrase, bannerImage },
        });
        onSave('saved');
      } catch { onSave('unsaved'); }
    }, 800);
  }, [wallTitle, phrase, bannerImage]);

  /* Auto-save cagnotte config */
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
            enabled: cagnotteEnabled, description: cagnotteDescription,
            goal: cagnotteGoal, deadline: cagnotteDeadline || null,
            collectTitle, wishesEnabled: reception, requireModeration: moderation,
            isPrivate, accessCode, minContribution: minContrib, maxContribution: maxContrib,
          },
        });
        onSave('saved');
      } catch { onSave('unsaved'); }
    }, 800);
  }, [reception, moderation, isPrivate, accessCode, cagnotteEnabled,
      cagnotteGoal, cagnotteDescription, cagnotteDeadline,
      minContrib, maxContrib, collectTitle]);

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
    <div className="wall-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-gap)', alignItems: 'start' }}>

      {/* Left column */}
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

      {/* Right column: cagnotte */}
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

      {/* Verrouillés  au-delà des 5 mots gratuits, ou avec média sur mur non-payé */}
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
function WallCagnotte({ pub, id }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);

  const cc = pub.cagnotteConfig || {};

  useEffect(() => {
    if (!cc.enabled) { setLoading(false); return; }
    Promise.all([getContributions(id), getContributionStats(id)])
      .then(([cRes, sRes]) => {
        setContributions(cRes.data || []);
        setStats(sRes.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, cc.enabled]);

  if (!cc.enabled) {
    return (
      <div className="empty-state card" style={{ padding: '40px 20px' }}>
        <div className="e-title">La cagnotte est désactivée</div>
        <p style={{ fontSize: 13 }}>Active-la dans l'onglet Réglages pour collecter des fonds avec Kkiapay.</p>
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
    <div className="wall-2col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--d-gap)', alignItems: 'start' }}>

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
              className="btn btn-primary"
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
  const [pubError, setPubError] = useState('');
  const [toast, setToast]       = useState('');
  const [tab, setTab]           = useState('settings');
  const [wordCounts, setWordCounts] = useState({ pending: 0, ok: 0, locked: 0 });

  const pubRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getPublicationById(id);
        pubRef.current = res.data;
        setPub(res.data);
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

  const handlePublish = async () => {
    setPublishing(true); setPubError('');
    try {
      await publishPublication(id);
      const updated = await getPublicationById(id);
      pubRef.current = updated.data;
      setPub(updated.data);
      showToast(
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <NotoEmoji name="partying-face" size={22} />
          Le mur est en ligne !
          <NotoEmoji name="party-popper" size={22} />
        </span>
      );
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
    { id: 'settings', label: 'Réglages',  icon: '⚙' },
    { id: 'words',    label: 'Mots',       icon: '💬', count: wordCounts.pending + wordCounts.locked },
    { id: 'cagnotte', label: 'Cagnotte',   icon: '🎁' },
  ];

  return (
    <div className="page">

      {/* Page header */}
      <div className="ph">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding: '3px 10px' }} onClick={() => navigate(-1)}>
              <ArrowLeft size={13} /> Retour
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mk-ink-3)' }}>
              {TEMPLATE_LABELS[pub?.templateName] || pub?.templateName}
            </span>
          </div>
          <h1 className="ph-title">{pub?.title || 'Mur sans titre'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {isPublished
            ? <span className="badge badge-live"><Check size={11} /> En ligne</span>
            : <span className="badge badge-draft">
                {Math.min(wordCounts.ok, 5)} / 5 mots gratuits
                {wordCounts.locked > 0 && (
                  <span style={{ marginLeft: 6, color: 'var(--mk-accent)', fontWeight: 700 }}>
                     · <LockKeyhole size={10} style={{ display: 'inline', verticalAlign: -1 }} /> {wordCounts.locked} verrouillé{wordCounts.locked > 1 ? 's' : ''}
                  </span>
                )}
              </span>
          }
          <span style={{ fontSize: 12, color: 'var(--mk-ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {saveStatus === 'saving'  && <><Loader2 size={12} style={{ animation: 'mk-spin .75s linear infinite' }} /> Sauvegarde…</>}
            {saveStatus === 'saved'   && <><Check size={12} color="var(--mk-mint)" /> Sauvegardé</>}
            {saveStatus === 'unsaved' && <span style={{ color: 'var(--mk-accent)' }}>Non sauvegardé</span>}
          </span>
          {isPublished && siteUrl && (
            <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <Eye size={13} /> Voir le mur
            </a>
          )}
          {isPublished && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/ewish-admin/share/${id}`)}>
              <Share2 size={13} /> Partager
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={handlePublish} disabled={publishing}>
            {publishing
              ? <><Loader2 size={13} style={{ animation: 'mk-spin .75s linear infinite' }} /> Publication…</>
              : isPublished ? <><Check size={13} /> Mettre à jour</> : 'Publier le mur'
            }
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="wall-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`wall-tab${tab === t.id ? ' on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && <span className="count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab content — key={tab} déclenche l'animation à chaque switch */}
      <div key={tab} className="mk-anim-fade-in">
        {tab === 'settings' && (
          <>
            <WallSettings pub={pub} id={id} onSave={setSaveStatus} />
            {pubError && (
              <div style={{ marginTop: 12, color: 'var(--mk-accent)', fontSize: 13, fontWeight: 600, padding: '10px 14px', background: 'var(--mk-accent-pale)', borderRadius: 'var(--mk-r-xs)' }}>
                {pubError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 'var(--d-gap)', flexWrap: 'wrap' }}>
              {isPublished && siteUrl && (
                <a href={siteUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  <ExternalLink size={14} /> Voir le mur
                </a>
              )}
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePublish} disabled={publishing}>
                {publishing
                  ? <><Loader2 size={16} style={{ animation: 'mk-spin .75s linear infinite' }} /> Publication…</>
                  : isPublished ? <><Check size={16} /> Mettre à jour</> : 'Publier le mur'
                }
              </button>
              {isPublished && (
                <button className="btn btn-ghost" onClick={() => navigate(`/ewish-admin/share/${id}`)}>
                  <Share2 size={14} /> QR Code & Partage
                </button>
              )}
            </div>
          </>
        )}

        {tab === 'words' && (
          <WallWords
            id={id}
            moderation={moderation}
            isPaid={pub?.isPaid}
            onRequestPay={handlePublish}
          />
        )}
        {tab === 'cagnotte' && <WallCagnotte pub={pub} id={id} />}
      </div>

      {/* Toast */}
      {toast && <div className="mk-toast">{toast}</div>}
    </div>
  );
}
