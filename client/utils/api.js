import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // Always send cookies (needed for cross-domain auth)
});


export const getTemplates = () => api.get('/templates');
export const getTemplate = (name) => api.get(`/templates/${name}`);

export const getPublications = (params) => api.get('/publications', { params });
export const getPublicationById = (id) => api.get(`/publications/id/${id}`, { withCredentials: true });
export const getPremadePublications = () => api.get('/publications', { params: { premade: 'true' } });
export const getPublication = (templateName, customName) => api.get(`/publications/${templateName}/${customName}`);
export const createPublication = (data) => api.post('/publications', data);
export const updatePublication = (id, data) => api.patch(`/publications/${id}`, data);
export const publishPublication = (id) => api.post(`/publications/${id}/publish`);
//export const unpublishPublication = (id) => api.post(`/publications/${id}/unpublish`);
export const deletePublication = (id) => api.delete(`/publications/${id}`);

// export const uploadFile = (file) => {
//   const form = new FormData();
//   form.append('file', file);
//   return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
// };

/* ── Image compression (Canvas API, no deps) ─────────────────
   opts.maxWidth  : resize if wider  (default 1920)
   opts.maxHeight : resize if taller (default 1920)
   opts.quality   : JPEG/WebP quality 0-1 (default 0.82)
   opts.asBlob    : return Blob instead of File
   ────────────────────────────────────────────────────────── */
export function compressImage(file, opts = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
  } = opts;

  return new Promise((resolve, reject) => {
    // Skip non-images and tiny files (< 300 KB  not worth recompressing)
    if (!file.type.startsWith('image/') || file.size < 300_000) {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Compute new dimensions (keep aspect ratio)
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      if (h > maxHeight) { w = Math.round(w * maxHeight / h); h = maxHeight; }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      // Prefer WebP (best compression), fallback to original type
      const outType = ['image/webp', 'image/jpeg'].includes(file.type)
        ? 'image/webp'
        : file.type;

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file); // canvas failed → send original
          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: outType,
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        outType,
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); }; // fail safe
    img.src = url;
  });
}

/* Background images get extra compression (max 1400px, quality 0.75) */
export async function uploadFile(file, opts = {}) {
  const compressed = await compressImage(file, {
    maxWidth: opts.background ? 1400 : 1920,
    maxHeight: opts.background ? 1400 : 1920,
    quality: opts.background ? 0.75 : 0.82,
  });

  const form = new FormData();
  form.append('file', compressed);
  if (opts.background) form.append('hint', 'background'); // server can use this too
  return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export default api;

// ── Auth ──
export const login = (email, password) => api.post('/auth/login', { email, password }, { withCredentials: true });
export const register = (email, password, name) => api.post('/auth/register', { email, password, name }, { withCredentials: true });
export const googleLogin = (credential) => api.post('/auth/google', { credential }, { withCredentials: true });
export const logout = () => api.post('/auth/logout', {}, { withCredentials: true });
export const getMe = () => api.get('/auth/me', { withCredentials: true });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

// ── Orders ──
export const getOrders = (params) => api.get('/orders', { params, withCredentials: true });
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data, { withCredentials: true });
export const getOrderByPublication = (pubId) => api.get(`/orders/by-publication/${pubId}`, { withCredentials: true });

// ── Analytics ──
export const getAnalytics = (period) => api.get('/analytics', { params: { period }, withCredentials: true });

// ── Promos ──
export const getPromos = () => api.get('/promo', { withCredentials: true });
export const createPromo = (data) => api.post('/promo', data, { withCredentials: true });
export const updatePromo = (id, data) => api.patch(`/promo/${id}`, data, { withCredentials: true });
export const deletePromo = (id) => api.delete(`/promo/${id}`, { withCredentials: true });

// ── Wishes (admin moderation) ──
export const getWishes = (pubId) => api.get(`/wishes/${pubId}`, { withCredentials: true });
export const updateWish = (id, data) => api.patch(`/wishes/${id}`, data, { withCredentials: true });
export const deleteWish = (id) => api.delete(`/wishes/${id}`, { withCredentials: true });
export const getApprovedWishes = (pubId) => api.get(`/wishes/${pubId}/approved`, { withCredentials: true });

// ── Templates (admin update) ──
export const updateTemplate = (name, data) => api.patch(`/templates/${name}`, data, { withCredentials: true });

export const getShortLink = (id) => api.post(`/shortlinks/${id}`, {}, { withCredentials: true });
export const setCustomSlug = (id, slug) => api.patch(`/shortlinks/${id}`, { slug }, { withCredentials: true });

export const getFonts = () => api.get('/fonts');
export const uploadFont = (formData) => api.post('/fonts', formData, {
  withCredentials: true,
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteFont = (id) => api.delete(`/fonts/${id}`, { withCredentials: true });
export const duplicatePublication = (id, data) => api.post(`/publications/${id}/duplicate`, data, { withCredentials: true });

export const unpublishPublication = (id) => api.post(`/publications/${id}/unpublish`, {}, { withCredentials: true });

// ── Billing ──
export const buyCredits = (amount) => api.post('/billing/buy-credits', { amount }, { withCredentials: true });
export const verifyKkiapayTransaction = (transactionId) => api.post('/billing/kkiapay-verify', { transactionId }, { withCredentials: true });
export const applyPromoCode = (code) => api.post('/billing/apply-promo', { code }, { withCredentials: true });

// ── KYC ──
export const submitKyc              = (data)        => api.post('/kyc/submit', data, { withCredentials: true });
export const getKycStatus           = ()            => api.get('/kyc/status', { withCredentials: true });
export const generateKycMobileToken = ()            => api.post('/kyc/mobile-token', {}, { withCredentials: true });
export const verifyKycMobileToken   = (token)       => api.get(`/kyc/mobile-verify/${token}`);
export const submitKycMobile        = (token, d)    => api.post(`/kyc/mobile-submit/${token}`, d);
export const getKycList             = (params)      => api.get('/kyc/list', { params, withCredentials: true });
export const updateKycStatus        = (id, data)    => api.patch(`/kyc/${id}`, data, { withCredentials: true });

// ── Contributions ──
export const getContributions       = (pubId)       => api.get(`/contributions/${pubId}`);
export const getContributionStats   = (pubId)       => api.get(`/contributions/${pubId}/stats`);
export const verifyContribution     = (data)        => api.post('/contributions/verify', data);

// ── Super Admin ──
export const getSuperAdminStats  = ()         => api.get('/superadmin/stats');
export const getSuperAdminTransactions = (params) => api.get('/superadmin/transactions', { params });
export const getSuperAdminUsers  = (params)   => api.get('/superadmin/users', { params });
export const getSuperAdminUser   = (id)       => api.get(`/superadmin/users/${id}`);
export const updateSuperAdminUser= (id, data) => api.put(`/superadmin/users/${id}`, data);
export const deleteSuperAdminUser= (id)       => api.delete(`/superadmin/users/${id}`);

// ── Asset Bank ──
export const getAssets     = (type)  => api.get('/assets', { params: { type } });
export const uploadAsset   = (formData) => api.post('/assets', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateAsset   = (id, data) => api.put(`/assets/${id}`, data);
export const deleteAsset   = (id)    => api.delete(`/assets/${id}`);

// ── Suggestions ──
export const createSuggestion  = (data)       => api.post('/suggestions', data, { withCredentials: true });
export const getMySuggestions  = ()           => api.get('/suggestions/mine', { withCredentials: true });
export const getAllSuggestions  = (params)    => api.get('/suggestions', { params, withCredentials: true });
export const updateSuggestion  = (id, data)  => api.patch(`/suggestions/${id}`, data, { withCredentials: true });
export const deleteSuggestion  = (id)        => api.delete(`/suggestions/${id}`, { withCredentials: true });

// ── Prospects (super admin) ──
export const getProspects    = (params)    => api.get('/prospects', { params, withCredentials: true });
export const createProspect  = (data)      => api.post('/prospects', data, { withCredentials: true });
export const updateProspect  = (id, data)  => api.patch(`/prospects/${id}`, data, { withCredentials: true });
export const deleteProspect  = (id)        => api.delete(`/prospects/${id}`, { withCredentials: true });

// ── Settings ──
export const getSettings     = ()           => api.get('/settings');
export const updateSettings  = (data)       => api.put('/settings', data, { withCredentials: true });
