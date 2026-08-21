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
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = file.mimetype.startsWith('pdf/');
    cb(null, true);
  },
});


router.post('/:pubId/export/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  const wallId = req.params.pubId;
  const pdfFilePath = req.file.path;

  const size = req.body.size || 'A4';
  const totalWords = Number(req.body.totalWords) || 0;

  const publication = await Publication.findById(wallId);
  if (!publication) return res.status(404).json({ error: 'Publication not found' });

  const result = await cloudinary.uploader.upload(pdfFilePath, {
    resource_type: 'raw',
    folder: 'ewishes/pdfs'
  });

  publication.pdfUrl = result.secure_url;
  publication.pdfConfig = {
    ...publication.pdfConfig,
    size: size,
    totalWords: totalWords,
  };
  await publication.save();
  res.status(200).json({ message: 'PDF uploaded and cached successfully', url: result.secure_url });
});


router.get('/:pubId/export/pdf', async (req, res) => {
  try {
    const { publication, wishes } = await loadWallData(req.params.pubId);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    if (wishes.length === 0) {
      return res.status(422).json({ error: 'Ce mur ne contient encore aucun mot à imprimer.' });
    }

    const { layout = 'book', bg = 'wall' } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdf = await renderWallBookPdf({ publication, wishes, baseUrl, layout, bgMode: bg });
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

/* Data JSON — consommée par @react-pdf/renderer côté client pour générer
   le PDF sans passer par Puppeteer/serveur. Retourne uniquement ce dont
   le composant WallBookPdfDoc a besoin (mêmes champs que loadWallData). */
router.get('/:pubId/export/data', async (req, res) => {
  try {
    const { publication, wishes } = await loadWallData(req.params.pubId);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });
    res.json({
      publication: {
        _id: publication._id,
        title: publication.title,
        data: publication.data || {},
        style: publication.style || {},
        thankYouMessage: publication.thankYouMessage || '',
      },
      wishes: wishes.map(w => ({
        _id: w._id,
        firstName: w.firstName,
        role: w.role,
        message: w.message,
        color: w.color ?? 0,
        mediaType: w.mediaType,
        photoUrl: w.photoUrl,
        videoUrl: w.videoUrl,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Preview HTML — utile pour :
   1. itérer sur la mise en page sans générer un PDF (mode debug)
   2. servir la page à imprimer côté client (?print=1) : le navigateur
      ouvre la boîte "Imprimer" qui propose "Enregistrer en PDF". C'est
      le remplacement léger de Puppeteer côté serveur.
   Query : ?layout=book|mosaic  ?bg=wall|clean  ?print=1 */
router.get('/:pubId/export/preview', async (req, res) => {
  try {
    const { publication, wishes } = await loadWallData(req.params.pubId);
    if (!publication) return res.status(404).send('Publication not found');
    const { layout = 'book', bg = 'wall', print } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const html = buildBookHtml({
      publication,
      wishes,
      baseUrl,
      layout,
      bgMode: bg,
      print: print === '1' || print === 'true',
    });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
