// const router = require('express').Router();
// const multer = require('multer');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs');

// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${uuidv4()}${ext}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|gif|webp|svg|mp3|wav|ogg|m4a/;
//   const ext = path.extname(file.originalname).toLowerCase().slice(1);
//   if (allowed.test(ext)) cb(null, true);
//   else cb(new Error('File type not allowed'), false);
// };

// const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// router.post('/', upload.single('file'), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//   const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//   res.json({ url, filename: req.file.filename });
// });



// module.exports = router;

const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith('audio/');
    return {
      folder: isAudio ? 'ewishwell/audio' : 'ewishwell/images',
      resource_type: isAudio ? 'video' : 'image',
      public_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...(isAudio ? {} : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image|audio)\//.test(file.mimetype);
    cb(ok ? null : new Error('Type non supporté'), ok);
  },
});

// POST /api/upload
router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
    res.json({ url: req.file.path, publicId: req.file.filename });
  });
});

// GET /api/upload/sign — signed params for direct browser upload
router.get('/sign', (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: 'ewishwell' };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  res.json({ signature, timestamp, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});

module.exports = router;