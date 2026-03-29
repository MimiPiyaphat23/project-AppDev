// src/pages/MallsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMall } from '../context/MallContext';
import { useFetch } from '../hooks/useFetch';
import { mallAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';
import Icon from '../components/Icons';

const C = {
  header: '#4A4A4A',
  badge: '#3D3D3D',
  bg: '#F0EEEE',
};

export default function MallsPage() {
  const navigate = useNavigate();
  const { setSelectedMall, setSelectedFloor } = useMall();
  const [search, setSearch] = useState('');

  const { data: malls, loading } = useFetch(() => mallAPI.getAll(), []);

  const mallList = malls?.data?.data || malls?.data || malls || [];

  const filtered = mallList.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectMall = (mall) => {
    setSelectedMall(mall);
    setSelectedFloor(null);
    navigate('/');
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ background: C.header, padding: '48px 20px 20px', color: 'white' }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Select Mall</div>
        <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 16 }}>Choose a shopping mall to explore</div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={14} color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search malls by name or location..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 36px',
              borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: 'white', fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '16px 16px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>No malls found</div>
        ) : (
          <>
            {/* Recent / Popular sections — แสดง list ทั้งหมด */}
            {search === '' && (
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="clock" size={13} color="#888" /> Recent
              </div>
            )}

            {search !== '' && (
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10 }}>
                Results for "{search}"
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {filtered.map(mall => (
                <MallCard key={mall.id || mall.mall_id} mall={mall} onSelect={handleSelectMall} />
              ))}
            </div>

            {/* Popular section */}
            {search === '' && filtered.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="trending-up" size={13} color="#888" /> Popular Malls
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.slice(0, 3).map(mall => (
                    <MallCard key={`pop-${mall.id || mall.mall_id}`} mall={mall} onSelect={handleSelectMall} showPopular />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function MallCard({ mall, onSelect, showPopular }) {
  const name = mall.name || mall.MallName || 'Mall';
  const location = mall.location || mall.Location || mall.address || '';
  const storeCount = mall.store_count ?? mall.StoreCount ?? mall.stores_count ?? '-';
  const image = mall.image || mall.logo || mall.ImageURL || null;

  return (
    <div
      onClick={() => onSelect(mall)}
      style={{
        background: 'white', borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)', cursor: 'pointer',
        transition: 'transform 0.1s',
        position: 'relative',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Mall image / placeholder */}
      <div style={{
        width: 52, height: 52, borderRadius: 12, background: '#f0f0f0',
        flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {image
          ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Icon name="shopping-bag" size={24} color="#ccc" />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          {showPopular && (
            <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              ⭐ Popular
            </span>
          )}
        </div>
        {location ? (
          <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <Icon name="map-pin" size={11} color="#aaa" /> {location}
          </div>
        ) : null}
        <div style={{ fontSize: 11, color: '#aaa' }}>{storeCount} stores</div>
      </div>

      {/* Arrow */}
      <Icon name="chevron-right" size={18} color="#ccc" />
    </div>
  );
}