import React, { useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

const AdvocateProfile = () => {
  const { roles, assignments, cases, comments } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const officialId = authUser?.OfficialID || authUser?.UserID;
  const role = roles.find((r) => r.RoleID === authUser?.RoleID);

  const assignedCount = assignments.filter((a) => a.AssignedToUserID === officialId).length;
  const activeCount = assignments
    .filter((a) => a.AssignedToUserID === officialId)
    .map((a) => cases.find((c) => c.CaseID === a.CaseID))
    .filter((c) => c && c.Status !== "Closed").length;
  const commentCount = comments.filter((c) => c.UserID === officialId).length;

  const fields = [
    ["Staff ID", authUser?.StaffID],
    ["Designation", authUser?.Designation],
    ["Department", authUser?.Department],
    ["Email", authUser?.Email],
    ["Phone", authUser?.Phone],
    ["Specialization", authUser?.Specialization],
    ["Bar Council ID", authUser?.BarCouncilID || "—"],
    ["Role", role?.RoleName],
    ["Status", authUser?.Status],
  ];

  return (
    <div style={{ maxWidth: 720, animation: "fadeIn 0.2s ease-out" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #E5E7EB",
          padding: 28,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <Avatar name={authUser?.FullName || "?"} size={72} style={{ margin: "0 auto 14px", fontSize: 26 }} />
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "var(--color-navy-dark)" }}>{authUser?.FullName}</h2>
        <p style={{ margin: 0, fontSize: 13, color: "hsl(215, 10%, 50%)" }}>{authUser?.Designation}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          ["Total Assigned", assignedCount],
          ["Active Cases", activeCount],
          ["Messages Sent", commentCount],
        ].map(([label, val]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-blue)" }}>{val}</div>
            <div style={{ fontSize: 11, color: "hsl(215, 10%, 55%)", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-navy-dark)" }}>Professional Profile</h3>
        {fields.map(([label, val]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #F1F5F9",
              fontSize: 13,
            }}
          >
            <span style={{ color: "hsl(215, 10%, 55%)" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "var(--color-navy-dark)", textAlign: "right", maxWidth: "60%" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvocateProfile;
