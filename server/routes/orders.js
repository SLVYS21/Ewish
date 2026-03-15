const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Promo = require('../models/Promo');
const Template = require('../models/Template');
const { requireAdmin } = require('../middleware/auth');
const { sendFbEvent } = require('../services/facebook');
const { trackEvent } = require('../services/analytics');

// POST /api/orders — public, create order from landing page
router.post('/', async (req, res) => {
  try {
    const { templateName, client, recipientName, occasion, notes, promoCode, fbp, fbc } = req.body;

    // console.log(await Template.find().select('name active').lean());
    const template = await Template.findOne({ name: templateName });
    if (!template) return res.status(404).json({ error: 'Template introuvable' });

    let basePrice = template.price;
    let finalPrice = basePrice;
    let promoDiscount = 0;
    let usedPromo = null;

    // Apply promo code
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase() });
      if (promo) {
        const check = promo.isValid(basePrice);
        if (check.ok) {
          // Check template restriction
          if (promo.templates.length === 0 || promo.templates.includes(templateName)) {
            promoDiscount = promo.computeDiscount(basePrice);
            finalPrice = Math.max(0, basePrice - promoDiscount);
            usedPromo = promo;
          }
        }
      }
    }

    const fbEventId = uuidv4();
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const order = await Order.create({
      templateName,
      templateLabel: template.label,
      basePrice,
      finalPrice,
      promoCode: usedPromo?.code,
      promoDiscount,
      client,
      recipientName,
      occasion,
      notes,
      fbEventId,
      ipAddress,
      userAgent,
      fbp,
      fbc,
    });

    // Increment promo usage
    if (usedPromo) {
      await Promo.findByIdAndUpdate(usedPromo._id, { $inc: { usedCount: 1 } });
    }

    // Track Purchase event
    await trackEvent({ event: 'Purchase', templateName, orderId: order._id, value: finalPrice });
    await sendFbEvent({
      eventName: 'Purchase',
      eventId: fbEventId,
      value: finalPrice,
      currency: 'XOF',
      email: client.email,
      phone: client.phone,
      fbp, fbc,
      ipAddress, userAgent,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      finalPrice,
      promoDiscount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/orders — admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter).sort('-createdAt').skip((page-1)*limit).limit(+limit).lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: +page, pages: Math.ceil(total/limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/orders/:id
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/orders/:id — update status or link publication
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;