/* ============================================================
   myKado · Wall app shell — role switch + state machine (responsive)
   ============================================================ */
const { useState: useS, useEffect: useE } = React;

function useIsDesktop() {
  const [d, setD] = useS(typeof window !== 'undefined' && window.innerWidth >= 900);
  useE(() => {
    const on = () => setD(window.innerWidth >= 900);
    window.addEventListener('resize', on); return () => window.removeEventListener('resize', on);
  }, []);
  return d;
}

function StatusBar({ color }) {
  return (
    <div className="p-status" style={{ color }}>
      <span>9:41</span>
      <div className="dots">
        <svg width="17" height="11" viewBox="0 0 17 12" fill="none"><rect x="0" y="3" width="3" height="6" rx="1" fill="currentColor"/><rect x="4" y="1.5" width="3" height="9" rx="1" fill="currentColor"/><rect x="8" y="0" width="3" height="12" rx="1" fill="currentColor"/><rect x="12" y="0" width="3" height="12" rx="1" fill="currentColor" opacity=".4"/></svg>
        <svg width="20" height="11" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".5"/><rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

function WallApp({ variant }) {
  const isDesktop = useIsDesktop();
  const [role, setRole] = useS('contrib');
  const [wishes, setWishes] = useS(SEED);
  const [cag, setCag] = useS(CAGNOTTE);
  const [composer, setComposer] = useS(false);
  const [thanks, setThanks] = useS(null);
  const [cagSheet, setCagSheet] = useS(false);
  const [toast, setToast] = useS(null);
  const [story, setStory] = useS(null);
  const [rStage, setRStage] = useS('intro');   // intro | gift | wall
  const [cascade, setCascade] = useS(false);
  const [burst, setBurst] = useS(false);         // reveal flourish over the wall
  const [claim, setClaim] = useS(false);         // ClaimFlow overlay
  const [claimed, setClaimed] = useS(false);

  const showToast = (msg) => { setToast(msg); clearTimeout(showToast._t); showToast._t = setTimeout(()=>setToast(null), 2400); };

  const publish = (w) => { setWishes(ws => [w, ...ws]); setComposer(false); setThanks(w.name); };
  const contribute = (amt) => {
    setCag(c => ({ ...c, collected: c.collected + amt, count: c.count + 1 }));
    setCagSheet(false);
    showToast(`Merci ! ${fcfa(amt)} ajoutés 🎉`);
  };

  const switchRole = (r) => {
    setRole(r); setComposer(false); setThanks(null); setCagSheet(false); setStory(null); setClaim(false);
    if (r === 'recipient') { setRStage('intro'); setCascade(false); setBurst(false); }
  };

  const unwrap = () => {
    setRStage('wall'); setCascade(true); setBurst(true);
    setTimeout(()=>setBurst(false), 3000);
    setTimeout(()=>setCascade(false), 8000);
  };

  const onWall = role === 'recipient' && rStage === 'wall';
  const darkStage = role === 'recipient' && rStage !== 'wall';
  const statusColor = darkStage ? '#fff' : 'var(--mk-ink)';

  return (
    <div className={'stage'+(isDesktop?' desktop':'')}>
      <div className="rolebar">
        <button className={'seg contrib'+(role==='contrib'?' on':'')} onClick={()=>switchRole('contrib')}>
          <span className="em">👋</span> Je laisse un mot
        </button>
        <button className={'seg recipient'+(role==='recipient'?' on':'')} onClick={()=>switchRole('recipient')}>
          <span className="em">🎁</span> Je reçois mon mur
        </button>
      </div>

      <div className={'phone'+(darkStage?' dark':'')}>
        <StatusBar color={statusColor} />
        <div className="p-view">

          {/* ─────────── CONTRIBUTOR ─────────── */}
          {role === 'contrib' && (
            <>
              <div className="scroll">
                <WallBoard variant={variant} mode="contrib" wishes={wishes} cag={cag}
                  onOpenWish={(i)=>setStory(i)} onParticipate={()=>setCagSheet(true)} />
              </div>
              <button className="cta-fab" style={{ background: variant==='pin' ? '#3A2814' : 'var(--mk-mur)' }} onClick={()=>setComposer(true)}>
                {Icon.pen({ size:17, stroke:'#fff' })} Laisser un mot
              </button>
              {composer && <Composer onPublish={publish} onClose={()=>setComposer(false)} />}
              {cagSheet && <CagnotteSheet cag={cag} onConfirm={contribute} onClose={()=>setCagSheet(false)} />}
              {thanks && <ThankYou name={thanks}
                onParticipate={()=>{ setThanks(null); setCagSheet(true); }}
                onShare={()=>{ setThanks(null); showToast('Lien du mur copié 🔗'); }}
                onCreate={()=>{ setThanks(null); showToast('Bienvenue sur myKado ✨'); }}
                onClose={()=>setThanks(null)} />}
            </>
          )}

          {/* ─────────── RECIPIENT ─────────── */}
          {role === 'recipient' && (
            <>
              {rStage === 'intro' && <Intro onDone={()=>setRStage('gift')} />}
              {rStage === 'gift' && <GiftUnwrap onOpen={unwrap} />}
              {rStage === 'wall' && (
                <>
                  <div className="scroll">
                    <WallBoard variant={variant} mode="recipient" wishes={wishes} cag={cag}
                      onOpenWish={(i)=>setStory(i)} onClaim={()=>setClaim(true)} />
                  </div>
                  <Cascade run={cascade} />
                  {burst && <RevealBurst cag={cag} />}
                  {!burst && !claim && (
                    <button className={'claim-fab'+(claimed?' done':'')} onClick={()=>setClaim(true)}>
                      {claimed ? Icon.check({ size:17, stroke:'#fff' }) : Icon.gift({ size:17, stroke:'#fff' })}
                      {claimed ? 'Cadeau débloqué' : <>Débloquer mon cadeau <b>· {fcfa(cag.collected)}</b></>}
                    </button>
                  )}
                  {claim && <ClaimFlow cag={cag} onClose={()=>setClaim(false)} onClaimed={()=>setClaimed(true)} />}
                </>
              )}
            </>
          )}

          {/* story viewer — shared by both roles */}
          {story !== null && <StoryViewer wishes={wishes} start={story} onClose={()=>setStory(null)} />}

          {toast && <div className="toast">{Icon.check({ size:15, stroke:'#fff' })} {toast}</div>}
        </div>
        <div className="p-home" style={{ color: statusColor }}/>
      </div>
    </div>
  );
}

Object.assign(window, { WallApp, StatusBar, useIsDesktop });
