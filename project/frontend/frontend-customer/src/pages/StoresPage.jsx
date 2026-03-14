// src/pages/StoresPage.jsx — หน้ารายการร้านค้า (Image 2)
// แสดงร้านค้าแยกตามชั้น พร้อม Tab floor
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMall } from '../context/MallContext';
import { useFetch } from '../hooks/useFetch';
import { floorAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';

function StoreItem({ store, onNavigate }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'white', borderRadius: 12, padding: '14px 16px',
      marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, background: '#f5f0f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>
        {store.category_icon || '🏪'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#222' }}>{store.name}</div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{store.category_name}</div>
      </div>
      <button onClick={() => onNavigate(store)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: '#999', fontSize: 18,
      }}>➤</button>
    </div>
  );
}

export default function StoresPage() {
  const navigate = useNavigate();
  const { selectedMall, selectedFloor, setSelectedFloor } = useMall();
  const mallId = selectedMall?.id || 1;

  // ดึง floors ของ mall ที่เลือก
  const { data: floors } = useFetch(() => floorAPI.getByMall(mallId), [mallId]);

  // เลือก floor แรกถ้ายังไม่ได้เลือก
  const activeFloor = selectedFloor || floors?.[0];

  // ดึงร้านค้าตาม floor ที่เลือก
  const { data: stores, loading } = useFetch(
    () => floorAPI.getStores(activeFloor?.id),
    [activeFloor?.id]
  );

  const handleNavigateToStore = (store) => {
    // navigate ไปหน้า Map พร้อมชี้ตำแหน่งร้าน (ฝากไว้ทีหลัง)
    navigate('/');
  };

  return (
    <div style={{ background: '#f7f5f8', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#5A3D4E', padding: '16px 20px 0', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>←</button>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedMall?.name || 'Smart Mall'}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Interactive Directory</div>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>🔍</button>
        </div>

        {/* Floor Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 0, scrollbarWidth: 'none' }}>
          {floors?.map((f) => {
            const active = activeFloor?.id === f.id;
            return (
              <button key={f.id} onClick={() => setSelectedFloor(f)} style={{
                padding: '8px 16px', borderRadius: '10px 10px 0 0', border: 'none',
                background: active ? 'white' : 'rgba(255,255,255,0.15)',
                color: active ? '#5A3D4E' : 'white',
                fontWeight: active ? 700 : 400, fontSize: 13,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Floor {f.floor_code}
                <span style={{
                  background: active ? '#5A3D4E' : 'rgba(255,255,255,0.3)',
                  color: active ? 'white' : 'white',
                  borderRadius: 20, padding: '1px 7px', fontSize: 11,
                }}>{f.store_count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Store List */}
      <div style={{ padding: '20px 16px 100px' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 4 }}>
          Floor {activeFloor?.floor_code}
        </div>
        <div style={{ color: '#7B3F5E', fontSize: 14, marginBottom: 16 }}>
          {stores?.length || 0} stores available
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>กำลังโหลด...</div>
        ) : stores?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>ไม่มีร้านค้าในชั้นนี้</div>
        ) : (
          stores?.map((s) => <StoreItem key={s.id} store={s} onNavigate={handleNavigateToStore} />)
        )}
      </div>
      <BottomNav />
    </div>
  );
}