import React, { useContext, useState, useRef, useEffect } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = () => {
  const { users } = useContext(GrievanceContext);
  const {
    portalMode,
    authError,
    isAuthenticating,
    loginAsUser,
    loginAsStaff,
    switchToStaffLogin,
    switchToUserLogin,
    setAuthError,
  } = useAuth();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const profileRef = useRef(null);

  // Plain employees only for the quick-access picker (RoleID 6)
  const employeeOptions = users.filter((u) => u.RoleID === 6 && u.Status === "Active");
  const selectedEmployee = employeeOptions.find((u) => u.UserID === Number(selectedEmployeeId));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserLogin = (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setAuthError("Please select your profile to continue.");
      return;
    }
    loginAsUser(selectedEmployeeId);
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setAuthError("Please enter both Staff ID/Email and password.");
      return;
    }
    await loginAsStaff({ identifier: identifier.trim(), password: password.trim() });
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, hsl(218,55%,18%), hsl(218,60%,9%) 60%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Admin login toggle - top right corner */}
      <div style={{ position: "absolute", top: 24, right: 28, zIndex: 5 }}>
        {portalMode === "user" ? (
          <button onClick={switchToStaffLogin} style={adminBtnStyle}>
            🛡️ Staff Login
          </button>
        ) : (
          <button onClick={switchToUserLogin} style={adminBtnStyle}>
            ← User Portal
          </button>
        )}
      </div>

      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)",
          top: "-15%",
          right: "-10%",
        }}
      />

      <div
        style={{
          width: "92%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "36px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          zIndex: 2,
          animation: "scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, var(--color-blue), #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              margin: "0 auto 14px",
              boxShadow: "0 8px 20px rgba(59,130,246,0.35)",
            }}
          >
            ⚖️
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>LegalDesk</div>
          <div style={{ fontSize: 12, color: "hsl(217, 25%, 65%)", marginTop: 4 }}>
            {portalMode === "staff" ? "Staff & Advocate Portal" : "Legal, Ethics & Grievance Support"}
          </div>
        </div>

        {authError && (
          <div
            style={{
              background: "hsl(0, 70%, 18%)",
              border: "1px solid hsl(0, 70%, 30%)",
              color: "hsl(0, 90%, 85%)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              marginBottom: 18,
              fontWeight: 500,
            }}
          >
            ⚠️ {authError}
          </div>
        )}

        {portalMode === "user" ? (
          <form onSubmit={handleUserLogin}>
            <label style={labelStyle}>Select Your Profile</label>
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                style={{
                  ...selectStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  color: selectedEmployee ? "#fff" : "hsl(217, 20%, 55%)",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedEmployee
                    ? `${selectedEmployee.FullName} (${selectedEmployee.EmployeeID}) · ${selectedEmployee.Department}`
                    : "— Choose your name —"}
                </span>
                <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 8, flexShrink: 0 }}>
                  {profileOpen ? "▲" : "▼"}
                </span>
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    maxHeight: 220,
                    overflowY: "auto",
                    background: "hsl(218, 55%, 12%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                    zIndex: 20,
                  }}
                >
                  {employeeOptions.map((u) => {
                    const isSelected = Number(selectedEmployeeId) === u.UserID;
                    return (
                      <button
                        key={u.UserID}
                        type="button"
                        onClick={() => {
                          setSelectedEmployeeId(String(u.UserID));
                          setProfileOpen(false);
                          setAuthError("");
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 14px",
                          border: "none",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          background: isSelected ? "rgba(59,130,246,0.22)" : "transparent",
                          color: isSelected ? "#fff" : "hsl(217, 20%, 78%)",
                          fontSize: 13,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {u.FullName} ({u.EmployeeID}) · {u.Department}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "hsl(217, 20%, 60%)",
                marginTop: 8,
                marginBottom: 22,
                lineHeight: 1.5,
              }}
            >
              Demo mode: pick your employee profile to enter the portal. In production this becomes SSO / company login.
            </div>

            <button type="submit" style={primaryBtnStyle}>
              Continue to User Portal →
            </button>
          </form>
        ) : (
          <form onSubmit={handleStaffLogin}>
            <label style={labelStyle}>Staff ID or Email</label>
            <input
              type="text"
              className="login-dark-input"
              placeholder="e.g. LD-MGR-001 or priya.nair@company.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={inputStyle}
              autoComplete="username"
            />

            <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
            <input
              type="password"
              className="login-dark-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
            />

            <div
              style={{
                fontSize: 11,
                color: "hsl(217, 20%, 60%)",
                marginTop: 8,
                marginBottom: 22,
                lineHeight: 1.5,
              }}
            >
              Demo mode: any password (4+ characters) works for a valid Staff ID/Email. Admin and advocates share this login — you are routed to the correct portal by role.
            </div>

            <button type="submit" disabled={isAuthenticating} style={primaryBtnStyle}>
              {isAuthenticating ? "Verifying…" : "Sign In to Staff Portal →"}
            </button>

            <div style={{ marginTop: 16, fontSize: 10.5, color: "hsl(217, 15%, 50%)", textAlign: "center" }}>
              Admin, Legal Manager, Legal Agent, HR, ICC, and Empanelled Advocates.
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 600,
  color: "hsl(217, 25%, 70%)",
  marginBottom: 7,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const selectStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const inputStyle = { ...selectStyle };

const primaryBtnStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, var(--color-blue), #2563EB)",
  color: "#fff",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
};

const adminBtnStyle = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "#E2E8F0",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

export default LoginScreen;
