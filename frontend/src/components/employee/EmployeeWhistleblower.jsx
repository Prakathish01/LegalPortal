import React, { useState } from "react";
import NewWhistleblowerModal from "../modals/NewWhistleblowerModal";

const EmployeeWhistleblower = () => {
  const [showModal, setShowModal] = useState(false);
  const [lastRef, setLastRef] = useState(null);
  const [trackRef, setTrackRef] = useState("");

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 6 }}>
        Anonymous Whistleblower Channel
      </h2>
      <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 50%)", marginBottom: 24, maxWidth: 560 }}>
        Report fraud, ethics violations, safety issues, or misconduct confidentially. This channel is completely
        anonymous and is never linked to your employee account.
      </p>

      <div
        style={{
          background: "linear-gradient(135deg, var(--color-navy), #1E293B)",
          borderRadius: 16,
          padding: 28,
          color: "#fff",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Your identity is protected</span>
        </div>
        <p style={{ fontSize: 12.5, color: "hsl(217, 25%, 78%)", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 540 }}>
          Reports go directly to the Ethics Committee with no login session metadata, IP address, or employee ID
          attached. You'll receive a Reference Number to track investigation status — keep it safe, as it's the
          only way to look up your report.
        </p>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            border: "none",
            background: "#fff",
            color: "var(--color-navy-dark)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔒 Submit a Secure Report
        </button>
      </div>

      {/* What you can report */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "💰", label: "Financial Fraud", desc: "Misappropriation, conflict of interest" },
          { icon: "🔐", label: "Data Privacy Breach", desc: "Mishandling of sensitive information" },
          { icon: "⚠️", label: "Safety Violation", desc: "Compliance or workplace safety risks" },
          { icon: "🚫", label: "Retaliation", desc: "Workplace ethics violations" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "hsl(215, 10%, 55%)" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Track existing report (by ref number, no list shown) */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 22 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 10 }}>
          Track a Previous Report
        </h3>
        <p style={{ fontSize: 11.5, color: "hsl(215, 10%, 55%)", marginBottom: 14 }}>
          For confidentiality, reports are never listed here. Enter your Reference Number to check status with the
          Ethics Committee directly.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="e.g. WB-2024-0007"
            value={trackRef}
            onChange={(e) => setTrackRef(e.target.value)}
            style={{
              flex: 1,
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={() =>
              alert(
                trackRef.trim()
                  ? `Status lookups for ${trackRef.trim()} happen through the secure Ethics Committee channel (not visible here, by design, since reports aren't linked to accounts).`
                  : "Please enter a reference number."
              )
            }
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: "var(--color-navy)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Check Status
          </button>
        </div>
      </div>

      {showModal && (
        <NewWhistleblowerModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default EmployeeWhistleblower;
