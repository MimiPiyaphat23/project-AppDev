// ============================================================
// src/pages/StoreProductsPage.jsx — รายการสินค้า + stock
// สีตรงตาม design: header #5C3352 (ม่วงเข้ม)
// ============================================================

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { storeAPI, productAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/layout/BottomNav';
import Icon, { CategoryIcon } from '../components/Icons';

// สีหลักของหน้านี้ตาม design
const HEADER_COLOR = '#5C3352'; // ม่วงเข้มเหมือนในรูป
const HEART_COLOR  = '#C9B8D4'; // ม่วงอ่อน (หัวใจ unfavorited)
const STOCK_COLOR  = '#2D2D3A'; // เทาเข้มมาก (badge stock)

// ============================================================
// ProductCard — การ์ดสินค้าแต่ละชิ้น
// ============================================================
function ProductCard({ product, onFavorite }) {
  const [fav, setFav] = useState(false);

  // สี badge stock ตามจำนวนที่เหลือ
  const stockBg = product.stock > 20
    ? STOCK_COLOR       // เยอะ — เทาเข้ม
    : product.stock > 5
    ? '#7A3B1E'         // น้อย — น้ำตาล
    : '#8B1A1A';        // น้อยมาก — แดง

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'white', borderRadius: 14,
      marginBottom: 12, overflow: 'hidden',
      boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
    }}>
      {/* รูปสินค้า */}
      <div style={{ width: 88, height: 88, flexShrink: 0, overflow: 'hidden' }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f0edf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="package" size={28} color="#c4aed4" strokeWidth={1.4} />
          </div>
        )}
      </div>

      {/* ข้อมูลสินค้า */}
      <div style={{ flex: 1, padding: '0 12px' }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', marginBottom: 7 }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* ราคา */}
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
            ฿{product.price.toLocaleString()}
          </span>
          {/* badge stock */}
          <span style={{
            background: stockBg, color: 'white',
            borderRadius: 20, padding: '3px 11px',
            fontSize: 12, fontWeight: 600,
          }}>
            {product.stock >= 999 ? 'Available' : `${product.stock} left`}
          </span>
        </div>
      </div>

      {/* ปุ่ม heart — สีม่วงอ่อนตาม design */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFav(f => !f);
          onFavorite(product.id);
        }}
        style={{
          background: 'none', border: 'none',
          padding: '0 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Icon
          name={fav ? 'heart-fill' : 'heart'}
          size={22}
          color={fav ? '#C9B8D4' : '#C9B8D4'}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}

// ============================================================
// StoreProductsPage
// ============================================================
export default function StoreProductsPage() {
  const { storeId }    = useParams();
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();
  const [storeFav, setStoreFav] = useState(false);

  const { data: store }             = useFetch(() => storeAPI.getById(storeId),    [storeId]);
  const { data: products, loading } = useFetch(() => productAPI.getByStore(storeId), [storeId]);

  const handleFavoriteProduct = async (productId) => {
    if (!isLoggedIn) { navigate('/profile'); return; }
    await favoriteAPI.addProduct(productId);
  };

  const handleFavoriteStore = async () => {
    if (!isLoggedIn) { navigate('/profile'); return; }
    await favoriteAPI.addStore(storeId);
    setStoreFav(true);
  };

  return (
    <div style={{ background: '#F5F2F8', minHeight: '100vh' }}>

      {/* ===== Header — ม่วงเข้มตาม design ===== */}
      <div style={{ background: HEADER_COLOR, padding: '48px 16px 18px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* ปุ่มย้อนกลับ */}
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                width: 32, height: 32, borderRadius: 9,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="arrow-left" size={17} color="white" />
            </button>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{store?.name || 'Store'}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>{store?.category_name}</div>
            </div>
          </div>

          {/* ปุ่ม heart ด้านขวา — วงกลมม่วงอ่อน */}
          <button
            onClick={handleFavoriteStore}
            style={{
              background: 'rgba(255,255,255,0.18)', border: 'none',
              width: 34, height: 34, borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon
              name={storeFav ? 'heart-fill' : 'heart'}
              size={17}
              color="white"
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* ===== Store Info Card ===== */}
        <div style={{
          background: 'white', borderRadius: 14,
          padding: '14px 16px', marginBottom: 20,
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* ไอคอน category */}
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: '#f5f0f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CategoryIcon categoryName={store?.category_name} size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
              {store?.name}
            </div>
            <div style={{ color: '#999', fontSize: 13, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="map-pin" size={12} color="#bbb" />
              Floor {store?.floor_code} • {store?.category_name}
            </div>
          </div>
        </div>

        {/* ===== Products Header ===== */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#1a1a1a' }}>Products</div>
          <span style={{
            background: '#ede8f2', color: '#5C3352',
            borderRadius: 20, padding: '3px 12px',
            fontSize: 13, fontWeight: 600,
          }}>
            {products?.length || 0} items
          </span>
        </div>

        {/* ===== Product List ===== */}
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', background: 'white', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ width: 88, height: 88, background: '#f0edf5', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '14px' }}>
                <div style={{ width: '60%', height: 14, background: '#f0edf5', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ width: '40%', height: 12, background: '#f5f0f8', borderRadius: 6 }} />
              </div>
            </div>
          ))
        ) : products?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#aaa' }}>
            <Icon name="package" size={40} color="#ddd" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 15 }}>ยังไม่มีสินค้า</div>
          </div>
        ) : (
          products?.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onFavorite={handleFavoriteProduct}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}