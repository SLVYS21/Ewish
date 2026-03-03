const fetch = require('node-fetch');
const crypto = require('crypto');

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

function hash(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

/**
 * Send an event to Facebook Conversions API
 */
async function sendFbEvent({
  eventName,
  eventId,
  eventTime,
  value,
  currency = 'XOF',
  email,
  phone,
  fbp,
  fbc,
  ipAddress,
  userAgent,
  contentIds,
  contentType,
}) {
  const pixelId = process.env.FB_PIXEL_ID;
  const accessToken = process.env.FB_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('⚠️  FB Conversions API not configured — skipping');
    return null;
  }

  const userData = {};
  if (email)     userData.em      = [hash(email)];
  if (phone)     userData.ph      = [hash(phone)];
  if (fbp)       userData.fbp     = fbp;
  if (fbc)       userData.fbc     = fbc;
  if (ipAddress) userData.client_ip_address = ipAddress;
  if (userAgent) userData.client_user_agent = userAgent;

  const customData = {};
  if (value !== undefined) customData.value    = value;
  if (currency)            customData.currency = currency;
  if (contentIds)          customData.content_ids = contentIds;
  if (contentType)         customData.content_type = contentType;

  const event = {
    event_name:   eventName,
    event_time:   eventTime || Math.floor(Date.now() / 1000),
    event_id:     eventId,
    action_source: 'website',
    user_data:    userData,
    custom_data:  Object.keys(customData).length ? customData : undefined,
  };

  const body = {
    data: [event],
    ...(process.env.FB_TEST_EVENT_CODE && { test_event_code: process.env.FB_TEST_EVENT_CODE }),
  };

  try {
    const r = await fetch(`${GRAPH_URL}/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.error) console.error('FB CAPI error:', data.error);
    return data;
  } catch (e) {
    console.error('FB CAPI fetch error:', e.message);
    return null;
  }
}

module.exports = { sendFbEvent };