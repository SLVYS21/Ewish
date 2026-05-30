import { Link } from 'react-router-dom';

const LAST_UPDATED = '30 mai 2026';

export default function TermsPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <Link to="/ewish-admin/login" style={styles.back}>← Retour</Link>
          <div style={styles.badge}>Conditions d'utilisation</div>
          <h1 style={styles.title}>Conditions Générales d'Utilisation</h1>
          <p style={styles.meta}>myKado · En vigueur à partir du {LAST_UPDATED}</p>
        </div>

        <Section title="1. Présentation du service">
          <p>myKado est une plateforme en ligne permettant aux utilisateurs (ci-après "marchands") de créer, personnaliser et partager des pages-événements numériques (cartes d'anniversaire, pages de vœux, invitations, etc.). Le service est accessible via <strong>mykado.app</strong> et ses sous-domaines.</p>
          <p>L'utilisation de myKado implique l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
        </Section>

        <Section title="2. Inscription et compte utilisateur">
          <p>Pour accéder aux fonctionnalités complètes, vous devez créer un compte en fournissant :</p>
          <ul>
            <li>Votre nom complet</li>
            <li>Une adresse email valide</li>
            <li>Un mot de passe sécurisé (minimum 8 caractères)</li>
          </ul>
          <p>Vous pouvez également vous connecter via votre compte Google. Dans ce cas, myKado récupère votre nom et adresse email auprès de Google, avec votre consentement explicite.</p>
          <p>Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités réalisées depuis votre compte. En cas d'utilisation non autorisée, contactez-nous immédiatement à <strong>support@mykado.app</strong>.</p>
        </Section>

        <Section title="3. Crédits et paiements">
          <p>L'utilisation de certaines fonctionnalités (publication de pages, templates premium) requiert l'utilisation de <strong>crédits myKado</strong>.</p>
          <ul>
            <li>Les crédits s'achètent via la plateforme de paiement <strong>KKiaPay</strong>, qui accepte Mobile Money (MTN, Moov, Wave) et cartes bancaires.</li>
            <li>Les crédits ne sont pas remboursables sauf en cas d'erreur technique de notre part.</li>
            <li>myKado ne stocke aucune information bancaire ou de Mobile Money. Les transactions sont entièrement gérées par KKiaPay.</li>
            <li>Les codes promotionnels sont à usage unique et soumis à leurs propres conditions.</li>
          </ul>
        </Section>

        <Section title="4. Contenu créé par les utilisateurs">
          <p>Vous restez propriétaire de tout le contenu que vous créez sur myKado (textes, photos, musiques, etc.). En utilisant le service, vous nous accordez une licence limitée, non exclusive, pour héberger, afficher et diffuser ce contenu dans le cadre du fonctionnement du service.</p>
          <p><strong>Vous vous engagez à ne pas publier :</strong></p>
          <ul>
            <li>Du contenu illégal, diffamatoire, offensant ou portant atteinte aux droits de tiers</li>
            <li>Des images ou vidéos à caractère sexuel, violent ou discriminatoire</li>
            <li>Du contenu violant des droits d'auteur ou droits voisins sans autorisation</li>
            <li>Des informations personnelles de tiers sans leur consentement</li>
          </ul>
          <p>myKado se réserve le droit de supprimer tout contenu non conforme et de suspendre les comptes en infraction.</p>
        </Section>

        <Section title="5. Vérification d'identité (KYC)">
          <p>Pour accéder à certaines fonctionnalités avancées (notamment la collecte de cagnotte), une vérification d'identité peut être requise. Ce processus implique :</p>
          <ul>
            <li>La fourniture d'une photo de pièce d'identité (CNI, passeport ou permis de conduire)</li>
            <li>La prise d'un selfie en temps réel via votre téléphone</li>
          </ul>
          <p>Ces données sont traitées conformément à notre <Link to="/privacy" style={styles.link}>Politique de confidentialité</Link> et conservées pour une durée de 5 ans à compter de la soumission, conformément aux obligations légales en matière de lutte contre le blanchiment.</p>
        </Section>

        <Section title="6. Disponibilité du service">
          <p>myKado s'efforce de maintenir le service disponible 24h/24 et 7j/7, mais ne garantit pas une disponibilité sans interruption. Des maintenances planifiées ou des incidents techniques peuvent occasionner des interruptions temporaires.</p>
          <p>Les pages publiées restent accessibles tant que le compte est actif. En cas de résiliation du compte, les pages publiées peuvent être supprimées après un délai de 30 jours.</p>
        </Section>

        <Section title="7. Limitation de responsabilité">
          <p>myKado ne saurait être tenu responsable :</p>
          <ul>
            <li>Des pertes de données résultant d'un usage inapproprié du service</li>
            <li>Des problèmes techniques liés aux services tiers (KKiaPay, Cloudinary, Google)</li>
            <li>Du contenu publié par les utilisateurs</li>
            <li>Des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service</li>
          </ul>
        </Section>

        <Section title="8. Résiliation">
          <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre espace. La suppression entraîne la suppression de toutes vos créations et l'annulation de vos crédits non utilisés, sans remboursement.</p>
          <p>myKado se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU, sans préavis ni remboursement.</p>
        </Section>

        <Section title="9. Modifications des CGU">
          <p>myKado peut modifier les présentes CGU à tout moment. Les utilisateurs seront notifiés par email ou via l'interface au moins 15 jours avant l'entrée en vigueur des nouvelles conditions. La poursuite de l'utilisation du service après ce délai vaut acceptation des nouvelles conditions.</p>
        </Section>

        <Section title="10. Droit applicable">
          <p>Les présentes CGU sont régies par le droit béninois. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux de Cotonou, Bénin.</p>
        </Section>

        <div style={styles.footer}>
          <p>Pour toute question : <strong>support@mykado.app</strong></p>
          <p style={{ fontSize: 12 }}>Dernière mise à jour : {LAST_UPDATED}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <Link to="/privacy" style={styles.link}>Politique de confidentialité</Link>
            <Link to="/ewish-admin/register" style={styles.link}>Créer un compte</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionBody}>{children}</div>
    </section>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #fff1f4 0%, #fce7f3 30%, #fdf2ff 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#2B1A2D',
    padding: '0 0 60px',
  },
  container: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 36,
    borderBottom: '1.5px solid rgba(225,29,72,.1)',
    marginBottom: 32,
  },
  back: {
    display: 'inline-block',
    fontSize: 13,
    fontWeight: 600,
    color: '#E11D48',
    textDecoration: 'none',
    marginBottom: 20,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 999,
    background: 'rgba(225,29,72,.08)',
    color: '#E11D48',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 14,
    letterSpacing: '.04em',
  },
  title: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontStyle: 'italic',
    fontSize: 36,
    fontWeight: 400,
    lineHeight: 1.15,
    color: '#2B1A2D',
    margin: '0 0 12px',
  },
  meta: {
    fontSize: 13,
    color: '#9B7EBF',
    margin: 0,
  },
  section: {
    marginBottom: 32,
    background: '#fff',
    borderRadius: 18,
    padding: '24px 28px',
    boxShadow: '0 2px 8px rgba(43,26,45,.05)',
    border: '1.5px solid rgba(225,29,72,.06)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#2B1A2D',
    marginBottom: 14,
    marginTop: 0,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#3D2C3F',
  },
  link: {
    color: '#E11D48',
    fontWeight: 600,
    textDecoration: 'none',
  },
  footer: {
    marginTop: 40,
    padding: '24px 28px',
    background: '#fff',
    borderRadius: 18,
    border: '1.5px solid rgba(225,29,72,.1)',
    fontSize: 14,
    color: '#6B4E6D',
    lineHeight: 1.7,
  },
};
