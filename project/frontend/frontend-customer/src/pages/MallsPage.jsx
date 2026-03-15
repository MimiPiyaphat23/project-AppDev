// ============================================================
// src/pages/MallsPage.jsx
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMall } from "../context/MallContext";
import { useFetch } from "../hooks/useFetch";
import { mallAPI } from "../services/api";
import BottomNav from "../components/layout/BottomNav";
import Icon from "../components/Icons";
import { T } from "../theme";

const THEMES = [
  { iconBg: "#C7D2FE", color: "#4338CA" },
  { iconBg: "#BBF7D0", color: "#15803D" },
  { iconBg: "#FED7AA", color: "#C2410C" },
  { iconBg: "#E9D5FF", color: "#7E22CE" }
];

function MallCard({ mall, onClick }) {
  const [pressed, setPressed] = useState(false);
  const theme = THEMES[mall.id % THEMES.length];

  return (
    <div
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: T.white,
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        border: `1px solid ${T.cardBorder}`,
        boxShadow: pressed
          ? "0 1px 2px rgba(0,0,0,0.04)"
          : "0 2px 10px rgba(0,0,0,0.07)",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        transition: "all 0.12s ease"
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: theme.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        <Icon name="building" size={26} color={theme.color} strokeWidth={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: T.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {mall.name}
        </div>

        <div
          style={{
            color: T.textSecondary,
            fontSize: 13,
            marginTop: 3,
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          <Icon name="map-pin" size={12} color={T.textMuted} />
          {mall.location}
        </div>

        <div
          style={{
            color: T.textMuted,
            fontSize: 12,
            marginTop: 2
          }}
        >
          {mall.store_count} stores
        </div>
      </div>

      <Icon name="arrow-right" size={16} color={T.textMuted} />
    </div>
  );
}

function Skeleton() {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        background: T.white,
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: "#eee"
        }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            width: "55%",
            height: 14,
            background: "#eee",
            borderRadius: 6,
            marginBottom: 8
          }}
        />

        <div
          style={{
            width: "40%",
            height: 12,
            background: "#f5f5f5",
            borderRadius: 6
          }}
        />
      </div>
    </div>
  );
}

export default function MallsPage() {
  const navigate = useNavigate();
  const { setSelectedMall, setSelectedFloor } = useMall();

  const [search, setSearch] = useState("");

  const { data: allMalls, loading } = useFetch(() => mallAPI.getAll(), []);
  const { data: recentMalls } = useFetch(() => mallAPI.getRecent(), []);

  const filtered =
    allMalls?.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleSelect = (mall) => {
    setSelectedMall(mall);
    setSelectedFloor(null);
    navigate("/");
  };

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
          padding: "48px 16px 18px",
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
            gap: 10,
            marginBottom: 14
          }}
        >
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
            <div style={{ fontWeight: 700, fontSize: 18 }}>Select Mall</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>
              Choose a shopping mall
            </div>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search malls..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            outline: "none",
            fontSize: 13
          }}
        />
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 14px 100px"
        }}
      >
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} />)
        ) : (
          <>
            {!search && recentMalls?.length > 0 && (
              <>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 10
                  }}
                >
                  Recent
                </div>

                {recentMalls.map((m) => (
                  <MallCard
                    key={m.id}
                    mall={m}
                    onClick={() => handleSelect(m)}
                  />
                ))}
              </>
            )}

            {filtered.map((m) => (
              <MallCard
                key={m.id}
                mall={m}
                onClick={() => handleSelect(m)}
              />
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}