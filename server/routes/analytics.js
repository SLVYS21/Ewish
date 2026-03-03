const router = require('express').Router();
const PageEvent = require('../models/PageEvent');
const Order = require('../models/Order');
const { requireAdmin } = require('../middleware/auth');
const { trackEvent } = require('../services/analytics');

// POST /api/track — public, receive pixel events from browser
router.post('/', async (req, res) => {
  try {
    const { event, templateName, value, fbp, fbc } = req.body;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    // Fire and forget
    trackEvent({ event, templateName, value, fbp, fbc, ipAddress, userAgent }).catch(console.error);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/analytics — admin dashboard stats
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalOrders, pendingOrders, confirmedOrders, deliveredOrders,
      totalRevenue, revenueArr,
      pageViews, viewContents, initiateCheckouts, purchases, leads,
      eventsByDay, ordersByTemplate, recentOrders,
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'delivered' }),

      // Total revenue (confirmed + delivered)
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'in_progress', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },
      ]),

      // Revenue by day
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $in: ['confirmed', 'in_progress', 'delivered'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$finalPrice' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Events
      PageEvent.countDocuments({ event: 'PageView', createdAt: { $gte: since } }),
      PageEvent.countDocuments({ event: 'ViewContent', createdAt: { $gte: since } }),
      PageEvent.countDocuments({ event: 'InitiateCheckout', createdAt: { $gte: since } }),
      PageEvent.countDocuments({ event: 'Purchase', createdAt: { $gte: since } }),
      PageEvent.countDocuments({ event: 'Lead', createdAt: { $gte: since } }),

      // Events by day
      PageEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, event: '$event' }, count: { $sum: 1 } } },
        { $sort: { '_id.date': 1 } },
      ]),

      // Orders by template
      Order.aggregate([
        { $group: { _id: '$templateName', count: { $sum: 1 }, revenue: { $sum: '$finalPrice' } } },
        { $sort: { count: -1 } },
      ]),

      // Recent orders
      Order.find({}).sort('-createdAt').limit(10).lean(),
    ]);

    const conversionRate = pageViews > 0 ? ((purchases / pageViews) * 100).toFixed(1) : 0;

    res.json({
      period,
      orders: { total: totalOrders, pending: pendingOrders, confirmed: confirmedOrders, delivered: deliveredOrders },
      revenue: { total: totalRevenue[0]?.total || 0, byDay: revenueArr },
      funnel: { pageViews, viewContents, initiateCheckouts, purchases, leads, conversionRate },
      eventsByDay,
      ordersByTemplate,
      recentOrders,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;