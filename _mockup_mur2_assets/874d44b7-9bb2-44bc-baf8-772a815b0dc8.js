/* ============================================================
   myKado · Contributor flow — composer, GIF bank, thank-you, cagnotte
   ============================================================ */
const { useState } = React;

/* ---------- GIF picker overlay ---------- */
function GifPicker({ onPick, onClose }) {
  const cats = Object.keys(GIF_BANK);
  const [cat, setCat] = useState(cats[0]);
  const [q, setQ] = useState('');
  const all = Object.values(GIF_BANK).flat();
  const list = q.trim()
    ? all.filter(([c,ch]) => (EMOJI_NAME[c]||'').includes(q.toLowerCase()))
    : GIF_BANK[cat];
  return (
    <div className="ov">
      <div className="ov-dim" onClick={onClose}/>
      <div className="sheet" style={{ height:'82%' }}>
        <div className="grab"/>
        <div className="sheet-h">
          <div className="t">Ajouter un GIF</div>
          <button className="icon-btn" onClick={onClose}>{Icon.x({ size:18 })}</button>
        </div>
        <div className="sheet-body">
          <div className="search-in">
            {Icon.search({ size:17, stroke:'var(--mk-ink-3)' })}
            <input placeholder="Chercher un GIF en ligne…" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          {!q && (
            <div className="gif-tabs m-noscroll">
              {cats.map(c => <button key={c} className={'gif-tab'+(c===cat?' on':'')} onClick={()=>setCat(c)}>{c}</button>)}
            </div>
          )}
          {q && <div className="field-lbl">Résultats pour « {q} »</div>}
          <div className="gif-grid">
            {(list.length?list:all).map(([code,char]) => (
              <button key={code} className="gif-cell" onClick={()=>onPick({ type:'gif', code, char })}>
                <Anim code={code} char={char} size={52} />
              </button>
            ))}
          </div>
          <p style={{ fontSize:11.5, color:'var(--mk-ink-3)', textAlign:'center', marginTop:14, fontWeight:600 }}>
            Animations propulsées par Noto Emoji · recherche web activée
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Composer sheet ---------- */
function Composer({ onPublish, onClose }) {
  const [tx, setTx] = useState('');
  const [name, setName] = useState('');
  const [tone, setTone] = useState('lilac');
  const [media, setMedia] = useState(null);
  const [gif, setGif] = useState(false);
  const [rec, setRec] = useState(false);
  const t = TONE(tone);

  const toggleMedia = (kind) => {
    if (kind==='gif') { setGif(true); return; }
    if (kind==='photo') { setMedia(m => m&&m.type==='photo' ? null : { type:'photo', g: Math.floor(Math.random()*PHOTOS.length) }); return; }
    if (kind==='audio') {
      if (media && media.type==='audio') { setMedia(null); setRec(false); return; }
      setRec(true);
    }
  };
  const stopRec = () => { setRec(false); setMedia({ type:'audio', dur:'0:09' }); };

  const canPost = tx.trim().length > 1 && name.trim().length > 0;

  return (
    <div className="ov">
      <div className="ov-dim" onClick={onClose}/>
      <div className="sheet" style={{ height:'94%' }}>
        <div className="grab"/>
        <div className="sheet-h">
          <div className="t">Laisser un mot</div>
          <button className="icon-btn" onClick={onClose}>{Icon.x({ size:18 })}</button>
        </div>
        <div className="sheet-body">
          <div className="field-lbl">Ton message</div>
          <textarea className="txt-in" rows={3} placeholder={`Un mot doux pour ${EVT.who}…`} value={tx} onChange={e=>setTx(e.target.value)} autoFocus/>

          <div className="field-lbl">Ton prénom</div>
          <input className="txt-in" style={{ height:46 }} placeholder="Ex. Aïcha" value={name} onChange={e=>setName(e.target.value)} />

          <div className="field-lbl">Couleur de ta carte</div>
          <div className="tones">
            {TONES.map(tt => (
              <button key={tt.id} className={'tone-sw'+(tt.id===tone?' on':'')} style={{ background: tt.bg }} onClick={()=>setTone(tt.id)} aria-label={tt.id}>
                <span style={{ position:'absolute', inset:9, borderRadius:'50%', background: tt.dot }}/>
              </button>
            ))}
          </div>

          <div className="field-lbl">Ajoute un média</div>
          <div className="media-row">
            <button className={'media-btn'+(media&&media.type==='photo'?' on':'')} onClick={()=>toggleMedia('photo')}>{Icon.image({ size:20 })} Image</button>
            <button className={'media-btn'+((media&&media.type==='audio')||rec?' on':'')} onClick={()=>toggleMedia('audio')}>{Icon.mic({ size:20 })} Vocal</button>
            <button className={'media-btn'+(media&&media.type==='gif'?' on':'')} onClick={()=>toggleMedia('gif')}>{Icon.smile({ size:20 })} GIF</button>
          </div>

          {rec && (
            <div className={'rec live'} style={{ marginTop:11 }}>
              <span className="dot">{Icon.mic({ size:18, stroke:'#fff' })}</span>
              <div className="wave">{Array.from({length:22}).map((_,i)=><i key={i} style={{ animationDelay:(i*0.05)+'s' }}/>)}</div>
              <button className="icon-btn" style={{ background:'var(--mk-rose)', color:'#fff' }} onClick={stopRec}>{Icon.check({ size:18, stroke:'#fff' })}</button>
            </div>
          )}

          {/* live preview */}
          <div className="preview-wrap">
            <div className="preview-lbl">Aperçu en direct</div>
            <div className="pv-card" style={{ background: t.bg }}>
              <div className="nm" style={{ color: t.ink }}><span className="av" style={{ background:t.dot }}>{name?initials(name):'?'}</span> {name||'Ton prénom'}</div>
              <div className="tx" style={{ color:'var(--mk-ink)' }}>{tx || <span style={{ opacity:.4 }}>Ton message apparaît ici…</span>}</div>
              {media && media.type==='photo' && <div className="pv-media pv-photo" style={{ background: PHOTOS[media.g] }}>📷</div>}
              {media && media.type==='gif' && <div className="pv-gif" style={{ marginTop:11 }}><Anim code={media.code} char={media.char} size={72} /></div>}
              {media && media.type==='audio' && <div className="s-audio" style={{ marginTop:11, background:'rgba(255,255,255,.6)' }}><span className="pb">{Icon.play({ size:16, stroke:'#fff', fill:'#fff' })}</span><div className="wave" style={{ height:26 }}>{Array.from({length:18}).map((_,i)=><i key={i} style={{ background:t.dot, opacity:.5 }}/>)}</div><span style={{ fontSize:12, fontWeight:800, color:t.ink }}>{media.dur}</span></div>}
            </div>
          </div>

          <button className="btn-pri" disabled={!canPost} onClick={()=>onPublish({ name:name.trim(), tone, tx:tx.trim(), media })}>
            {Icon.send({ size:18, stroke:'#fff' })} Publier mon mot
          </button>
        </div>
      </div>
      {gif && <GifPicker onPick={(m)=>{ setMedia(m); setGif(false); }} onClose={()=>setGif(false)} />}
    </div>
  );
}

/* ---------- Thank-you screen ---------- */
function ThankYou({ name, onParticipate, onShare, onCreate, onClose }) {
  return (
    <div className="thanks">
      <button className="skip" style={{ color:'var(--mk-ink-3)', background:'var(--mk-cream-2)' }} onClick={onClose}>{Icon.arrowL({ size:14, stroke:'currentColor' })} Retour au mur</button>
      <Anim className="hero-anim" code="1f973" char="🥳" size={116} />
      <h2>Merci {name} !</h2>
      <p>Ton mot est maintenant sur le mur de {EVT.who}. Ça va lui faire chaud au cœur 💜</p>
      <div className="choices">
        <button className="choice" onClick={onParticipate}>
          <span className="ic" style={{ background:'var(--mk-mur-bg)' }}><Anim code={CAGNOTTE.emoji[0]} char={CAGNOTTE.emoji[1]} size={40} /></span>
          <span className="ct"><b>Participer au kado</b><span>Cotise pour « {CAGNOTTE.name} »</span></span>
          {Icon.chevR({ size:20, stroke:'var(--mk-ink-4)' })}
        </button>
        <button className="choice" onClick={onShare}>
          <span className="ic" style={{ background:'#FFF4F6' }}>{Icon.share({ size:22, stroke:'var(--mk-rose)' })}</span>
          <span className="ct"><b>Partager le mur</b><span>Invite d’autres proches</span></span>
          {Icon.chevR({ size:20, stroke:'var(--mk-ink-4)' })}
        </button>
        <button className="choice" onClick={onCreate}>
          <span className="ic" style={{ background:'#E3F5EE' }}>{Icon.sparkle({ size:22, stroke:'var(--mk-mint)' })}</span>
          <span className="ct"><b>Créer mon propre mur</b><span>Gratuit pour commencer</span></span>
          {Icon.chevR({ size:20, stroke:'var(--mk-ink-4)' })}
        </button>
      </div>
    </div>
  );
}

/* ---------- Cagnotte contribute sheet ---------- */
const PRESETS = [1000, 2000, 5000, 10000, 15000, 25000];
function CagnotteSheet({ cag, onConfirm, onClose }) {
  const [amt, setAmt] = useState(5000);
  const [name, setName] = useState('');
  const pct = Math.min(100, Math.round(cag.collected / cag.goal * 100));
  return (
    <div className="ov">
      <div className="ov-dim" onClick={onClose}/>
      <div className="sheet">
        <div className="grab"/>
        <div className="sheet-h">
          <div className="t">Participer au kado</div>
          <button className="icon-btn" onClick={onClose}>{Icon.x({ size:18 })}</button>
        </div>
        <div className="sheet-body">
          <div className="cag" style={{ background:'var(--mk-cream)', padding:14 }}>
            <div className="top">
              <span className="ce" style={{ background:'#fff' }}><Anim code={cag.emoji[0]} char={cag.emoji[1]} size={40} /></span>
              <div className="cb">
                <div className="cr"><span className="cn">{cag.name}</span><span className="cp" style={{ color:'var(--mk-mur)' }}>{pct}%</span></div>
                <div className="bar" style={{ background:'var(--mk-mur-bg)' }}><div className="fill" style={{ width:pct+'%', background:'var(--mk-mur)' }}/></div>
                <div className="meta">{fcfa(cag.collected)} / {fcfa(cag.goal)}</div>
              </div>
            </div>
          </div>

          <div className="field-lbl">Ton montant</div>
          <div className="amounts">
            {PRESETS.map(p => <button key={p} className={'amount'+(p===amt?' on':'')} onClick={()=>setAmt(p)}>{p.toLocaleString('fr-FR')}<small>FCFA</small></button>)}
          </div>

          <div className="field-lbl">Ton prénom (optionnel)</div>
          <input className="txt-in" style={{ height:46 }} placeholder="Anonyme" value={name} onChange={e=>setName(e.target.value)} />

          <button className="btn-pri" onClick={()=>onConfirm(amt)}>{Icon.lock({ size:17, stroke:'#fff' })} Payer {fcfa(amt)}</button>
          <p style={{ fontSize:11.5, color:'var(--mk-ink-3)', textAlign:'center', marginTop:12, fontWeight:600 }}>
            Paiement sécurisé · Mobile Money, Wave, carte
          </p>
        </div>
      </div>
    </div>
  );
}

const EMOJI_NAME = {
  '1f382':'gateau anniversaire cake','1f389':'fete confetti party','1f388':'ballon balloon','1f381':'cadeau gift box',
  '1f973':'fete party visage','1f37e':'champagne bouteille','1f386':'feu artifice','1f38a':'confetti boule',
  '2764_fe0f':'coeur amour love','1f60d':'amour yeux coeur','1f490':'fleurs bouquet','1f48b':'bisou kiss',
  '1f339':'rose fleur','1f496':'coeur brillant','1f970':'sourire amour','1f495':'coeurs',
  '1f44f':'bravo applaudir clap','1f64c':'mains bravo','1f942':'sante trinquer','1f3c6':'trophee bravo',
  '1f31f':'etoile star','1f4aa':'force muscle','1f525':'feu fire','1f947':'medaille or',
  '1f57a':'danse homme','1f483':'danse femme','1f3b5':'musique note','1f37b':'biere sante',
  '1f938':'sport','1f3b8':'guitare','1f602':'rire mdr','1f923':'rire ptdr','1f60e':'cool lunettes',
  '1f929':'etoiles yeux','1f61c':'clin oeil langue','1f60a':'sourire','1f917':'calin hug','1f47b':'fantome',
};

Object.assign(window, { GifPicker, Composer, ThankYou, CagnotteSheet, EMOJI_NAME });
