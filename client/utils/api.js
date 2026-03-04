import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getTemplates = () => api.get('/templates');
export const getTemplate = (name) => api.get(`/templates/${name}`);

export const getPublications = () => api.get('/publications');
export const getPublication = (templateName, customName) => api.get(`/publications/${templateName}/${customName}`);
export const createPublication = (data) => api.post('/publications', data);
export const updatePublication = (id, data) => api.patch(`/publications/${id}`, data);
export const publishPublication = (id) => api.post(`/publications/${id}/publish`);
export const deletePublication = (id) => api.delete(`/publications/${id}`);

export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export default api;

// ── Auth ──
export const login = (email, password) => api.post('/auth/login', { email, password }, { withCredentials: true });
export const logout = () => api.post('/auth/logout', {}, { withCredentials: true });
export const getMe = () => api.get('/auth/me', { withCredentials: true });

// ── Orders ──
export const getOrders = (params) => api.get('/orders', { params, withCredentials: true });
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data, { withCredentials: true });

// ── Analytics ──
export const getAnalytics = (period) => api.get('/analytics', { params: { period }, withCredentials: true });

// ── Promos ──
export const getPromos = () => api.get('/promo', { withCredentials: true });
export const createPromo = (data) => api.post('/promo', data, { withCredentials: true });
export const updatePromo = (id, data) => api.patch(`/promo/${id}`, data, { withCredentials: true });
export const deletePromo = (id) => api.delete(`/promo/${id}`, { withCredentials: true });

// ── Wishes (admin moderation) ──
export const getWishes    = (pubId)       => api.get(`/wishes/${pubId}`,         { withCredentials: true });
export const updateWish   = (id, data)    => api.patch(`/wishes/${id}`, data,     { withCredentials: true });
export const deleteWish   = (id)          => api.delete(`/wishes/${id}`,          { withCredentials: true });

// ── Templates (admin update) ──
export const updateTemplate = (name, data) => api.patch(`/templates/${name}`, data, { withCredentials: true });