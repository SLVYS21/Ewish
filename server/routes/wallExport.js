/* ================================================================
   myKado — Wall export routes
     GET /api/walls/:pubId/export/pdf     → livre A5 des vœux
     GET /api/walls/:pubId/export/preview → HTML brut (debug / QA)
   Le mur étant publiquement lisible, l'export est public.
   Ajouter une auth ici si un usage privé apparaît.
   ================================================================ */

const router = require('express').Router();
const Publication = require('../models/Publication');
const Wish = require('../models/Wish');
const { renderWallBookPdf, buildBookHtml } = require('../services/wallBookPdf');

function safeSlug(s) {
  return String(s || 'mur')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'mur';
}

async function loadWallData(pubId) {
  const publication = await Publication.findById(pubId).lean();
  if (!publication) return { publication: null, wishes: [] };
  const wishes = await Wish.find({
    publicationId: pubId,
    approved: true,
    hidden: false,
    pendingPayment: { $ne: true },
  }).sort('createdAt').lean();
  return { publication, wishes };
}

router.get('/:pubId/export/pdf', async (req, res) => {
  try {
    const { publication, wishes } = await loadWallData(req.params.pubId);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    if (wishes.length === 0) {
      return res.status(422).json({ error: 'Ce mur ne contient encore aucun mot à imprimer.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdf = await renderWallBookPdf({ publication, wishes, baseUrl });
    /* Filename basé sur le prénom du destinataire seul (Sarah) plutôt que
       le titre complet ("Joyeux anniversaire, Sarah") — plus lisible dans
       l'explorateur de fichiers. Fallback legacy sur titleName/title pour
       les murs pré-migration où data.recipient contenait le titre. */
    const recipient = publication.data?.recipient
      || publication.data?.titleName
      || publication.title
      || 'mur';
    const filename = `livre-des-mots-${safeSlug(recipient)}.pdf`;
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    res.end(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Preview HTML — utile pour itérer sur la mise en page sans générer un PDF. */
router.get('/:pubId/export/preview', async (req, res) => {
  try {
    const { publication, wishes } = await loadWallData(req.params.pubId);
    if (!publication) return res.status(404).send('Publication not found');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const html = buildBookHtml({ publication, wishes, baseUrl });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
