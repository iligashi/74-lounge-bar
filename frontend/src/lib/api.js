const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyToken: () => request('/auth/verify'),
  changePassword: (body) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),

  // Menu (public)
  getMenu: () => request('/menu/categories'),
  getFeatured: () => request('/menu/featured'),

  // Menu (admin)
  getAdminCategories: () => request('/menu/admin/categories'),
  createCategory: (body) => request('/menu/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, body) => request(`/menu/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/menu/admin/categories/${id}`, { method: 'DELETE' }),
  getAdminItems: () => request('/menu/admin/items'),
  createItem: (body) => request('/menu/admin/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id, body) => request(`/menu/admin/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteItem: (id) => request(`/menu/admin/items/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrders: (params) => request(`/orders/admin?${new URLSearchParams(params)}`),
  updateOrderStatus: (id, status) => request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getOrderStats: () => request('/orders/admin/stats'),

  // Reservations
  createReservation: (body) => request('/reservations', { method: 'POST', body: JSON.stringify(body) }),
  getReservations: (params) => request(`/reservations/admin?${new URLSearchParams(params)}`),
  updateReservationStatus: (id, status) => request(`/reservations/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getReservationStats: () => request('/reservations/admin/stats'),

  // Content
  getContent: () => request('/content'),
  updateContent: (items) => request('/content/admin', { method: 'PUT', body: JSON.stringify({ items }) }),

  // Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
