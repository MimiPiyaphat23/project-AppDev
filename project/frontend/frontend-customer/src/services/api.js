// ============================================================
// src/services/api.js
// ศูนย์กลางการเรียก API ทั้งหมดของแอป
//
// วิธีใช้:
//   ตอนนี้ (ยังไม่มี Backend) → USE_MOCK = true
//   พอ Backend พร้อม          → USE_MOCK = false  แค่นี้พอ
// ============================================================

import axios from 'axios';
import * as mock from '../mock/data';

// ====================================================
// 👇 เปลี่ยนตรงนี้ค่าเดียวเมื่อ Backend พร้อม
const USE_MOCK = false;
// ====================================================

// URL ของ Backend (อ่านจาก .env)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --------------------------------------------------
// Axios instance — ใช้เมื่อ USE_MOCK = false
// แนบ JWT Token อัตโนมัติทุก Request
// --------------------------------------------------
const http = axios.create({ 
  baseURL: BASE_URL, 
  timeout: 10000,
  headers: { 'ngrok-skip-browser-warning': 'true' } // <--- เพิ่มบรรทัดนี้
});

// แนบ Token ก่อนส่ง Request ทุกครั้ง
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ถ้า Token หมดอายุ (401) ให้ logout อัตโนมัติ
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/profile';
    }
    return Promise.reject(err);
  }
);

// --------------------------------------------------
// Helper — จำลอง delay เหมือนเรียก API จริง
// --------------------------------------------------
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const ok    = (data)      => ({ data: { success: true, data } });

// ============================================================
// Auth API — Login / Register / Profile
// หน้าที่เกี่ยวข้อง: ProfilePage
// ============================================================
export const authAPI = {

  // เข้าสู่ระบบ
  // Body: { email, password }
  login: USE_MOCK
    ? async ({ email, password }) => {
        await delay();
        // Mock: บัญชีทดสอบ test@mail.com / 1234
        if (email === 'test@mail.com' && password === '1234') {
          const user = { id: 1, username: 'Test User', email };
          localStorage.setItem('token', 'mock-token-123');
          return { data: { success: true, token: 'mock-token-123', user } };
        }
        throw { response: { data: { message: 'Email หรือ Password ไม่ถูกต้อง' } } };
      }
    : (data) => http.post('/auth/login', data),

  // สมัครสมาชิก
  // Body: { username, email, password }
  register: USE_MOCK
    ? async (data) => {
        await delay();
        const user = { id: 99, ...data };
        localStorage.setItem('token', 'mock-token-new');
        return { data: { success: true, token: 'mock-token-new', user } };
      }
    : (data) => http.post('/auth/register', data),

  // ดูโปรไฟล์ตัวเอง (ต้องมี Token)
  getProfile: USE_MOCK
    ? async () => {
        await delay(200);
        return { data: { success: true, user: { id: 1, username: 'Test User', email: 'test@mail.com' } } };
      }
    : () => http.get('/auth/profile'),
};

// ============================================================
// Mall API — รายการห้างสรรพสินค้า
// หน้าที่เกี่ยวข้อง: MallsPage
// ============================================================
export const mallAPI = {

  // ดึง Mall ทั้งหมด (ค้นหาด้วย search ได้)
  getAll: USE_MOCK
    ? async (search = '') => {
        await delay();
        const data = search
          ? mock.MALLS.filter(
              (m) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.location.toLowerCase().includes(search.toLowerCase())
            )
          : mock.MALLS;
        return ok(data);
      }
    : (search = '') => http.get('/malls/', { params: { search: search || '' } }),

  // ดึง Mall ยอดนิยม
  getPopular: USE_MOCK
    ? async () => { await delay(); return ok(mock.MALLS.filter((m) => m.is_popular)); }
    : () => http.get('/malls/popular'),

  // ดึง Mall ที่เพิ่งเข้าชมล่าสุด
  getRecent: USE_MOCK
    ? async () => { await delay(200); return ok(mock.RECENT_MALLS); }
    : () => http.get('/malls/recent/'),

  // ดูรายละเอียด Mall ตาม ID
  getById: USE_MOCK
    ? async (id) => { await delay(); return ok(mock.MALLS.find((m) => m.id === Number(id))); }
    : (id) => http.get(`/malls/${id}`),
};

// ============================================================
// Floor API — ข้อมูลชั้นของห้าง
// หน้าที่เกี่ยวข้อง: MapPage, StoresPage (Tab ด้านบน)
// ============================================================
export const floorAPI = {

  // ดึงชั้นทั้งหมดของ Mall (ใช้แสดง Tab: LG / G / 1)
  getByMall: USE_MOCK
    ? async (mallId) => {
        await delay();
        return ok(mock.FLOORS.filter((f) => f.mall_id === Number(mallId)));
      }
    : (mallId) => http.get(`/floors/mall/${mallId}`),

  // ดึงร้านค้าทั้งหมดในชั้นนั้น
  getStores: USE_MOCK
    ? async (floorId) => {
        await delay();
        return ok(mock.STORES.filter((s) => s.floor_id === Number(floorId)));
      }
    : (floorId) => http.get(`/floors/${floorId}/stores`),
};

// ============================================================
// Store API — ข้อมูลร้านค้า
// หน้าที่เกี่ยวข้อง: StoresPage, MapPage
// ============================================================
export const storeAPI = {

  // ดึงร้านค้าทั้งหมดใน Mall
  getByMall: USE_MOCK
    ? async (mallId) => {
        await delay();
        return ok(mock.STORES.filter((s) => s.mall_id === Number(mallId)));
      }
    : (mallId) => http.get(`/stores/mall/${mallId}`),

  // ดูรายละเอียดร้านค้าตาม ID
  getById: USE_MOCK
    ? async (id) => { await delay(); return ok(mock.STORES.find((s) => s.id === Number(id))); }
    : (id) => http.get(`/stores/${id}`),

  // ค้นหาร้านค้าใน Mall
  search: USE_MOCK
    ? async (mallId, q) => {
        await delay();
        return ok(
          mock.STORES.filter(
            (s) =>
              s.mall_id === Number(mallId) &&
              (s.name.toLowerCase().includes(q.toLowerCase()) ||
                s.category_name.toLowerCase().includes(q.toLowerCase()))
          )
        );
      }
    : (mallId, q) => http.get(`/stores/search?mall_id=${mallId}&q=${q}`),
};

// ============================================================
// Favorite API — รายการโปรด
// หน้าที่เกี่ยวข้อง: FavoritesPage
// ทุก endpoint ต้องการ Login (มี Token)
// ============================================================

// เก็บ favorites ไว้ใน memory ตอน mock (reset เมื่อ refresh หน้า)
let _favStores   = [];
let _favProducts = [];

export const favoriteAPI = {

  // ดึงร้านค้าโปรด
  getStores: USE_MOCK
    ? async () => { await delay(); return ok(_favStores); }
    : () => http.get('/favorites/stores'),

  // เพิ่มร้านค้าโปรด (รับ storeId)
  addStore: USE_MOCK
    ? async (storeId) => {
        await delay(200);
        const store = mock.STORES.find((s) => s.id === Number(storeId));
        if (store && !_favStores.find((s) => s.id === store.id)) {
          _favStores.push(store);
        }
        return ok(null);
      }
    : (storeId) => http.post('/favorites/stores', { store_id: storeId }),

  // ลบร้านค้าโปรด (รับ storeId)
  removeStore: USE_MOCK
    ? async (storeId) => {
        await delay(200);
        _favStores = _favStores.filter((s) => s.id !== Number(storeId));
        return ok(null);
      }
    : (storeId) => http.delete(`/favorites/stores/${storeId}`),

  // ดึงสินค้าโปรด
  getProducts: USE_MOCK
    ? async () => { await delay(); return ok(_favProducts); }
    : () => http.get('/favorites/products'),

  // เพิ่มสินค้าโปรด (รับ productId)
  addProduct: USE_MOCK
    ? async (productId) => {
        await delay(200);
        return ok(null);
      }
    : (productId) => http.post('/favorites/products', { product_id: productId }),

  // ลบสินค้าโปรด (รับ productId)
  removeProduct: USE_MOCK
    ? async (productId) => {
        await delay(200);
        _favProducts = _favProducts.filter((p) => p.id !== Number(productId));
        return ok(null);
      }
    : (productId) => http.delete(`/favorites/products/${productId}`),
};

// ============================================================
// Product API — สินค้าในร้าน (StoreProductsPage)
// ============================================================
export const productAPI = {

  // ดึงสินค้าทั้งหมดของร้านนั้น (รับ storeId)
  getByStore: USE_MOCK
    ? async (storeId) => {
        await delay();
        return ok(mock.PRODUCTS.filter((p) => p.store_id === Number(storeId)));
      }
    : (storeId) => http.get(`/products/store/${storeId}`),

  // ดูรายละเอียดสินค้าตาม ID
  getById: USE_MOCK
    ? async (id) => {
        await delay();
        return ok(mock.PRODUCTS.find((p) => p.id === Number(id)));
      }
    : (id) => http.get(`/products/${id}`),
};