// ============================================================
// src/mock/data.js
// ข้อมูลจำลอง (Mock Data) ใช้แทน Backend ตอนที่ยังไม่พร้อม
// ============================================================

export const MALLS = [
  { id: 1, name: 'Smart Mall',            location: 'City Center',      store_count: 5,   is_popular: true, image: null },
  { id: 2, name: 'Grand Central Plaza',   location: 'Downtown Tokyo',   store_count: 230, is_popular: true, image: null },
  { id: 3, name: 'Shibuya Mall',          location: 'Shibuya District', store_count: 180, is_popular: true, image: null },
  { id: 4, name: 'Ginza Shopping Center', location: 'Ginza, Chuo City', store_count: 150, is_popular: true, image: null },
];

export const FLOORS = [
  { id: 1, mall_id: 1, name: 'Lower Ground', floor_code: 'LG', floor_order: 0, store_count: 1 },
  { id: 2, mall_id: 1, name: 'Ground Floor',  floor_code: 'G',  floor_order: 1, store_count: 2 },
  { id: 3, mall_id: 1, name: 'Floor 1',       floor_code: '1',  floor_order: 2, store_count: 2 },
];

export const STORES = [
  { id: 1, floor_id: 1, mall_id: 1, name: 'Food Court',    description: 'อาหารหลากหลายเมนูจากทั่วโลก',                  category_name: 'Food & Beverage', category_icon: '🍔', floor_name: 'Lower Ground', floor_code: 'LG', map_x: 200, map_y: 300 },
  { id: 2, floor_id: 2, mall_id: 1, name: 'Fashion Hub',   description: 'Trendy clothing and accessories for all ages',  category_name: 'Clothing',        category_icon: '👕', floor_name: 'Ground Floor', floor_code: 'G',  map_x: 120, map_y: 330 },
  { id: 3, floor_id: 2, mall_id: 1, name: 'Tech World',    description: 'Latest gadgets and electronics',                category_name: 'Electronics',     category_icon: '💻', floor_name: 'Ground Floor', floor_code: 'G',  map_x: 357, map_y: 285 },
  { id: 4, floor_id: 3, mall_id: 1, name: 'Beauty Lounge', description: 'Premium beauty and skincare products',          category_name: 'Beauty',          category_icon: '💄', floor_name: 'Floor 1',      floor_code: '1',  map_x: 180, map_y: 260 },
  { id: 5, floor_id: 3, mall_id: 1, name: 'Sports Zone',   description: 'Sporting goods and athletic wear',              category_name: 'Sports',          category_icon: '⚽', floor_name: 'Floor 1',      floor_code: '1',  map_x: 320, map_y: 310 },
];

// สินค้าในแต่ละร้าน
export const PRODUCTS = [
  { id: 1,  store_id: 2, name: 'Cotton T-Shirt',   price: 29.99,  stock: 45,  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
  { id: 2,  store_id: 2, name: 'Denim Jeans',       price: 79.99,  stock: 32,  image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200' },
  { id: 3,  store_id: 3, name: 'Wireless Earbuds',  price: 1299,   stock: 18,  image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200' },
  { id: 4,  store_id: 3, name: 'Smart Watch',       price: 2990,   stock: 7,   image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
  { id: 5,  store_id: 4, name: 'Face Serum',        price: 450,    stock: 60,  image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200' },
  { id: 6,  store_id: 4, name: 'Lip Palette',       price: 290,    stock: 24,  image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200' },
  { id: 7,  store_id: 5, name: 'Running Shoes',     price: 2490,   stock: 15,  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
  { id: 8,  store_id: 5, name: 'Sport Bottle',      price: 350,    stock: 80,  image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200' },
  { id: 9,  store_id: 1, name: 'Set Menu A',        price: 89,     stock: 999, image: null },
  { id: 10, store_id: 1, name: 'Set Menu B',        price: 109,    stock: 999, image: null },
];

export const RECENT_MALLS = [MALLS[0]];