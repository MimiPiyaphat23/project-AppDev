// ============================================================
// src/pages/MapPage.jsx
// สีตรงตาม design จริง: header เทาเข้ม #4A4A4A
// ============================================================

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMall } from '../context/MallContext';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { floorAPI, favoriteAPI, productAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';
import Icon, { CategoryIcon } from '../components/Icons';

// ===== สีตรงตาม design =====
const C = {
  header:   '#4A4A4A',  // header เทาเข้ม
  headerBg: '#4A4A4A',
  mapBg:    '#EDECEA',  // map พื้นหลังเทาอ่อน
  block1:   '#BEBAB8',  // floor plan block สีเทากลาง
  block2:   '#9E9A98',  // floor plan block สีเทาเข้มกว่า
  badge:    '#3D3D3D',  // badge เทาเข้ม (145%, Current Floor)
  tabPill:  '#3D3D3D',  // tab active pill สีเข้ม
  white:    '#FFFFFF',
  bg:       '#F0EEEE',  // พื้นหลังหน้า
};

const ZOOM_MIN = 80, ZOOM_MAX = 300, ZOOM_STEP = 20;

function StorePin({ store, onPress, zoom }) {
  const size = Math.max(36, 48 * (zoom / 100));
  return (
    <div onClick={e => { e.stopPropagation(); onPress(store); }} title={store.name}
      style={{
        position: 'absolute',
        left: `${(store.map_x / 480) * 100}%`,
        top:  `${(store.map_y / 600) * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: size, height: size, borderRadius: '50%',
        background: C.badge,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 5,
        transition: 'width 0.2s, height 0.2s',
      }}>
      <CategoryIcon categoryName={store.category_name} size={size * 0.52} />
    </div>
  );
}

function StorePopup({ store, onClose, onViewStore }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { data: products } = useFetch(() => productAPI.getByStore(store.id), [store.id]);

  const [favorited, setFavorited] = useState(false);

  const handleFavorite = async (e) => {
    // หยุดไม่ให้ event ลอยไปถึง overlay แล้วปิด popup
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/profile'); return; }
    await favoriteAPI.addStore(store.id);
    setFavorited(true); // แสดง feedback ว่ากดแล้ว
  };

  return (
    // overlay ใช้ inset:0 เต็มหน้าจอ ไม่ต้องกำหนด width/left
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      {/* sheet หยุด event ไม่ให้ทะลุ overlay */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 390, margin: '0 auto',
          background: 'white', borderRadius: '20px 20px 0 0',
          padding: '10px 20px 36px',
          animation: 'slideUp 0.22s ease',
        }}
      >
        <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CategoryIcon categoryName={store.category_name} size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 19, color: '#1a1a1a', marginBottom: 5 }}>{store.name}</div>
              <span style={{ background: C.badge, color: 'white', borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 600 }}>
                {store.category_name}
              </span>
            </div>
          </div>
          {/* ปุ่ม heart — ใช้ pointer-events: all และ position relative เพื่อรับ click ได้แน่นอน */}
          <button
            onClick={handleFavorite}
            style={{
              background: favorited ? '#fee2e2' : '#f5f5f5',
              border: 'none', borderRadius: '50%',
              width: 38, height: 38, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 1,
              transition: 'background 0.2s',
            }}
          >
            <Icon
              name={favorited ? 'heart-fill' : 'heart'}
              size={17}
              color={favorited ? '#ef4444' : '#888'}
              strokeWidth={1.8}
            />
          </button>
        </div>

        <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '11px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="map-pin" size={15} color="#666" />
          <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>Floor {store.floor_code}</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 5 }}>About</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{store.description || '-'}</div>
        </div>

        <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '11px 14px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 2 }}>Available Products</div>
          <div style={{ fontSize: 12, color: '#888' }}>{products?.length || 0} products in stock</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onViewStore} style={{ flex: 1, padding: '13px', background: C.badge, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Icon name="navigation" size={15} color="white" /> View Store
          </button>
          <button onClick={onClose} style={{ padding: '13px 22px', background: 'white', color: '#444', border: '1.5px solid #ddd', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

// ============================================================
// StoreListItem — รายการร้านด้านล่างแผนที่
// แยก component เพื่อให้ state favorite เป็นของตัวเอง
// ============================================================
function StoreListItem({ store, isLoggedIn, navigate, onOpen }) {
  const [fav, setFav] = useState(false);

  const handleFav = async (e) => {
    // หยุด event ไม่ให้ทะลุขึ้นไปเปิด popup
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/profile'); return; }
    await favoriteAPI.addStore(store.id);
    setFav(true);
  };

  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'white', borderRadius: 12,
        padding: '11px 14px', marginBottom: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        position: 'relative', // ให้ zIndex ทำงาน
      }}
    >
      {/* ไอคอน category */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <CategoryIcon categoryName={store.category_name} size={22} />
      </div>

      {/* ชื่อร้าน + category */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{store.name}</div>
        <div style={{ color: '#999', fontSize: 12, marginTop: 1 }}>{store.category_name}</div>
      </div>

      {/* ปุ่ม heart — zIndex สูงกว่า parent เพื่อรับ click ก่อน */}
      <button
        onPointerDown={e => e.stopPropagation()} // บล็อค pointer ตั้งแต่ต้น
        onClick={handleFav}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', padding: 6,
          display: 'flex', alignItems: 'center',
          position: 'relative', zIndex: 10,
        }}
      >
        <Icon
          name={fav ? 'heart-fill' : 'heart'}
          size={18}
          color={fav ? '#e87070' : '#ccc'}
          strokeWidth={1.6}
        />
      </button>
    </div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth(); // ← ใช้ตรวจสอบก่อนกด favorite
  const { selectedMall, selectedFloor, setSelectedFloor } = useMall();
  const mallId = selectedMall?.id || 1;

  const [selectedStore, setSelectedStore] = useState(null);
  const [zoom,     setZoom]     = useState(100);
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const { data: floors } = useFetch(() => floorAPI.getByMall(mallId), [mallId]);
  const activeFloor = selectedFloor || floors?.[0];
  const { data: stores } = useFetch(
    () => activeFloor ? floorAPI.getStores(activeFloor.id) : Promise.resolve({ data: { data: [] } }),
    [activeFloor?.id]
  );

  const zoomIn    = () => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  const zoomOut   = () => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN));
  const zoomReset = () => { setZoom(100); setOffset({ x: 0, y: 0 }); };

  const onMouseDown  = e => { setDragging(true); dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }; };
  const onMouseMove  = e => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); };
  const onMouseUp    = () => setDragging(false);
  const onTouchStart = e => { const t = e.touches[0]; setDragging(true); dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y }; };
  const onTouchMove  = e => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y }); };
  const onTouchEnd   = () => setDragging(false);

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ===== Header — เทาเข้ม ===== */}
      <div style={{ background: C.header, padding: '48px 16px 0', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-left" size={17} color="white" />
            </button>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{selectedMall?.name || 'Smart Mall'}</div>
              <div style={{ fontSize: 11, opacity: 0.65, marginTop: 1 }}>Interactive Directory</div>
            </div>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 32, height: 32, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="search" size={15} color="white" />
          </button>
        </div>

        {/* Floor Tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {floors?.map(floor => {
            const isActive = activeFloor?.id === floor.id;
            return (
              <button key={floor.id} onClick={() => setSelectedFloor(floor)} style={{
                padding: '7px 14px',
                borderRadius: '9px 9px 0 0',
                border: 'none',
                background: isActive ? C.bg : 'rgba(255,255,255,0.12)',
                color: isActive ? C.badge : 'rgba(255,255,255,0.85)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                Floor {floor.floor_code}
                {/* badge จำนวนร้าน */}
                <span style={{
                  background: isActive ? C.badge : 'rgba(255,255,255,0.25)',
                  color: 'white', borderRadius: 20,
                  padding: '1px 6px', fontSize: 10, fontWeight: 600,
                }}>
                  {floor.store_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Map Area ===== */}
      <div
        style={{ position: 'relative', height: 370, overflow: 'hidden', background: C.mapBg, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        {/* Zoom buttons */}
        <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[['+', zoomIn], ['−', zoomOut], ['↗', zoomReset]].map(([label, fn]) => (
            <button key={label} onClick={e => { e.stopPropagation(); fn(); }} style={{
              width: 38, height: 38, background: 'white', border: 'none', borderRadius: 10,
              fontSize: label === '↗' ? 13 : 20, fontWeight: 300,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Zoom % */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: C.badge, color: 'white', borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 600, pointerEvents: 'none' }}>
          {zoom}%
        </div>

        {/* แผนที่ */}
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center',
          transition: dragging ? 'none' : 'transform 0.15s ease',
          userSelect: 'none',
        }}>
          <svg width="260" height="200" viewBox="0 0 260 200">
            <rect x="0"   y="60"  width="75"  height="100" rx="5" fill={C.block2} />
            <rect x="85"  y="40"  width="85"  height="65"  rx="5" fill={C.block1} />
            <rect x="85"  y="115" width="175" height="55"  rx="5" fill={C.block1} />
            <rect x="180" y="40"  width="80"  height="55"  rx="5" fill={C.block2} />
          </svg>
          {stores?.map(store => (
            <StorePin key={store.id} store={store} zoom={zoom} onPress={s => setSelectedStore(s)} />
          ))}
        </div>

        {/* Current Floor badge */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 10, background: C.badge, color: 'white', borderRadius: 10, padding: '8px 14px', pointerEvents: 'none' }}>
          <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Floor</div>
          <div style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.2, marginTop: 1 }}>{activeFloor?.floor_code || 'G'}</div>
        </div>
      </div>

      {/* ===== Store List ===== */}
      <div style={{ padding: '14px 14px 100px' }}>
        <div style={{ fontWeight: 600, fontSize: 11, color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Stores on Floor {activeFloor?.floor_code}
        </div>
        {stores?.map(store => (
          <StoreListItem
            key={store.id}
            store={store}
            isLoggedIn={isLoggedIn}
            navigate={navigate}
            onOpen={() => setSelectedStore(store)}
          />
        ))}
      </div>

      {selectedStore && (
        <StorePopup store={selectedStore} onClose={() => setSelectedStore(null)}
          onViewStore={() => { setSelectedStore(null); navigate(`/store/${selectedStore.id}/products`); }} />
      )}
      <BottomNav />
    </div>
  );
}