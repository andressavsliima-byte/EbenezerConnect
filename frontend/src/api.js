import axios from 'axios';

const API_URL = '/api';

// Instância base do Axios
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: injeta token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: trata 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    // 403 de usuário desativado continua forçando logout
    if (status === 403 && message === 'Usuário desativado') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/?reason=inactive';
      return Promise.reject(err);
    }

    // 401 agora é tratado de forma branda: mantém token/user para evitar sumiço de dados locais
    return Promise.reject(err);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Products APIs
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySku: (sku) => api.get(`/products/sku/${encodeURIComponent(sku)}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  recalculateMetals: () => api.post('/products/recalculate-metals'),
  downloadPriceSheet: () => api.get('/products/price-sheet', { responseType: 'blob' }),
  importPriceSheet: (formData) => api.post('/products/price-sheet/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Orders APIs
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getMine: () => api.get('/orders/user/my-orders'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status, note) => api.put(`/orders/${id}`, { status, adminNotes: note }),
  // Lixeira
  getTrash: () => api.get('/orders', { params: { trash: true } }),
  moveToTrash: (id) => api.put(`/orders/${id}/trash`),
  restore: (id) => api.put(`/orders/${id}/restore`),
  hardDelete: (id) => api.delete(`/orders/${id}`),
};

// Users APIs (Admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  setActive: (id, isActive) => api.put(`/users/${id}/active`, { isActive }),
};

// Messages APIs
export const messagesAPI = {
  getAll: () => api.get('/messages'),
  getUnreadCount: () => api.get('/messages/unread/count'),
  markAsRead: (id, isRead = true) => api.put(`/messages/${id}/read`, { isRead }),
  moveToTrash: (id) => api.delete(`/messages/${id}`),
  getTrash: () => api.get('/messages/trash'),
  restore: (id) => api.put(`/messages/${id}/restore`),
  hardDelete: (id) => api.delete(`/messages/${id}/hard`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Upload APIs
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (filename) => api.delete(`/upload/${filename}`),
};

// Settings APIs
export const settingsAPI = {
  getMetalPricingConfig: () => api.get('/settings/metal-pricing'),
  updateMetalPricingConfig: (data) => api.put('/settings/metal-pricing', data),
};

export const formulasAPI = {
  getSheet: (params) => api.get('/formulas', { params }),
  updateSheet: (payload) => api.put('/formulas', payload),
};

// Promos/Banners APIs
export const promosAPI = {
  getPublic: () => api.get('/promos'),
  getAll: () => api.get('/promos/all'),
  create: (data) => api.post('/promos', data),
  update: (id, data) => api.put(`/promos/${id}`, data),
  remove: (id) => api.delete(`/promos/${id}`),
  // Upload image directly attached to a promo (multipart form-data)
  uploadImage: (id, formData, config = {}) => api.post(`/promos/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, ...config }),
};

// Partner Levels APIs
export const partnerLevelsAPI = {
  list: () => api.get('/partner-levels'),
  create: (payload) => api.post('/partner-levels', payload),
  update: (id, payload) => api.put(`/partner-levels/${id}`, payload),
  remove: (id, force = false) => api.delete(`/partner-levels/${id}${force ? '?force=true' : ''}`),
};

export default api;
