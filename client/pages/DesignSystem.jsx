import React from 'react';
import {
  Icon,
  Motif,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Card,
  Modal,
  ToastProvider,
  useToast,
  Tabs,
  Dropdown,
  Tooltip,
  Container,
  Section,
  Stack,
  Grid,
  Divider,
  celebrate,
} from '../design-system';

/* ─────────────────────────────────────────────────────────
   Design System demo — route interne /ewish-admin/design-system
   ───────────────────────────────────────────────────────── */

const SECTIONS = [
  ['colors', 'Couleurs'],
  ['typography', 'Typographie'],
  ['spacing', 'Spacing'],
  ['radius', 'Radius'],
  ['shadows', 'Shadows'],
  ['motion', 'Motion'],
  ['icons', 'Icônes'],
  ['motifs', 'Motifs'],
  ['primitives', 'Primitives'],
  ['composed', 'Composed'],
  ['layout', 'Layout'],
];

export default function DesignSystem() {
  return (
    <>
      <div style={{ background: 'var(--mk-surface-base)', minHeight: '100vh' }}>
        <TopNav />
        <Container variant="marketing" style={{ paddingBlock: 32 }}>
          <header style={{ marginBottom: 48 }}>
            <div className="mk-overline" style={{ marginBottom: 8 }}>myKado · Design System</div>
            <h1 className="mk-display-lg">Hybride C+A</h1>
            <p className="mk-body-lg" style={{ maxWidth: 640, marginTop: 12 }}>
              Afro-Modern Elegance sur ergonomie éditoriale. Base fond blanc, UX-first, cohérence
              complète sur toutes les briques myKado.
            </p>
          </header>
          <ColorsSection />
          <TypographySection />
          <SpacingSection />
          <RadiusSection />
          <ShadowsSection />
          <MotionSection />
          <IconsSection />
          <MotifsSection />
          <PrimitivesSection />
          <ComposedSection />
          <LayoutSection />
        </Container>
      </div>
    </>
  );
}

function TopNav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--mk-border-subtle)',
      }}
    >
      <Container variant="marketing">
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 0',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="mk-body-sm"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--mk-radius-full)',
                color: 'var(--mk-text-secondary)',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </Container>
    </nav>
  );
}

function Sec({ id, title, description, children }) {
  return (
    <section id={id} style={{ paddingBlock: 48, borderTop: '1px solid var(--mk-border-subtle)' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 className="mk-h2">{title}</h2>
        {description && (
          <p className="mk-body" style={{ marginTop: 8, maxWidth: 640 }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ── Colors ── */
const COLOR_FAMILIES = [
  { name: 'indigo', label: 'Indigo (primaire)', base: 700 },
  { name: 'gold',   label: 'Or / Brass',       base: 400 },
  { name: 'clay',   label: 'Argile',           base: 500 },
  { name: 'stone',  label: 'Stone (neutre)',   base: 900 },
];
const STONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function ColorsSection() {
  return (
    <Sec id="colors" title="Couleurs" description="5 familles brand + tokens sémantiques.">
      <Stack gap={8}>
        {COLOR_FAMILIES.map(({ name, label, base }) => (
          <div key={name}>
            <div className="mk-overline" style={{ marginBottom: 12 }}>{label}</div>
            <Grid cols={{ base: 5, md: 10 }} gap={2}>
              {STONE_STEPS.map((step) => {
                const varName = `--mk-${name}-${step}`;
                const isBase = step === base;
                return (
                  <div key={step}>
                    <div
                      style={{
                        aspectRatio: '1',
                        background: `var(${varName})`,
                        borderRadius: 'var(--mk-radius-md)',
                        border: '1px solid var(--mk-border-subtle)',
                        position: 'relative',
                      }}
                    >
                      {isBase && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: step >= 400 ? '#fff' : 'var(--mk-stone-900)',
                          }}
                        />
                      )}
                    </div>
                    <div className="mk-micro" style={{ marginTop: 6 }}>{step}</div>
                  </div>
                );
              })}
            </Grid>
          </div>
        ))}
      </Stack>
    </Sec>
  );
}

/* ── Typography ── */
function TypographySection() {
  const samples = [
    ['mk-display-2xl', 'Célébrez quelqu\'un aujourd\'hui'],
    ['mk-display-xl',  'Célébrez quelqu\'un aujourd\'hui'],
    ['mk-display-lg',  'Célébrez quelqu\'un aujourd\'hui'],
    ['mk-h1',          'Titre H1 · Fraunces serif éditorial'],
    ['mk-h2',          'Titre H2 · avec caractère'],
    ['mk-h3',          'Titre H3 · basculement de poids'],
    ['mk-h4',          'Titre H4 · dernière graduation serif'],
    ['mk-h5',          'Titre H5 · sans-serif à partir d\'ici'],
    ['mk-overline',    '◆ NOS BRIQUES'],
    ['mk-body-lg',     'Body large — pour les lead paragraphs, promesses hero, contexte introductif.'],
    ['mk-body',        'Body standard — utilisé partout dans l\'app pour le corps de texte.'],
    ['mk-body-sm',     'Body small — meta, sous-titres de cartes, détails.'],
    ['mk-caption',     'Caption — hints, notes, contexte.'],
    ['mk-micro',       'Micro — labels de sections, badges très petits.'],
  ];
  return (
    <Sec id="typography" title="Typographie" description="Fraunces (serif) titres + Inter (sans) body.">
      <Stack gap={6}>
        {samples.map(([cls, text]) => (
          <div key={cls} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24, alignItems: 'baseline' }}>
            <code className="mk-micro" style={{ color: 'var(--mk-text-tertiary)' }}>.{cls}</code>
            <div className={cls}>{text}</div>
          </div>
        ))}
      </Stack>
    </Sec>
  );
}

/* ── Spacing ── */
function SpacingSection() {
  const scale = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];
  return (
    <Sec id="spacing" title="Spacing" description="Base 4px. Utiliser les tokens sémantiques dans le code.">
      <Stack gap={2}>
        {scale.map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <code className="mk-micro" style={{ width: 100, color: 'var(--mk-text-tertiary)' }}>--mk-space-{n}</code>
            <div
              style={{
                height: 20,
                background: 'var(--mk-action-primary)',
                width: `calc(var(--mk-space-${n}) )`,
              }}
            />
            <div className="mk-caption">{n * 4}px</div>
          </div>
        ))}
      </Stack>
    </Sec>
  );
}

/* ── Radius ── */
function RadiusSection() {
  const scale = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
  return (
    <Sec id="radius" title="Radius">
      <Grid cols={{ base: 3, sm: 4, md: 7 }} gap={4}>
        {scale.map((k) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div
              style={{
                height: 80,
                background: 'var(--mk-indigo-100)',
                borderRadius: `var(--mk-radius-${k})`,
              }}
            />
            <div className="mk-micro" style={{ marginTop: 6 }}>--mk-radius-{k}</div>
          </div>
        ))}
      </Grid>
    </Sec>
  );
}

/* ── Shadows ── */
function ShadowsSection() {
  const scale = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'brand', 'gold'];
  return (
    <Sec id="shadows" title="Shadows" description="Warm — teinte stone-800 (chaude) plutôt que black.">
      <Grid cols={{ base: 2, md: 4 }} gap={6}>
        {scale.map((k) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div
              style={{
                height: 100,
                background: 'var(--mk-surface-base)',
                borderRadius: 'var(--mk-radius-lg)',
                boxShadow: `var(--mk-shadow-${k})`,
              }}
            />
            <div className="mk-micro" style={{ marginTop: 8 }}>--mk-shadow-{k}</div>
          </div>
        ))}
      </Grid>
    </Sec>
  );
}

/* ── Motion ── */
function MotionSection() {
  const [pulse, setPulse] = React.useState(0);
  return (
    <Sec id="motion" title="Motion" description="Durées harmoniques + easings expressifs (spring/emphasis).">
      <Stack gap={4}>
        <Button variant="secondary" onClick={() => setPulse((n) => n + 1)} iconLeft="Sparkles">
          Déclencher les preview
        </Button>
        <Grid cols={{ base: 2, md: 4 }} gap={4}>
          {['fast', 'base', 'slow', 'slower', 'story'].map((k) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div
                key={pulse}
                style={{
                  height: 80,
                  background: 'var(--mk-action-primary)',
                  borderRadius: 'var(--mk-radius-md)',
                  transform: 'scale(1)',
                  animation: `mk-preview-motion var(--mk-duration-${k}) var(--mk-ease-spring)`,
                }}
              />
              <div className="mk-micro" style={{ marginTop: 8 }}>--mk-duration-{k}</div>
            </div>
          ))}
        </Grid>
        <style>{`
          @keyframes mk-preview-motion {
            0% { transform: scale(0.6); opacity: 0.3; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </Stack>
    </Sec>
  );
}

/* ── Icons ── */
function IconsSection() {
  const icons = [
    'Sparkles', 'Gift', 'LayoutGrid', 'CalendarHeart', 'Building2',
    'Send', 'Share2', 'Copy', 'QrCode', 'Download',
    'Music', 'Image', 'Video', 'Mic', 'Type',
    'Palette', 'PartyPopper', 'Pin', 'Users', 'Eye',
    'Heart', 'Star', 'Bell', 'CheckCircle2', 'AlertCircle',
    'ChevronRight', 'ArrowRight', 'Menu', 'Search', 'Settings',
  ];
  return (
    <Sec id="icons" title="Icônes" description="Lucide, stroke 1.75px, hérite currentColor.">
      <Grid cols={{ base: 3, sm: 5, md: 6, lg: 10 }} gap={4}>
        {icons.map((name) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: 12,
              background: 'var(--mk-surface-muted)',
              borderRadius: 'var(--mk-radius-md)',
            }}
          >
            <Icon name={name} size="lg" color="var(--mk-text-brand)" />
            <div className="mk-micro" style={{ textAlign: 'center' }}>{name}</div>
          </div>
        ))}
      </Grid>
    </Sec>
  );
}

/* ── Motifs ── */
function MotifsSection() {
  return (
    <Sec id="motifs" title="Motifs" description="Abstraits, jamais figuratifs. Or par défaut.">
      <Stack gap={6}>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Separator</div>
          <Motif name="diamond-line" width={240} color="var(--mk-action-accent-gold)" />
        </div>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Accents</div>
          <Stack horizontal gap={4}>
            <Motif name="star-4pt" size={24} color="var(--mk-action-accent-gold)" />
            <Motif name="star-4pt" size={16} color="var(--mk-action-primary)" />
            <Motif name="corner-mark" size={24} color="var(--mk-action-accent-gold)" />
          </Stack>
        </div>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Background pattern (opacity 8%)</div>
          <div
            style={{
              height: 140,
              background: 'var(--mk-surface-muted)',
              borderRadius: 'var(--mk-radius-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                color: 'var(--mk-action-accent-gold)',
                opacity: 0.15,
              }}
            >
              <Motif name="grid-diamond" width="100%" height="100%" opacity={1} />
            </div>
          </div>
        </div>
      </Stack>
    </Sec>
  );
}

/* ── Primitives ── */
function PrimitivesSection() {
  const [checked, setChecked] = React.useState(true);
  const [radio, setRadio] = React.useState('public');
  const [switched, setSwitched] = React.useState(false);

  return (
    <Sec id="primitives" title="Primitives">
      <Stack gap={8}>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Buttons — variants</div>
          <Stack horizontal gap={3} style={{ flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="gold">Gold</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </Stack>
        </div>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Buttons — sizes + icons</div>
          <Stack horizontal gap={3} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg" iconRight="ArrowRight">Large</Button>
            <Button variant="secondary" iconLeft="ArrowLeft">Retour</Button>
            <Button variant="ghost" iconOnly icon="Settings" aria-label="Réglages" />
          </Stack>
        </div>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Inputs</div>
          <Grid cols={{ base: 1, md: 2 }} gap={4}>
            <Field label="Nom du destinataire" hint="Comme il apparaîtra sur la carte">
              <Input placeholder="Amina" />
            </Field>
            <Field label="Email" required error="Adresse invalide">
              <Input type="email" defaultValue="pas-un-email" error />
            </Field>
            <Field label="Message">
              <Textarea placeholder="Écris quelque chose de beau…" rows={3} />
            </Field>
            <Field label="Occasion">
              <Select defaultValue="">
                <option value="" disabled>Choisir…</option>
                <option>Anniversaire</option>
                <option>Mariage</option>
                <option>Naissance</option>
                <option>Retraite</option>
              </Select>
            </Field>
          </Grid>
        </div>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Selection</div>
          <Stack gap={4}>
            <Checkbox checked={checked} onChange={setChecked}>Accepter les cadeaux sur le mur</Checkbox>
            <div>
              <div className="mk-caption" style={{ marginBottom: 8 }}>Visibilité</div>
              <RadioGroup name="visibility" value={radio} onChange={setRadio}>
                <Radio value="public">Public — les invités voient tous les messages</Radio>
                <Radio value="private">Privé — seul le destinataire voit tout</Radio>
              </RadioGroup>
            </div>
            <Switch checked={switched} onChange={setSwitched}>Activer la modération</Switch>
          </Stack>
        </div>
      </Stack>
    </Sec>
  );
}

/* ── Composed ── */
function ComposedSection() {
  const [modal, setModal] = React.useState(false);
  const [tab, setTab] = React.useState('cartes');
  const { toast } = useToast();

  return (
    <Sec id="composed" title="Composants composés">
      <Stack gap={8}>
        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Cards</div>
          <Grid cols={{ base: 1, md: 3 }} gap={4}>
            <Card>
              <Card.Header>
                <div className="mk-h4">Card default</div>
                <Icon name="Sparkles" size="md" color="var(--mk-action-accent-gold)" />
              </Card.Header>
              <Card.Body>
                <p className="mk-body-sm">Border subtile + shadow xs. Base du système.</p>
              </Card.Body>
            </Card>
            <Card variant="elevated">
              <Card.Header>
                <div className="mk-h4">Card elevated</div>
              </Card.Header>
              <Card.Body>
                <p className="mk-body-sm">Sans border, shadow md. Pour la mise en avant.</p>
              </Card.Body>
            </Card>
            <Card variant="muted">
              <Card.Header>
                <div className="mk-h4">Card muted</div>
              </Card.Header>
              <Card.Body>
                <p className="mk-body-sm">Fond crème stone-50, sans shadow. Sections calmes.</p>
              </Card.Body>
            </Card>
          </Grid>
        </div>

        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Modal</div>
          <Button variant="primary" onClick={() => setModal(true)}>Ouvrir la modale</Button>
          <Modal open={modal} onClose={() => setModal(false)} title="Créer une carte">
            <Modal.Body>
              <p>Confirmes-tu la création de cette carte pour <strong>Amina</strong> ?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setModal(false)}>Annuler</Button>
              <Button variant="primary" onClick={() => { setModal(false); celebrate('form-success'); }}>
                Confirmer
              </Button>
            </Modal.Footer>
          </Modal>
        </div>

        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Toasts</div>
          <Stack horizontal gap={3} style={{ flexWrap: 'wrap' }}>
            <Button variant="tertiary" onClick={() => toast.success({ title: 'Carte envoyée', message: 'Ta carte est en route.' })}>Success</Button>
            <Button variant="tertiary" onClick={() => toast.warning({ title: 'Attention', message: 'Il te reste 3 crédits.' })}>Warning</Button>
            <Button variant="tertiary" onClick={() => toast.error({ title: 'Erreur', message: 'Impossible de sauvegarder.' })}>Error</Button>
            <Button variant="tertiary" onClick={() => toast.info({ title: 'Info', message: 'Nouvelle brique disponible.' })}>Info</Button>
          </Stack>
        </div>

        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Tabs</div>
          <Tabs value={tab} onChange={setTab}>
            <Tabs.List>
              <Tabs.Trigger value="cartes" icon="Sparkles">Cartes</Tabs.Trigger>
              <Tabs.Trigger value="murs" icon="LayoutGrid">Murs</Tabs.Trigger>
              <Tabs.Trigger value="cadeaux" icon="Gift">Cadeaux</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="cartes"><p className="mk-body">Contenu Cartes.</p></Tabs.Panel>
            <Tabs.Panel value="murs"><p className="mk-body">Contenu Murs.</p></Tabs.Panel>
            <Tabs.Panel value="cadeaux"><p className="mk-body">Contenu Cadeaux.</p></Tabs.Panel>
          </Tabs>
        </div>

        <div>
          <div className="mk-overline" style={{ marginBottom: 12 }}>Dropdown + Tooltip</div>
          <Stack horizontal gap={4}>
            <Dropdown
              trigger={<Button variant="tertiary" iconRight="ChevronDown">Actions</Button>}
            >
              <Dropdown.Item icon="Edit3">Éditer</Dropdown.Item>
              <Dropdown.Item icon="Share2">Partager</Dropdown.Item>
              <Dropdown.Item icon="Download">Télécharger</Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item icon="Trash2" danger>Supprimer</Dropdown.Item>
            </Dropdown>
            <Tooltip label="Partager sur les réseaux">
              <Button variant="ghost" iconOnly icon="Share2" aria-label="Partager" />
            </Tooltip>
          </Stack>
        </div>
      </Stack>
    </Sec>
  );
}

/* ── Layout ── */
function LayoutSection() {
  return (
    <Sec id="layout" title="Layout" description="Container, Stack, Grid, Divider.">
      <Stack gap={6}>
        <Card variant="muted">
          <div className="mk-caption" style={{ marginBottom: 8 }}>&lt;Stack gap={4}&gt;</div>
          <Stack gap={4}>
            <div style={{ height: 40, background: 'var(--mk-indigo-100)', borderRadius: 8 }} />
            <div style={{ height: 40, background: 'var(--mk-indigo-100)', borderRadius: 8 }} />
            <div style={{ height: 40, background: 'var(--mk-indigo-100)', borderRadius: 8 }} />
          </Stack>
        </Card>
        <Card variant="muted">
          <div className="mk-caption" style={{ marginBottom: 8 }}>&lt;Grid cols={"{"} base: 1, md: 3 {"}"}&gt;</div>
          <Grid cols={{ base: 1, md: 3 }} gap={4}>
            <div style={{ height: 60, background: 'var(--mk-gold-100)', borderRadius: 8 }} />
            <div style={{ height: 60, background: 'var(--mk-gold-100)', borderRadius: 8 }} />
            <div style={{ height: 60, background: 'var(--mk-gold-100)', borderRadius: 8 }} />
          </Grid>
        </Card>
        <Card variant="muted">
          <div className="mk-caption" style={{ marginBottom: 8 }}>&lt;Divider /&gt; · &lt;Divider gold /&gt;</div>
          <Divider />
          <Divider gold />
        </Card>
      </Stack>
    </Sec>
  );
}
