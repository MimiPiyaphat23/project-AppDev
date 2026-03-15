// ============================================================
// src/pages/ProfilePage.jsx — Login / Register / Profile
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';
import Icon from '../components/Icons';
import { T } from '../theme';

function InputField({ label, type = 'text', value, onChange, placeholder }) {

  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 14 }}>

      <label
        style={{
          display: 'block',
          fontSize: 13,
          color: '#555',
          marginBottom: 5,
          fontWeight: 500
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '11px 13px',
          borderRadius: 10,
          border: `1.5px solid ${focused ? T.header : '#e0e0e0'}`,
          fontSize: 13,
          outline: 'none',
          boxSizing: 'border-box',
          color: '#333',
          fontFamily: 'inherit'
        }}
      />

    </div>
  );
}

export default function ProfilePage() {

  const navigate = useNavigate();
  const { isLoggedIn, user, login, logout } = useAuth();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {

    if (!email || !password) {
      setError('กรุณากรอก Email และ Password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      setError('เข้าสู่ระบบไม่สำเร็จ');
    }

    setLoading(false);
  };


  const handleRegister = async () => {

    if (!username || !email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.register({ username, email, password });
      await login(email, password);
      navigate('/');
    } catch (e) {
      setError('สมัครสมาชิกไม่สำเร็จ');
    }

    setLoading(false);
  };


  const switchMode = (m) => {
    setMode(m);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };


  // =====================================================
  // PROFILE PAGE (LOGIN แล้ว)
  // =====================================================

  if (isLoggedIn) {

    return (

      <div
        style={{
          background: T.pageBg,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >

        {/* HEADER */}

        <div
          style={{
            background: T.header,
            padding: '48px 16px 20px',
            color: T.white,
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 17 }}>
            Profile
          </div>

          <div style={{ fontSize: 11, opacity: 0.65 }}>
            Smart Mall
          </div>
        </div>


        {/* CONTENT */}

        <div
          style={{
            flex: 1,
            overflowY: 'auto'
          }}
        >

          <div style={{ padding: '36px 20px 100px', textAlign: 'center' }}>

            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: '50%',
                background: '#e0dce8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Icon name="user" size={36} color={T.header} />
            </div>

            <div
              style={{
                fontWeight: 700,
                fontSize: 19,
                marginBottom: 4
              }}
            >
              {user?.username || 'User'}
            </div>

            <div
              style={{
                color: T.textSecondary,
                marginBottom: 32
              }}
            >
              {user?.email}
            </div>


            <button
              onClick={logout}
              style={{
                background: T.white,
                color: T.header,
                border: `1.5px solid ${T.header}`,
                borderRadius: 11,
                padding: '11px 40px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>

          </div>

        </div>

        <BottomNav />

      </div>

    );
  }


  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  return (

    <div
      style={{
        background: T.pageBg,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background: T.header,
          padding: '48px 16px 20px',
          color: T.white,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >

        <div style={{ fontWeight: 700, fontSize: 17 }}>
          Smart Mall
        </div>

        <div style={{ fontSize: 11, opacity: 0.65 }}>
          Interactive Directory
        </div>

      </div>


      {/* CONTENT */}

      <div
        style={{
          flex: 1,
          overflowY: 'auto'
        }}
      >

        <div style={{ padding: '18px 16px 100px' }}>

          <div
            style={{
              background: T.white,
              borderRadius: 16,
              padding: '20px',
              marginBottom: 14
            }}
          >

            {mode === 'register' && (
              <InputField
                label="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div style={{ color: 'red', marginBottom: 10 }}>
                {error}
              </div>
            )}

            <button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              style={{
                width: '100%',
                padding: 12,
                background: T.header,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                marginBottom: 10
              }}
            >
              {mode === 'login' ? 'Login' : 'Register'}
            </button>

            <button
              onClick={() =>
                switchMode(mode === 'login' ? 'register' : 'login')
              }
              style={{
                width: '100%',
                padding: 11,
                borderRadius: 10,
                border: '1px solid #ddd',
                background: 'white'
              }}
            >
              {mode === 'login'
                ? 'สมัครสมาชิก'
                : 'กลับไปหน้า Login'}
            </button>

          </div>

        </div>

      </div>

      <BottomNav />

    </div>

  );
}