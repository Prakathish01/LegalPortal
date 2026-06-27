import React, { useContext, useMemo, useState, useEffect } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";
import { getCategoryIcon } from "../../utils/categoryMeta";

const AdvocateDashboard = ({ onSelectCase, setActiveView }) => {
  const { cases, assignments, categories, getPersonName, comments } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const officialId = authUser?.OfficialID || authUser?.UserID;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Scratchpad notepad state
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`legaldesk_notes_${officialId}`) || "";
  });
  const [saveStatus, setSaveStatus] = useState("Saved");

  useEffect(() => {
    localStorage.setItem(`legaldesk_notes_${officialId}`, notes);
    setSaveStatus("Saving...");
    const timeout = setTimeout(() => {
      setSaveStatus("Saved");
    }, 4000);
    return () => clearTimeout(timeout);
  }, [notes, officialId]);

  const myAssignments = useMemo(
    () => assignments.filter((a) => Number(a.AssignedToUserID) === Number(officialId)),
    [assignments, officialId]
  );

  const myCases = useMemo(
    () =>
      myAssignments
        .map((a) => cases.find((c) => c.CaseID === a.CaseID))
        .filter(Boolean),
    [myAssignments, cases]
  );

  // Stats
  const activeCount = myCases.filter((c) => c.Status !== "Closed").length;
  const criticalCount = myCases.filter((c) => c.Priority === "Critical" && c.Status !== "Closed").length;
  const inProgressCount = myCases.filter((c) => c.Status === "In Progress" || c.Status === "Under Review").length;
  const resolvedCount = myCases.filter((c) => c.Status === "Closed").length;

  // Filtered cases list based on search and status tabs
  const filteredCases = useMemo(() => {
    return myCases.filter((c) => {
      // 1. Status/Priority Filter
      if (statusFilter === "Critical") {
        if (c.Priority !== "Critical" || c.Status === "Closed") return false;
      } else if (statusFilter !== "all") {
        if (c.Status !== statusFilter) return false;
      }

      // 2. Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const subjectMatch = (c.Subject || "").toLowerCase().includes(query);
        const descMatch = (c.Description || "").toLowerCase().includes(query);
        const idMatch = String(c.CaseID).includes(query);
        const authorMatch = getPersonName(c.UserID).toLowerCase().includes(query);
        return subjectMatch || descMatch || idMatch || authorMatch;
      }

      return true;
    });
  }, [myCases, statusFilter, searchQuery, getPersonName]);

  // Categories splits
  const categorySplits = useMemo(() => {
    const counts = {};
    myCases.forEach((c) => {
      counts[c.CategoryID] = (counts[c.CategoryID] || 0) + 1;
    });
    return Object.keys(counts).map((catId) => {
      const cat = categories.find((x) => x.CategoryID === Number(catId));
      const count = counts[catId];
      return {
        id: Number(catId),
        name: cat?.CategoryName || "Other Consultation",
        count,
        percentage: myCases.length > 0 ? (count / myCases.length) * 100 : 0
      };
    }).sort((a, b) => b.count - a.count);
  }, [myCases, categories]);

  // Urgency list (critical & in-progress active cases)
  const urgentCases = useMemo(() => {
    return myCases
      .filter((c) => c.Status !== "Closed")
      .sort((a, b) => {
        if (a.Priority === "Critical" && b.Priority !== "Critical") return -1;
        if (a.Priority !== "Critical" && b.Priority === "Critical") return 1;
        return b.CaseID - a.CaseID;
      })
      .slice(0, 3);
  }, [myCases]);

  // Recent comments on the advocate's cases
  const recentActivity = useMemo(() => {
    const caseIds = myCases.map((c) => c.CaseID);
    return comments
      .filter((comm) => caseIds.includes(comm.CaseID))
      .sort((a, b) => b.CommentID - a.CommentID)
      .slice(0, 3);
  }, [comments, myCases]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">
            {greeting()}, {authUser?.FullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-xs text-indigo-200 font-medium">
            {authUser?.Designation} · Assigned Legal Counsel & Presiding Officer
          </p>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 py-1.5 px-4 rounded-xl text-[11px] font-semibold tracking-wider text-indigo-300">
          SECURE PORTAL ONLINE 🟢
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Assignments", value: activeCount, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Under Review / Active", value: inProgressCount, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
          { label: "Critical Priority", value: criticalCount, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
          { label: "Resolved Cases", value: resolvedCount, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-1.5 border-slate-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
          >
            <div className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs font-semibold text-slate-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Center Column - Interactive Case Workload & Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Assignments list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Section Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 m-0">Grievance Assignments</h3>
                <span className="text-xs text-slate-400 font-semibold">{filteredCases.length} matches</span>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search case subject, description, or filer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* Status filtering selector/tabs */}
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {[
                    { id: "all", label: "All" },
                    { id: "In Progress", label: "Active" },
                    { id: "Under Review", label: "Review" },
                    { id: "Critical", label: "🔥 Critical" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                        statusFilter === tab.id
                          ? "bg-white text-indigo-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cases List */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[480px]">
              {filteredCases.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <span className="text-4xl">📁</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800 mb-1">No assignments found</div>
                    <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                      We couldn't find any cases matching your current query or filters. Check another tab or search term.
                    </p>
                  </div>
                </div>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.CaseID}
                    onClick={() => onSelectCase(c)}
                    className="p-4 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between gap-4 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl mt-0.5 flex-shrink-0">{getCategoryIcon(c.CategoryID)}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 m-0 truncate hover:text-indigo-600 transition-colors">
                          #{c.CaseID} · {c.Subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>Filed by <strong>{getPersonName(c.UserID)}</strong></span>
                          <span className="text-slate-300">•</span>
                          <span>{c.CreatedDate}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <Badge label={c.Priority} type="priority" />
                      <Badge label={c.Status} />
                      <span className="text-slate-400 text-xs font-medium pl-1">→</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Comments Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>💬</span> Recent Case Updates & Comments
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent comments logged on your cases.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {recentActivity.map((act) => {
                  const relativeCase = cases.find((c) => c.CaseID === act.CaseID);
                  return (
                    <div
                      key={act.CommentID}
                      onClick={() => onSelectCase(relativeCase)}
                      className="border border-slate-100 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-150"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Case #{act.CaseID}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{act.CreatedDate || "Just Now"}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 mb-1">
                        {getPersonName(act.UserID)} wrote:
                      </div>
                      <p className="text-[11px] text-slate-500 m-0 italic line-clamp-2">
                        "{act.CommentText}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Workload Insights & Reference */}
        <div className="flex flex-col gap-6">
          {/* Workload Splits */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-4 tracking-wide uppercase">Workload Distribution</h3>
            {categorySplits.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No categories mapped yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {categorySplits.map((split) => (
                  <div key={split.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">{split.name}</span>
                      <span className="font-bold text-slate-500">{split.count} case{split.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${split.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Urgency / SLA Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-800 mb-1 tracking-wide uppercase">Action Urgency Tracker</h3>
            {urgentCases.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">All cases resolved. Nice job! 🎉</p>
            ) : (
              <div className="flex flex-col gap-3">
                {urgentCases.map((c) => (
                  <div
                    key={c.CaseID}
                    onClick={() => onSelectCase(c)}
                    className="flex justify-between items-center p-2.5 rounded-lg border border-l-4 border-slate-100 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer transition-all duration-150"
                    style={{ borderLeftColor: c.Priority === "Critical" ? "var(--color-red)" : "var(--color-blue)" }}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-800 truncate">
                        Case #{c.CaseID} - {c.Subject}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.Status}</span>
                    </div>
                    <Badge label={c.Priority} type="priority" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-saving Scratchpad Notepad */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase m-0">Advocate Notes</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                saveStatus === "Saving..." ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {saveStatus}
              </span>
            </div>
            <textarea
              placeholder="Jot down notes or interview schedules regarding active POSH hearings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-28 p-3 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 font-mono resize-none leading-relaxed"
            />
            <button
              onClick={() => { setNotes(""); }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 py-1.5 px-3 rounded-lg border-none cursor-pointer text-center transition-colors duration-150"
            >
              🗑️ Clear Scratchpad
            </button>
          </div>

          {/* Quick SLA guidelines */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h3 className="text-xs font-bold text-indigo-950 m-0 uppercase tracking-wide">Legal Desk Guidelines</h3>
            </div>
            <div className="text-[11px] leading-relaxed text-indigo-900/80 flex flex-col gap-2.5">
              <div className="flex gap-2">
                <span>⏱️</span>
                <p className="m-0"><strong>Response SLA:</strong> Please review and update new assignments within 24 hours.</p>
              </div>
              <div className="flex gap-2">
                <span>🔒</span>
                <p className="m-0"><strong>Confidentiality:</strong> Standard POSH and ICC records must never be shared offline.</p>
              </div>
              <div className="flex gap-2">
                <span>💬</span>
                <p className="m-0"><strong>Case Logs:</strong> Document arbitration comments transparently at each transition.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateDashboard;
