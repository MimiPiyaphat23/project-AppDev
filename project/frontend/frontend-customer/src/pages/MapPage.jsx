// src/pages/MapPage.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMall } from '../context/MallContext';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { floorAPI, favoriteAPI, productAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';
import Icon, { CategoryIcon } from '../components/Icons';

const C = {
  header: '#4A4A4A',
  mapBg: '#EDECEA',
  badge: '#3D3D3D',
  bg: '#F0EEEE',
};

const ZOOM_MIN = 80, ZOOM_MAX = 300, ZOOM_STEP = 20;
const IMG_W = 480;
const IMG_H = 600;

// ✅ floors hardcode เหมือน admin — ไม่ขึ้นกับ API
const FLOORS = [
  { id: 'LG', label: 'LG', image: '/picture/LG.png' },
  { id: 'G',  label: 'G',  image: '/picture/G.png'  },
  { id: '1',  label: '1',  image: '/picture/1.png'  },
  { id: '2',  label: '2',  image: '/picture/2.png'  },
  { id: '3',  label: '3',  image: '/picture/3.png'  },
  { id: '4',  label: '4',  image: '/picture/4.png'  },
];

function loadAreas() {
  try { return JSON.parse(localStorage.getItem('mall_areas') || '[]'); }
  catch { return []; }
}

function loadStores() {
  try { return JSON.parse(localStorage.getItem('mall_stores') || '[]'); }
  catch { return []; }
}

function pctToPixel(xPct, yPct) {
  return { x: (xPct / 100) * IMG_W, y: (yPct / 100) * IMG_H };
}

function getCentroid(points) {
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
}

/* ---- Store Popup ---- */
function StorePopup({ store, onClose, onViewStore }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { data: products } = useFetch(() => productAPI.getByStore(store.id), [store.id]);
  const [favorited, setFavorited] = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/profile'); return; }
    await favoriteAPI.addStore(store.id);
    setFavorited(true);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 390, margin: '0 auto', background: 'white', borderRadius: '20px 20px 0 0', padding: '10px 20px 36px', animation: 'slideUp 0.22s ease' }}>
        <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {store.logo
              ? <img src={store.logo} alt={store.name} style={{ width: 60, height: 60, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 60, height: 60, borderRadius: 14, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CategoryIcon categoryName={store.category_name || store.category} size={32} />
                </div>
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: 19, color: '#1a1a1a', marginBottom: 5 }}>{store.name}</div>
              <span style={{ background: C.badge, color: 'white', borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 600 }}>
                {store.category_name || store.category || 'Store'}
              </span>
            </div>
          </div>
          <button onClick={handleFavorite} style={{ background: favorited ? '#fee2e2' : '#f5f5f5', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={favorited ? 'heart-fill' : 'heart'} size={17} color={favorited ? '#ef4444' : '#888'} strokeWidth={1.8} />
          </button>
        </div>

        <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '11px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="map-pin" size={15} color="#666" />
          <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>
            Floor {store.floor_code || store.floor || '-'}
          </span>
        </div>

        {store.description && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 5 }}>About</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{store.description}</div>
          </div>
        )}

        <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '11px 14px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 2 }}>Available Products</div>
          <div style={{ fontSize: 12, color: '#888' }}>{products?.length || 0} products in stock</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); onViewStore(); }}
            style={{ flex: 1, padding: '13px', background: C.badge, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
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

/* ---- Main Page ---- */
export default function MapPage() {
  const navigate = useNavigate();
  const { selectedMall } = useMall();

  const [currentFloor, setCurrentFloor] = useState('LG');
  const [selectedStore, setSelectedStore] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [areas, setAreas] = useState([]);
  const [stores, setStores] = useState([]);
  const [imageError, setImageError] = useState(false);

  const dragStart = useRef(null);
  const didDrag = useRef(false);

  // ✅ โหลด areas + stores จาก localStorage (sync กับ admin)
  useEffect(() => {
    const reload = () => {
      setAreas(loadAreas());
      setStores(loadStores());
    };
    reload();
    window.addEventListener('storage', reload);
    return () => window.removeEventListener('storage', reload);
  }, []);

  // ✅ ถ้า mall_stores ว่าง ให้ดึงจาก API แล้วเซฟลง localStorage
  useEffect(() => {
    const cached = loadStores();
    if (cached.length === 0) {
      fetch('http://localhost:5000/api/stores')
        .then(r => r.json())
        .then(data => {
          const list = data.data ?? data;
          const formatted = list.map(item => ({
            id: item.id,
            name: item.name,
            floor: item.floor,
            category: item.category?.name ?? item.category,
            category_name: item.category?.name ?? item.category,
            icon: item.category?.icon || '🏪',
            logo: item.logo,
            description: item.description,
            position: item.position,
          }));
          localStorage.setItem('mall_stores', JSON.stringify(formatted));
          setStores(formatted);
        })
        .catch(() => {});
    }
  }, []);

  // reset zoom/pan เมื่อเปลี่ยนชั้น
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setImageError(false);
    setZoom(100);
  }, [currentFloor]);

  const areasOnFloor = areas.filter(a => a.floor === currentFloor);

  // นับ store ต่อชั้นจาก areas
  const storeCountByFloor = (floorId) =>
    areas.filter(a => a.floor === floorId).length;

  const currentFloorData = FLOORS.find(f => f.id === currentFloor);
  const floorImage = imageError
    ? '/picture/G.png'
    : (currentFloorData?.image || '/picture/LG.png');

  // ---- drag ----
  const onMouseDown = (e) => {
    didDrag.current = false;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    didDrag.current = true;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => setDragging(false);

  const onTouchStart = (e) => {
    didDrag.current = false;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    didDrag.current = true;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };

  const zoomIn = () => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  const zoomOut = () => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN));
  const zoomReset = () => { setZoom(100); setOffset({ x: 0, y: 0 }); };

  // ---- click area → popup ----
  const handleAreaClick = useCallback((area, e) => {
    e.stopPropagation();
    if (didDrag.current) return;
    const store = stores.find(s =>
      s.name === area.storeName ||
      s.name?.toLowerCase() === area.storeName?.toLowerCase()
    );
    if (store) setSelectedStore(store);
  }, [stores]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ background: C.header, padding: '48px 16px 0', color: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{selectedMall?.name || 'Smart Mall'}</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>Interactive Directory</div>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 32, height: 32, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="search" size={15} color="white" />
          </button>
        </div>

        {/* ✅ Floor tabs — hardcode เหมือน admin */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {FLOORS.map(floor => {
            const isActive = currentFloor === floor.id;
            const count = storeCountByFloor(floor.id);
            return (
              <button
                key={floor.id}
                onClick={() => setCurrentFloor(floor.id)}
                style={{
                  padding: '7px 14px', borderRadius: '9px 9px 0 0', border: 'none',
                  background: isActive ? C.bg : 'rgba(255,255,255,0.12)',
                  color: isActive ? C.badge : 'rgba(255,255,255,0.85)',
                  fontWeight: isActive ? 600 : 400, fontSize: 12, cursor: 'pointer',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                Floor {floor.label}
                <span style={{
                  background: isActive ? C.badge : 'rgba(255,255,255,0.25)',
                  color: 'white', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 600,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAP */}
      <div
        style={{ position: 'relative', height: 370, overflow: 'hidden', background: C.mapBg, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        {/* zoom badge */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: C.badge, color: 'white', borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 600, pointerEvents: 'none' }}>
          {zoom}%
        </div>

        {/* zoom buttons */}
        <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[['+', zoomIn], ['-', zoomOut], ['x', zoomReset]].map(([label, fn]) => (
            <button key={label} onClick={e => { e.stopPropagation(); fn(); }} style={{
              width: 38, height: 38, background: 'white', border: 'none', borderRadius: 10,
              fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Outer: transform */}
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center',
          transition: dragging ? 'none' : 'transform 0.15s ease',
          userSelect: 'none',
        }}>
          {/* Fixed 480×600 canvas */}
          <div style={{ position: 'relative', width: IMG_W, height: IMG_H }}>

            <img
              src={floorImage}
              alt={`Floor ${currentFloor}`}
              draggable={false}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
            />

            {/* Clickable area polygons */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              {areasOnFloor.map((area, i) => {
                const pts = area.points.map(p => {
                  const px = pctToPixel(p.x, p.y);
                  return `${px.x},${px.y}`;
                }).join(' ');
                return (
                  <polygon
                    key={i}
                    points={pts}
                    fill="rgba(0,0,0,0)"
                    stroke="transparent"
                    strokeWidth="0"
                    style={{ cursor: 'pointer' }}
                    onClick={e => handleAreaClick(area, e)}
                  />
                );
              })}
            </svg>

            {/* Store icons at centroid */}
            {areasOnFloor.map((area, i) => {
              const centroid = getCentroid(area.points);
              const pos = pctToPixel(centroid.x, centroid.y);
              const store = stores.find(s =>
                s.name === area.storeName ||
                s.name?.toLowerCase() === area.storeName?.toLowerCase()
              );
              return (
                <div
                  key={i}
                  style={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)', cursor: 'pointer', zIndex: 5 }}
                  onClick={e => handleAreaClick(area, e)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      border: '2.5px solid #3D3D3D', background: 'white', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>
                      {store?.logo
                        ? <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.name} />
                        : <CategoryIcon categoryName={store?.category_name || store?.category} size={18} />
                      }
                    </div>
                    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #3D3D3D' }} />
                    <div style={{
                      marginTop: 2, background: 'rgba(0,0,0,0.65)', color: 'white',
                      fontSize: 9, padding: '2px 5px', borderRadius: 4,
                      whiteSpace: 'nowrap', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {area.storeName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedStore && (
        <StorePopup
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onViewStore={() => navigate(`/store/${selectedStore.id}/products`)}
        />
      )}

      <BottomNav />
    </div>
  );
}