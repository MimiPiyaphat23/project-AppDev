import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => http.post('/auth/login', data),
  getProfile: () => http.get('/auth/profile'),
}

export const storeAPI = {
  getAll: () => http.get('/stores/'),
  getById: (id) => http.get(`/stores/${id}`),
  getByMall: (mallId) => http.get(`/stores/mall/${mallId}`),
  create: (data) => http.post('/stores/', data),
  update: (id, data) => http.put(`/stores/${id}`, data),
  delete: (id) => http.delete(`/stores/${id}`),
}

export default http
