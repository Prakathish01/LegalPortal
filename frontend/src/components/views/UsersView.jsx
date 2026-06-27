import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GrievanceContext } from "../../context/GrievanceContext";
import Avatar from "../ui/Avatar";

const advocateSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().min(2, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  roleId: z.string().min(1, "Please select a role"),
  staffId: z.string().min(4, "Staff ID is required (e.g. LD-ICC-005)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialization: z.string().optional(),
  barCouncilId: z.string().optional()
});

const UsersView = () => {
  const { users, roles, cases, assignments, officials, addOfficial } = useContext(GrievanceContext);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [directoryTab, setDirectoryTab] = useState("employees");
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingOfficial, setIsSubmittingOfficial] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(advocateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      roleId: "",
      staffId: "",
      password: "",
      specialization: "",
      barCouncilId: ""
    }
  });

  const handleAddOfficial = async (data) => {
    setIsSubmittingOfficial(true);
    setSubmitError("");
    try {
      await addOfficial(data);
      reset();
      setShowAddModal(false);
    } catch (err) {
      setSubmitError(err.message || "Failed to add advocate.");
    } finally {
      setIsSubmittingOfficial(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.FullName.toLowerCase().includes(q) ||
      u.Department.toLowerCase().includes(q) ||
      u.EmployeeID.toLowerCase().includes(q);
    const matchRole = filterRole === "All" || String(u.RoleID) === String(filterRole);
    return matchSearch && matchRole;
  });

  const filteredOfficials = officials.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.FullName.toLowerCase().includes(q) ||
      o.Department.toLowerCase().includes(q) ||
      o.StaffID.toLowerCase().includes(q) ||
      (o.Designation && o.Designation.toLowerCase().includes(q));
    const matchRole = filterRole === "All" || String(o.RoleID) === String(filterRole);
    return matchSearch && matchRole;
  });

  const activeList = directoryTab === "employees" ? filteredUsers : filteredOfficials;

  const getRoleLabel = (roleId) => {
    const r = roles.find((role) => String(role.RoleID) === String(roleId));
    return r ? r.RoleName : "Unknown";
  };

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
    <div style={{ animation: "fadeIn 0.2s ease-out" }} className="flex flex-col gap-6">
      {/* Title block */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-navy-dark)", margin: "0 0 4px" }}>Organization Directory</h2>
          <p style={{ fontSize: 12.5, color: "hsl(215, 10%, 55%)", margin: 0 }}>
            {directoryTab === "employees"
              ? `Viewing ${filteredUsers.length} of ${users.length} employees (User Portal).`
              : `Viewing ${filteredOfficials.length} of ${officials.length} officials & advocates.`}
          </p>
        </div>
        
        {directoryTab === "officials" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer border-none shadow transition-all flex items-center gap-1.5"
          >
            <span>+</span> Add Advocate / Staff
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {[
          ["employees", "Employees"],
          ["officials", "Officials & Advocates"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setDirectoryTab(id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: directoryTab === id ? "1px solid var(--color-blue)" : "1px solid #E5E7EB",
              background: directoryTab === id ? "#EFF6FF" : "#fff",
              color: directoryTab === id ? "var(--color-blue)" : "hsl(215, 15%, 45%)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters Panel */}
      <div style={{
        display: "flex",
        gap: 12,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search by name, department, ID..."
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
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Roles</option>
          {roles.map((r) => (
            <option key={r.RoleID} value={r.RoleID}>
              {r.RoleName}
            </option>
          ))}
        </select>
      </div>

      {/* Users Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16
      }}>
        {activeList.map((person) => {
          const isOfficial = directoryTab === "officials";
          const personId = isOfficial ? person.OfficialID : person.UserID;
          const roleName = getRoleLabel(person.RoleID);
          const casesFiled = cases.filter((c) => String(c.UserID) === String(personId)).length;
          const casesAssigned = assignments.filter((a) => String(a.AssignedToUserID) === String(personId)).length;
          const isActive = person.Status === "Active";

          return (
            <div
              key={personId}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              className="hover:shadow-md transition-shadow"
            >
              {/* Card Top / Identity */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <Avatar name={person.FullName} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--color-navy-dark)",
                      margin: "0 0 3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }} title={person.FullName}>
                      {person.FullName}
                    </h4>
                    <span style={{ fontSize: 11.5, color: "hsl(215, 10%, 55%)", fontWeight: 500 }}>
                      {isOfficial ? person.Designation : person.Department}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "hsl(214, 100%, 95%)",
                    color: "var(--color-blue)",
                    border: "1px solid hsl(214, 100%, 90%)"
                  }}>
                    {roleName}
                  </span>
                  
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: isActive ? "hsl(142, 70%, 95%)" : "hsl(0, 100%, 97%)",
                    color: isActive ? "var(--color-green)" : "var(--color-red)",
                    border: isActive ? "1px solid hsl(142, 70%, 90%)" : "1px solid hsl(0, 100%, 92%)"
                  }}>
                    {person.Status}
                  </span>
                </div>
              </div>

              {/* Card Footer / Stats */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #F1F5F9",
                paddingTop: 12,
                fontSize: 11.5,
                color: "hsl(215, 10%, 55%)"
              }}>
                <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
                  🆔 {isOfficial ? person.StaffID : person.EmployeeID}
                </span>
                
                <div style={{ display: "flex", gap: 10 }}>
                  <span title="Cases Filed" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    📁 <strong>{casesFiled}</strong>
                  </span>
                  <span title="Cases Assigned" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    📌 <strong>{casesAssigned}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeList.length === 0 && (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "hsl(215, 10%, 60%)",
          fontSize: 14
        }}>
          🔍 No users match your search criteria.
        </div>
      )}

      {/* ═══════ ADD ADVOCATE MODAL ═══════ */}
      {showAddModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-[rgba(15,31,61,0.5)] backdrop-blur-[5px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white w-[92%] max-w-[560px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">
            {/* Header */}
            <div className="py-5 px-6 border-b border-slate-100 flex justify-between items-center bg-slate-55 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <h2 className="text-sm font-bold m-0 text-white">Add New Legal Advocate / Official</h2>
              <button
                onClick={() => { setShowAddModal(false); setSubmitError(""); }}
                className="bg-transparent border-none cursor-pointer text-2xl text-slate-400 p-1 leading-none hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Form scroll wrapper */}
            <form onSubmit={handleSubmit(handleAddOfficial)} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {submitError && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700 font-medium">
                  ⚠️ {submitError}
                </div>
              )}

              {/* Grid fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Adv. Priya Nair"
                    {...register("fullName")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.fullName && <span className="text-[10px] text-rose-600 font-bold">{errors.fullName.message}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="priya.nair@company.com"
                    {...register("email")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.email && <span className="text-[10px] text-rose-600 font-bold">{errors.email.message}</span>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    {...register("phone")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.phone && <span className="text-[10px] text-rose-600 font-bold">{errors.phone.message}</span>}
                </div>

                {/* Department */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Legal Advisory"
                    {...register("department")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.department && <span className="text-[10px] text-rose-600 font-bold">{errors.department.message}</span>}
                </div>

                {/* Designation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Arbitrator"
                    {...register("designation")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.designation && <span className="text-[10px] text-rose-600 font-bold">{errors.designation.message}</span>}
                </div>

                {/* Staff ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staff ID / Code</label>
                  <input
                    type="text"
                    placeholder="LD-EXT-008"
                    {...register("staffId")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.staffId && <span className="text-[10px] text-rose-600 font-bold">{errors.staffId.message}</span>}
                </div>

                {/* Role ID Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Role</label>
                  <select
                    {...register("roleId")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white"
                  >
                    <option value="">Select Role Option</option>
                    <option value="2">Legal Manager</option>
                    <option value="3">Legal Agent</option>
                    <option value="4">HR Manager</option>
                    <option value="5">ICC Presiding Officer (POSH)</option>
                    <option value="7">Empanelled Lawyer</option>
                    <option value="8">Ethics Auditor</option>
                  </select>
                  {errors.roleId && <span className="text-[10px] text-rose-600 font-bold">{errors.roleId.message}</span>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Default Password</label>
                  <input
                    type="password"
                    placeholder="******"
                    {...register("password")}
                    className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  {errors.password && <span className="text-[10px] text-rose-600 font-bold">{errors.password.message}</span>}
                </div>
              </div>

              {/* Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specialization Area (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Labor disputes, sexual harassment investigations, IP compliance"
                  {...register("specialization")}
                  className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Bar Council ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bar Council ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MH/294/2014"
                  {...register("barCouncilId")}
                  className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setSubmitError(""); }}
                  className="py-2 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOfficial}
                  className="py-2 px-5 rounded-lg border-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow disabled:opacity-50"
                >
                  {isSubmittingOfficial ? "Registering..." : "Add Advocate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
