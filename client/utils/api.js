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