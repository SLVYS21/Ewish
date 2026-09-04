import React from 'react';
import { Button, Card, Input, Textarea, Field, Switch, Checkbox, Radio, RadioGroup } from '../design-system';

/* ─────────────────────────────────────────────────────────
   /brand — Warm Celebration playground
   Doc vivante + QA visuel du brand system canonique.
   Voir : client/design-system/BRAND.md
   ───────────────────────────────────────────────────────── */

export default function BrandPage() {
  return (
    <div style={{ background: 'var(--mk-surface-base)', minHeight: '100vh', padding: '48px 24px 128px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: 64, textAlign: 'center' }}>
          <span className="mk-label-tag" style={{ color: 'var(--mk-honey-600)' }}>Brand system</span>
          <h1 className="mk-hero" style={{ marginTop: 12 }}>
            Warm <span className="mk-em-coral">Celebration</span>
          </h1>
          <p className="mk-body-lg" style={{ marginTop: 16, maxWidth: 640, marginInline: 'auto' }}>
            Fine stationery warmth meets contemporary digital delight. Coral terracotta,
            warm honey gold, plum espresso ink on noble paper — l'identité complète de myKado.
          </p>
        </header>

        <Section title="Palette" subtitle="Coral (primaire), Honey (secondaire), Plum (ink), Paper (surfaces)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <PaletteCol name="Coral" role="Primary — festive heartbeat" steps={[100, 300, 400, 500, 600, 700]} varPrefix="--mk-coral" onLight={[400, 500, 600, 700]} />
            <PaletteCol name="Honey" role="Secondary — keepsakes, gold milestones" steps={[100, 300, 400, 500, 600, 700]} varPrefix="--mk-honey" onLight={[500, 600, 700]} />
            <PaletteCol name="Plum" role="Ink — never use cold gray" steps={[100, 300, 500, 700, 800, 900]} varPrefix="--mk-plum" onLight={[500, 700, 800, 900]} />
            <PaletteCol name="Paper" role="Surfaces — coton fin" steps={['noble', 'cream', 'sand', 'white']} varPrefix="--mk-paper" onLight={[]} labels={{ noble: '#FDFBF7', cream: '#F7F3EE', sand: '#EFE9E0', white: '#FFFFFF' }} />
          </div>
        </Section>

        <Section title="Typographie" subtitle="Epilogue (display) + Plus Jakarta Sans (UI/body)">
          <Card style={{ padding: 32 }}>
            <p className="mk-label-tag" style={{ marginBottom: 8 }}>Display · Epilogue</p>
            <h1 className="mk-hero" style={{ marginBottom: 4 }}>Un cadeau se raconte</h1>
            <h2 className="mk-h1" style={{ marginBottom: 4 }}>H1 · Titre de section</h2>
            <h3 className="mk-h2" style={{ marginBottom: 4 }}>H2 · Sous-section</h3>
            <h4 className="mk-h3" style={{ marginBottom: 24 }}>H3 · Bloc de contenu</h4>

            <div style={{ height: 1, background: 'var(--mk-border-warm)', marginBlock: 24 }} />

            <p className="mk-label-tag" style={{ marginBottom: 8 }}>Body · Plus Jakarta Sans</p>
            <p className="mk-body-lg" style={{ marginBottom: 8 }}>Body Large — 17px, pour les intros et hero subtitles.</p>
            <p className="mk-body" style={{ marginBottom: 8 }}>Body Medium — 15px, corps standard de l'application.</p>
            <p className="mk-body-sm" style={{ marginBottom: 16 }}>Body Small — 13px, méta-informations et captions.</p>
            <p className="mk-body" style={{ maxWidth: 560 }}>
              L'italique coloré crée le rythme éditorial :
              {' '}<span className="mk-em-coral">un moment inoubliable</span>{' '}
              ou {' '}<span className="mk-em-honey">un cadeau doré</span>{' '} au fil du texte.
            </p>
          </Card>
        </Section>

        <Section title="Buttons" subtitle="Primary Festive (coral pill), Secondary Midnight (plum pill), Warm Ghost (stroke), Gold">
          <Card style={{ padding: 32 }}>
            <div style={{ display: 'grid', gap: 24 }}>
              <Row label="Primary — Festive Coral">
                <Button variant="primary" size="sm">Envoyer</Button>
                <Button variant="primary" size="md">Envoyer le cadeau</Button>
                <Button variant="primary" size="lg" iconLeft="Sparkles">Créer un mur</Button>
                <Button variant="primary" size="md" loading>Envoi…</Button>
                <Button variant="primary" size="md" disabled>Désactivé</Button>
              </Row>
              <Row label="Secondary — Midnight Plum">
                <Button variant="secondary" size="sm">Sauver</Button>
                <Button variant="secondary" size="md">Enregistrer les modifications</Button>
                <Button variant="secondary" size="lg" iconRight="ArrowRight">Publier</Button>
              </Row>
              <Row label="Ghost — Warm stroke, remplit coral au hover">
                <Button variant="ghost" size="sm">Annuler</Button>
                <Button variant="ghost" size="md" iconLeft="ArrowLeft">Retour</Button>
                <Button variant="ghost" size="lg">Aperçu</Button>
              </Row>
              <Row label="Gold — keepsakes dorés">
                <Button variant="gold" size="md" iconLeft="Gift">Débloquer le cadeau</Button>
                <Button variant="gold" size="lg">Recevoir mon KADO</Button>
              </Row>
              <Row label="Danger">
                <Button variant="danger" size="md" iconLeft="Trash2">Supprimer</Button>
              </Row>
            </div>
          </Card>
        </Section>

        <Section title="Inputs & Forms" subtitle="Radius-lg (20px), focus ring coral, background paper-noble, placeholder muted plum">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Card style={{ padding: 32 }}>
              <div style={{ display: 'grid', gap: 20 }}>
                <Field label="Nom du destinataire" hint="Le prénom apparaîtra sur la carte">
                  <Input placeholder="Ex : Aïcha, Mamadou…" />
                </Field>
                <Field label="Message personnel">
                  <Textarea placeholder="Écris quelques mots pour la personne qui recevra ton cadeau…" />
                </Field>
                <Field label="Occasion">
                  <select className="mk-select">
                    <option>Anniversaire</option>
                    <option>Mariage</option>
                    <option>Naissance</option>
                    <option>Fête des mères</option>
                  </select>
                </Field>
              </div>
            </Card>
            <Card style={{ padding: 32 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <p className="mk-label-tag">Controls</p>
                <Switch label="Recevoir les notifications" defaultChecked />
                <Switch label="Autoriser les commentaires publics" />
                <Checkbox label="J'accepte les conditions d'utilisation" defaultChecked />
                <Checkbox label="Newsletter mensuelle" />
                <RadioGroup name="visibility" defaultValue="private">
                  <Radio value="public" label="Public — visible via le lien" />
                  <Radio value="private" label="Privé — seuls les invités voient" />
                </RadioGroup>
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Cards" subtitle="Radius xl (28px), warm hairline, ambient shadow, hover lift -3px">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            <Card interactive>
              <h4 className="mk-h4">Card interactive</h4>
              <p className="mk-body-sm" style={{ marginTop: 8 }}>Hover me — je lift, la shadow s'ouvre.</p>
            </Card>
            <Card variant="elevated">
              <h4 className="mk-h4">Card elevated</h4>
              <p className="mk-body-sm" style={{ marginTop: 8 }}>Ombre douce par défaut, pas de bordure.</p>
            </Card>
            <Card variant="outlined">
              <h4 className="mk-h4">Card outlined</h4>
              <p className="mk-body-sm" style={{ marginTop: 8 }}>Uniquement une bordure, calme et sec.</p>
            </Card>
            <Card variant="muted">
              <h4 className="mk-h4">Card muted</h4>
              <p className="mk-body-sm" style={{ marginTop: 8 }}>Fond crème, pour les sections calmes.</p>
            </Card>
          </div>
        </Section>

        <Section title="Chips & Badges" subtitle="Pill, warm border, active plum ink OR festive coral">
          <Card style={{ padding: 32 }}>
            <Row label="Chips (interactifs)">
              <button className="mk-chip">Anniversaire</button>
              <button className="mk-chip mk-chip--active">Mariage</button>
              <button className="mk-chip mk-chip--festive">Naissance</button>
              <button className="mk-chip mk-chip--lg">Fête des mères</button>
            </Row>
            <Row label="Badges (statiques)" style={{ marginTop: 24 }}>
              <span className="mk-badge mk-badge--success">Publié</span>
              <span className="mk-badge mk-badge--warning">Brouillon</span>
              <span className="mk-badge mk-badge--error">Expiré</span>
              <span className="mk-badge mk-badge--coral">Nouveau</span>
              <span className="mk-badge mk-badge--plum">Premium</span>
              <span className="mk-badge mk-badge--outline">Beta</span>
            </Row>
          </Card>
        </Section>

        <Section title="Shadows & glows" subtitle="Ambient warm (teinte plum), pas de noir. Glows coral/honey pour keepsakes.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <ShadowSwatch name="xs"   varName="--mk-shadow-xs" />
            <ShadowSwatch name="sm"   varName="--mk-shadow-sm" />
            <ShadowSwatch name="md"   varName="--mk-shadow-md" />
            <ShadowSwatch name="lg"   varName="--mk-shadow-lg" />
            <ShadowSwatch name="xl"   varName="--mk-shadow-xl" />
            <ShadowSwatch name="2xl"  varName="--mk-shadow-2xl" />
            <ShadowSwatch name="coral glow" varName="--mk-shadow-coral" bg="var(--mk-coral-500)" fg="var(--mk-paper-noble)" />
            <ShadowSwatch name="honey glow" varName="--mk-shadow-honey" bg="var(--mk-honey-500)" fg="var(--mk-plum-800)" />
          </div>
        </Section>

        <Section title="Radius scale" subtitle="Généreux, tactiles, keepsake">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 }}>
            {['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].map((r) => (
              <div key={r} style={{ textAlign: 'center' }}>
                <div style={{
                  height: 96,
                  background: 'var(--mk-coral-100)',
                  border: '1px solid var(--mk-border-warm)',
                  borderRadius: `var(--mk-radius-${r})`,
                  marginBottom: 8,
                }} />
                <p className="mk-label-md">radius-{r}</p>
                <p className="mk-body-sm">{
                  { sm: '8px', md: '14px', lg: '20px', xl: '28px', '2xl': '36px', '3xl': '48px', full: '9999px' }[r]
                }</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Motion — courbe emphase 240ms" subtitle="cubic-bezier(0.16, 1, 0.3, 1) — signature Warm Celebration">
          <Card style={{ padding: 32 }}>
            <p className="mk-body" style={{ marginBottom: 20 }}>Hover les cards ci-dessous pour observer la courbe emphasis :</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <MotionSwatch label="Hover lift" mode="lift" />
              <MotionSwatch label="Coral glow bloom" mode="glow" />
              <MotionSwatch label="Scale + shadow" mode="scale" />
            </div>
          </Card>
        </Section>

        <footer style={{ marginTop: 96, paddingTop: 32, borderTop: '1px solid var(--mk-border-warm)', textAlign: 'center' }}>
          <p className="mk-label-tag">Source de vérité</p>
          <p className="mk-body" style={{ marginTop: 8 }}>
            <code style={{ background: 'var(--mk-paper-cream)', padding: '4px 10px', borderRadius: 6 }}>
              client/design-system/BRAND.md
            </code>
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Helper components
   ───────────────────────────────────────────────────────── */

function Section({ title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="mk-h2">{title}</h2>
        {subtitle && <p className="mk-body" style={{ marginTop: 6 }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children, style }) {
  return (
    <div style={style}>
      <p className="mk-label-tag" style={{ marginBottom: 12 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>{children}</div>
    </div>
  );
}

function PaletteCol({ name, role, steps, varPrefix, onLight, labels }) {
  return (
    <div>
      <p className="mk-label-md" style={{ marginBottom: 2, color: 'var(--mk-text-primary)' }}>{name}</p>
      <p className="mk-body-sm" style={{ marginBottom: 12 }}>{role}</p>
      <div style={{ display: 'grid', gap: 6 }}>
        {steps.map((step) => {
          const isDark = onLight?.includes(step);
          const bg = `var(${varPrefix}-${step})`;
          const fg = isDark ? 'var(--mk-paper-noble)' : 'var(--mk-plum-800)';
          const label = labels?.[step] ?? `${varPrefix.replace('--mk-', '')}-${step}`;
          return (
            <div key={step} style={{
              background: bg, color: fg, padding: '10px 14px',
              borderRadius: 'var(--mk-radius-md)', fontSize: 12, fontWeight: 600,
              display: 'flex', justifyContent: 'space-between', gap: 8,
              border: '1px solid var(--mk-border-warm)',
            }}>
              <span>{label}</span>
              <span style={{ opacity: 0.8, fontFamily: 'var(--mk-font-mono)' }}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShadowSwatch({ name, varName, bg = 'var(--mk-surface-elevated)', fg = 'var(--mk-text-primary)' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        height: 96,
        background: bg,
        color: fg,
        borderRadius: 'var(--mk-radius-lg)',
        boxShadow: `var(${varName})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14,
        marginBottom: 12,
      }}>{name}</div>
      <p className="mk-body-sm" style={{ fontFamily: 'var(--mk-font-mono)', fontSize: 11 }}>{varName}</p>
    </div>
  );
}

function MotionSwatch({ label, mode }) {
  const base = {
    height: 120,
    background: 'var(--mk-surface-elevated)',
    border: '1px solid var(--mk-border-warm)',
    borderRadius: 'var(--mk-radius-xl)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, color: 'var(--mk-text-primary)',
    cursor: 'pointer',
    transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
  };
  const hoverStyle = React.useRef({});
  const [hover, setHover] = React.useState(false);
  const hoverStyles = {
    lift: { transform: 'translateY(-6px)', boxShadow: 'var(--mk-shadow-md)' },
    glow: { boxShadow: 'var(--mk-shadow-coral)', borderColor: 'var(--mk-coral-500)', color: 'var(--mk-coral-600)' },
    scale: { transform: 'scale(1.03)', boxShadow: 'var(--mk-shadow-lg)' },
  };
  return (
    <div
      style={{ ...base, ...(hover ? hoverStyles[mode] : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </div>
  );
}
