import React from "react";

const FloatingChatLauncher = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Ask AI Advocate"
    style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      width: 58,
      height: 58,
      borderRadius: "50%",
      border: "none",
      background: "linear-gradient(135deg, #7C3AED, #6366F1)",
      color: "#fff",
      fontSize: 24,
      cursor: "pointer",
      boxShadow: "0 10px 25px rgba(99, 102, 241, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
      animation: "floatPulse 2.5s ease-in-out infinite",
    }}
  >
    🤖
    <style>{`
      @keyframes floatPulse {
        0%, 100% { transform: translateY(0); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.45); }
        50% { transform: translateY(-4px); box-shadow: 0 16px 30px rgba(99, 102, 241, 0.55); }
      }
    `}</style>
  </button>
);

export default FloatingChatLauncher;
