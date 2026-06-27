import React from "react";

const Avatar = ({ name = "?", size = 32, style = {} }) => {
  const initials = name
    .replace("Adv. ", "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 37 % 360;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${(hue + 40) % 360}, 55%, 38%))`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justify: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        userSelect: "none",
        ...style,
      }}
      title={name}
    >
      {initials || "?"}
    </div>
  );
};

export default Avatar;
