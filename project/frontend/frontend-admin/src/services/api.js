import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

// แนบ Token สำหรับ Admin/Seller (ถ้ามีระบบ Login แล้ว)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const storeAPI = {
  getAll: () => http.get('/stores/'), // ใส่ trailing slash ให้ตรงกับโครงสร้าง Flask Blueprint
  getById: (id) => http.get(`/stores/${id}`),
  create: (data) => http.post('/stores/', data),
  update: (id, data) => http.put(`/stores/${id}`, data),
  delete: (id) => http.delete(`/stores/${id}`),
};

export default http;