/**
 * dataSource.js
 * ------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for where app data comes from.
 *
 * TODAY: grievanceData.json + users.json + officials.json
 * (via GrievanceContext's in-memory state).
 * ------------------------------------------------------------------
 */

export const USE_REMOTE = true;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://i6pmbkq0rk.execute-api.us-east-1.amazonaws.com/Prod";

function mapKeyToPascal(key) {
  if (key === "id") return "ID";
  let pascal = key.charAt(0).toUpperCase() + key.slice(1);
  if (pascal.endsWith("Id")) {
    pascal = pascal.slice(0, -2) + "ID";
  }
  if (pascal === "EmployeeId") return "EmployeeID";
  if (pascal === "RoleId") return "RoleID";
  if (pascal === "UserId") return "UserID";
  if (pascal === "OfficialId") return "OfficialID";
  if (pascal === "StaffId") return "StaffID";
  if (pascal === "BarCouncilId") return "BarCouncilID";
  if (pascal === "CaseId") return "CaseID";
  if (pascal === "AssignedToUserId") return "AssignedToUserID";
  if (pascal === "AssignedByUserId") return "AssignedByUserID";
  if (pascal === "AssignmentId") return "AssignmentID";
  if (pascal === "CommentId") return "CommentID";
  if (pascal === "AttachmentId") return "AttachmentID";
  if (pascal === "NotificationId") return "NotificationID";
  if (pascal === "ReportId") return "ReportID";
  if (pascal === "CategoryId") return "CategoryID";
  return pascal;
}

export function keysToPascal(obj) {
  if (Array.isArray(obj)) {
    return obj.map(keysToPascal);
  }
  if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const newKey = mapKeyToPascal(key);
      newObj[newKey] = keysToPascal(val);
    }
    return newObj;
  }
  return obj;
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} failed: ${res.status} ${errText}`);
  }
  const json = await res.json();
  if (json && json.data !== undefined) {
    json.data = keysToPascal(json.data);
  }
  return json;
}

/** Admin portal â€” full org visibility (RoleID 1, 8). */
export const ADMIN_ROLE_IDS = [1, 8];

/** Advocate / staff handler portal â€” assigned cases only. */
export const ADVOCATE_ROLE_IDS = [2, 3, 4, 5, 7];

/** User portal â€” employees who file grievances. */
export const USER_ROLE_IDS = [6];

export const STAFF_ROLE_IDS = [...ADMIN_ROLE_IDS, ...ADVOCATE_ROLE_IDS];

export const resolvePortalType = (roleId) => {
  const id = Number(roleId);
  if (ADMIN_ROLE_IDS.includes(id)) return "admin";
  if (ADVOCATE_ROLE_IDS.includes(id)) return "advocate";
  return "user";
};

export const isAdminRole = (roleId) => ADMIN_ROLE_IDS.includes(Number(roleId));
export const isAdvocateRole = (roleId) => ADVOCATE_ROLE_IDS.includes(Number(roleId));
export const isStaffRole = (roleId) => STAFF_ROLE_IDS.includes(Number(roleId));
export const isUserRole = (roleId) => USER_ROLE_IDS.includes(Number(roleId));

/**
 * Staff login â€” officials table (StaffID or Email + password).
 */
export async function mockAuthenticateStaff({ identifier, password, officials }) {
  const official = officials.find(
    (o) =>
      o.StaffID?.toLowerCase() === identifier.toLowerCase() ||
      o.Email?.toLowerCase() === identifier.toLowerCase()
  );

  if (!official) {
    throw new Error("No staff account found for that Staff ID / Email.");
  }
  if (!password || password.length < 4) {
    throw new Error("Incorrect password.");
  }
  if (official.Status !== "Active") {
    throw new Error("This account is inactive. Contact the Legal Operations team.");
  }
  return { ...official, personType: "official", UserID: official.OfficialID };
}

/** Legacy alias â€” staff authenticate. */
export async function mockAuthenticate({ identifier, password, users, officials }) {
  if (officials?.length) {
    return mockAuthenticateStaff({ identifier, password, officials });
  }
  const user = users.find(
    (u) =>
      u.EmployeeID?.toLowerCase() === identifier.toLowerCase() ||
      u.Email?.toLowerCase() === identifier.toLowerCase()
  );
  if (!user) throw new Error("No account found for that Employee ID / Email.");
  if (!password || password.length < 4) throw new Error("Incorrect password.");
  if (user.Status !== "Active") throw new Error("This account is inactive. Contact HR/Admin.");
  return { ...user, personType: "user" };
}

