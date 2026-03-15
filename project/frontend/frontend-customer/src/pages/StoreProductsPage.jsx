// ============================================================
// src/pages/StoreProductsPage.jsx — รายการสินค้า + stock
// ============================================================

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { storeAPI, productAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/layout/BottomNav';
import Icon, { CategoryIcon } from '../components/Icons';
import { T } from '../theme';


// ============================================================
// ProductCard
// ============================================================

function ProductCard({ product, onFavorite }) {

  const [fav, setFav] = useState(false);

  const stockBg =
    product.stock > 20
      ? '#2D2D3A'
      : product.stock > 5
      ? '#7A3B1E'
      : '#8B1A1A';

  return (

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: T.white,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        border: `1px solid ${T.cardBorder}`
      }}
    >

      {/* IMAGE */}

      <div style={{ width: 88, height: 88, flexShrink: 0 }}>

        {product.image ? (

          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

        ) : (

          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="package" size={28} color="#c4aed4" />
          </div>

        )}

      </div>


      {/* INFO */}

      <div style={{ flex: 1, padding: '0 12px' }}>

        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: T.textPrimary,
            marginBottom: 7
          }}
        >
          {product.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: T.textPrimary
            }}
          >
            ฿{product.price.toLocaleString()}
          </span>

          <span
            style={{
              background: stockBg,
              color: 'white',
              borderRadius: 20,
              padding: '3px 11px',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            {product.stock >= 999
              ? 'Available'
              : `${product.stock} left`}
          </span>

        </div>

      </div>


      {/* HEART */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setFav((f) => !f);
          onFavorite(product.id);
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: '0 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Icon
          name={fav ? 'heart-fill' : 'heart'}
          size={22}
          color={T.heartPurple}
        />
      </button>

    </div>

  );
}



// ============================================================
// StoreProductsPage
// ============================================================

export default function StoreProductsPage() {

  const { storeId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [storeFav, setStoreFav] = useState(false);

  const { data: store } = useFetch(
    () => storeAPI.getById(storeId),
    [storeId]
  );

  const { data: products, loading } = useFetch(
    () => productAPI.getByStore(storeId),
    [storeId]
  );


  const handleFavoriteProduct = async (productId) => {

    if (!isLoggedIn) {
      navigate('/profile');
      return;
    }

    await favoriteAPI.addProduct(productId);
  };


  const handleFavoriteStore = async () => {

    if (!isLoggedIn) {
      navigate('/profile');
      return;
    }

    await favoriteAPI.addStore(storeId);
    setStoreFav(true);
  };


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
          padding: '48px 16px 18px',
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
            justifyContent: 'space-between'
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
                {store?.name || 'Store'}
              </div>

              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {store?.category_name}
              </div>

            </div>

          </div>


          <button
            onClick={handleFavoriteStore}
            style={{
              background: T.headerLight,
              border: 'none',
              width: 34,
              height: 34,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon
              name={storeFav ? 'heart-fill' : 'heart'}
              size={17}
              color={T.white}
            />
          </button>

        </div>

      </div>



      {/* CONTENT */}

      <div
        style={{
          flex: 1,
          overflowY: 'auto'
        }}
      >

        <div style={{ padding: '16px 16px 100px' }}>


          {/* STORE INFO */}

          <div
            style={{
              background: T.white,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
              border: `1px solid ${T.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14
            }}
          >

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CategoryIcon
                categoryName={store?.category_name}
                size={28}
              />
            </div>


            <div>

              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: T.textPrimary
                }}
              >
                {store?.name}
              </div>

              <div
                style={{
                  color: T.textSecondary,
                  fontSize: 13,
                  marginTop: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Icon name="map-pin" size={12} color="#bbb" />
                Floor {store?.floor_code} • {store?.category_name}
              </div>

            </div>

          </div>



          {/* PRODUCT HEADER */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14
            }}
          >

            <div
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: T.textPrimary
              }}
            >
              Products
            </div>


            <span
              style={{
                background: T.headerLight,
                color: T.header,
                borderRadius: 20,
                padding: '3px 12px',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {products?.length || 0} items
            </span>

          </div>



          {/* PRODUCT LIST */}

          {loading ? (

            <div style={{ textAlign: 'center', padding: 40 }}>
              Loading...
            </div>

          ) : products?.length === 0 ? (

            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                color: '#aaa'
              }}
            >
              <Icon name="package" size={40} color="#ddd" />
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                ยังไม่มีสินค้า
              </div>
            </div>

          ) : (

            products.map((product) => (

              <ProductCard
                key={product.id}
                product={product}
                onFavorite={handleFavoriteProduct}
              />

            ))

          )}

        </div>

      </div>


      <BottomNav />

    </div>

  );

}