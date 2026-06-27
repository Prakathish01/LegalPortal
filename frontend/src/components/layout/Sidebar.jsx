import React, { useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

const NAV = [
  { id: "dashboard",     label: "Overview",        icon: "📊" },
  { id: "cases",         label: "Cases",           icon: "📁" },
  { id: "users",         label: "Users",           icon: "👥" },
  { id: "whistleblower", label: "Whistleblower",   icon: "🔒" },
];

const Sidebar = ({ activeView, setActiveView }) => {
  const { cases, whistleblowerReports, roles } = useContext(GrievanceContext);
  const { authUser, logout } = useAuth();
  const roleName = roles.find((r) => r.RoleID === authUser?.RoleID)?.RoleName || "Staff";

  // Dynamic badge counts
  const activeCasesCount = cases.filter(c => c.Status === "Open" || c.Status === "In Progress" || c.Status === "Under Review").length;
  const openWbCount = whistleblowerReports.filter(r => r.Status !== "Closed").length;

  return (
    <div className="sidebar" style={{
      width: 240,
      flexShrink: 0,
      backgroundColor: "var(--color-navy)",
      display: "flex",
      flexDirection: "column",
      padding: "0 0 20px",
      color: "#fff",
      boxShadow: "4px 0 24px rgba(15, 31, 61, 0.15)",
      zIndex: 10,
      position: "relative"
    }}>
      {/* Brand Header */}
      <div className="sidebar-brand" style={{ padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--color-blue), #6366F1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            flexShrink: 0
          }}>⚖️</div>
          <div className="sidebar-logo-text">
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "#F9FAFB", lineHeight: 1.2 }}>LegalDesk</div>
            <div style={{ fontSize: 10, color: "hsl(217, 30%, 60%)", fontWeight: 500, marginTop: 2 }}>Segment 6 Ethics</div>
          </div>
        </div>
      </div>

      <div className="sidebar-divider" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", margin: "0 16px 12px" }} />

      {/* Nav Link List */}
      <nav style={{ padding: "0 12px", flex: 1 }}>
        {NAV.map(n => {
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
                background: isActive ? "linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))" : "transparent",
                color: isActive ? "hsl(214, 100%, 80%)" : "hsl(217, 20%, 75%)",
                marginBottom: 4,
                transition: "all 0.2s ease",
                borderLeft: isActive ? "3px solid var(--color-blue)" : "3px solid transparent",
              }}
              className="nav-btn"
            >
              <span className="sidebar-btn-icon" style={{ fontSize: 16, opacity: isActive ? 1 : 0.7 }}>{n.icon}</span>
              <span className="sidebar-btn-label" style={{ flex: 1 }}>{n.label}</span>
              
              {/* Notifications / Badges */}
              {n.id === "cases" && activeCasesCount > 0 && (
                <span className="sidebar-badge" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#93C5FD",
                  borderRadius: 999,
                  padding: "2px 8px",
                  border: "1px solid rgba(59, 130, 246, 0.3)"
                }}>{activeCasesCount}</span>
              )}

              {n.id === "whistleblower" && openWbCount > 0 && (
                <span className="sidebar-badge" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: "hsl(0, 75%, 45%)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "2px 6px",
                  boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)"
                }}>{openWbCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Current User Profile Block */}
      {authUser && (
        <div style={{ padding: "12px 12px 0" }}>
          <div className="sidebar-profile-box" style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: 12,
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            <Avatar name={authUser.FullName} size={36} />
            <div className="profile-details" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F3F4F6", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {authUser.FullName}
              </div>
              <div style={{ fontSize: 10, color: "hsl(217, 15%, 55%)", marginTop: 2, fontWeight: 500 }}>
                {authUser?.Designation || authUser?.Department} · {roleName}
              </div>
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

export default Sidebar;
