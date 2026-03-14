// ============================================================
// src/components/Icons.jsx
// SVG Icons — outline stroke style ตรงกับ design ในรูป
// BottomNav: Map, Stores(basket), Heart, Malls(building), Profile
// Category: เสื้อ, laptop, fork+knife, sparkle, dumbbell
// ============================================================

// ===== BottomNav Icons (เหมือนในรูป Image 1-5) =====
const NAV_ICONS = {

  // Map — grid แผนที่แบบในรูป Image 1
  map: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5L8.5 4l7 3L21 4.5v13L16 20l-7-3-6 2.5V6.5z"/>
      <path d="M8.5 4v13M15.5 7v13"/>
    </g>
  ),

  // Stores — basket/shop แบบในรูป Image 2
  stores: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </g>
  ),

  // Heart — outline แบบในรูป Image 3
  heart: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  ),

  // Heart filled
  'heart-fill': (
    <path strokeLinecap="round" strokeLinejoin="round" fill="currentColor"
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  ),

  // Malls — building แบบในรูป Image 4
  malls: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
      <rect x="13" y="13" width="4" height="8" rx="1"/>
    </g>
  ),

  // Profile — person แบบในรูป Image 5
  profile: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </g>
  ),
};

// ===== Action Icons =====
const ACTION_ICONS = {
  search: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </g>
  ),
  'arrow-left': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/>
      <path d="M12 19l-7-7 7-7"/>
    </g>
  ),
  'arrow-right': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5l7 7-7 7"/>
    </g>
  ),
  navigation: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l19-9-9 19-2-8-8-2z"/>
  ),
  'zoom-in': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
      <path d="M11 8v6M8 11h6"/>
    </g>
  ),
  'zoom-out': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35M8 11h6"/>
    </g>
  ),
  maximize: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </g>
  ),
  trash: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </g>
  ),
  'log-in': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </g>
  ),
  'user-plus': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </g>
  ),
  'log-out': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </g>
  ),
  clock: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </g>
  ),
  'trending-up': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </g>
  ),
  'map-pin': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </g>
  ),
  package: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </g>
  ),
  star: (
    <polygon strokeLinecap="round" strokeLinejoin="round"
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  ),
  'x-circle': (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </g>
  ),
  map: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5L8.5 4l7 3L21 4.5v13L16 20l-7-3-6 2.5V6.5z"/>
      <path d="M8.5 4v13M15.5 7v13"/>
    </g>
  ),
  building: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
      <rect x="13" y="13" width="4" height="8" rx="1"/>
    </g>
  ),
  user: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </g>
  ),
  store: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </g>
  ),
  heart: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  ),
};

// ===== Category Icons — flat colored ตาม design =====
// ใช้ SVG แบบมี fill สีเหมือนในรูป (เสื้อเขียว, laptop ฟ้า ฯลฯ)
const CATEGORY_SVG = {
  Clothing: (color) => (
    // เสื้อ T-Shirt flat
    <g>
      <path d="M3 6l4-3h10l4 3-3 3v9H6V9L3 6z" fill={color} stroke="none"/>
      <path d="M9 3c0 1.66 1.34 3 3 3s3-1.34 3-3" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  ),
  Electronics: (color) => (
    // Laptop flat
    <g>
      <rect x="3" y="4" width="18" height="13" rx="2" fill={color}/>
      <rect x="5" y="6" width="14" height="9" rx="1" fill="white" opacity="0.3"/>
      <path d="M1 19h22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="8" y="17" width="8" height="2" rx="1" fill={color}/>
    </g>
  ),
  'Food & Beverage': (color) => (
    // ชาม/อาหาร flat
    <g>
      <path d="M12 3C7 3 3 6.5 3 10h18c0-3.5-4-7-9-7z" fill={color}/>
      <rect x="3" y="10" width="18" height="2.5" rx="1" fill={color}/>
      <path d="M5 13.5C5 17 8.13 20 12 20s7-3 7-6.5" fill={color} opacity="0.6"/>
      <rect x="10" y="20" width="4" height="2" rx="1" fill={color}/>
      <rect x="7" y="22" width="10" height="1.5" rx="0.75" fill={color}/>
    </g>
  ),
  Beauty: (color) => (
    // ดอกไม้/สปา flat
    <g>
      <circle cx="12" cy="12" r="3.5" fill={color}/>
      <circle cx="12" cy="6"  r="2.5" fill={color} opacity="0.7"/>
      <circle cx="12" cy="18" r="2.5" fill={color} opacity="0.7"/>
      <circle cx="6"  cy="12" r="2.5" fill={color} opacity="0.7"/>
      <circle cx="18" cy="12" r="2.5" fill={color} opacity="0.7"/>
      <circle cx="8"  cy="8"  r="2"   fill={color} opacity="0.5"/>
      <circle cx="16" cy="8"  r="2"   fill={color} opacity="0.5"/>
      <circle cx="8"  cy="16" r="2"   fill={color} opacity="0.5"/>
      <circle cx="16" cy="16" r="2"   fill={color} opacity="0.5"/>
    </g>
  ),
  Sports: (color) => (
    // บอล flat
    <g>
      <circle cx="12" cy="12" r="9" fill={color}/>
      <path d="M12 3c0 4-2 7-2 9s2 5 2 9" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6"/>
      <path d="M3 12c4 0 7-2 9-2s5 2 9 2" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6"/>
    </g>
  ),
  default: (color) => (
    <g>
      <rect x="3" y="7" width="18" height="14" rx="2" fill={color}/>
      <path d="M16 7V5a2 2 0 00-4 0v2M8 7V5a2 2 0 00-4 0v2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  ),
};

// สีประจำ category
const CATEGORY_COLORS = {
  Clothing:        '#4CAF50',
  Electronics:     '#2196F3',
  'Food & Beverage': '#FF9800',
  Beauty:          '#E91E63',
  Sports:          '#9C27B0',
  default:         '#607D8B',
};

// ============================================================
// Icon — outline stroke (ใช้กับ BottomNav, action buttons)
// ============================================================
export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style = {} }) {
  // ลอง nav icons ก่อน แล้วค่อย action icons
  const path = NAV_ICONS[name] || ACTION_ICONS[name];
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}>
      {path}
    </svg>
  );
}

// ============================================================
// CategoryIcon — flat colored ตาม design (ใช้กับ store pins, store cards)
// ============================================================
export function CategoryIcon({ categoryName, size = 24, style = {} }) {
  const color  = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.default;
  const render = CATEGORY_SVG[categoryName]    || CATEGORY_SVG.default;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}>
      {render(color)}
    </svg>
  );
}

// export สีด้วยเผื่อใช้ที่อื่น
export { CATEGORY_COLORS };