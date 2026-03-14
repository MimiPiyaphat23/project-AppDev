// src/pages/FavoritesPage.jsx — หน้ารายการโปรด (Image 3)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { favoriteAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState('stores'); // 'stores' | 'products'

  const { data: favStores, loading: loadingStores, refetch } = useFetch(
    () => favoriteAPI.getStores(), [isLoggedIn]
  );
  const { data: favProducts, loading: loadingProducts } = useFetch(
    () => favoriteAPI.getProducts(), [isLoggedIn]
  );

  const handleRemoveStore = async (storeId) => {
    await favoriteAPI.removeStore(storeId);
    refetch();
  };

  const isEmpty = tab === 'stores' ? !favStores?.length : !favProducts?.length;
  const loading = tab === 'stores' ? loadingStores : loadingProducts;

  return (
    <div style={{ background: '#f7f5f8', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#5A3D4E', padding: '16px 20px 0', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>←</button>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>My Favorites</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {(favStores?.length || 0) + (favProducts?.length || 0)} saved items
              </div>
            </div>
          </div>
          <span style={{ fontSize: 22 }}>🤍</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 3, marginBottom: -1 }}>
          {['stores', 'products'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#5A3D4E' : 'rgba(255,255,255,0.8)',
              fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>
              Favorite {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>กำลังโหลด...</div>
        ) : isEmpty ? (
          /* Empty State */
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#f0edf5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 30, margin: '0 auto 20px',
            }}>🤍</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#333', marginBottom: 8 }}>No Favorites Yet</div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Start adding {tab} to your favorites to easily find them later
            </div>
            <button onClick={() => navigate('/stores')} style={{
              background: '#5A3D4E', color: 'white', border: 'none',
              borderRadius: 10, padding: '12px 24px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: 8,
            }}>
              🗺️ Browse Stores
            </button>
          </div>
        ) : (
          /* Filled State */
          (tab === 'stores' ? favStores : favProducts)?.map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'white', borderRadius: 12, padding: '14px 16px',
              marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10, background: '#f5f0f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {item.category_icon || '🏪'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{item.category_name}</div>
              </div>
              <button onClick={() => handleRemoveStore(item.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#e88',
              }}>🗑️</button>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}