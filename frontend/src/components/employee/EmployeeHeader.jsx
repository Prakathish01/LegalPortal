import React, { useContext, useState, useRef, useEffect } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";

const VIEW_LABELS = {
  home: "Home",
  "my-cases": "My Cases",
  file: "File a Complaint",
  "ai-chat": "AI Advocate Assistant",
  whistleblower: "Whistleblower Channel",
  faq: "FAQ & Resources",
  profile: "My Profile",
};

const EmployeeHeader = ({ activeView }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userNotifs = notifications.filter((n) => n.UserID === authUser?.UserID);
  const unreadCount = userNotifs.filter((n) => !n.IsRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: 64,
        backgroundColor: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", margin: 0, letterSpacing: "-0.015em" }}>
        {VIEW_LABELS[activeView] || "Home"}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: isOpen ? "#EFF6FF" : "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              position: "relative",
            }}
          >
            <span>🔔</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "var(--color-red)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 2px #fff",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 340,
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                border: "1px solid #E2E8F0",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #E2E8F0",
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "#F8FAFC",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)" }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead(authUser?.UserID)}
                    style={{ background: "none", border: "none", color: "var(--color-blue)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {userNotifs.length === 0 ? (
                  <div style={{ padding: "30px 16px", textAlign: "center", color: "hsl(215, 15%, 60%)", fontSize: 12 }}>
                    No notifications yet.
                  </div>
                ) : (
                  userNotifs.map((n) => (
                    <div
                      key={n.NotificationID}
                      onClick={() => markNotificationAsRead(n.NotificationID)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #F1F5F9",
                        cursor: "pointer",
                        backgroundColor: n.IsRead ? "transparent" : "hsl(214, 100%, 98.5%)",
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <span style={{ marginTop: 2, fontSize: 13, color: n.IsRead ? "hsl(215, 10%, 60%)" : "var(--color-blue)" }}>
                        {n.IsRead ? "✓" : "🔵"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: n.IsRead ? "hsl(215, 10%, 45%)" : "var(--color-navy-dark)", fontWeight: n.IsRead ? 400 : 500, lineHeight: 1.4, marginBottom: 4 }}>
                          {n.Message}
                        </div>
                        <div style={{ fontSize: 10, color: "hsl(215, 10%, 60%)" }}>{n.CreatedDate}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
