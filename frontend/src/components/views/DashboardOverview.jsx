import React, { useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import Badge from "../ui/Badge";

const DashboardOverview = ({ onSelectCase, onViewChange }) => {
  const { cases, whistleblowerReports, categories, getPersonName } = useContext(GrievanceContext);

  const totalCases = cases.length;
  const openCount = cases.filter(c => c.Status === "Open").length;
  const inProgressCount = cases.filter(c => c.Status === "In Progress").length;
  const underReviewCount = cases.filter(c => c.Status === "Under Review").length;
  const closedCount = cases.filter(c => c.Status === "Closed").length;
  const criticalCount = cases.filter(c => c.Priority === "Critical").length;
  const poshCount = cases.filter(c => c.CategoryID === 8).length;
  const wbOpenCount = whistleblowerReports.filter(r => r.Status !== "Closed").length;

  const statCards = [
    { label: "Total Cases", value: totalCases, sub: "All time", color: "var(--color-navy)", icon: "📂" },
    { label: "Open",        value: openCount,  sub: "Awaiting action", color: "var(--color-blue)", icon: "🔵" },
    { label: "In Progress", value: inProgressCount, sub: "Active handling", color: "hsl(35, 85%, 45%)", icon: "⏳" },
    { label: "Under Review",value: underReviewCount, sub: "Joint escalation", color: "hsl(262, 80%, 50%)", icon: "🔍" },
    { label: "Closed",      value: closedCount, sub: "Resolved grievances", color: "var(--color-green)", icon: "✅" },
    { label: "Critical Priority", value: criticalCount, sub: "Needs urgent action", color: "var(--color-red)", icon: "🚨" },
    { label: "POSH / ICC",  value: poshCount, sub: "ICC escalation", color: "#C026D3", icon: "🔒" },
    { label: "Whistleblower",value: wbOpenCount, sub: "Ethics reports", color: "#0D9488", icon: "🛡️" }
  ];

  // Cases by category
  const catCounts = categories.map(cat => {
    const count = cases.filter(c => c.CategoryID === cat.CategoryID).length;
    return {
      ...cat,
      count,
      percentage: totalCases > 0 ? (count / totalCases) * 100 : 0
    };
  }).sort((a, b) => b.count - a.count);

  // Recent cases (top 5 by ID / Date)
  const recentCases = [...cases]
    .sort((a, b) => b.CaseID - a.CaseID)
    .slice(0, 5);

  const handleRecentCaseClick = (caseItem) => {
    if (onSelectCase) onSelectCase(caseItem);
    if (onViewChange) onViewChange("cases");
  };

  return (
    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--color-navy), #1E3A8A)",
        borderRadius: 16,
        padding: "24px 32px",
        color: "#fff",
        marginBottom: 28,
        boxShadow: "0 4px 20px rgba(15, 31, 61, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Ethics & Legal Dashboard</h2>
          <p style={{ fontSize: 13, color: "hsl(217, 30%, 80%)", margin: 0, fontWeight: 400 }}>
            Real-time management portal for Segment 6 employee cases, inquiries, and secure whistleblower reports.
          </p>
        </div>
        <div style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 600,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          System Status: Online 🟢
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        {statCards.map((s, idx) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "20px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer"
            }}
            className="kpi-card"
            onClick={() => {
              if (s.label === "Whistleblower") {
                onViewChange("whistleblower");
              } else {
                onViewChange("cases");
              }
            }}
          >
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1.1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: "hsl(215, 10%, 60%)" }}>{s.sub}</div>
            </div>
            <span style={{ fontSize: 20, backgroundColor: "#F8FAFC", padding: 8, borderRadius: 8 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Charts / Lists Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }} className="dashboard-grid">
        
        {/* Category breakdown */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--color-navy-dark)", margin: "0 0 16px", borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
            Cases by Service Type
          </h3>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 380, paddingRight: 4 }}>
            {catCounts.map(c => (
              <div key={c.CategoryID} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "var(--color-navy-dark)", fontWeight: 500 }}>
                    {c.CategoryID === 8 ? "🔒" : "⚖️"} {c.CategoryName}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--color-navy)" }}>{c.count}</span>
                </div>
                <div style={{ height: 6, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 4,
                    background: c.CategoryID === 8 
                      ? "linear-gradient(90deg, #A855F7, #C026D3)" 
                      : "linear-gradient(90deg, var(--color-blue), #60A5FA)",
                    width: `${c.percentage}%`,
                    transition: "width 0.4s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent cases */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--color-navy-dark)", margin: "0 0 16px", borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>
            Recently Filed Cases
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto", maxHeight: 380 }}>
            {recentCases.map(c => {
              const cat = categories.find(catItem => catItem.CategoryID === c.CategoryID);
              const filerName = getPersonName(c.UserID);
              return (
                <div
                  key={c.CaseID}
                  onClick={() => handleRecentCaseClick(c)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #F1F5F9",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease, border-color 0.15s ease"
                  }}
                  className="recent-case-row"
                >
                  <span style={{ fontSize: 20, marginTop: 2 }}>{cat?.CategoryID === 8 ? "🔒" : "📄"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--color-navy-dark)",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      #{c.CaseID} — {c.Subject}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <Badge label={c.Status} />
                      <Badge label={c.Priority} type="priority" />
                      <span style={{ fontSize: 10.5, color: "hsl(215, 10%, 55%)", fontWeight: 500 }}>
                        Filer: {filerName}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10.5, color: "hsl(215, 10%, 60%)", whiteSpace: "nowrap", alignSelf: "center" }}>
                    {c.CreatedDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Whistleblower Spotlight */}
      <div style={{
        background: "linear-gradient(135deg, hsl(218, 60%, 12%), var(--color-navy))",
        borderRadius: 16,
        padding: 24,
        color: "#fff",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Confidential Ethics & Whistleblower Reports</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#FCA5A5", padding: "1px 6px", borderRadius: 4 }}>
              Encrypted
            </span>
          </div>
          <button
            onClick={() => onViewChange("whistleblower")}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
          >
            Access Ethics Desk →
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: "hsl(217, 20%, 75%)", lineHeight: 1.4, margin: "0 0 16px", maxWidth: 700 }}>
          Ethics violations, conflict of interest, fraud, safety issues, and harassment cases are routed directly through secure, isolated schemas. The reports below are kept strictly anonymous.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {whistleblowerReports.slice(0, 3).map(r => (
            <div
              key={r.ReportID}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 4, lineHeight: 1.4 }}>{r.Subject}</div>
                <div style={{ fontSize: 10, color: "hsl(217, 30%, 70%)", marginBottom: 12 }}>{r.Category}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>
                <span style={{ fontSize: 9.5, color: "hsl(217, 10%, 55%)", fontFamily: "monospace" }}>{r.ReferenceNumber}</span>
                <Badge label={r.Status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
