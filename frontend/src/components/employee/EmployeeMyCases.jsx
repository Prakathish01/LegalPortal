import React, { useContext, useState, useMemo } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import { getCategoryIcon } from "../../utils/categoryMeta";

const STEPS = ["Open", "In Progress", "Under Review", "Closed"];

const EmployeeMyCases = ({ onSelectCase, setActiveView }) => {
  const { cases, categories, assignments, getPersonName } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState("All");

  const myCases = useMemo(
    () =>
      cases
        .filter((c) => c.UserID === authUser?.UserID)
        .filter((c) => filterStatus === "All" || c.Status === filterStatus)
        .sort((a, b) => b.CaseID - a.CaseID),
    [cases, authUser, filterStatus]
  );

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 4px" }}>My Cases</h2>
          <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 50%)", margin: 0 }}>Track the status of every case you've filed.</p>
        </div>
        <button
          onClick={() => setActiveView("file")}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--color-blue)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + File New Case
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["All", ...STEPS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid",
              borderColor: filterStatus === s ? "var(--color-blue)" : "#D1D5DB",
              background: filterStatus === s ? "var(--color-blue)" : "#fff",
              color: filterStatus === s ? "#fff" : "hsl(215, 15%, 40%)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {myCases.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-navy-dark)", marginBottom: 6 }}>
            No cases in this view
          </div>
          <div style={{ fontSize: 12.5, color: "hsl(215, 10%, 55%)" }}>
            {filterStatus === "All" ? "You haven't filed any cases yet." : `No cases with status "${filterStatus}".`}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myCases.map((c) => {
            const cat = categories.find((cc) => cc.CategoryID === c.CategoryID);
            const assignment = assignments.find((a) => a.CaseID === c.CaseID);
            const advocateName = assignment ? getPersonName(assignment.AssignedToUserID) : null;
            const currentStepIdx = STEPS.indexOf(c.Status === "Under Review" ? "Under Review" : c.Status);

            return (
              <div
                key={c.CaseID}
                onClick={() => onSelectCase(c)}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #E5E7EB",
                  padding: 20,
                  cursor: "pointer",
                }}
                className="recent-case-row"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 24 }}>{getCategoryIcon(c.CategoryID)}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-navy-dark)", marginBottom: 3 }}>
                        #{c.CaseID} — {c.Subject}
                      </div>
                      <div style={{ fontSize: 11.5, color: "hsl(215, 10%, 55%)" }}>{cat?.CategoryName}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Badge label={c.Priority} type="priority" />
                    <Badge label={c.Status} />
                  </div>
                </div>

                {/* Progress tracker */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: advocateName ? 14 : 4 }}>
                  {STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isLast = idx === STEPS.length - 1;
                    return (
                      <React.Fragment key={step}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64 }}>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: isDone ? "var(--color-blue)" : "#E5E7EB",
                              color: isDone ? "#fff" : "#9CA3AF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {isDone ? "✓" : idx + 1}
                          </div>
                          <div style={{ fontSize: 9.5, color: isDone ? "var(--color-navy-dark)" : "#9CA3AF", marginTop: 4, fontWeight: isDone ? 600 : 400, textAlign: "center" }}>
                            {step}
                          </div>
                        </div>
                        {!isLast && (
                          <div
                            style={{
                              flex: 1,
                              height: 2,
                              background: idx < currentStepIdx ? "var(--color-blue)" : "#E5E7EB",
                              marginBottom: 16,
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {advocateName && (
                  <div style={{ fontSize: 11.5, color: "hsl(215, 10%, 50%)", borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                    Handled by <strong style={{ color: "var(--color-navy-dark)" }}>{advocateName}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeMyCases;
