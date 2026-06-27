import React, { useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import { getCategoryIcon } from "../../utils/categoryMeta";

const EmployeeHome = ({ setActiveView, onSelectCase }) => {
  const { cases, categories, users, notifications } = useContext(GrievanceContext);
  const { authUser } = useAuth();

  const myCases = cases.filter((c) => c.UserID === authUser?.UserID);
  const openCount = myCases.filter((c) => c.Status === "Open" || c.Status === "In Progress" || c.Status === "Under Review").length;
  const closedCount = myCases.filter((c) => c.Status === "Closed").length;
  const myNotifs = notifications.filter((n) => n.UserID === authUser?.UserID && !n.IsRead);

  const recentCases = [...myCases].sort((a, b) => b.CaseID - a.CaseID).slice(0, 4);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    { id: "file", label: "File a Complaint", desc: "Submit a new case manually", icon: "✍️", color: "var(--color-blue)" },
    { id: "ai-chat", label: "Ask AI Advocate", desc: "Describe it, get auto-matched", icon: "🤖", color: "#7C3AED" },
    { id: "my-cases", label: "Track My Cases", desc: `${myCases.length} total filed`, icon: "📁", color: "hsl(35, 85%, 45%)" },
    { id: "whistleblower", label: "Anonymous Report", desc: "Confidential ethics channel", icon: "🔒", color: "var(--color-navy)" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--color-navy), #1E3A8A)",
          borderRadius: 16,
          padding: "26px 32px",
          color: "#fff",
          marginBottom: 24,
          boxShadow: "0 4px 20px rgba(15, 31, 61, 0.08)",
        }}
      >
        <h2 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 6px" }}>
          {greeting()}, {authUser?.FullName?.split(" ")[0]} 👋
        </h2>
        <p style={{ fontSize: 13, color: "hsl(217, 30%, 80%)", margin: 0, maxWidth: 560, lineHeight: 1.5 }}>
          File a complaint, track existing cases, or describe your issue to our AI Advocate Assistant for instant
          triage and routing to the right specialist.
        </p>
        {myNotifs.length > 0 && (
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.1)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            🔔 You have {myNotifs.length} unread update{myNotifs.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Active Cases", value: openCount, color: "var(--color-blue)" },
          { label: "Resolved", value: closedCount, color: "var(--color-green)" },
          { label: "Total Filed", value: myCases.length, color: "var(--color-navy)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: "18px 20px" }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: "hsl(215, 10%, 50%)", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 26 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 14 }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          {quickActions.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveView(a.id)}
              style={{
                textAlign: "left",
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: 18,
                cursor: "pointer",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              className="kpi-card"
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${a.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 3 }}>
                  {a.label}
                </div>
                <div style={{ fontSize: 11.5, color: "hsl(215, 10%, 55%)" }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent cases */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-navy-dark)", margin: 0 }}>Your Recent Cases</h3>
          {myCases.length > 0 && (
            <button
              onClick={() => setActiveView("my-cases")}
              style={{ background: "none", border: "none", color: "var(--color-blue)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              View All →
            </button>
          )}
        </div>

        {recentCases.length === 0 ? (
          <EmptyState setActiveView={setActiveView} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentCases.map((c) => {
              const cat = categories.find((cc) => cc.CategoryID === c.CategoryID);
              return (
                <div
                  key={c.CaseID}
                  onClick={() => onSelectCase(c)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #F1F5F9",
                    cursor: "pointer",
                  }}
                  className="recent-case-row"
                >
                  <span style={{ fontSize: 20 }}>{getCategoryIcon(c.CategoryID)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--color-navy-dark)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 4,
                      }}
                    >
                      #{c.CaseID} — {c.Subject}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge label={c.Status} />
                      <Badge label={c.Priority} type="priority" />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "hsl(215, 10%, 60%)" }}>{c.CreatedDate}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ setActiveView }) => (
  <div style={{ textAlign: "center", padding: "30px 20px" }}>
    <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-navy-dark)", marginBottom: 4 }}>
      No cases filed yet
    </div>
    <div style={{ fontSize: 12, color: "hsl(215, 10%, 55%)", marginBottom: 16 }}>
      Need help? File a complaint or talk to our AI Advocate.
    </div>
    <button
      onClick={() => setActiveView("ai-chat")}
      style={{
        padding: "8px 18px",
        borderRadius: 8,
        border: "none",
        background: "var(--color-blue)",
        color: "#fff",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      🤖 Talk to AI Advocate
    </button>
  </div>
);

export default EmployeeHome;
