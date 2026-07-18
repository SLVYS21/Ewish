import React from 'react';
import {
  Modal, Field, Input, Button, Icon, useToast,
} from '../design-system';
import { checkSlugAvailability, updatePublicationSlug } from '../utils/api';

/**
 * myKado — Modal "Personnaliser le lien"
 *
 * Conforme aux règles UX (notes/ux-rules.md §2) :
 * - Suggestion auto pré-remplie
 * - Validation live (debounced)
 * - Format explicité en langage clair
 * - Preview de l'URL finale
 * - Toast confirmation
 *
 * <PersonalizeLinkModal
 *   open={open}
 *   onClose={close}
 *   publicationId={id}
 *   currentSlug={pub.slug}
 *   brique={pub.brique}          // 'carte' | 'mur' | 'cadeau'
 *   suggestedBase={pub.title || pub.data?.name}
 *   onUpdated={(newSlug) => setPub({ ...pub, slug: newSlug })}
 * />
 */

const BRIQUE_PREFIX = { carte: 'c', mur: 'm', cadeau: 'g' };
const APP_HOST = typeof window !== 'undefined' ? window.location.host : 'mykado.co';

export default function PersonalizeLinkModal({
  open,
  onClose,
  publicationId,
  currentSlug = '',
  brique = 'carte',
  suggestedBase = '',
  onUpdated,
}) {
  const [value, setValue] = React.useState(currentSlug);
  const [status, setStatus] = React.useState({ state: 'idle' });
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setValue(currentSlug || '');
      setStatus({ state: 'idle' });
    }
  }, [open, currentSlug]);

  // Live check debounced
  React.useEffect(() => {
    if (!value || value === currentSlug) {
      setStatus({ state: 'idle' });
      return;
    }
    setStatus({ state: 'checking' });
    const t = setTimeout(async () => {
      try {
        const { data } = await checkSlugAvailability(value, publicationId);
        if (data.valid) {
          setStatus({ state: 'valid', slug: data.slug });
        } else {
          const messages = {
            format: 'Format invalide (3–40 caractères, lettres, chiffres, tirets)',
            taken:  'Ce lien est déjà pris',
            empty:  'Choisis un lien',
          };
          setStatus({
            state: 'invalid',
            reason: data.reason,
            message: messages[data.reason] || 'Non disponible',
            suggestion: data.suggestion,
          });
        }
      } catch (err) {
        setStatus({ state: 'invalid', message: 'Vérification impossible' });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [value, currentSlug, publicationId]);

  const prefix = BRIQUE_PREFIX[brique] || 'c';
  const previewValue = status.state === 'valid' ? status.slug : value || '…';

  const canSave =
    !saving &&
    value &&
    value !== currentSlug &&
    (status.state === 'valid' || (status.state === 'idle' && value === currentSlug));

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const { data } = await updatePublicationSlug(publicationId, value);
      toast.success({ title: 'Lien mis à jour', message: `Ton lien est maintenant ${prefix}/${data.slug}` });
      onUpdated?.(data.slug);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Impossible de sauvegarder';
      toast.error({ title: 'Erreur', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const applySuggestion = () => {
    if (status.suggestion) setValue(status.suggestion);
    else if (suggestedBase) {
      // Fallback : côté client on peut faire un slugify simple
      const s = suggestedBase
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9_]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue(s.slice(0, 40));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Personnaliser le lien" size="md">
      <Modal.Body>
        <p className="mk-body" style={{ marginBottom: 24 }}>
          Un lien court et clair, plus facile à partager et à retenir.
        </p>

        <Field
          label="Ton lien personnalisé"
          hint="Utilise des lettres, chiffres et tirets — entre 3 et 40 caractères"
          error={status.state === 'invalid' ? status.message : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
            <div
              className="mk-body"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 14px',
                background: 'var(--mk-surface-muted)',
                border: '1px solid var(--mk-border-default)',
                borderRadius: 'var(--mk-radius-sm)',
                color: 'var(--mk-text-tertiary)',
                whiteSpace: 'nowrap',
                fontSize: 14,
              }}
            >
              {APP_HOST}/{prefix}/
            </div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase())}
              placeholder="amina-30-ans"
              error={status.state === 'invalid'}
              autoFocus
              style={{ flex: 1 }}
            />
          </div>
        </Field>

        {/* Feedback zone */}
        <div style={{ marginTop: 16, minHeight: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
          {status.state === 'checking' && (
            <>
              <Icon name="Loader2" size="sm" color="var(--mk-text-tertiary)" />
              <span className="mk-caption">Vérification…</span>
            </>
          )}
          {status.state === 'valid' && (
            <>
              <Icon name="CheckCircle2" size="sm" color="var(--mk-state-success)" />
              <span className="mk-caption" style={{ color: 'var(--mk-state-success)' }}>
                Ce lien est libre — tu peux le prendre.
              </span>
            </>
          )}
          {status.state === 'invalid' && status.suggestion && status.suggestion !== value && (
            <Button variant="ghost" size="sm" iconLeft="Sparkles" onClick={applySuggestion}>
              Essayer « {status.suggestion} »
            </Button>
          )}
        </div>

        {/* Preview */}
        <div
          style={{
            marginTop: 24,
            padding: '20px 24px',
            background: 'var(--mk-surface-muted)',
            borderRadius: 'var(--mk-radius-md)',
            border: '1px solid var(--mk-border-subtle)',
          }}
        >
          <div className="mk-overline" style={{ marginBottom: 6 }}>Aperçu</div>
          <div className="mk-body-strong" style={{ wordBreak: 'break-all' }}>
            {APP_HOST}/{prefix}/<span style={{ color: 'var(--mk-text-brand)' }}>{previewValue}</span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button variant="primary" onClick={handleSave} disabled={!canSave} loading={saving}>
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
