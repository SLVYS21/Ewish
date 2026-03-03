const router = require('express').Router();
const Wish = require('../models/Wish');
const Publication = require('../models/Publication');

// POST /api/wishes/:publicationId — submit a wish (public, no auth)
router.post('/:publicationId', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.publicationId).lean();
    if (!pub) return res.status(404).json({ error: 'Publication not found' });

    const { firstName, role, message, photoUrl } = req.body;
    if (!firstName?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'firstName and message are required' });
    }

    const wish = await Wish.create({
      publicationId: req.params.publicationId,
      firstName: firstName.trim(),
      role: role?.trim() || '',
      message: message.trim(),
      photoUrl: photoUrl || '',
      approved: false,
    });

    res.status(201).json({ success: true, id: wish._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wishes/:publicationId — list all wishes (admin)
router.get('/:publicationId', async (req, res) => {
  try {
    const wishes = await Wish.find({ publicationId: req.params.publicationId })
      .sort('-createdAt').lean();
    res.json(wishes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wishes/:publicationId/approved — approved + not hidden (for template display)
router.get('/:publicationId/approved', async (req, res) => {
  try {
    const wishes = await Wish.find({
      publicationId: req.params.publicationId,
      approved: true,
      hidden: false,
    }).sort('createdAt').lean();
    res.json(wishes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/wishes/:id — approve or hide
router.patch('/:id', async (req, res) => {
  try {
    const wish = await Wish.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!wish) return res.status(404).json({ error: 'Not found' });
    res.json(wish);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/wishes/:id
router.delete('/:id', async (req, res) => {
  try {
    await Wish.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;