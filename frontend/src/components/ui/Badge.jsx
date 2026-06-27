import React from "react";

export const PRIORITY_META = {
  Critical: { bg: "hsl(0, 100%, 96%)", text: "hsl(0, 72%, 35%)", dot: "hsl(0, 72%, 50%)", border: "hsl(0, 100%, 90%)" },
  High:     { bg: "hsl(35, 100%, 96%)", text: "hsl(35, 85%, 30%)", dot: "hsl(35, 85%, 45%)", border: "hsl(35, 100%, 90%)" },
  Medium:   { bg: "hsl(214, 100%, 96%)", text: "hsl(214, 80%, 35%)", dot: "hsl(214, 80%, 50%)", border: "hsl(214, 100%, 92%)" },
  Low:      { bg: "hsl(142, 70%, 95%)", text: "hsl(142, 70%, 25%)", dot: "hsl(142, 70%, 40%)", border: "hsl(142, 70%, 88%)" },
};

export const STATUS_META = {
  "Open":                { bg: "hsl(214, 100%, 96%)", text: "hsl(214, 80%, 35%)", border: "hsl(214, 100%, 90%)", dot: "hsl(214, 80%, 50%)" },
  "In Progress":         { bg: "hsl(35, 100%, 96%)", text: "hsl(35, 85%, 30%)", border: "hsl(35, 100%, 90%)", dot: "hsl(35, 85%, 45%)" },
  "Under Review":        { bg: "hsl(262, 80%, 96%)", text: "hsl(262, 80%, 40%)", border: "hsl(262, 80%, 90%)", dot: "hsl(262, 80%, 55%)" },
  "Closed":              { bg: "hsl(142, 70%, 95%)", text: "hsl(142, 70%, 25%)", border: "hsl(142, 70%, 85%)", dot: "hsl(142, 70%, 35%)" },
  "Submitted":           { bg: "hsl(200, 90%, 96%)", text: "hsl(200, 80%, 35%)", border: "hsl(200, 90%, 88%)", dot: "hsl(200, 80%, 45%)" },
  "Under Investigation": { bg: "hsl(280, 75%, 96%)", text: "hsl(280, 75%, 40%)", border: "hsl(280, 75%, 90%)", dot: "hsl(280, 75%, 50%)" },
};

const Badge = ({ label, type = "status", style = {} }) => {
  const meta = type === "priority" 
    ? (PRIORITY_META[label] || PRIORITY_META["Medium"])
    : (STATUS_META[label] || STATUS_META["Open"]);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.03em",
        backgroundColor: meta.bg,
        color: meta.text,
        border: `1px solid ${meta.border || "transparent"}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {meta.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: meta.dot,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
};

export default Badge;
