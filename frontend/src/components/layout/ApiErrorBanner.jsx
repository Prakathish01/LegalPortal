import React, { useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";

export default function ApiErrorBanner() {
  const { apiError, setApiError } = useContext(GrievanceContext);

  if (!apiError) return null;

  return (
    <div
      style={{
        margin: "0 0 16px 0",
        padding: "12px 16px",
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        animation: "slideDown 0.3s ease-out",
        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#DC2626" }}>Connection Issue</div>
          <div style={{ fontSize: "11.5px", color: "#B91C1C", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={apiError}>
            {apiError}
          </div>
        </div>
      </div>
      <button
        onClick={() => setApiError(null)}
        style={{
          background: "none",
          border: "none",
          color: "#EF4444",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "6px",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.08)"}
        onMouseLeave={(e) => e.target.style.background = "none"}
      >
        Dismiss
      </button>
    </div>
  );
}
