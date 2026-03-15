// ============================================================
// src/pages/StoresPage.jsx — รายการร้านค้าแยกตามชั้น
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMall } from '../context/MallContext';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { floorAPI, favoriteAPI } from '../services/api';
import BottomNav from '../components/layout/BottomNav';
import Icon, { CategoryIcon } from '../components/Icons';
import { T } from '../theme';

function StoreItem({ store, onLocate }) {

  const [fav, setFav] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleFav = async (e) => {

    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/profile');
      return;
    }

    await favoriteAPI.addStore(store.id);
    setFav(true);
  };

  return (

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: T.white,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        border: `1px solid ${T.cardBorder}`
      }}
    >

      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <CategoryIcon categoryName={store.category_name} size={24} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>

        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: T.textPrimary
          }}
        >
          {store.name}
        </div>

        <div
          style={{
            color: T.textSecondary,
            fontSize: 12,
            marginTop: 2
          }}
        >
          {store.category_name}
        </div>

      </div>

      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleFav}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Icon
          name={fav ? 'heart-fill' : 'heart'}
          size={18}
          color={fav ? T.danger : T.heartPurple}
          strokeWidth={1.6}
        />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onLocate(store);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Icon name="navigation" size={17} color={T.textMuted} strokeWidth={1.6} />
      </button>

    </div>

  );
}

function Skeleton() {

  return (

    <div
      style={{
        display: 'flex',
        gap: 12,
        background: T.white,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10
      }}
    >

      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          background: '#eee'
        }}
      />

      <div style={{ flex: 1 }}>

        <div
          style={{
            width: '50%',
            height: 13,
            background: '#eee',
            borderRadius: 6,
            marginBottom: 8
          }}
        />

        <div
          style={{
            width: '30%',
            height: 11,
            background: '#f5f5f5',
            borderRadius: 6
          }}
        />

      </div>

    </div>

  );
}

export default function StoresPage() {

  const navigate = useNavigate();
  const { selectedMall, selectedFloor, setSelectedFloor } = useMall();

  const mallId = selectedMall?.id || 1;

  const { data: floors } = useFetch(
    () => floorAPI.getByMall(mallId),
    [mallId]
  );

  const activeFloor = selectedFloor || floors?.[0];

  const { data: stores, loading } = useFetch(
    () =>
      activeFloor
        ? floorAPI.getStores(activeFloor.id)
        : Promise.resolve({ data: { data: [] } }),
    [activeFloor?.id]
  );

  return (

    <div
      style={{
        background: T.pageBg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background: T.header,
          padding: '48px 16px 0',
          color: T.white,
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14
          }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            <button
              onClick={() => navigate(-1)}
              style={{
                background: T.headerLight,
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 9,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="arrow-left" size={17} color={T.white} />
            </button>

            <div>

              <div style={{ fontWeight: 700, fontSize: 17 }}>
                {selectedMall?.name || 'Smart Mall'}
              </div>

              <div
                style={{
                  fontSize: 11,
                  opacity: 0.65,
                  marginTop: 1
                }}
              >
                Interactive Directory
              </div>

            </div>

          </div>

          <button
            style={{
              background: T.headerLight,
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: 9,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="search" size={15} color={T.white} />
          </button>

        </div>

        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 6
          }}
        >

          {floors?.map((floor) => {

            const active = activeFloor?.id === floor.id;

            return (

              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9px 9px 0 0',
                  border: 'none',
                  background: active
                    ? T.pageBg
                    : 'rgba(255,255,255,0.12)',
                  color: active
                    ? T.header
                    : 'rgba(255,255,255,0.85)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >

                Floor {floor.floor_code}

                <span
                  style={{
                    background: active
                      ? T.badge
                      : 'rgba(255,255,255,0.25)',
                    color: T.white,
                    borderRadius: 20,
                    padding: '1px 6px',
                    fontSize: 10,
                    fontWeight: 600
                  }}
                >
                  {floor.store_count}
                </span>

              </button>

            );

          })}

        </div>

      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        <div style={{ padding: '18px 14px 100px' }}>

          <div style={{ marginBottom: 16 }}>

            <div
              style={{
                fontWeight: 700,
                fontSize: 19,
                color: T.textPrimary
              }}
            >
              Floor {activeFloor?.floor_code}
            </div>

            <div
              style={{
                color: T.textSecondary,
                fontSize: 13,
                marginTop: 3
              }}
            >
              {stores?.length || 0} stores available
            </div>

          </div>

          {loading
            ? [1, 2, 3].map((i) => <Skeleton key={i} />)
            : stores?.length === 0
            ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '50px 20px',
                  color: '#aaa'
                }}
              >
                <Icon name="store" size={38} color="#ddd" />
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  ไม่มีร้านค้าในชั้นนี้
                </div>
              </div>
            )
            : stores.map((store) => (

                <StoreItem
                  key={store.id}
                  store={store}
                  onLocate={() => navigate('/')}
                />

              ))
          }

        </div>

      </div>

      <BottomNav />

    </div>

  );
}