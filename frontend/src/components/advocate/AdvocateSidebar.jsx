import React from "react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

const NAV = [
  { id: "dashboard", label: "My Dashboard", icon: "📊" },
  { id: "assignments", label: "Assigned Cases", icon: "📁" },
  { id: "chats", label: "Case Messages", icon: "💬" },
  { id: "profile", label: "My Profile", icon: "👤" },
];

const AdvocateSidebar = ({ activeView, setActiveView, assignedCount }) => {
  const { authUser, logout } = useAuth();
  const roleLabel = authUser?.Designation || "Legal Advocate";

  return (
    <div
      className="sidebar"
      style={{
        width: 240,
        flexShrink: 0,
        backgroundColor: "var(--color-navy)",
        display: "flex",
        flexDirection: "column",
        padding: "0 0 20px",
        color: "#fff",
        boxShadow: "4px 0 24px rgba(15, 31, 61, 0.15)",
        zIndex: 10,
      }}
    >
      <div className="sidebar-brand" style={{ padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #059669, #10B981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0
            }}
          >
            ⚖️
          </div>
          <div className="sidebar-logo-text">
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F9FAFB" }}>LegalDesk</div>
            <div style={{ fontSize: 10, color: "hsl(217, 30%, 60%)", marginTop: 2 }}>Advocate Portal</div>
          </div>
        </div>
      </div>

      <div className="sidebar-divider" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", margin: "0 16px 12px" }} />

      <nav style={{ padding: "0 12px", flex: 1 }}>
        {NAV.map((n) => {
          const isActive = activeView === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActiveView(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "11px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "13.5px",
                fontWeight: isActive ? 600 : 500,
                background: isActive
                  ? "linear-gradient(90deg, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.06))"
                  : "transparent",
                color: isActive ? "hsl(152, 80%, 78%)" : "hsl(217, 20%, 75%)",
                marginBottom: 4,
                borderLeft: isActive ? "3px solid #10B981" : "3px solid transparent",
              }}
            >
              <span className="sidebar-btn-icon" style={{ fontSize: 16 }}>{n.icon}</span>
              <span className="sidebar-btn-label" style={{ flex: 1 }}>{n.label}</span>
              {n.id === "assignments" && assignedCount > 0 && (
                <span
                  className="sidebar-badge"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: "rgba(16, 185, 129, 0.25)",
                    color: "#6EE7B7",
                    borderRadius: 999,
                    padding: "2px 8px",
                  }}
                >
                  {assignedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {authUser && (
        <div style={{ padding: "4px 12px 0" }}>
          <div
            className="sidebar-profile-box"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 12,
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar name={authUser.FullName} size={36} />
            <div className="profile-details" style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#F3F4F6",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {authUser.FullName}
              </div>
              <div style={{ fontSize: 10, color: "hsl(217, 15%, 55%)", marginTop: 2 }}>{roleLabel}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              style={{
                background: "none",
                border: "none",
                color: "hsl(217, 20%, 60%)",
                cursor: "pointer",
                fontSize: 14,
                padding: 4,
              }}
            >
              ⏻
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvocateSidebar;
