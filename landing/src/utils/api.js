// Dev:  '' → Vite proxy /api → localhost:5000
// Prod: https://api.ewishes.com
const BASE = import.meta.env.VITE_API_URL ?? '';

async function req(method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const getTemplates  = ()       => req('GET',  '/templates');
export const createOrder   = (data)   => req('POST', '/orders', data);
export const checkPromo    = (code, templateName) =>
  req('POST', '/promo/check', { code, templateName });

// Facebook server-side tracking (fires alongside client fbq())
export const trackEvent = (eventName, data) =>
  req('POST', '/track', { eventName, ...data }).catch(() => {}); // silent fail OK