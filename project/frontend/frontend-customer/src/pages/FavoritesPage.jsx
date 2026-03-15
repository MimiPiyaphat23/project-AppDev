// ============================================================
// src/pages/FavoritesPage.jsx — หน้ารายการโปรด
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { favoriteAPI } from "../services/api";
import BottomNav from "../components/layout/BottomNav";
import Icon, { CategoryIcon } from "../components/Icons";
import { T } from "../theme";

function FavoriteItem({ item, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.id);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: T.white,
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 10,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        border: `1px solid ${T.cardBorder}`,
        opacity: removing ? 0.5 : 1,
        transition: "opacity 0.2s"
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 10,
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <CategoryIcon categoryName={item.category_name} size={24} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: T.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {item.name}
        </div>

        <div
          style={{
            color: T.textSecondary,
            fontSize: 12,
            marginTop: 2
          }}
        >
          {item.category_name || item.store_name}
        </div>
      </div>

      <button
        onClick={handleRemove}
        disabled={removing}
        style={{
          background: "#fff0f0",
          border: "1px solid #fecaca",
          borderRadius: 8,
          width: 34,
          height: 34,
          cursor: removing ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <Icon name="trash" size={15} color={T.danger} />
      </button>
    </div>
  );
}

function EmptyState({ tab, onBrowse }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px"
        }}
      >
        <Icon name="heart" size={32} color={T.heartPurple} strokeWidth={1.4} />
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: 17,
          color: T.textPrimary,
          marginBottom: 8
        }}
      >
        No Favorites Yet
      </div>

      <div
        style={{
          color: T.textSecondary,
          fontSize: 13,
          lineHeight: 1.6,
          marginBottom: 24
        }}
      >
        Start adding {tab === "stores" ? "stores" : "products"} to your
        favorites
        <br />
        to easily find them later
      </div>

      <button
        onClick={onBrowse}
        style={{
          background: T.header,
          color: T.white,
          border: "none",
          borderRadius: 12,
          padding: "12px 28px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 8
        }}
      >
        <Icon name="map" size={15} color={T.white} />
        Browse Stores
      </button>
    </div>
  );
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState("stores");

  const {
    data: favStores,
    loading: ls,
    refetch: refetchStores
  } = useFetch(() => favoriteAPI.getStores(), [isLoggedIn]);

  const {
    data: favProducts,
    loading: lp,
    refetch: refetchProducts
  } = useFetch(() => favoriteAPI.getProducts(), [isLoggedIn]);

  const handleRemoveStore = async (id) => {
    await favoriteAPI.removeStore(id);
    refetchStores();
  };

  const handleRemoveProduct = async (id) => {
    await favoriteAPI.removeProduct(id);
    refetchProducts();
  };

  const currentItems = tab === "stores" ? favStores : favProducts;
  const currentLoading = tab === "stores" ? ls : lp;
  const handleRemove =
    tab === "stores" ? handleRemoveStore : handleRemoveProduct;

  const totalCount =
    (favStores?.length || 0) + (favProducts?.length || 0);

  return (
    <div
      style={{
        background: T.pageBg,
        height: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: T.header,
          padding: "48px 16px 0",
          color: T.white,
          position: "sticky",
          top: 0,
          zIndex: 20
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: T.headerLight,
                border: "none",
                width: 32,
                height: 32,
                borderRadius: 9,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon name="arrow-left" size={17} color={T.white} />
            </button>

            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>
                My Favorites
              </div>

              <div style={{ fontSize: 11, opacity: 0.65 }}>
                {totalCount} saved items
              </div>
            </div>
          </div>

          <Icon
            name="heart-fill"
            size={20}
            color="rgba(255,255,255,0.6)"
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 9,
            padding: 3
          }}
        >
          {[
            { key: "stores", label: "Favorite Stores" },
            { key: "products", label: "Favorite Products" }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 7,
                border: "none",
                background: tab === key ? T.white : "transparent",
                color:
                  tab === key
                    ? T.header
                    : "rgba(255,255,255,0.8)",
                fontWeight: tab === key ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ height: 14 }} />
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px 100px"
        }}
      >
        {currentLoading
          ? [1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  background: T.white,
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 10
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    background: "#eee"
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "50%",
                      height: 13,
                      background: "#eee",
                      borderRadius: 6,
                      marginBottom: 8
                    }}
                  />

                  <div
                    style={{
                      width: "35%",
                      height: 11,
                      background: "#f5f5f5",
                      borderRadius: 6
                    }}
                  />
                </div>
              </div>
            ))
          : !currentItems?.length
          ? (
            <EmptyState
              tab={tab}
              onBrowse={() => navigate("/stores")}
            />
          )
          : currentItems.map((item) => (
              <FavoriteItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
              />
            ))}
      </div>

      <BottomNav />
    </div>
  );
}