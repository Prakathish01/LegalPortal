import React, { useState, useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import Badge from "../ui/Badge";
import NewWhistleblowerModal from "../modals/NewWhistleblowerModal";

const WhistleblowerView = () => {
  const { whistleblowerReports } = useContext(GrievanceContext);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const total = whistleblowerReports.length;
  const underInvestigation = whistleblowerReports.filter((r) => r.Status === "Under Investigation").length;
  const submitted = whistleblowerReports.filter((r) => r.Status === "Submitted").length;
  const closed = whistleblowerReports.filter((r) => r.Status === "Closed").length;

  const handleToggleExpand = (id) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  const copyRefNumber = (e, refNum) => {
    e.stopPropagation();
    navigator.clipboard.writeText(refNum);
    alert(`Reference number ${refNum} copied to clipboard.`);
  };

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Title */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 4px" }}>
            Whistleblower Investigations
          </h2>
          <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 55%)", margin: 0 }}>
            Confidential reports submitted anonymously to the Ethics & Compliance Committee.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, var(--color-navy), #1E293B)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(15, 31, 61, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
          className="btn-hover-glow"
        >
          🔒 Submit Secure Report
        </button>
      </div>

      {/* Top Banner Disclaimer */}
      <div style={{
        backgroundColor: "hsl(0, 100%, 97%)",
        border: "1px solid hsl(0, 100%, 92%)",
        color: "hsl(0, 100%, 25%)",
        padding: "12px 16px",
        borderRadius: 10,
        marginBottom: 24,
        fontSize: 12.5,
        lineHeight: 1.5,
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div>
          <strong>Strict Access Control:</strong> This panel is restricted to empanelled compliance officers. Information regarding these files must remain confidential under policy guidelines.
        </div>
      </div>

      {/* Mini Stats Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 12,
        marginBottom: 24
      }}>
        {[
          ["Total Reports", total, "var(--color-navy)"],
          ["Submitted", submitted, "var(--color-blue)"],
          ["Under Investigation", underInvestigation, "hsl(262, 80%, 50%)"],
          ["Closed Cases", closed, "var(--color-green)"]
        ].map(([label, val, color]) => (
          <div
            key={label}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "14px 16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.1, marginBottom: 4 }}>{val}</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "hsl(215, 10%, 45%)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Report list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {whistleblowerReports.map((r) => {
          const isExpanded = expandedReportId === r.ReportID;
          return (
            <div
              key={r.ReportID}
              onClick={() => handleToggleExpand(r.ReportID)}
              style={{
                backgroundColor: "#fff",
                border: isExpanded ? "1px solid var(--color-blue)" : "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
                boxShadow: isExpanded ? "0 4px 12px rgba(59,130,246,0.05)" : "0 1px 3px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease"
              }}
              className="wb-card"
            >
              {/* Card Summary Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "var(--color-navy-dark)",
                    margin: "0 0 6px",
                    lineHeight: 1.3
                  }}>
                    {r.Subject}
                  </h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11.5, color: "hsl(215, 10%, 55%)", fontWeight: 500 }}>{r.Category}</span>
                    <span style={{ color: "#CBD5E1" }}>·</span>
                    <span style={{ fontSize: 11, color: "hsl(215, 10%, 60%)" }}>Submitted: {r.SubmittedDate.split(" ")[0]}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <Badge label={r.Status} />
                  <span style={{ fontSize: 12, color: "hsl(215, 10%, 65%)" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div
                  onClick={(e) => e.stopPropagation()} // stop toggle collapse on content clicks
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    marginTop: 16,
                    paddingTop: 16,
                    animation: "fadeIn 0.15s ease"
                  }}
                >
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 8 }}>
                    Report Description & Evidence Details
                  </h4>
                  <p style={{
                    fontSize: 13,
                    color: "hsl(215, 15%, 30%)",
                    lineHeight: 1.6,
                    margin: "0 0 20px",
                    whiteSpace: "pre-wrap"
                  }}>
                    {r.Description || "No further details provided."}
                  </p>

                  <div style={{
                    backgroundColor: "#F8FAFC",
                    padding: 12,
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "hsl(215, 10%, 55%)", display: "block", marginBottom: 2 }}>REFERENCE NUMBER</span>
                      <code style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-navy-dark)", fontFamily: "monospace" }}>{r.ReferenceNumber}</code>
                    </div>
                    
                    <button
                      onClick={(e) => copyRefNumber(e, r.ReferenceNumber)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-blue)",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Copy Ref
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewWhistleblowerModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default WhistleblowerView;
