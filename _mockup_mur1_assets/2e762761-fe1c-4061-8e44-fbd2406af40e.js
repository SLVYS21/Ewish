/* ============================================================
   myKado · Recipient flow — intro, gift unwrap, reveal burst,
   story viewer, and the CLAIM (débloquer son cadeau) flow.
   ============================================================ */
const { useState: useStateR, useEffect: useEffectR, useRef: useRefR } = React;

/* ---------- falling cascade (balloons, confetti, gifts + paper bits) ---------- */
function Cascade({ run }) {
  if (!run) return null;
  const emojis = EVT.cascade;
  const bits = Array.from({ length: 30 });
  const papers = Array.from({ length: 40 });
  const colors = ['#E11D48','#8A63D2','#3FA98A','#E5A93B','#FF9F7A','#5B95E0'];
  return (
    <div className="cascade">
      {bits.map((_,i)=>{
        const [code,char] = emojis[i % emojis.length];
        const left = (i*3.4 + (i%3)*6) % 97;
        const dur = 4.5 + (i%5)*0.9;
        const size = 30 + (i%4)*12;
        return <span key={'e'+i} style={{ left:left+'%', '--r':((i%2?1:-1)*40)+'deg', animation:`fall ${dur}s linear ${(i%6)*0.35}s infinite` }}>
          <Anim code={code} char={char} size={size} />
        </span>;
      })}
      {papers.map((_,i)=>{
        const left = (i*2.6 + (i%4)*5) % 98;
        const dur = 3.8 + (i%6)*0.7;
        return <span key={'p'+i} className="confetti-bit" style={{ left:left+'%', background: colors[i%colors.length], animation:`fall2 ${dur}s linear ${(i%8)*0.25}s infinite` }}/>;
      })}
    </div>
  );
}

/* ---------- count-up helper ---------- */
function useCountUp(target, ms = 1400, run = true) {
  const [v, setV] = useStateR(0);
  useEffectR(() => {
    if (!run) { setV(target); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

/* ---------- intro animation (cinematic) ---------- */
function Intro({ onDone }) {
  useEffectR(() => { const t = setTimeout(onDone, 4200); return () => clearTimeout(t); }, []);
  return (
    <div className="intro">
      <span className="glow" style={{ width:'46vmin', height:'46vmin', top:'8%', left:'-8%', background:'#9B7EE2' }}/>
      <span className="glow" style={{ width:'50vmin', height:'50vmin', bottom:'6%', right:'-10%', background:'#E11D48' }}/>
      <span className="glow" style={{ width:'34vmin', height:'34vmin', top:'40%', left:'55%', background:'#3FA98A', opacity:.35 }}/>
      <button className="skip" onClick={onDone}>Passer l’intro {Icon.forward({ size:14, stroke:'currentColor' })}</button>
      <div className="intro-inner">
        <div className="brand">myKado</div>
        <Anim className="intro-anim" code={EVT.hero[0]} char={EVT.hero[1]} size={110} />
        <div className="big">Quelqu’un a préparé<br/>quelque chose <em>rien que pour toi</em></div>
        <div className="from">Un mur de vœux t’attend, {EVT.who}…</div>
      </div>
      <div className="prog"><i/></div>
    </div>
  );
}

/* ---------- the gift to unwrap (replaces flat envelope) ---------- */
function GiftUnwrap({ onOpen }) {
  const [popping, setPopping] = useStateR(false);
  const go = () => { if (popping) return; setPopping(true); setTimeout(onOpen, 720); };
  return (
    <div className={'gift-scene'+(popping?' pop':'')}>
      <span className="glow" style={{ width:'52vmin', height:'52vmin', top:'14%', left:'50%', transform:'translateX(-50%)', background:'#8A63D2' }}/>
      <span className="glow" style={{ width:'34vmin', height:'34vmin', bottom:'10%', left:'12%', background:'#E11D48', opacity:.4 }}/>
      <div className="brand" style={{ opacity:.7 }}>myKado</div>
      <button className="gift-box" onClick={go} aria-label="Déballer mon cadeau">
        <span className="gift-ring"/>
        <span className="gift-ring r2"/>
        <Anim className="gift-anim" code={EVT.gift ? EVT.gift[0] : '1f381'} char={EVT.gift ? EVT.gift[1] : '🎁'} size={200} />
        <span className="gift-spark s1">✨</span>
        <span className="gift-spark s2">✨</span>
      </button>
      <h3 className="gift-title">{EVT.who}, {SEED.length} proches ont<br/>préparé quelque chose pour toi</h3>
      <button className="open-btn" onClick={go}>{Icon.gift({ size:19, stroke:'#fff' })} Déballer mon cadeau</button>
      <div className="tap-hint">Touche le paquet pour l’ouvrir ✨</div>
    </div>
  );
}

/* ---------- reveal burst — plays over the wall right after unwrap ---------- */
function RevealBurst({ cag }) {
  const money = useCountUp(cag.collected, 1500);
  const msgs = useCountUp(SEED.length, 1100);
  return (
    <div className="burst">
      <div className="burst-inner">
        <Anim code={EVT.cheer[0]} char={EVT.cheer[1]} size={92} className="burst-anim" />
        <div className="burst-big">Surprise, {EVT.who} !</div>
        <div className="burst-stats">
          <div className="bs"><b>{msgs}</b><span>mots d’amour</span></div>
          <div className="bs-sep"/>
          <div className="bs"><b>{money.toLocaleString('fr-FR')}</b><span>FCFA réunis pour toi</span></div>
        </div>
        <div className="burst-hint">Fais défiler pour tout découvrir ↓</div>
      </div>
    </div>
  );
}

/* ---------- story viewer (WhatsApp-status / TikTok feed) ---------- */
function StoryViewer({ wishes, start, onClose }) {
  const [idx, setIdx] = useStateR(start || 0);
  const [key, setKey] = useStateR(0); // restart bar animation on manual nav
  const next = () => { if (idx < wishes.length-1) { setIdx(idx+1); setKey(k=>k+1); } else onClose(); };
  const prev = () => { if (idx > 0) { setIdx(idx-1); setKey(k=>k+1); } };

  useEffectR(() => {
    const onKey = (e) => { if (e.key==='ArrowRight') next(); else if (e.key==='ArrowLeft') prev(); else if (e.key==='Escape') onClose(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="story">
      <div className="story-bars">
        {wishes.map((_,i)=>(
          <i key={i} className={i<idx?'done':(i===idx?'active':'')}>
            <b key={i===idx?key:i} onAnimationEnd={i===idx?next:undefined}/>
          </i>
        ))}
      </div>
      <div className="story-count">{idx+1} / {wishes.length}</div>
      <button className="story-x" onClick={onClose}>{Icon.x({ size:20, stroke:'#fff' })}</button>

      {/* desktop nav arrows */}
      <button className="story-arrow left" onClick={prev} disabled={idx===0}>{Icon.chevR({ size:26, stroke:'#fff' })}</button>
      <button className="story-arrow right" onClick={next}>{Icon.chevR({ size:26, stroke:'#fff' })}</button>

      <div className="story-track" style={{ transform:`translateX(-${idx*100}%)` }}>
        {wishes.map((w,i)=>{
          const t = TONE(w.tone);
          return (
            <div className="story-slide" key={i}>
              <div className="bgblur" style={{ background: t.dot }}/>
              {Math.abs(i-idx)<=1 && (
                <div className="story-card" style={{ background: t.bg }}>
                  <div className="who">
                    <span className="av" style={{ background:t.dot }}>{initials(w.name)}</span>
                    <div><b style={{ color:t.ink }}>{w.name}</b><div className="rel">a laissé un mot pour {EVT.who}</div></div>
                  </div>
                  <div className="big-tx">{w.tx}</div>
                  {w.media && w.media.type==='photo' && <div className="s-media s-photo" style={{ background: PHOTOS[w.media.g] }}>📷</div>}
                  {w.media && w.media.type==='gif' && <div className="s-gif"><Anim code={w.media.code} char={w.media.char} size={120} /></div>}
                  {w.media && w.media.type==='audio' && <div className="s-audio"><span className="pb">{Icon.play({ size:17, stroke:'#fff', fill:'#fff' })}</span><div className="wave">{Array.from({length:26}).map((_,k)=><i key={k} style={{ background:t.dot, opacity:.55 }}/>)}</div><span style={{ fontSize:12, fontWeight:800, color:t.ink }}>{w.media.dur}</span></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="tap-l" onClick={prev}/>
      <div className="tap-r" onClick={next}/>
      <div className="story-hint">Touche à droite pour le mot suivant · ✕ pour revenir au mur</div>
    </div>
  );
}

/* ============================================================
   CLAIM FLOW — le/la destinataire débloque son cadeau (argent + mur)
   en créant son compte. Trois temps : hero → inscription → succès.
   ============================================================ */
const MOMO = [
  { id:'wave',   label:'Wave',         c:'#1DC8FF' },
  { id:'orange', label:'Orange Money', c:'#FF6B00' },
  { id:'mtn',    label:'MTN MoMo',     c:'#FFCC00' },
  { id:'moov',   label:'Moov Money',   c:'#0070C0' },
];
function ClaimFlow({ cag, onClose, onClaimed }) {
  const [step, setStep] = useStateR('hero'); // hero | form | done
  const [name, setName] = useStateR('');
  const [phone, setPhone] = useStateR('');
  const [op, setOp] = useStateR('wave');
  const money = useCountUp(cag.collected, 1300, step==='hero');
  const canSubmit = name.trim().length > 0 && phone.replace(/\D/g,'').length >= 8;

  return (
    <div className="claim">
      <div className="claim-dim" onClick={step!=='done' ? onClose : undefined}/>

      {step === 'hero' && (
        <div className="claim-panel hero">
          <button className="claim-x" onClick={onClose}>{Icon.x({ size:18, stroke:'currentColor' })}</button>
          <span className="claim-glow g1"/><span className="claim-glow g2"/>
          <Anim className="claim-hero-anim" code={cag.emoji[0]} char={cag.emoji[1]} size={92} />
          <div className="claim-kicker">Ton cadeau t’attend, {EVT.who}</div>
          <div className="claim-amount">{money.toLocaleString('fr-FR')} <small>FCFA</small></div>
          <p className="claim-sub">Tes proches ont réuni cette somme pour <b>« {cag.name} »</b>, en plus de {SEED.length} messages. Crée ton compte myKado pour recevoir tes fonds et garder ton mur pour toujours.</p>
          <button className="btn-pri claim-cta" onClick={()=>setStep('form')}>{Icon.gift({ size:18, stroke:'#fff' })} Réclamer mon cadeau</button>
          <div className="claim-reassure">{Icon.lock({ size:13, stroke:'currentColor' })} Gratuit · sécurisé · aucun engagement</div>
        </div>
      )}

      {step === 'form' && (
        <div className="claim-panel form">
          <button className="claim-back" onClick={()=>setStep('hero')}>{Icon.arrowL({ size:16, stroke:'currentColor' })}</button>
          <button className="claim-x" onClick={onClose}>{Icon.x({ size:18, stroke:'currentColor' })}</button>
          <div className="claim-steps"><i className="on"/><i className="on"/><i/></div>
          <h3 className="claim-h">Où envoyer tes <b>{fcfa(cag.collected)}</b> ?</h3>
          <p className="claim-p">On crée ton compte et on t’envoie les fonds sur ton Mobile Money.</p>

          <div className="field-lbl">Ton prénom</div>
          <input className="txt-in" style={{ height:48 }} placeholder="Ex. Sarah" value={name} onChange={e=>setName(e.target.value)} autoFocus/>

          <div className="field-lbl">Ton numéro Mobile Money</div>
          <input className="txt-in" style={{ height:48 }} inputMode="tel" placeholder="Ex. 07 00 00 00 00" value={phone} onChange={e=>setPhone(e.target.value)} />

          <div className="field-lbl">Opérateur</div>
          <div className="momo-row">
            {MOMO.map(m => (
              <button key={m.id} className={'momo'+(m.id===op?' on':'')} onClick={()=>setOp(m.id)} style={{ '--mc': m.c }}>
                <span className="momo-dot" style={{ background:m.c }}/>{m.label}
              </button>
            ))}
          </div>

          <button className="btn-pri" disabled={!canSubmit} onClick={()=>{ setStep('done'); onClaimed && onClaimed(); }}>
            {Icon.lock({ size:17, stroke:'#fff' })} Recevoir mes {fcfa(cag.collected)}
          </button>
          <p className="claim-fine">En continuant, tu crées ton compte myKado. Transfert traité sous 24 h.</p>
        </div>
      )}

      {step === 'done' && (
        <div className="claim-panel done">
          <Cascade run={true} />
          <Anim className="claim-hero-anim" code={EVT.cheer[0]} char={EVT.cheer[1]} size={104} />
          <h3 className="claim-done-h">Cadeau débloqué !</h3>
          <p className="claim-p" style={{ maxWidth:340 }}>Bienvenue sur myKado, {name || EVT.who}. Tes <b>{fcfa(cag.collected)}</b> arrivent sur ton {MOMO.find(m=>m.id===op).label}. Ton mur de vœux est désormais à toi, pour toujours 💜</p>
          <div className="claim-done-card">
            <div className="cd-row"><span>{SEED.length} messages sauvegardés</span>{Icon.check({ size:16, stroke:'var(--mk-mint)' })}</div>
            <div className="cd-row"><span>{fcfa(cag.collected)} en route</span>{Icon.check({ size:16, stroke:'var(--mk-mint)' })}</div>
            <div className="cd-row"><span>Compte myKado créé</span>{Icon.check({ size:16, stroke:'var(--mk-mint)' })}</div>
          </div>
          <button className="btn-pri" onClick={onClose}>{Icon.heart({ size:17, stroke:'#fff', fill:'#fff' })} Revoir mon mur</button>
          <button className="btn-ghost" onClick={onClose}>{Icon.sparkle({ size:16, stroke:'var(--mk-ink)' })} Créer un mur pour un proche</button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Cascade, useCountUp, Intro, GiftUnwrap, RevealBurst, StoryViewer, ClaimFlow });
