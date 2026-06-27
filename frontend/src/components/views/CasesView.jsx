import React, { useState, useMemo, useContext } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import NewCaseModal from "../modals/NewCaseModal";

const CasesView = ({ onSelectCase, assignedToId = null }) => {
  const { cases, categories, assignments, getPersonName } = useContext(GrievanceContext);
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  // Helper search & filter logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (assignedToId) {
        const assignment = assignments.find((a) => a.CaseID === c.CaseID);
        if (!assignment || Number(assignment.AssignedToUserID) !== Number(assignedToId)) return false;
      }
      const cat = categories.find((catItem) => catItem.CategoryID === c.CategoryID);
      const filerName = getPersonName(c.UserID);
      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        c.Subject.toLowerCase().includes(q) ||
        (c.Description && c.Description.toLowerCase().includes(q)) ||
        filerName.toLowerCase().includes(q) ||
        (cat && cat.CategoryName.toLowerCase().includes(q)) ||
        String(c.CaseID).includes(q);

      const matchStatus = filterStatus === "All" || c.Status === filterStatus;
      const matchPriority = filterPriority === "All" || c.Priority === filterPriority;
      const matchCat = filterCat === "All" || String(c.CategoryID) === filterCat;

      return matchSearch && matchStatus && matchPriority && matchCat;
    });
  }, [cases, search, filterStatus, filterPriority, filterCat, categories, assignments, assignedToId, getPersonName]);

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #D1D5DB",
    fontSize: 12.5,
    fontWeight: 500,
    color: "var(--color-navy-dark)",
    background: "#fff",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
  };

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Title block */}
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
            {assignedToId ? "My Assigned Cases" : "Grievance Cases"}
          </h2>
          <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 55%)", margin: 0 }}>
            Showing {filteredCases.length} of {assignedToId ? filteredCases.length : cases.length} {assignedToId ? "assigned" : "active grievance"} files.
          </p>
        </div>
        
        {!assignedToId && !isAdmin && (
        <button
          onClick={() => setShowNewCaseModal(true)}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, var(--color-blue), #2563EB)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s"
          }}
          className="btn-hover-glow"
        >
          <span style={{ fontSize: 16 }}>+</span> File New Case
        </button>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 20,
        flexWrap: "wrap",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}>
        <input
          type="text"
          placeholder="Search by ID, subject, employee name, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...selectStyle,
            padding: "8px 14px",
            flex: "1 1 240px",
            boxSizing: "border-box"
          }}
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.CategoryID} value={c.CategoryID}>
              {c.CategoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Cases Table */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{
                background: "#F8FAFC",
                borderBottom: "1px solid #E5E7EB",
                userSelect: "none"
              }}>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filed By</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned To</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "hsl(215, 15%, 50%)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, i) => {
                const cat = categories.find((catItem) => catItem.CategoryID === c.CategoryID);
                const filerName = getPersonName(c.UserID);
                const assignment = assignments.find((a) => a.CaseID === c.CaseID);
                const assigneeName = assignment ? getPersonName(assignment.AssignedToUserID) : null;

                return (
                  <tr
                    key={c.CaseID}
                    onClick={() => onSelectCase(c)}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      cursor: "pointer",
                      background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                      transition: "background-color 0.15s ease"
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: "12px 16px", color: "hsl(215, 10%, 50%)", fontFamily: "monospace", fontWeight: 600 }}>
                      #{c.CaseID}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--color-navy-dark)", maxWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{cat?.CategoryID === 8 ? "🔒" : "📄"}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.Subject}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={filerName} size={24} />
                        <span style={{ color: "hsl(215, 20%, 30%)", whiteSpace: "nowrap", fontWeight: 500 }}>
                          {filerName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "hsl(215, 15%, 45%)", fontSize: 12.5 }}>
                      {cat?.CategoryName}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge label={c.Priority} type="priority" />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge label={c.Status} type="status" />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {assigneeName ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Avatar name={assigneeName} size={20} />
                          <span style={{ color: "hsl(215, 15%, 40%)", fontSize: 12.5, whiteSpace: "nowrap", fontWeight: 500 }}>
                            {assigneeName.replace("Adv. ", "")}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "hsl(215, 10%, 65%)", fontStyle: "italic", fontSize: 12.5 }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "hsl(215, 10%, 55%)", fontSize: 12, whiteSpace: "nowrap" }}>
                      {c.CreatedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCases.length === 0 && (
          <div style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "hsl(215, 10%, 60%)",
            fontSize: 14
          }}>
            🔍 No cases found matching your filters.
          </div>
        )}
      </div>

      {/* New Case Modal Overlay */}
      {showNewCaseModal && (
        <NewCaseModal onClose={() => setShowNewCaseModal(false)} />
      )}
    </div>
  );
};

export default CasesView;
