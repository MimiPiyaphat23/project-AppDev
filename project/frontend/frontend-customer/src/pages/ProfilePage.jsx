// src/pages/ProfilePage.jsx — หน้า Profile / Login (Image 5)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';

function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
        width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0',
        fontSize: 14, outline: 'none', boxSizing: 'border-box',
      }} />
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, login, logout } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError(''); setLoading(true);
    try {
      await authAPI.register({ username, email, password });
      await login(email, password);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally { setLoading(false); }
  };

  // ===== หน้า Profile (เมื่อ Login แล้ว) =====
  if (isLoggedIn) {
    return (
      <div style={{ background: '#f7f5f8', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: '#5A3D4E', padding: '16px 20px', color: 'white' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Profile</div>
        </div>
        <div style={{ padding: '30px 20px 100px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#e0d8e8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 16px',
          }}>👤</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#222', marginBottom: 4 }}>
            {user?.username || 'User'}
          </div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>{user?.email}</div>
          <button onClick={logout} style={{
            background: 'white', color: '#5A3D4E', border: '1.5px solid #5A3D4E',
            borderRadius: 10, padding: '12px 40px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            ออกจากระบบ
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ===== หน้า Login/Register =====
  return (
    <div style={{ background: '#f7f5f8', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ background: '#5A3D4E', padding: '16px 20px', color: 'white' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Smart Mall</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Interactive Directory</div>
      </div>

      <div style={{ padding: '24px 20px 100px' }}>
        {/* Login Card */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#f0edf5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 14px',
            }}>👤</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#222' }}>Welcome to Smart Mall</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              Login or register to access multiple malls and save your favorite stores
            </div>
          </div>

          {/* Mock hint */}
          <div style={{ background: '#f0fff4', border: '1px solid #b2f5c6', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#276749' }}>
            🧪 Mock: ใช้ test@mail.com / 1234 เพื่อ Login ทดสอบ
          </div>

          {mode === 'register' && (
            <Input label="ชื่อผู้ใช้" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" />
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          {error && (
            <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 14, background: '#fff5f5', padding: '8px 12px', borderRadius: 8 }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading} style={{
            width: '100%', padding: '13px', background: '#5A3D4E', color: 'white',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? '→ Login' : '→ Register'}
          </button>

          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{
            width: '100%', padding: '12px', background: 'white', color: '#5A3D4E',
            border: '1.5px solid #5A3D4E', borderRadius: 10, fontSize: 14,
            fontWeight: 500, cursor: 'pointer',
          }}>
            {mode === 'login' ? '📝 Register' : '← Back to Login'}
          </button>
        </div>

        {/* Features */}
        {[
          { icon: '🤍', title: 'Save Favorites', desc: 'Save your favorite stores and products for quick access anytime' },
          { icon: '🏬', title: 'Browse Multiple Malls', desc: 'Register to access directories for multiple shopping malls in your area' },
        ].map((f) => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'center', gap: 14, background: 'white',
            borderRadius: 12, padding: '14px 16px', marginBottom: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f0f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{f.title}</div>
              <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}