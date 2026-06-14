import { Link } from 'react-router-dom';

const LAST_UPDATED = '30 mai 2026';

export default function PrivacyPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <Link to="/ewish-admin/login" style={styles.back}>← Retour</Link>
          <div style={styles.badge}>Confidentialité</div>
          <h1 style={styles.title}>Politique de Confidentialité</h1>
          <p style={styles.meta}>myKado · En vigueur à partir du {LAST_UPDATED}</p>
        </div>

        <InfoBox>
          myKado s'engage à protéger vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, comment nous les utilisons et vos droits à leur égard.
        </InfoBox>

        <Section title="1. Responsable du traitement">
          <p><strong>myKado</strong> est responsable du traitement de vos données personnelles.</p>
          <p>Contact : <strong>privacy@mykado.store</strong></p>
        </Section>

        <Section title="2. Données collectées">
          <SubTitle>2.1 Données de compte</SubTitle>
          <DataTable rows={[
            ['Nom complet',    'Inscription',          'Personnalisation du compte',                '5 ans après clôture du compte'],
            ['Adresse email',  'Inscription / Google', 'Connexion, notifications, support',         '5 ans après clôture du compte'],
            ['Identifiant Google (sub)', 'Connexion Google', 'Authentification OAuth',              '5 ans après clôture du compte'],
            ['Mot de passe hashé (bcrypt)', 'Inscription', 'Authentification sécurisée',           'Durée du compte'],
            ['Rôle (marchand / admin)', 'Inscription', 'Contrôle des accès',                       'Durée du compte'],
            ['Crédits restants', 'Achat',              'Gestion des droits de publication',         'Durée du compte'],
            ['Date de dernière connexion', 'Auto', 'Sécurité du compte',                          '1 an'],
          ]} />

          <SubTitle>2.2 Contenu des créations</SubTitle>
          <DataTable rows={[
            ['Titres, textes des pages-événements', 'Création',  'Affichage de la page publiée', "Durée de la publication + 30 jours après suppression"],
            ['Photos et images uploadées', 'Upload',             'Affichage dans la page',       "Durée de la publication + 30 jours après suppression"],
            ['Fichiers audio (musique)',  'Upload',              'Lecture dans la page',          "Durée de la publication + 30 jours après suppression"],
            ['Vœux soumis par les visiteurs', 'Soumission',      'Affichage dans la boîte à vœux', 'Durée de la publication'],
          ]} />

          <SubTitle>2.3 Données KYC (vérification d'identité)</SubTitle>
          <p>Collectées uniquement lors de la demande de vérification pour accéder aux fonctionnalités de cagnotte :</p>
          <DataTable rows={[
            ['Nom complet déclaré',           'Formulaire KYC', 'Vérification d\'identité', '5 ans (obligation légale LCB-FT)'],
            ['Photo de pièce d\'identité',     'Upload mobile',  'Vérification d\'identité', '5 ans (obligation légale LCB-FT)'],
            ['Selfie (photo en temps réel)',   'Caméra mobile',  'Vérification d\'identité', '5 ans (obligation légale LCB-FT)'],
            ['Type de document (CNI, passeport…)', 'Formulaire', 'Catégorisation',           '5 ans (obligation légale LCB-FT)'],
            ['Statut KYC et motif éventuel de rejet', 'Admin', 'Traçabilité des décisions', '5 ans'],
          ]} />
          <p style={{ fontSize: 13, color: '#9B7EBF', marginTop: 8 }}>
            Les fichiers KYC sont stockés sur <strong>Cloudinary</strong> (voir section 5). La durée de 5 ans est imposée par la réglementation béninoise sur la lutte contre le blanchiment de capitaux et le financement du terrorisme (LCB-FT).
          </p>

          <SubTitle>2.4 Données de paiement</SubTitle>
          <p>myKado <strong>ne stocke aucune donnée bancaire ou de Mobile Money</strong>. Les paiements sont intégralement traités par <strong>KKiaPay</strong>. Nous conservons uniquement :</p>
          <DataTable rows={[
            ['ID de transaction KKiaPay', 'Paiement',    'Réconciliation comptable / preuve de paiement', '5 ans'],
            ['Montant et nombre de crédits achetés', 'Paiement', 'Historique des achats',                '5 ans'],
          ]} />

          <SubTitle>2.5 Données techniques</SubTitle>
          <DataTable rows={[
            ['Logs d\'accès (IP, user-agent)', 'Automatique', 'Sécurité et débogage', '90 jours'],
            ['Cookies de session (JWT httpOnly)', 'Connexion', 'Maintien de la session', '7 jours'],
          ]} />
        </Section>

        <Section title="3. Bases légales du traitement">
          <ul>
            <li><strong>Exécution du contrat</strong>  données de compte, créations, paiements</li>
            <li><strong>Consentement explicite</strong>  connexion Google, cookie de session</li>
            <li><strong>Obligation légale</strong>  données KYC (LCB-FT), données de paiement (comptabilité)</li>
            <li><strong>Intérêt légitime</strong>  logs de sécurité, statistiques anonymisées</li>
          </ul>
        </Section>

        <Section title="4. Partage des données">
          <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec :</p>
          <ul>
            <li><strong>KKiaPay</strong>  traitement des paiements (email, montant). <a href="https://kkiapay.me/privacy" target="_blank" rel="noopener noreferrer" style={styles.extLink}>Politique KKiaPay ↗</a></li>
            <li><strong>Cloudinary</strong>  hébergement des médias (photos, audio, documents KYC). Les fichiers sont stockés dans des espaces sécurisés et accessibles uniquement via URL signée. <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.extLink}>Politique Cloudinary ↗</a></li>
            <li><strong>Google</strong>  si vous utilisez la connexion Google (votre adresse email et votre identifiant Google nous sont transmis). <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={styles.extLink}>Politique Google ↗</a></li>
            <li><strong>Autorités légales</strong>  si requis par une décision de justice ou obligation réglementaire.</li>
          </ul>
        </Section>

        <Section title="5. Hébergement et sécurité">
          <p><strong>Hébergement :</strong> Les données sont hébergées sur des serveurs situés dans l'Union Européenne (MongoDB Atlas, Railway ou Render). Les médias sont hébergés sur Cloudinary (serveurs UE et USA).</p>
          <p><strong>Sécurité :</strong></p>
          <ul>
            <li>Mots de passe hashés avec bcrypt (facteur 12)</li>
            <li>Authentification par JWT httpOnly, secure, sameSite:none</li>
            <li>Connexions chiffrées TLS/HTTPS sur toutes les communications</li>
            <li>Accès aux données KYC restreint aux super-administrateurs habilités</li>
          </ul>
        </Section>

        <Section title="6. Cookies">
          <p>myKado utilise un seul cookie essentiel :</p>
          <DataTable rows={[
            ['ww_admin_token', 'Session', 'Maintien de la connexion (JWT)', 'httpOnly, secure  7 jours'],
          ]} />
          <p>Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
        </Section>

        <Section title="7. Vos droits">
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la réglementation béninoise applicable, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong>  obtenir une copie des données vous concernant</li>
            <li><strong>Droit de rectification</strong>  corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong>  demander la suppression de vos données (sauf obligations légales)</li>
            <li><strong>Droit à la portabilité</strong>  recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition</strong>  vous opposer à certains traitements basés sur l'intérêt légitime</li>
            <li><strong>Droit de retrait du consentement</strong>  pour les traitements basés sur votre consentement</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à : <strong>privacy@mykado.store</strong></p>
          <p>Nous répondons dans un délai de 30 jours.</p>
        </Section>

        <Section title="8. Modifications">
          <p>Nous pouvons mettre à jour cette politique. En cas de modification substantielle, vous serez notifié par email. La date de dernière mise à jour est indiquée en haut de cette page.</p>
        </Section>

        <div style={styles.footer}>
          <p>Questions sur vos données ? <strong>privacy@mykado.app</strong></p>
          <p style={{ fontSize: 12 }}>Dernière mise à jour : {LAST_UPDATED}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <Link to="/terms" style={styles.link}>Conditions d'utilisation</Link>
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

function SubTitle({ children }) {
  return <h3 style={{ fontSize: 14, fontWeight: 800, color: '#2B1A2D', marginTop: 20, marginBottom: 10 }}>{children}</h3>;
}

function InfoBox({ children }) {
  return (
    <div style={{
      background: 'rgba(225,29,72,.06)',
      border: '1.5px solid rgba(225,29,72,.15)',
      borderRadius: 14,
      padding: '16px 20px',
      fontSize: 14,
      color: '#7A1E35',
      lineHeight: 1.65,
      marginBottom: 28,
      fontWeight: 500,
    }}>
      {children}
    </div>
  );
}

function DataTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9F0FC' }}>
            <th style={styles.th}>Donnée</th>
            <th style={styles.th}>Source</th>
            <th style={styles.th}>Finalité</th>
            <th style={styles.th}>Conservation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FDF5FF' }}>
              {row.map((cell, j) => (
                <td key={j} style={styles.td}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    maxWidth: 860,
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
    marginBottom: 24,
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
  extLink: {
    color: '#6E4FBA',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: 12,
  },
  footer: {
    marginTop: 32,
    padding: '24px 28px',
    background: '#fff',
    borderRadius: 18,
    border: '1.5px solid rgba(225,29,72,.1)',
    fontSize: 14,
    color: '#6B4E6D',
    lineHeight: 1.7,
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 700,
    color: '#6E4FBA',
    fontSize: 11.5,
    borderBottom: '1.5px solid #F0E8F6',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '9px 12px',
    borderBottom: '1px solid #F5EDF8',
    color: '#3D2C3F',
    verticalAlign: 'top',
    lineHeight: 1.5,
  },
};
