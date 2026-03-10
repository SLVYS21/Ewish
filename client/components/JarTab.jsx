import { useState } from 'react';
import s from './JarTab.module.css';

const DESIGNS = [
  {
    id: 'classic', label: 'Bocal Classique', emoji: '🫙', desc: 'Petits mots colorés à piocher',
    svg: <svg viewBox="0 0 80 96" fill="none">
      <rect x="17" y="5" width="46" height="14" rx="5" fill="#d4a843" opacity=".9"/>
      <path d="M12 22 Q10 26 10 32 L10 84 Q10 91 18 91 L62 91 Q70 91 70 84 L70 32 Q70 26 68 22 Z" fill="#fff8f0" stroke="#f0d9b0" strokeWidth="1.5"/>
      <path d="M18 32 Q16 50 16 64" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round"/>
      <rect x="22" y="66" width="24" height="9" rx="3" fill="#ffd6e0" opacity=".9"/>
      <rect x="36" y="71" width="20" height="8" rx="3" fill="#d0e8ff" opacity=".9"/>
      <rect x="24" y="75" width="18" height="7" rx="3" fill="#d4f1c8" opacity=".9"/>
      <rect x="40" y="63" width="18" height="7" rx="3" fill="#fff3cd" opacity=".9"/>
      <rect x="21" y="57" width="16" height="7" rx="3" fill="#f3d9ff" opacity=".9"/>
      <rect x="18" y="38" width="44" height="14" rx="4" fill="rgba(255,200,150,.18)" stroke="#f0d0a0" strokeWidth="1"/>
      <text x="40" y="48" textAnchor="middle" fontFamily="Georgia,serif" fontSize="6" fill="#c8860a" fontStyle="italic">mots doux</text>
    </svg>,
  },
  {
    id: 'readmewhen', label: 'Lis-moi quand…', emoji: '💌', desc: 'Par humeur : triste, heureuse…',
    svg: <svg viewBox="0 0 80 96" fill="none">
      <rect x="17" y="5" width="46" height="14" rx="5" fill="#e91e8c" opacity=".85"/>
      <path d="M12 22 Q10 26 10 32 L10 84 Q10 91 18 91 L62 91 Q70 91 70 84 L70 32 Q70 26 68 22 Z" fill="#fff0f5" stroke="#f0c0d0" strokeWidth="1.5"/>
      <text x="30" y="52" fontSize="10" fill="#e91e8c" opacity=".7">♥</text>
      <text x="44" y="48" fontSize="12" fill="#e91e8c" opacity=".8">♥</text>
      <text x="55" y="58" fontSize="9"  fill="#e91e8c" opacity=".65">♥</text>
      <text x="24" y="62" fontSize="8"  fill="#e91e8c" opacity=".6">♥</text>
      <text x="38" y="66" fontSize="11" fill="#e91e8c" opacity=".75">♥</text>
      <text x="52" y="70" fontSize="8"  fill="#e91e8c" opacity=".6">♥</text>
      <text x="28" y="76" fontSize="9"  fill="#e91e8c" opacity=".65">♥</text>
      <text x="46" y="80" fontSize="10" fill="#e91e8c" opacity=".7">♥</text>
      <rect x="14" y="34" width="52" height="11" rx="4" fill="#ffd6e0"/>
      <text x="40" y="42" textAnchor="middle" fontFamily="sans-serif" fontSize="5.5" fill="#c2185b" fontWeight="700">Lis-moi quand…</text>
    </svg>,
  },
  {
    id: 'scroll', label: 'Vase des parchemins', emoji: '📜', desc: 'Rouleaux élégants, style luxe',
    svg: <svg viewBox="0 0 80 96" fill="none">
      <path d="M26 24 Q19 32 17 42 L15 82 Q15 90 23 90 L57 90 Q65 90 63 82 L61 42 Q59 32 52 24 Z" fill="#fdf6e3" stroke="#d4a843" strokeWidth="1.5"/>
      <ellipse cx="39" cy="24" rx="13" ry="5" fill="#e8c060" stroke="#d4a843" strokeWidth="1"/>
      <rect x="15" y="56" width="48" height="2.5" fill="#d4a843" opacity=".35"/>
      <rect x="32" y="10" width="7" height="20" rx="3" fill="#f5e6c8" stroke="#d4a843" strokeWidth="1" transform="rotate(-12 35 20)"/>
      <rect x="39" y="7"  width="7" height="23" rx="3" fill="#f5e6c8" stroke="#d4a843" strokeWidth="1"/>
      <rect x="46" y="10" width="7" height="18" rx="3" fill="#f5e6c8" stroke="#d4a843" strokeWidth="1" transform="rotate(10 50 19)"/>
      <rect x="25" y="12" width="6" height="17" rx="3" fill="#f5e6c8" stroke="#d4a843" strokeWidth="1" transform="rotate(-20 28 20)"/>
    </svg>,
  },
];

const DEFAULT_WORDS = {
  birthday: [
    "Tu mérites tout le bonheur du monde 🎂",
    "Une nouvelle année pleine de magie t'attend ✨",
    "Tu vieillis en beauté — comme du bon vin 🍷",
    "Que tous tes rêves deviennent réels 🌟",
    "Tu rends la vie de ceux qui t'entourent plus belle 💛",
    "Continue d'être exactement toi — c'est parfait 🌸",
  ],
  special: [
    "Tu es une force tranquille qui inspire 🌿",
    "Chaque jour avec toi est un cadeau 🎁",
    "Ta présence est un bonheur rare ✨",
    "Je suis tellement fier(e) de toi 🌟",
    "Tu mérites tout ce que la vie a de beau 🌺",
    "Merci d'exister exactement comme tu es 🙏",
  ],
};

const DEFAULT_CATS = [
  { id:'sad',    label:"Quand tu te sens triste",    color:'#4e9eff', bg:'#d0e8ff', words:["Tu n'es pas seul(e) 💙","Cette douleur est temporaire 🌊","Je suis là pour toi 🤝"] },
  { id:'happy',  label:"Quand tu es heureuse",       color:'#f0a030', bg:'#fff3cd', words:["Continue de briller ☀️","Tu mérites cette joie 🌻","Ta joie me rend heureux aussi 🎉"] },
  { id:'faith',  label:"Quand tu as besoin de foi",  color:'#3ecf8e', bg:'#d4f1c8', words:["Tu es plus forte que tu ne le crois 💪","Dieu a un plan pour toi 🙏","Tiens bon — ça va aller 🌟"] },
  { id:'lonely', label:"Quand tu te sens seul(e)",   color:'#c8963e', bg:'#f5e9c8', words:["Tu comptes tellement pour moi 💛","Je pense à toi souvent 🌸"] },
  { id:'doubt',  label:"Quand tu doutes de toi",     color:'#a78bfa', bg:'#f3d9ff', words:["Tu es capable de grandes choses ✨","Je crois en toi, même quand tu n'y crois pas 🌙"] },
];

export default function JarTab({ jarConfig: jarConfigProp, onChange, templateName }) {
  if (!onChange) return null;  // guard: editor not ready
  const cfg    = jarConfigProp ?? {};
  const design = cfg.design     || 'classic';
  const words  = cfg.words      || DEFAULT_WORDS[templateName] || DEFAULT_WORDS.birthday;
  const cats   = cfg.categories || DEFAULT_CATS;

  const [newWord,    setNewWord]   = useState('');
  const [editIdx,    setEditIdx]   = useState(null);
  const [editVal,    setEditVal]   = useState('');
  const [openCatId,  setOpenCatId] = useState(null);
  const [newCatWord, setNewCatWord]= useState('');

  const save = (patch) => onChange({ ...cfg, ...patch });

  // Classic/scroll words
  const addWord    = () => { const v=newWord.trim(); if(!v) return; save({words:[...words,v]}); setNewWord(''); };
  const removeWord = (i) => save({words:words.filter((_,j)=>j!==i)});
  const startEdit  = (i) => { setEditIdx(i); setEditVal(words[i]); };
  const commitEdit = () => { if(!editVal.trim()) return; const n=[...words]; n[editIdx]=editVal.trim(); save({words:n}); setEditIdx(null); };
  const moveWord   = (i,d) => { const n=[...words]; const j=i+d; if(j<0||j>=n.length) return; [n[i],n[j]]=[n[j],n[i]]; save({words:n}); };

  // Category words
  const updateCatLabel  = (id,v)    => save({categories:cats.map(c=>c.id===id?{...c,label:v}:c)});
  const addCatWord      = (id)      => { if(!newCatWord.trim()) return; save({categories:cats.map(c=>c.id===id?{...c,words:[...c.words,newCatWord.trim()]}:c)}); setNewCatWord(''); };
  const removeCatWord   = (id,wi)   => save({categories:cats.map(c=>c.id===id?{...c,words:c.words.filter((_,j)=>j!==wi)}:c)});
  const updateCatWord   = (id,wi,v) => save({categories:cats.map(c=>c.id===id?{...c,words:c.words.map((w,j)=>j===wi?v:w)}:c)});

  return (
    <div className={s.root}>

      {/* Design picker */}
      <div className={s.section}>
        <div className={s.sectionTitle}>🎨 Design du bocal</div>
        <div className={s.designs}>
          {DESIGNS.map(d => (
            <button key={d.id} className={`${s.card} ${design===d.id?s.cardActive:''}`} onClick={()=>save({design:d.id})}>
              <div className={s.cardSvg}>{d.svg}</div>
              <div className={s.cardEmoji}>{d.emoji}</div>
              <div className={s.cardLabel}>{d.label}</div>
              <div className={s.cardDesc}>{d.desc}</div>
              {design===d.id && <div className={s.badge}>✓</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Words editor — classic + scroll */}
      {design !== 'readmewhen' && (
        <div className={s.section}>
          <div className={s.sectionTitle}>
            ✍️ Mots à piocher
            <span className={s.pill}>{words.length}</span>
          </div>
          <div className={s.wordList}>
            {words.map((w,i) => (
              <div key={i} className={s.wordRow}>
                {editIdx===i ? (
                  <>
                    <input className={s.editInput} value={editVal} autoFocus
                      onChange={e=>setEditVal(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter')commitEdit();if(e.key==='Escape')setEditIdx(null);}}/>
                    <button className={s.ib} onClick={commitEdit}>✓</button>
                    <button className={s.ib} onClick={()=>setEditIdx(null)}>✕</button>
                  </>
                ) : (
                  <>
                    <div className={s.reorder}>
                      <button className={s.ibTiny} onClick={()=>moveWord(i,-1)} disabled={i===0}>▲</button>
                      <button className={s.ibTiny} onClick={()=>moveWord(i,1)}  disabled={i===words.length-1}>▼</button>
                    </div>
                    <span className={s.wordText}>{w}</span>
                    <button className={s.ib} onClick={()=>startEdit(i)}>✏️</button>
                    <button className={`${s.ib} ${s.ibDanger}`} onClick={()=>removeWord(i)}>🗑</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className={s.addRow}>
            <input className={s.addInput} value={newWord} onChange={e=>setNewWord(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addWord()} placeholder="Nouveau mot doux… (Entrée pour ajouter)"/>
            <button className={s.addBtn} onClick={addWord} disabled={!newWord.trim()}>+</button>
          </div>
          <button className={s.resetLink} onClick={()=>save({words:DEFAULT_WORDS[templateName]||DEFAULT_WORDS.birthday})}>
            ↺ Remettre les mots par défaut
          </button>
        </div>
      )}

      {/* Categories editor — readmewhen */}
      {design === 'readmewhen' && (
        <div className={s.section}>
          <div className={s.sectionTitle}>💌 Catégories & messages</div>
          <div className={s.catList}>
            {cats.map(cat => (
              <div key={cat.id} className={s.catBlock} style={{borderLeftColor:cat.color}}>
                <div className={s.catHead} onClick={()=>setOpenCatId(openCatId===cat.id?null:cat.id)}>
                  <div className={s.catDot} style={{background:cat.color}}/>
                  <input className={s.catLabelInput} value={cat.label} style={{color:cat.color}}
                    onClick={e=>e.stopPropagation()} onChange={e=>updateCatLabel(cat.id,e.target.value)}/>
                  <span className={s.catCount}>{cat.words.length}</span>
                  <span className={s.chevron}>{openCatId===cat.id?'▲':'▼'}</span>
                </div>
                {openCatId===cat.id && (
                  <div className={s.catBody} style={{background:cat.bg}}>
                    {cat.words.map((w,wi) => (
                      <div key={wi} className={s.catWordRow}>
                        <input className={s.catWordInput} value={w}
                          style={{borderColor:cat.color+'55'}}
                          onChange={e=>updateCatWord(cat.id,wi,e.target.value)}/>
                        <button className={`${s.ib} ${s.ibDanger}`} onClick={()=>removeCatWord(cat.id,wi)}>✕</button>
                      </div>
                    ))}
                    <div className={s.addRow} style={{marginTop:8}}>
                      <input className={s.addInput} value={newCatWord} onChange={e=>setNewCatWord(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&addCatWord(cat.id)} placeholder="Ajouter un message…"
                        style={{borderColor:cat.color+'66'}}/>
                      <button className={s.addBtn} style={{background:cat.color}} onClick={()=>addCatWord(cat.id)} disabled={!newCatWord.trim()}>+</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={s.hint}>
        💡 Le bocal apparaît à la fin de l'animation. Le destinataire peut piocher les messages, secouer le bocal et les relire à volonté.
      </div>
    </div>
  );
}