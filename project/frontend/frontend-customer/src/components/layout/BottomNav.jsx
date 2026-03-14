// ============================================================
// src/components/layout/BottomNav.jsx
// Bottom Navigation — ตรงกับ design ในรูป Image 1-5
// ไอคอน outline stroke สีเทา / เข้มเมื่อ active
// ============================================================

import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../Icons';

// icon name ตรงกับที่กำหนดใน Icons.jsx NAV_ICONS
const TABS = [
  { path: '/',          icon: 'map',     label: 'Map'       },
  { path: '/stores',    icon: 'stores',  label: 'Stores'    },
  { path: '/favorites', icon: 'heart',   label: 'Favorites' },
  { path: '/malls',     icon: 'malls',   label: 'Malls'     },
  { path: '/profile',   icon: 'profile', label: 'Profile'   },
];

export default function BottomNav() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0,
      left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 390,
      background: 'white',
      borderTop: '1px solid #eee',
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 14px',
      zIndex: 100,
    }}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        const color    = isActive ? '#3D3D3D' : '#999';
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 12px',
              color,
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: 0.1,
            }}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={color}
              strokeWidth={isActive ? 2.2 : 1.6}
            />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}