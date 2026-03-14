// src/pages/MallsPage.jsx — หน้าเลือก Mall (Image 4)
// แสดง Recent + Popular Malls พร้อมค้นหาได้
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMall } from '../context/MallContext';
import { useFetch } from '../hooks/useFetch';
import { mallAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';

// ไอคอนและสีประจำแต่ละ mall (วนซ้ำถ้ามีเยอะ)
const MALL_THEMES = [
  { icon: '🏬', bg: '#EEF2FF', iconBg: '#C7D2FE' },
  { icon: '🏢', bg: '#F0FDF4', iconBg: '#BBF7D0' },
  { icon: '🛍️', bg: '#FFF7ED', iconBg: '#FED7AA' },
  { icon: '🏪', bg: '#FDF4FF', iconBg: '#E9D5FF' },
];

// ===== MallCard — การ์ดแสดงข้อมูลแต่ละห้าง =====
function MallCard({ mall, onClick }) {
  const [pressed, setPressed] = useState(false);
  const theme = MALL_THEMES[mall.id % MALL_THEMES.length];

  return (
    <div
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'white', borderRadius: 14, padding: '14px 16px',
        marginBottom: 10, cursor: 'pointer',
        boxShadow: pressed ? '0 1px 2px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f0ecf5',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.12s ease',
      }}
    >
      {/* ไอคอนห้าง */}
      <div style={{
        width: 54, height: 54, borderRadius: 12,
        background: theme.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, flexShrink: 0,
      }}>
        {mall.image
          ? <img src={mall.image} alt={mall.name} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
          : theme.icon
        }
      </div>

      {/* ข้อมูลห้าง */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {mall.name}
        </div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 12 }}>📍</span> {mall.location}
        </div>
        <div style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>
          {mall.store_count} stores
        </div>
      </div>

      {/* Badge + Arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        {mall.is_popular && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: '#FFFBEB', color: '#92400E',
            border: '1px solid #FDE68A', borderRadius: 20,
            padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            ⭐ Popular
          </span>
        )}
        <span style={{ color: '#d0c8dc', fontSize: 20, lineHeight: 1 }}>›</span>
      </div>
    </div>
  );
}

// ===== Section Header =====
function SectionHeader({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      marginBottom: 12, fontWeight: 700, fontSize: 14, color: '#444',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </div>
  );
}

// ===== Loading Skeleton =====
function SkeletonCard() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'white', borderRadius: 14, padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ width: 54, height: 54, borderRadius: 12, background: '#f0f0f0' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '60%', height: 14, background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ width: '40%', height: 12, background: '#f5f5f5', borderRadius: 6 }} />
      </div>
    </div>
  );
}

// ===== MallsPage หลัก =====
export default function MallsPage() {
  const navigate = useNavigate();
  const { setSelectedMall, setSelectedFloor } = useMall();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // ดึงข้อมูล Mall ทั้งหมดและล่าสุด
  const { data: allMalls, loading } = useFetch(() => mallAPI.getAll(), []);
  const { data: recentMalls } = useFetch(() => mallAPI.getRecent(), []);

  // กรองตามคำค้นหา (client-side สำหรับ mock)
  const filtered = allMalls
    ? allMalls.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  const popular = filtered.filter((m) => m.is_popular);

  // เลือกห้าง → บันทึก context → ไปหน้าแผนที่
  const handleSelect = (mall) => {
    setSelectedMall(mall);
    setSelectedFloor(null); // reset ชั้นที่เคยเลือก
    navigate('/');
  };

  return (
    <div style={{ background: '#f7f4fb', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>

      {/* ===== Header ===== */}
      <div style={{ background: '#5A3D4E', padding: '52px 20px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 34, height: 34, borderRadius: 10, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ←
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19 }}>Select Mall</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1 }}>Choose a shopping mall to explore</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          boxShadow: searchFocused ? '0 0 0 3px rgba(255,255,255,0.25)' : 'none',
          borderRadius: 12, transition: 'box-shadow 0.2s',
        }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.45 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search malls by name or location..."
            style={{
              width: '100%', padding: '11px 12px 11px 38px', borderRadius: 12,
              border: 'none', fontSize: 14, background: 'white',
              boxSizing: 'border-box', outline: 'none', color: '#333',
            }}
          />
          {/* ปุ่มล้างคำค้นหา */}
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: '#ddd', border: 'none', color: '#666',
                width: 20, height: 20, borderRadius: '50%', fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ padding: '20px 16px 100px' }}>
        {loading ? (
          // Skeleton loading
          <>
            <div style={{ height: 18, width: 80, background: '#ede8f2', borderRadius: 6, marginBottom: 14 }} />
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </>
        ) : (
          <>
            {/* ---- Recent ---- */}
            {!search && recentMalls && recentMalls.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <SectionHeader icon="🕒" label="Recent" />
                {recentMalls.map((m) => (
                  <MallCard key={m.id} mall={m} onClick={() => handleSelect(m)} />
                ))}
              </section>
            )}

            {/* ---- Popular / Results ---- */}
            {popular.length > 0 ? (
              <section>
                <SectionHeader icon="📈" label={search ? `Results for "${search}"` : 'Popular Malls'} />
                {popular.map((m) => (
                  <MallCard key={m.id} mall={m} onClick={() => handleSelect(m)} />
                ))}
              </section>
            ) : (
              // Empty state เมื่อค้นหาไม่เจอ
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#444', marginBottom: 6 }}>ไม่พบ Mall</div>
                <div style={{ color: '#aaa', fontSize: 14 }}>ลองค้นหาด้วยคำอื่น</div>
                <button onClick={() => setSearch('')} style={{
                  marginTop: 16, padding: '8px 20px', borderRadius: 20,
                  background: '#5A3D4E', color: 'white', border: 'none',
                  fontSize: 13, cursor: 'pointer',
                }}>ล้างคำค้นหา</button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}