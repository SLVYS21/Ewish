import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gift, Search, Users, Building, Heart, Sparkles, Film, Copy, X, Trash2,
  Edit2, MonitorPlay, ExternalLink, CircleOff, Eye, QrCode, Plus,
  ChevronDown, AlertTriangle, Send, Lightbulb, Star, Bug, Palette, HelpCircle,
  Folder, Layout, Star as StarIcon, Cake, Flower2, ArrowLeft
} from 'lucide-react';
import {
  getPublications, deletePublication, duplicatePublication, unpublishPublication,
  getTemplates, createPublication, createSuggestion, getMySuggestions,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import styles from './Dashboard.module.css';

const LIMIT = 20;

const TEMPLATE_ICONS = {
  birthday: <Cake size={32} />, 
  special: <Sparkles size={32} />, 
  'collective-family': <Users size={32} />, 
  'collective-pro': <Building size={32} />,
  forever: <Heart size={32} />, 
  sanctuary: <Flower2 size={32} />, 
  'notre-film': <Film size={32} />,
};
const TEMPLATE_COLORS = {
  birthday: 'linear-gradient(135deg,#ff6b9d,#ff8e53)',
  special:  'linear-gradient(135deg,#a78bfa,#60a5fa)',
  'collective-family': 'linear-gradient(135deg,#34d399,#06b6d4)',
  'collective-pro':    'linear-gradient(135deg,#c9a84c,#e8c86a)',
  forever:  'linear-gradient(135deg,#f472b6,#ec4899)',
  sanctuary:'linear-gradient(135deg,#818cf8,#c084fc)',
  'notre-film': 'linear-gradient(135deg,#475569,#0ea5e9)',
};

const CATEGORY_ICONS = { feature: <Lightbulb size={16}/>, bug: <Bug size={16}/>, design: <Palette size={16}/>, other: <HelpCircle size={16}/> };
const STATUS_COLORS = { new:'#3b82f6', read:'#94a3b8', planned:'#f59e0b', done:'#10b981', rejected:'#ef4444' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [pubs, setPubs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [page, setPage]           = useState(1);
  const [hasNext, setHasNext]     = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'super_admin';
  const LOW_CREDITS  = user?.role === 'merchant' && (user?.credits ?? 0) <= 2;

  // Dup modal
  const [dupModal,   setDupModal]   = useState(null);
  const [dupTitle,   setDupTitle]   = useState('');
  const [dupSlug,    setDupSlug]    = useState('');
  const [dupError,   setDupError]   = useState('');
  const [dupLoading, setDupLoading] = useState(false);

  // Preview modal
  const [previewUrl, setPreviewUrl] = useState(null);

  // QR
  const [qrModalPub, setQrModalPub] = useState(null);

  const [showTuto, setShowTuto] = useState(false);
  const searchTimer = useRef(null);

  /* ── Fetching ───────────────────────────────────── */
  const fetchPubs = useCallback((p, s, tab = activeTab) => {
    setLoading(true);
    if (tab === 'templates') {
      getTemplates().then(r => setTemplates(r.data)).finally(() => setLoading(false));
      return;
    }
    const params = { page: p, limit: LIMIT, search: s || undefined };
    if (tab === 'mine')    params.mine    = 'true';
    if (tab === 'premade') params.premade = 'true';
    getPublications(params)
      .then(r => { setPubs(r.data); setHasNext(r.data.length === LIMIT); })
      .catch(() => { setPubs([]); setHasNext(false); })
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleTogglePremade = async (id, val, e) => {
    e.stopPropagation();
    try {
      await updatePublication(id, { isPremade: val });
      setPubs(prev => prev.map(p => p._id === id ? { ...p, isPremade: val } : p));
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  useEffect(() => { fetchPubs(1, ''); }, [fetchPubs]);

  const handleSearchChange = e => {
    const val = e.target.value;
    setSearch(val); setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchPubs(1, val, activeTab), 350);
  };

  const handleTabChange = tab => {
    setActiveTab(tab); setPage(1); setSearch('');
    fetchPubs(1, '', tab);
  };

  /* ── Template create ────────────────────────────── */
  const handleCreateFromTemplate = async templateName => {
    try {
      const res = await createPublication({ templateName, customName: `draft-${Date.now()}`, title: 'Nouvelle création' });
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) { alert(e.response?.data?.error || 'Erreur lors de la création'); }
  };

  /* ── Duplicate ──────────────────────────────────── */
  const openDupModal = (pub, e) => {
    e.stopPropagation();
    setDupModal(pub); setDupTitle(pub.title + ' (copie)');
    setDupSlug(pub.customName + '-copie'); setDupError('');
  };
  const closeDupModal = () => { setDupModal(null); setDupTitle(''); setDupSlug(''); setDupError(''); };
  const handleDuplicate = async () => {
    if (!dupTitle.trim() || !dupSlug.trim()) { setDupError('Titre et nom requis'); return; }
    setDupLoading(true); setDupError('');
    try {
      const r = await duplicatePublication(dupModal._id, { title: dupTitle.trim(), customName: dupSlug.trim() });
      setPubs(p => [r.data, ...p]); closeDupModal();
      navigate(`/ewish-admin/ewish/edit/${r.data._id}`);
    } catch (e) { setDupError(e.response?.data?.error || 'Erreur'); }
    finally { setDupLoading(false); }
  };

  /* ── Delete / Unpublish ─────────────────────────── */
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette création ?')) return;
    await deletePublication(id); fetchPubs(page, search);
  };
  const handleUnpublish = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Dépublier ?')) return;
    await unpublishPublication(id);
    setPubs(p => p.map(x => x._id === id ? { ...x, published: false } : x));
  };

  /* ── Preview ────────────────────────────────────── */
  const openPreview = (url, e) => { e?.stopPropagation(); setPreviewUrl(url); };

  /* ── Filtered templates ─────────────────────────── */
  const filteredTemplates = templates.filter(t =>
    !templateSearch || t.label?.toLowerCase().includes(templateSearch.toLowerCase()) || t.name?.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const VITE_API = import.meta.env.VITE_API_URL || '';

  return (
    <div className={styles.root}>

      {/* ── Low Credits Banner ── */}
      {/* {LOW_CREDITS && (
        <div className={styles.lowCreditsBanner}>
          <AlertTriangle size={16} />
          <span><strong>{user.credits}</strong> crédit{user.credits !== 1 ? 's' : ''} restant{user.credits !== 1 ? 's' : ''}.</span>
          <Link to="/ewish-admin" className={styles.lowCreditsLink}>Recharger →</Link>
        </div>
      )} */}

      {/* ── Preview Modal ── */}
      {previewUrl && (
        <div className={styles.modalOverlay} onClick={() => setPreviewUrl(null)}>
          <div className={styles.previewModalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.previewModalHeader}>
              <span>Aperçu du template</span>
              <button onClick={() => setPreviewUrl(null)} className={styles.previewClose}><X size={20}/></button>
            </div>
            <iframe src={previewUrl} className={styles.previewIframe} title="Template preview" />
          </div>
        </div>
      )}

      {/* ── Dup modal ── */}
      {dupModal && (
        <div className={styles.modalOverlay} onClick={closeDupModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}><Copy size={32} color="var(--brand)" /></span>
              <h2>Dupliquer la publication</h2>
              <p>Template <strong>{dupModal.templateName}</strong> conservé avec toutes ses données.</p>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Titre</label>
              <input className={styles.modalInput} value={dupTitle} onChange={e => setDupTitle(e.target.value)} placeholder="ex: Anniversaire Sophie" autoFocus />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Nom dans l'URL</label>
              <div className={styles.modalSlugWrap}>
                <span className={styles.modalSlugPre}>/{dupModal.templateName}/</span>
                <input className={styles.modalSlugInput} value={dupSlug} onChange={e => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="mon-nom"/>
              </div>
            </div>
            {dupError && <p className={styles.modalError}>{dupError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={closeDupModal}>Annuler</button>
              <button className={styles.modalConfirm} onClick={handleDuplicate} disabled={dupLoading}>
                {dupLoading ? '⏳ Duplication…' : <><Copy size={16}/> Dupliquer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR ── */}
      {qrModalPub?.shortCode && (
        <QRCodeModal url={`${VITE_API}/s/${qrModalPub.shortCode}`} onClose={() => setQrModalPub(null)} />
      )}

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.btnAdmin} onClick={() => navigate('/ewish-admin')} title="Admin"><ArrowLeft size={20}/></button>
          <div className={styles.logo}>
            <span className={styles.logoIcon}><Gift size={22} color="var(--brand)"/></span>
            <span className={styles.logoText}>myKado</span>
          </div>
          {/* {LOW_CREDITS && (
            <span className={styles.lowCreditsChip} title={`${user.credits} crédit(s) restant(s)`}>
              <AlertTriangle size={12}/> {user.credits}
            </span>
          )} */}
          {/* <strong>{user.credits}</strong> crédit{user.credits !== 1 ? 's' : ''} restant{user.credits !== 1 ? 's' : ''}. */}
        </div>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
          <button className={styles.btnGhost} onClick={() => setShowTuto(true)} title="Tuto"><MonitorPlay size={16}/> Tuto</button>
          {/* <button className={styles.btnGhost} onClick={logout} title="Déconnexion" style={{color:'var(--red)'}}>
          Quitter</button> */}
          <Link to="/ewish-admin/ewish/new" className={styles.btnPrimary}><Plus size={16}/></Link>
        </div>
      </header>

      {/* ── Tutorial Modal ── */}
      {showTuto && (
        <div className={styles.modalOverlay} onClick={() => setShowTuto(false)}>
          <div className={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Comment ça marche ?</h3>
              <button className={styles.closeBtn} onClick={() => setShowTuto(false)}><X size={20}/></button>
            </div>
            <div className={styles.videoWrap}>
              <iframe 
                width="100%" 
                height="450" 
                src="https://www.youtube.com/embed/S_8qK2yMIdo" 
                title="Tutorial Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}



      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {[
          { key:'templates', label:'Templates',      icon:<Layout size={18} /> },
          { key:'mine',      label:'Mes Sites', icon:<Folder size={18} /> },
          { key:'premade',   label:'Modèles',        icon:<StarIcon size={18} /> },
        ].map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => { handleTabChange(t.key); }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                {activeTab==='mine'&&'Mes Sites'}
                {activeTab==='templates'&&'Choisissez un template'}
                {activeTab==='premade'&&'Modèles'}
              </h2>
              <p className={styles.tabDescription}>
                {activeTab==='templates' && "Sélectionnez un design de base pour commencer votre création personnalisée."}
                {activeTab==='mine'      && "Gérez vos sites créés, modifiez-les ou suivez leurs performances."}
                {activeTab==='premade'   && "Gagnez du temps avec des créations déjà prêtes à l'emploi. Dupliquez et personnalisez en un clic !"}
              </p>
            </div>
            <span className={styles.badge}>
              {activeTab==='templates' ? filteredTemplates.length : pubs.length}{hasNext?'+':''}
            </span>
          </div>

          {/* Search */}
          {activeTab !== 'templates' ? (
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}><Search size={18} color="var(--text-3)"/></span>
              <input className={styles.searchInput} type="text" placeholder="Rechercher…" value={search} onChange={handleSearchChange}/>
              {search && <button className={styles.searchClear} onClick={() => { setSearch(''); setPage(1); fetchPubs(1,'',activeTab); }}><X size={16}/></button>}
            </div>
          ) : (
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}><Search size={18} color="var(--text-3)"/></span>
              <input className={styles.searchInput} type="text" placeholder="Rechercher un template…" value={templateSearch} onChange={e => setTemplateSearch(e.target.value)}/>
              {templateSearch && <button className={styles.searchClear} onClick={() => setTemplateSearch('')}><X size={16}/></button>}
            </div>
          )}

          {loading ? (
            <div className={styles.empty}><div className={styles.spinner}/></div>
          ) : activeTab === 'templates' ? (
            filteredTemplates.length === 0 ? (
              <div className={styles.empty}><p>Aucun template trouvé.</p></div>
            ) : (
              <div className={styles.cardGrid}>
                {filteredTemplates.map(tpl => (
                  <div key={tpl._id} className={styles.tplCard}>
                    <div 
                      className={styles.tplThumb} 
                      style={{
                        background: tpl.thumbnail ? `url(${tpl.thumbnail}) center/cover no-repeat` : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(135deg,#667eea,#764ba2)')
                      }}
                    >
                      {!tpl.thumbnail && (
                        <span className={styles.tplIcon}>{TEMPLATE_ICONS[tpl.name] || <Sparkles size={32} />}</span>
                      )}
                      <span className={styles.tplCreditBadge}>{tpl.creditsRequired} crédits</span>
                    </div>
                    <div className={styles.tplBody}>
                      <h3 className={styles.tplName}>{tpl.label}</h3>
                      <p className={styles.tplDesc}>{tpl.description}</p>
                    </div>
                    <div className={styles.tplActions}>
                      <button className={styles.tplBtnGhost} onClick={() => openPreview(`${VITE_API}/preview/${tpl.name}`)}>
                        <Eye size={14}/> Aperçu
                      </button>
                      <button className={styles.tplBtnPrimary} onClick={() => handleCreateFromTemplate(tpl.name)}>
                        <Plus size={14}/> Créer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : pubs.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}><Sparkles size={48} color="var(--brand)" strokeWidth={1}/></span>
              <p>{activeTab==='mine' ? 'Aucune publication — commencez !' : 'Aucun préfait trouvé.'}</p>
              {activeTab==='mine' && <Link to="/ewish-admin/ewish/new" className={styles.btnPrimary}><Plus size={16}/> Créer un vœu</Link>}
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {pubs.map(pub => (
                  <div
                    key={pub._id}
                    className={`${styles.pubCard} ${pub.isPremade ? styles.pubCardPremade : ''}`}
                    onClick={() => !pub.isPremade && navigate(`/ewish-admin/ewish/edit/${pub._id}`)}
                  >
                    {(() => {
                      const tpl = templates.find(t => t.name === pub.templateName);
                      return (
                        <div 
                          className={styles.pubThumb} 
                          style={{
                            background: tpl?.thumbnail ? `url(${tpl.thumbnail}) center/cover no-repeat` : (TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#667eea,#764ba2)')
                          }}
                        >
                          {!tpl?.thumbnail && (
                            <span className={styles.tplIcon}>{TEMPLATE_ICONS[pub.templateName] || <Sparkles size={32} />}</span>
                          )}
                          {pub.published && <span className={styles.liveBadge}>Live</span>}
                          {pub.isPremade && <span className={styles.premadeBadge}>MODÈLE</span>}
                        </div>
                      );
                    })()}
                  <div className={styles.pubBody}>
                    <h3>{pub.title || pub.data?.name || 'Sans titre'}</h3>
                    <p className={styles.pubMeta}>{pub.shortCode ? `/s/${pub.shortCode}` : `/${pub.templateName}/${pub.customName}`}</p>
                    <p className={styles.pubDate}>{new Date(pub.updatedAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                  <div className={styles.pubActions} onClick={e => e.stopPropagation()}>
                    {/* Preview button for premade */}
                    {pub.isPremade && pub.published && (
                      <button className={styles.btnIcon} title="Aperçu" onClick={e => openPreview(`${VITE_API}/site/${pub.templateName}/${pub.customName}`, e)}>
                        <Eye size={15}/>
                      </button>
                    )}
                    {pub.published && !pub.isPremade && (
                      <a href={`${VITE_API}/site/${pub.templateName}/${pub.customName}`} target="_blank" rel="noreferrer" className={styles.btnIcon} onClick={e => e.stopPropagation()} title="Voir en ligne">
                        <ExternalLink size={15}/>
                      </a>
                    )}
                    {pub.published && pub.shortCode && (
                      <button className={styles.btnIcon} title="QR Code" onClick={e => { e.stopPropagation(); setQrModalPub(pub); }}>
                        <QrCode size={15}/>
                      </button>
                    )}
                    {user?.role === 'super_admin' && (
                      <button 
                        className={styles.btnIcon} 
                        title={pub.isPremade ? "Retirer des modèles" : "Marquer comme modèle"} 
                        onClick={e => handleTogglePremade(pub._id, !pub.isPremade, e)}
                      >
                        <Star size={15} fill={pub.isPremade ? "var(--brand)" : "none"} color={pub.isPremade ? "var(--brand)" : "currentColor"} />
                      </button>
                    )}
                    {/* Duplicate is available for everyone (also for premade = creates from template) */}
                    <button className={`${styles.btnIcon} ${pub.isPremade ? styles.btnIconGold : ''}`} title={pub.isPremade ? 'Utiliser ce modèle' : 'Dupliquer'} onClick={e => openDupModal(pub, e)}>
                      <Copy size={15}/>
                    </button>
                    {!pub.isPremade && (pub.merchantId === user?.merchantId || isSuperAdmin) && (
                      <button className={styles.btnIcon} title="Éditer" onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>
                        <Edit2 size={15}/>
                      </button>
                    )}
                    {pub.published && (pub.merchantId === user?.merchantId || isSuperAdmin) && !pub.isPremade && (
                      <button className={styles.btnIcon} title="Dépublier" onClick={e => handleUnpublish(pub._id, e)}>
                        <CircleOff size={15} color="var(--red)"/>
                      </button>
                    )}
                    {(pub.merchantId === user?.merchantId || isSuperAdmin) && !pub.isPremade && (
                      <button className={`${styles.btnIcon} ${styles.btnDanger}`} title="Supprimer" onClick={e => handleDelete(pub._id, e)}>
                        <Trash2 size={15}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {activeTab !== 'templates' && (page > 1 || hasNext) && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page === 1 || loading} onClick={() => { setPage(p=>p-1); fetchPubs(page-1, search); }}>← Précédente</button>
              <span className={styles.pageInfo}>Page {page}</span>
              <button className={styles.pageBtn} disabled={!hasNext || loading} onClick={() => { setPage(p=>p+1); fetchPubs(page+1, search); }}>Suivante →</button>
            </div>
          )}
        </section>

      {!false && <WhatsAppFAB />}
    </div>
  );
}