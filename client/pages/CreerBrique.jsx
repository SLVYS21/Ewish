import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container, Section, Stack, Grid, Card, Button, Icon, Motif,
} from '../design-system';

/**
 * myKado — Écran "Comment veux-tu la célébrer ?"
 *
 * Correspond à Flow créateur §3 (notes/flows.md).
 * Sélection de la brique (carte / mur / cadeau).
 * Précédé par l'occasion + destinataire (query params).
 * Route : /app/creer  (nouveau) — pour l'instant sans blocage d'auth (preview design)
 *
 * Query params supportés (optionnels) :
 *  - occasion   ex: anniversaire, mariage, naissance, retirement, fin-annee, autre
 *  - recipient  ex: "Amina Ochoa"
 */

const BRIQUES = [
  {
    id: 'carte',
    icon: 'Sparkles',
    title: 'Une carte animée',
    tagline: 'Un moment intense, un destinataire.',
    description: 'Belle carte animée avec musique, photos, décorations. Idéal pour un anniversaire, une déclaration, un message qui marque.',
    accent: 'var(--mk-action-primary)',
    accentBg: 'var(--mk-indigo-50)',
    route: '/ewish-admin/templates?kind=animation',
  },
  {
    id: 'mur',
    icon: 'LayoutGrid',
    title: 'Un mur collaboratif',
    tagline: 'Rassemble plusieurs voix autour d\'une personne.',
    description: 'Invite tes proches à laisser un mot, une photo, un GIF ou un audio. Ils reçoivent l\'ensemble comme un cadeau collectif.',
    accent: 'var(--mk-action-secondary)',
    accentBg: 'var(--mk-clay-50)',
    route: '/ewish-admin/templates?kind=wall',
  },
  {
    id: 'cadeau',
    icon: 'Gift',
    title: 'Un cadeau direct',
    tagline: 'Un montant, une carte cadeau, un geste.',
    description: 'Envoie une carte cadeau chez un partenaire ou un montant directement, avec un petit mot personnalisé.',
    accent: 'var(--mk-action-accent-gold)',
    accentBg: 'var(--mk-gold-50)',
    route: '/ewish-admin/credits',
    comingSoon: true,
  },
];

export default function CreerBrique() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const occasion = params.get('occasion') || '';
  const recipient = params.get('recipient') || '';

  const contextHint = React.useMemo(() => {
    const bits = [];
    if (occasion) bits.push(occasion);
    if (recipient) bits.push(`pour ${recipient}`);
    return bits.join(' · ');
  }, [occasion, recipient]);

  const handlePick = (brique) => {
    if (brique.comingSoon) return;
    const url = new URL(brique.route, window.location.origin);
    if (occasion) url.searchParams.set('occasion', occasion);
    if (recipient) url.searchParams.set('recipient', recipient);
    navigate(url.pathname + url.search);
  };

  return (
    <div style={{ background: 'var(--mk-surface-base)', minHeight: '100vh' }}>
      <Container variant="marketing">
        <Section style={{ paddingBlock: 48 }}>
          <Stack gap={12}>
            {/* Header */}
            <Stack gap={4}>
              <Button
                variant="ghost"
                size="sm"
                iconLeft="ArrowLeft"
                onClick={() => navigate(-1)}
                style={{ alignSelf: 'flex-start' }}
              >
                Retour
              </Button>
              <Stack gap={2}>
                {contextHint && (
                  <div className="mk-overline">{contextHint}</div>
                )}
                <h1 className="mk-display-lg">Comment veux-tu célébrer&nbsp;?</h1>
                <p className="mk-body-lg" style={{ maxWidth: 640, color: 'var(--mk-text-secondary)' }}>
                  Trois façons de faire plaisir. Chacune raconte quelque chose de différent — choisis celle qui parle le plus à ton moment.
                </p>
              </Stack>
            </Stack>

            {/* Séparateur or */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--mk-action-accent-gold)' }}>
              <Motif name="star-4pt" size={14} />
              <div style={{ flex: 1, height: 1, background: 'var(--mk-action-accent-gold)', opacity: 0.5 }} />
              <Motif name="star-4pt" size={14} />
            </div>

            {/* 3 cards briques */}
            <Grid cols={{ base: 1, md: 3 }} gap={6}>
              {BRIQUES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handlePick(b)}
                  disabled={b.comingSoon}
                  style={{
                    all: 'unset',
                    cursor: b.comingSoon ? 'not-allowed' : 'pointer',
                    opacity: b.comingSoon ? 0.55 : 1,
                    display: 'block',
                  }}
                >
                  <Card
                    variant="elevated"
                    size="lg"
                    interactive={!b.comingSoon}
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 20,
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: 'var(--mk-radius-lg)',
                        background: b.accentBg,
                        color: b.accent,
                      }}
                    >
                      <Icon name={b.icon} size="xl" strokeWidth={1.5} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3 className="mk-h3">{b.title}</h3>
                      <div className="mk-body-strong" style={{ color: 'var(--mk-text-brand)' }}>
                        {b.tagline}
                      </div>
                      <p className="mk-body-sm" style={{ color: 'var(--mk-text-secondary)' }}>
                        {b.description}
                      </p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: b.accent, fontWeight: 600, fontSize: 14 }}>
                      {b.comingSoon ? 'Bientôt' : 'Choisir'}
                      {!b.comingSoon && <Icon name="ArrowRight" size="sm" />}
                    </div>
                  </Card>
                </button>
              ))}
            </Grid>

            {/* Aide */}
            <div
              style={{
                marginTop: 24,
                padding: 20,
                background: 'var(--mk-surface-muted)',
                borderRadius: 'var(--mk-radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Icon name="Info" size="md" color="var(--mk-text-tertiary)" />
              <div className="mk-body-sm" style={{ color: 'var(--mk-text-secondary)' }}>
                Pas sûr&nbsp;? Une carte animée est parfaite pour un moment intime, le mur collaboratif brille quand tu as
                plusieurs personnes à mobiliser, et le cadeau se cumule avec les deux.
              </div>
            </div>
          </Stack>
        </Section>
      </Container>
    </div>
  );
}
