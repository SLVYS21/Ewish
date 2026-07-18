/* ============================================================
   myKado · Wall board renderer (mosaic | pin) + header + cagnotte
   ============================================================ */

function Av({ name, tone }) {
  const t = TONE(tone);
  return <span className="av" style={{ background: t.dot }}>{initials(name)}</span>;
}

function MediaChip({ media, style }) {
  if (!media) return null;
  if (media.type === 'photo') return <span className="mchip" style={style}>{Icon.image({ size:12 })} Photo</span>;
  if (media.type === 'audio') return <span className="mchip" style={style}>{Icon.mic({ size:12 })} Vocal · {media.dur}</span>;
  if (media.type === 'gif') return <span className="mchip" style={style}><Anim code={media.code} char={media.char} size={15} /> GIF</span>;
  return null;
}

function Header({ variant, mode }) {
  const sub = mode === 'recipient'
    ? <>{SEED.length} proches ont laissé un mot rien que pour toi. Touche une carte pour la lire en grand 💜</>
    : <>{SEED.length} personnes ont déjà laissé un mot. Ajoute le tien 💜</>;
  return (
    <div className="wh">
      <div className="kicker">✦ {EVT.age} · {EVT.label.toLowerCase()}</div>
      <div className="ttl">{EVT.title}<br/><em>{EVT.who}</em></div>
      <div className="sub">{sub}</div>
    </div>
  );
}

/* Cagnotte block — role aware.
   contrib  → "Participer au kado" (cotiser à la cagnotte)
   recipient→ "Réclamer mon cadeau" (débloquer les fonds réunis) */
function Cagnotte({ cag, mode, onParticipate, onClaim }) {
  const pct = Math.min(100, Math.round(cag.collected / cag.goal * 100));
  if (mode === 'recipient') {
    return (
      <div className="cag cag-claim">
        <div className="top">
          <span className="ce"><Anim code={cag.emoji[0]} char={cag.emoji[1]} size={40} /></span>
          <div className="cb">
            <div className="cr"><span className="cn">Ton cadeau : {cag.name}</span></div>
            <div className="claim-line">Tes proches ont réuni <b>{fcfa(cag.collected)}</b></div>
            <div className="bar"><div className="fill" style={{ width: pct+'%' }}/></div>
            <div className="meta">{cag.count} participations · à débloquer</div>
          </div>
        </div>
        <button className="part" onClick={onClaim}>{Icon.gift({ size:17, stroke:'#fff' })} Réclamer mon cadeau</button>
      </div>
    );
  }
  return (
    <div className="cag">
      <div className="top">
        <span className="ce"><Anim code={cag.emoji[0]} char={cag.emoji[1]} size={40} /></span>
        <div className="cb">
          <div className="cr"><span className="cn">{cag.name}</span><span className="cp">{pct}%</span></div>
          <div className="bar"><div className="fill" style={{ width: pct+'%' }}/></div>
          <div className="meta">{fcfa(cag.collected)} récoltés · objectif {fcfa(cag.goal)} · {cag.count} participations</div>
        </div>
      </div>
      <button className="part" onClick={onParticipate}>{Icon.gift({ size:17, stroke:'#fff' })} Participer au kado</button>
    </div>
  );
}

/* Big claim block at the END of the recipient wall — the "grand écran final" */
function ClaimBlock({ cag, onClaim }) {
  const pct = Math.min(100, Math.round(cag.collected / cag.goal * 100));
  return (
    <div className="claim-block">
      <Anim code={cag.emoji[0]} char={cag.emoji[1]} size={70} className="cbk-anim" />
      <div className="cbk-kicker">Et ce n’est pas tout…</div>
      <div className="cbk-ttl">Tous ces mots sont pour toi.<br/><em>Ton cadeau aussi.</em></div>
      <div className="cbk-amount">{fcfa(cag.collected)}</div>
      <div className="cbk-sub">réunis par {cag.count} proches pour « {cag.name} »</div>
      <div className="cbk-bar"><div style={{ width: pct+'%' }}/></div>
      <button className="cbk-cta" onClick={onClaim}>{Icon.gift({ size:19, stroke:'#fff' })} Débloquer mon cadeau</button>
      <div className="cbk-fine">Crée ton compte pour recevoir tes fonds · garde ton mur pour toujours</div>
    </div>
  );
}

/* card media block inside a wall note */
function NoteMedia({ media, variant }) {
  if (!media) return null;
  if (media.type === 'photo') {
    if (variant === 'pin') return null; // handled by polaroid layout
    return <div className="photo" style={{ background: PHOTOS[media.g] }}>📷</div>;
  }
  if (media.type === 'gif') return <div className="gifwrap"><Anim code={media.code} char={media.char} size={variant==='pin'?62:70} /></div>;
  if (media.type === 'audio') return <div style={{ marginTop:8 }}><MediaChip media={media} style={{ background:'rgba(0,0,0,.06)', color:'inherit' }}/></div>;
  return null;
}

function WallBoard({ variant, mode, wishes, cag, onOpenWish, onParticipate, onClaim }) {
  const recipient = mode === 'recipient';
  if (variant === 'mosaic') {
    return (
      <div className="w-mosaic">
        <Header variant={variant} mode={mode} />
        <Cagnotte cag={cag} mode={mode} onParticipate={onParticipate} onClaim={onClaim} />
        <div className="grid">
          {wishes.map((w,i)=>(
            <div className={'note tone-'+w.tone} key={i} onClick={()=>onOpenWish(i)}>
              <div className="nm"><Av name={w.name} tone={w.tone}/> {w.name}</div>
              <div className="tx">{w.tx}</div>
              <NoteMedia media={w.media} variant={variant} />
            </div>
          ))}
        </div>
        {recipient && <ClaimBlock cag={cag} onClaim={onClaim} />}
      </div>
    );
  }

  /* pin board */
  const stickies = ['sticky','sticky s2','sticky s3','sticky s4'];
  let si = 0;
  return (
    <div className="w-pin">
      <Header variant={variant} mode={mode} />
      <Cagnotte cag={cag} mode={mode} onParticipate={onParticipate} onClaim={onClaim} />
      <div className="board">
        {wishes.map((w,i)=>{
          const rot = (i%2?1:-1)*(1.2+i%3);
          if (w.media && w.media.type==='photo') return (
            <div className={'pin polaroid'+(i%2?' tape-l':'')} key={i} style={{ transform:`rotate(${rot}deg)` }} onClick={()=>onOpenWish(i)}>
              <div className="ph" style={{ background: PHOTOS[w.media.g] }}>📸</div>
              <div className="cap">{w.tx}</div>
              <div className="nm" style={{ textAlign:'center', color:'#8A6A2A' }}>— {w.name}</div>
            </div>
          );
          const cls = stickies[si++ % stickies.length];
          return (
            <div className={'pin '+cls+(i%2?' tape-l':'')} key={i} style={{ transform:`rotate(${rot}deg)` }} onClick={()=>onOpenWish(i)}>
              <div className="nm">{w.name}</div>
              <div className="tx">{w.tx}</div>
              {w.media && w.media.type==='gif' && <div className="gifwrap"><Anim code={w.media.code} char={w.media.char} size={62} /></div>}
              {w.media && w.media.type==='audio' && <div style={{ marginTop:6 }}><MediaChip media={w.media} style={{ background:'rgba(0,0,0,.08)', color:'#3A2814' }}/></div>}
            </div>
          );
        })}
      </div>
      {recipient && <ClaimBlock cag={cag} onClaim={onClaim} />}
    </div>
  );
}

Object.assign(window, { Av, MediaChip, NoteMedia, Header, Cagnotte, ClaimBlock, WallBoard });
