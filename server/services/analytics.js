const PageEvent = require('../models/PageEvent');
const { sendFbEvent } = require('./facebook');
const { v4: uuidv4 } = require('uuid');

async function trackEvent({ event, templateName, orderId, value, fbp, fbc, ipAddress, userAgent }) {
  const fbEventId = uuidv4();
  const doc = await PageEvent.create({
    event, templateName, orderId, value, fbp, fbc, ipAddress, userAgent,
    fbSent: false, fbEventId,
  });
  // Send to FB CAPI
  const fbRes = await sendFbEvent({
    eventName: event, eventId: fbEventId,
    value, currency: 'XOF',
    fbp, fbc, ipAddress, userAgent,
    contentIds: templateName ? [templateName] : undefined,
    contentType: 'product',
  });
  if (fbRes) {
    await PageEvent.findByIdAndUpdate(doc._id, { fbSent: true, fbResponse: fbRes });
  }
  return doc;
}

module.exports = { trackEvent };