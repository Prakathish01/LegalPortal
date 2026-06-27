import React, { useContext, useState, useRef, useEffect } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";

const Header = ({ activeViewLabel }) => {
  const { notifications, currentUser, markNotificationAsRead, markAllNotificationsAsRead } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const notifyUserId = authUser?.OfficialID || authUser?.UserID || currentUser?.UserID || 1;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter notifications for current user (or Admin)
  const userNotifs = notifications.filter(n => n.UserID === notifyUserId);
  const unreadCount = userNotifs.filter(n => !n.IsRead).length;

  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format today's date
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString("en-US", options);
  };

  return (
    <header style={{
      height: 64,
      backgroundColor: "#fff",
      borderBottom: "1px solid #E5E7EB",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
      position: "relative"
    }}>
      {/* View Title */}
      <h1 style={{
        fontSize: 18,
        fontWeight: 700,
        color: "var(--color-navy-dark)",
        margin: 0,
        letterSpacing: "-0.015em"
      }}>
        {activeViewLabel}
      </h1>

      {/* Date & Notifications */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Date Display */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          fontWeight: 500,
          color: "hsl(215, 15%, 50%)",
          backgroundColor: "#F1F5F9",
          padding: "6px 12px",
          borderRadius: 8
        }}>
          <span>📅</span> {getFormattedDate()}
        </div>

        {/* Notifications Icon and Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          {/* Notification Icon Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              position: "relative",
              transition: "background-color 0.2s ease",
              backgroundColor: isOpen ? "#EFF6FF" : "transparent",
            }}
            className="notif-btn"
          >
            <span>🔔</span>
            {unreadCount > 0 && (
              <span style={{
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
                animation: "pulse 2s infinite"
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 340,
              backgroundColor: "#fff",
              borderRadius: 12,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E2E8F0",
              zIndex: 100,
              overflow: "hidden",
              animation: "fadeInUp 0.15s ease-out"
            }}>
              {/* Header */}
              <div style={{
                padding: "14px 16px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC"
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)" }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead(notifyUserId)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-blue)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{
                maxHeight: 280,
                overflowY: "auto",
              }}>
                {userNotifs.length === 0 ? (
                  <div style={{
                    padding: "30px 16px",
                    textAlign: "center",
                    color: "hsl(215, 15%, 60%)",
                    fontSize: 12
                  }}>
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
                        transition: "background-color 0.15s ease",
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                      className="notif-item"
                    >
                      <span style={{
                        marginTop: 2,
                        fontSize: 13,
                        color: n.IsRead ? "hsl(215, 10%, 60%)" : "var(--color-blue)"
                      }}>
                        {n.IsRead ? "✓" : "🔵"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 12,
                          color: n.IsRead ? "hsl(215, 10%, 45%)" : "var(--color-navy-dark)",
                          fontWeight: n.IsRead ? 400 : 500,
                          lineHeight: 1.4,
                          marginBottom: 4
                        }}>
                          {n.Message}
                        </div>
                        <div style={{ fontSize: 10, color: "hsl(215, 10%, 60%)" }}>
                          {n.CreatedDate}
                        </div>
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

export default Header;
