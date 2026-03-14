// ============================================================
// src/pages/StoreDetailPage.jsx
// หน้า Popup รายละเอียดร้านค้า (Image 1)
// เปิดขึ้นมาเมื่อกดไอคอนร้านบนแผนที่
// แสดง: ชื่อร้าน / หมวด / ชั้น / about / จำนวนสินค้า / ปุ่ม View Store
// ============================================================

import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { storeAPI, favoriteAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/layout/BottomNav';

export default function StoreDetailPage() {
  const { storeId }    = useParams(); // รับ id จาก URL /store/:storeId
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();

  // ดึงข้อมูลร้าน
  const { data: store, loading } = useFetch(
    () => storeAPI.getById(storeId),
    [storeId]
  );

  // ดึงสินค้าของร้านนี้ (เพื่อแสดงจำนวน)
  const { data: products } = useFetch(
    () => productAPI.getByStore(storeId),
    [storeId]
  );

  // กด Favorite
  const handleFavorite = async () => {
    if (!isLoggedIn) { navigate('/profile'); return; }
    await favoriteAPI.addStore(storeId);
  };

  if (loading) {
    return (
      <div style={{ background: '#f7f4fb', minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#aaa' }}>กำลังโหลด...</div>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div style={{ background: 'rgba(0,0,0,0.35)', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>

      {/* พื้นหลังมืด กดเพื่อปิด */}
      <div
        onClick={() => navigate(-1)}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />

      {/* ===== Bottom Sheet ===== */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'white', borderRadius: '20px 20px 0 0',
        padding: '12px 20px 40px',
        zIndex: 2,
        boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
      }}>

        {/* Handle bar */}
        <div style={{ width: 40, height: 4, background: '#e0d8ee', borderRadius: 2, margin: '0 auto 20px' }} />

        {/* ===== Store Header ===== */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* ไอคอนร้าน */}
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: '#f5f0f8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
            }}>
              {store.category_icon || '🏪'}
            </div>
            <div>
              {/* ชื่อร้าน */}
              <div style={{ fontWeight: 700, fontSize: 20, color: '#1a1a2e', marginBottom: 6 }}>
                {store.name}
              </div>
              {/* Badge หมวดหมู่ */}
              <span style={{
                background: '#5A3D4E', color: 'white',
                borderRadius: 20, padding: '3px 12px',
                fontSize: 12, fontWeight: 600,
              }}>
                {store.category_name}
              </span>
            </div>
          </div>

          {/* ปุ่ม Favorite */}
          <button
            onClick={handleFavorite}
            style={{
              background: '#f5f0f8', border: 'none', borderRadius: '50%',
              width: 40, height: 40, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >🤍</button>
        </div>

        {/* ===== Location ===== */}
        <div style={{
          background: '#f7f4fb', borderRadius: 10,
          padding: '12px 14px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>📍</span>
          <span style={{ fontSize: 14, color: '#555', fontWeight: 500 }}>
            Floor {store.floor_code}
          </span>
        </div>

        {/* ===== About ===== */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 6 }}>
            About
          </div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
            {store.description || 'ยังไม่มีรายละเอียดร้านค้า'}
          </div>
        </div>

        {/* ===== Available Products ===== */}
        <div style={{
          background: '#f7f4fb', borderRadius: 10,
          padding: '12px 14px', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 3 }}>
            Available Products
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>
            {products?.length || 0} products in stock
          </div>
        </div>

        {/* ===== Action Buttons ===== */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* ปุ่ม View Store — ไปหน้าสินค้าเต็ม */}
          <button
            onClick={() => navigate(`/store/${storeId}/products`)}
            style={{
              flex: 1, padding: '14px',
              background: '#5A3D4E', color: 'white',
              border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            ➤ View Store
          </button>

          {/* ปุ่ม Close */}
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '14px 24px',
              background: 'white', color: '#5A3D4E',
              border: '1.5px solid #d4c4dc',
              borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}