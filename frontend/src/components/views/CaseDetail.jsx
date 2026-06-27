import React, { useState, useContext, useEffect } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import { getCategoryIcon } from "../../utils/categoryMeta";
import { isAdminRole, isUserRole } from "../../data/dataSource";

const goBackBtnStyle = {
  marginTop: 14,
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #D1D5DB",
  background: "#fff",
  color: "var(--color-navy-dark)",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
};

const CaseDetail = ({ caseId, onBack, isEmployeeView = false, isAdvocateView = false, defaultTab = "overview" }) => {
  const {
    cases,
    categories,
    users,
    officials,
    roles,
    assignments,
    comments,
    attachments,
    statusHistory,
    currentUser,
    getPerson,
    getPersonName,
    addComment,
    updateCaseStatus,
    assignCase,
    addAttachment,
    fetchCommentsForCase,
    fetchAttachmentsForCase
  } = useContext(GrievanceContext);

  useEffect(() => {
    if (caseId) {
      fetchCommentsForCase(caseId);
      fetchAttachmentsForCase(caseId);
    }
  }, [caseId, fetchCommentsForCase, fetchAttachmentsForCase]);
  const { authUser } = useAuth();

  const actingUser = isEmployeeView || isAdvocateView ? authUser : currentUser;
  const actingId = actingUser?.OfficialID || actingUser?.UserID;
  const canManageCase = !isEmployeeView;
  const canReassign = !isEmployeeView && !isAdvocateView;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [commentText, setCommentText] = useState("");
  const [mockFileName, setMockFileName] = useState("");

  // Retrieve matching details
  const caseItem = cases.find(c => String(c.CaseID) === String(caseId));
  if (!caseItem) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <p>Case not found.</p>
        <button onClick={onBack} style={goBackBtnStyle}>← Go Back</button>
      </div>
    );
  }

  // Employees may only open their own cases (defends against ID guessing
  // in the URL/state, since this is client-side routing over shared data).
  if (isEmployeeView && caseItem.UserID !== actingUser?.UserID) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <p style={{ fontWeight: 600, color: "var(--color-navy-dark)" }}>You don't have access to this case.</p>
        <button onClick={onBack} style={goBackBtnStyle}>← Go Back</button>
      </div>
    );
  }

  const assignment = assignments.find(a => a.CaseID === caseItem.CaseID);
  if (isAdvocateView && String(assignment?.AssignedToUserID) !== String(actingId)) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <p style={{ fontWeight: 600, color: "var(--color-navy-dark)" }}>This case is not assigned to you.</p>
        <button onClick={onBack} style={goBackBtnStyle}>← Go Back</button>
      </div>
    );
  }

  const filer = getPerson(caseItem.UserID);
  const category = categories.find(c => c.CategoryID === caseItem.CategoryID);
  
  const assignee = assignment ? getPerson(assignment.AssignedToUserID) : null;
  const assigner = assignment ? getPerson(assignment.AssignedByUserID) : null;

  const caseComments = comments.filter(c => c.CaseID === caseItem.CaseID);
  const caseAttachments = attachments.filter(a => a.CaseID === caseItem.CaseID);
  let caseHistory = statusHistory.filter(h => h.CaseID === caseItem.CaseID);
  if (caseHistory.length === 0) {
    caseHistory = [
      {
        HistoryID: `sim-h1-${caseItem.CaseID}`,
        CaseID: caseItem.CaseID,
        OldStatus: null,
        NewStatus: "Open",
        ChangedBy: caseItem.UserID,
        ChangedDate: `${caseItem.CreatedDate} 09:00:00`,
      }
    ];
    if (caseItem.Status !== "Open") {
      caseHistory.push({
        HistoryID: `sim-h2-${caseItem.CaseID}`,
        CaseID: caseItem.CaseID,
        OldStatus: "Open",
        NewStatus: caseItem.Status,
        ChangedBy: caseItem.AssignedToUserID || 1,
        ChangedDate: `${caseItem.CreatedDate} 14:30:00`,
      });
    }
    if (caseItem.Status === "Closed" && caseItem.ClosedDate) {
      caseHistory.push({
        HistoryID: `sim-h3-${caseItem.CaseID}`,
        CaseID: caseItem.CaseID,
        OldStatus: "Under Review",
        NewStatus: "Closed",
        ChangedBy: caseItem.AssignedToUserID || 1,
        ChangedDate: `${caseItem.ClosedDate} 17:00:00`,
      });
    }
  }
  caseHistory.sort((a, b) => new Date(a.ChangedDate) - new Date(b.ChangedDate));

  // Select candidates for assignment (anyone except standard Employees, RoleID 6)
  const assigneesPool = officials.filter(o => o.Status === "Active");

  // Handle Comment Submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(caseItem.CaseID, actingId || 1, commentText.trim());
    setCommentText("");
  };

  // Handle Assignee Change
  const handleAssigneeChange = (e) => {
    const nextAssigneeId = e.target.value;
    if (nextAssigneeId) {
      assignCase(caseItem.CaseID, String(nextAssigneeId), actingId || "1");
    }
  };

  // Handle Status Change
  const handleStatusChange = (status) => {
    updateCaseStatus(caseItem.CaseID, status, actingId || 1);
  };

  // Handle Mock Attachment Upload
  const handleAttachmentSubmit = (e) => {
    e.preventDefault();
    if (!mockFileName.trim()) return;
    
    // Add extension if missing
    let finalName = mockFileName.trim();
    if (!finalName.includes(".")) {
      finalName += ".pdf";
    }
    
    addAttachment(caseItem.CaseID, finalName, "pdf", actingId || 1);
    setMockFileName("");
  };

  const getRoleLabel = (personId) => {
    const person = getPerson(personId);
    if (!person) return "";
    const r = roles.find(role => role.RoleID === person.RoleID);
    return r ? r.RoleName : "";
  };

  const tabStyle = (id) => ({
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    background: "none",
    color: activeTab === id ? "var(--color-blue)" : "hsl(215, 10%, 55%)",
    borderBottom: activeTab === id ? "2px solid var(--color-blue)" : "2px solid transparent",
    transition: "all 0.2s"
  });

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "var(--color-blue)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 16,
          padding: 0
        }}
      >
        ← Back to Cases
      </button>

      {/* Grid Layout: Main info and Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }} className="case-detail-grid">
        
        {/* Left Column (Content & Tabs) */}
        <div>
          {/* Top Info Banner */}
          <div style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            padding: 24,
            marginBottom: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge label={caseItem.Status} />
                <Badge label={caseItem.Priority} type="priority" />
                {(() => { const cat = categories.find(ct => String(ct.CategoryID) === String(caseItem.CategoryID)); return cat?.RequiresICC; })() && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: "hsl(280, 75%, 96%)", color: "hsl(280, 75%, 40%)", border: "1px solid hsl(280, 75%, 90%)", borderRadius: 999, padding: "2px 10px" }}>
                    🔒 Confidential ICC
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {/* Status Quick Actions — staff/admin only. Employees get a read-only view of status. */}
                {!isEmployeeView && (
                  <>
                    {caseItem.Status !== "Closed" && (
                      <>
                        {caseItem.Status === "Open" && (
                          <button
                            onClick={() => handleStatusChange("In Progress")}
                            style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 6, border: "1px solid #CBD5E1", background: "#fff", color: "var(--color-navy)", cursor: "pointer", fontWeight: 600 }}
                          >
                            Start Investigation
                          </button>
                        )}
                        {caseItem.Status !== "Under Review" && (
                          <button
                            onClick={() => handleStatusChange("Under Review")}
                            style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 6, border: "1px solid #CBD5E1", background: "#fff", color: "var(--color-navy)", cursor: "pointer", fontWeight: 600 }}
                          >
                            Escalate Review
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange("Closed")}
                          style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 6, border: "none", background: "var(--color-green)", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                        >
                          Close Case
                        </button>
                      </>
                    )}
                    {caseItem.Status === "Closed" && (
                      <button
                        onClick={() => handleStatusChange("In Progress")}
                        style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 6, border: "1px solid #CBD5E1", background: "#fff", color: "var(--color-navy)", cursor: "pointer", fontWeight: 600 }}
                      >
                        Reopen Case
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 32, marginTop: 4 }}>{getCategoryIcon(category?.CategoryID)}</span>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 4px", lineHeight: 1.3 }}>
                  {caseItem.Subject}
                </h3>
                <div style={{ fontSize: 12, color: "hsl(215, 10%, 55%)" }}>
                  Case #{caseItem.CaseID} · {category?.CategoryName}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid #E2E8F0",
            marginBottom: 20,
            gap: 8
          }}>
            <button onClick={() => setActiveTab("overview")} style={tabStyle("overview")}>Overview</button>
            <button onClick={() => setActiveTab("comments")} style={tabStyle("comments")}>
              Comments & Activity ({caseComments.length})
            </button>
            <button onClick={() => setActiveTab("timeline")} style={tabStyle("timeline")}>
              Timeline ({caseHistory.length})
            </button>
            <button onClick={() => setActiveTab("attachments")} style={tabStyle("attachments")}>
              Attachments ({caseAttachments.length})
            </button>
          </div>

          {/* Tab Panes */}
          <div style={{ minHeight: 200 }}>
            {/* 1. Overview */}
            {activeTab === "overview" && (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                animation: "fadeIn 0.15s ease"
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 10px" }}>Case Description</h4>
                <p style={{
                  fontSize: 13.5,
                  color: "hsl(215, 15%, 30%)",
                  lineHeight: 1.6,
                  margin: "0 0 24px",
                  whiteSpace: "pre-wrap"
                }}>
                  {caseItem.Description || "No detailed description provided."}
                </p>

                {/* Sub Metadata */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, backgroundColor: "#F8FAFC", padding: 16, borderRadius: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(215, 10%, 55%)", display: "block", marginBottom: 4 }}>DATE FILED</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-navy-dark)" }}>{caseItem.CreatedDate}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(215, 10%, 55%)", display: "block", marginBottom: 4 }}>DATE CLOSED</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: caseItem.ClosedDate ? "var(--color-green)" : "hsl(215, 10%, 60%)" }}>
                      {caseItem.ClosedDate || "Ongoing Investigation"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Comments */}
            {activeTab === "comments" && (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                animation: "fadeIn 0.15s ease"
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 16px" }}>Investigation Logs</h4>
                
                {/* Comment Feed */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  {caseComments.length === 0 ? (
                    <div style={{ color: "hsl(215, 10%, 60%)", fontSize: 13, padding: "12px 0" }}>
                      No logs or comments recorded yet.
                    </div>
                  ) : (
                    caseComments.map((cm) => {
                      const commUser = getPerson(cm.UserID);
                      const isMe = String(cm.UserID) === String(actingId);
                      const isActorAdmin = isAdminRole(commUser?.RoleID);
                      
                      return (
                        <div 
                          key={cm.CommentID} 
                          style={{ 
                            display: "flex", 
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            gap: 10, 
                            alignItems: "flex-end",
                            width: "100%"
                          }}
                        >
                          {!isMe && <Avatar name={commUser?.FullName || "?"} size={28} />}
                          
                          <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, fontSize: 10, color: "hsl(215, 10%, 55%)" }}>
                              {!isMe && (
                                <>
                                  <span style={{ fontWeight: 700, color: "var(--color-navy-dark)" }}>{commUser?.FullName}</span>
                                  <span style={{ fontSize: 9, background: isActorAdmin ? "hsl(214, 100%, 95%)" : "#F1F5F9", color: isActorAdmin ? "var(--color-blue)" : "hsl(215, 10%, 50%)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                    {getRoleLabel(cm.UserID)}
                                  </span>
                                </>
                              )}
                              <span>{cm.CreatedDate}</span>
                            </div>
                            <div style={{
                              fontSize: 12.5,
                              color: isMe ? "#fff" : "hsl(215, 15%, 25%)",
                              lineHeight: 1.5,
                              backgroundColor: isMe ? "var(--color-blue)" : "#F1F5F9",
                              padding: "10px 14px",
                              borderRadius: isMe ? "14px 14px 0 14px" : "0 14px 14px 14px",
                              border: isMe ? "none" : "1px solid #E2E8F0",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word"
                            }}>
                              {cm.CommentText}
                            </div>
                          </div>
                          
                          {isMe && <Avatar name={commUser?.FullName || "?"} size={28} />}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
                  <textarea
                    placeholder="Ask the user for more case details, request files, or send a message..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #D1D5DB",
                      fontSize: 13,
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                      boxSizing: "border-box"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      alignSelf: "flex-end",
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "var(--color-navy)",
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Add Log Note
                  </button>
                </form>
              </div>
            )}

            {/* 3. History */}
            {activeTab === "timeline" && (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                animation: "fadeIn 0.15s ease"
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 20px" }}>Case Lifecycle History</h4>
                
                <div style={{ position: "relative", paddingLeft: 20, borderLeft: "2px solid #E2E8F0", marginLeft: 8 }}>
                  {caseHistory.map((h, index) => {
                    const actor = getPerson(h.ChangedBy);
                    return (
                      <div key={h.HistoryID} style={{ position: "relative", marginBottom: index < caseHistory.length - 1 ? 24 : 0 }}>
                        {/* Timeline node dot */}
                        <div style={{
                          position: "absolute",
                          left: -27,
                          top: 4,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: h.NewStatus === "Closed" ? "var(--color-green)" : "var(--color-blue)",
                          border: "2px solid #fff",
                          boxShadow: "0 0 0 2px #E2E8F0"
                        }} />
                        
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)" }}>
                              {h.OldStatus ? `Status changed to "${h.NewStatus}"` : "Case Filed & Registered"}
                            </span>
                            <span style={{ fontSize: 10.5, color: "hsl(215, 10%, 60%)" }}>{h.ChangedDate}</span>
                          </div>
                          <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 45%)", margin: 0 }}>
                            Action by: <strong>{actor?.FullName || "System"}</strong> ({getRoleLabel(h.ChangedBy)})
                          </p>
                          {h.OldStatus && (
                            <div style={{ fontSize: 11.5, color: "hsl(215, 10%, 55%)", marginTop: 4 }}>
                              Previous: <span style={{ textDecoration: "line-through" }}>{h.OldStatus}</span> → <strong>{h.NewStatus}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Attachments */}
            {activeTab === "attachments" && (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                animation: "fadeIn 0.15s ease"
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 16px" }}>Shared Evidence & Files</h4>
                
                {/* File list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {caseAttachments.length === 0 ? (
                    <div style={{ color: "hsl(215, 10%, 60%)", fontSize: 13, padding: "12px 0" }}>
                      No attachments uploaded for this case file.
                    </div>
                  ) : (
                    caseAttachments.map((a) => {
                      const uploader = getPerson(a.UploadedBy);
                      return (
                        <div
                          key={a.AttachmentID}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            border: "1px solid #E2E8F0",
                            borderRadius: 8,
                            backgroundColor: "#F8FAFC"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 20 }}>📎</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-navy-dark)" }}>{a.FileName}</div>
                              <div style={{ fontSize: 10.5, color: "hsl(215, 10%, 55%)", marginTop: 2 }}>
                                Uploaded by {uploader?.FullName || "Filer"} on {a.UploadedDate}
                              </div>
                            </div>
                          </div>
                          
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); alert(`Downloading simulated file: ${a.FileName}`); }}
                            style={{
                              fontSize: 12,
                              color: "var(--color-blue)",
                              fontWeight: 600,
                              textDecoration: "none"
                            }}
                          >
                            Download
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Upload Form */}
                <form onSubmit={handleAttachmentSubmit} style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(215, 20%, 40%)", marginBottom: 6 }}>
                    Simulate Attachment Upload
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      placeholder="e.g. proof_of_invoice.pdf, contract_copy.docx..."
                      value={mockFileName}
                      onChange={(e) => setMockFileName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #D1D5DB",
                        fontSize: 13,
                        outline: "none"
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "var(--color-blue)",
                        color: "#fff",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Upload File
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Case Actors & Metadata) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filer Profile */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(215, 15%, 55%)", marginBottom: 12 }}>
              Filed By
            </div>
            {filer ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={filer.FullName} size={38} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-navy-dark)" }}>{filer.FullName}</div>
                  <div style={{ fontSize: 11, color: "hsl(215, 10%, 55%)", marginTop: 2 }}>
                    Dept: {filer.Department}
                  </div>
                  <div style={{ fontSize: 10.5, color: "hsl(215, 10%, 60%)", fontFamily: "monospace", marginTop: 2 }}>
                    ID: {filer.EmployeeID}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: "hsl(215, 10%, 60%)", fontSize: 12.5 }}>Unknown Employee</div>
            )}
          </div>

          {/* Current Assignee */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(215, 15%, 55%)", marginBottom: 12 }}>
              Assignment
            </div>
            
            {assignee ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Avatar name={assignee.FullName} size={38} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--color-navy-dark)" }}>{assignee.FullName}</div>
                  <div style={{ fontSize: 11, color: "hsl(215, 10%, 55%)", marginTop: 2 }}>
                    Role: {getRoleLabel(assignee.UserID)}
                  </div>
                  {assigner && (
                    <div style={{ fontSize: 10, color: "hsl(215, 10%, 60%)", marginTop: 2 }}>
                      Assigned by: {isUserRole(assigner.RoleID) || assignment.AssignedByUserID === caseItem.UserID ? "AI" : assigner.FullName.replace("Adv. ", "")}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                color: "hsl(35, 85%, 35%)",
                backgroundColor: "hsl(35, 100%, 96%)",
                border: "1px dashed hsl(35, 100%, 88%)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 14,
                textAlign: "center"
              }}>
                ⚠️ Unassigned Case
              </div>
            )}

            {/* Reassign select dropdown — admin only */}
            {canReassign && (
              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "hsl(215, 20%, 40%)", marginBottom: 6 }}>
                  {assignee ? "REASSIGN CASE" : "ASSIGN OFFICER"}
                </label>
                <select
                  value={assignee ? (assignee.OfficialID || assignee.UserID) : ""}
                  onChange={handleAssigneeChange}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #D1D5DB",
                    fontSize: 12,
                    background: "#fff",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="" disabled>Select Officer...</option>
                  {assigneesPool.map((o) => (
                    <option key={o.OfficialID} value={o.OfficialID}>
                      {o.FullName} ({getRoleLabel(o.OfficialID)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(215, 15%, 55%)", marginBottom: 12 }}>
              Properties
            </div>
            
            {[
              ["Priority", <Badge label={caseItem.Priority} type="priority" />],
              ["Status", <Badge label={caseItem.Status} />],
              ["Comments", caseComments.length],
              ["Attachments", caseAttachments.length],
              ["Created On", caseItem.CreatedDate],
              ["Closed On", caseItem.ClosedDate || "—"]
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12.5,
                  paddingBottom: 8,
                  marginBottom: 8,
                  borderBottom: "1px solid #F8FAFC"
                }}
              >
                <span style={{ color: "hsl(215, 10%, 55%)" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "var(--color-navy-dark)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseDetail;
