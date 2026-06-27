import React, { useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { getCategoryIcon } from "../../utils/categoryMeta";

const EmployeeProfile = () => {
  const { cases, categories, roles, notifications, markAllNotificationsAsRead } = useContext(GrievanceContext);
  const { authUser } = useAuth();

  const myCases = cases.filter((c) => c.UserID === authUser?.UserID);
  const myNotifs = [...notifications.filter((n) => n.UserID === authUser?.UserID)].sort(
    (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
  );
  const role = roles.find((r) => r.RoleID === authUser?.RoleID);

  const categoryFrequency = categories
    .map((cat) => ({ ...cat, count: myCases.filter((c) => c.CategoryID === cat.CategoryID).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 20 }}>My Profile</h2>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }} className="case-detail-grid">
        {/* Profile card */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 24, textAlign: "center" }}>
          <Avatar name={authUser?.FullName || "?"} size={72} style={{ margin: "0 auto 14px", fontSize: 26 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 4 }}>
            {authUser?.FullName}
          </div>
          <div style={{ fontSize: 12, color: "hsl(215, 10%, 55%)", marginBottom: 14 }}>{role?.RoleName}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
            {[
              ["Employee ID", authUser?.EmployeeID],
              ["Department", authUser?.Department],
              ["Email", authUser?.Email],
              ["Phone", authUser?.Phone],
              ["Status", <Badge label={authUser?.Status === "Active" ? "Open" : "Closed"} />, true],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "hsl(215, 10%, 55%)" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "var(--color-navy-dark)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Case category breakdown */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 22 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 14px" }}>
              Your Case History by Type
            </h3>
            {categoryFrequency.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "hsl(215, 10%, 55%)" }}>No cases filed yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {categoryFrequency.map((c) => (
                  <div key={c.CategoryID} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{getCategoryIcon(c.CategoryID)}</span>
                    <span style={{ flex: 1, fontSize: 12.5, color: "var(--color-navy-dark)" }}>{c.CategoryName}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: "#EFF6FF",
                        color: "var(--color-blue)",
                        padding: "2px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification history */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-navy-dark)", margin: 0 }}>
                Notification History
              </h3>
              <button
                onClick={() => markAllNotificationsAsRead(authUser?.UserID)}
                style={{ background: "none", border: "none", color: "var(--color-blue)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}
              >
                Mark all read
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 320, overflowY: "auto" }}>
              {myNotifs.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "hsl(215, 10%, 55%)" }}>No notifications yet.</div>
              ) : (
                myNotifs.map((n) => (
                  <div
                    key={n.NotificationID}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #F8FAFC",
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 12, color: n.IsRead ? "hsl(215, 10%, 70%)" : "var(--color-blue)", marginTop: 2 }}>
                      {n.IsRead ? "✓" : "🔵"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--color-navy-dark)", lineHeight: 1.4 }}>{n.Message}</div>
                      <div style={{ fontSize: 10, color: "hsl(215, 10%, 60%)", marginTop: 3 }}>{n.CreatedDate}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
