// Central icon + short-label map for Categories, since the JSON data
// doesn't carry an icon field. Keyed by CategoryID so it stays in sync
// even if CategoryName text changes slightly.
export const CATEGORY_ICON_MAP = {
  1: "⚖️",  // Personal Legal Consultation
  2: "🛡️",  // Consumer Rights Assistance
  3: "📜",  // Will & Estate Guidance
  4: "📋",  // Affidavit & Notarization
  5: "✅",  // Attestation Support
  6: "👔",  // Employment Law Advisory
  7: "⚠️",  // Disciplinary Advisory
  8: "🔒",  // Harassment & POSH Complaint
  9: "🏢",  // Workplace Conduct Complaint
  10: "📦", // Vendor & Service Complaint
  11: "🎯", // Anonymous Whistleblower Report
};

export const getCategoryIcon = (categoryId) => CATEGORY_ICON_MAP[Number(categoryId)] || "📁";

// Roles eligible to act as a case "advocate"/handler that the AI
// chatbot or admin can assign cases to (excludes plain Employees).
export const ADVOCATE_ROLE_IDS = [2, 3, 4, 5, 7]; // Legal Manager, Legal Agent, HR Manager, ICC Member, Empanelled Lawyer

// Maps each CategoryID to the RoleID(s) best suited to handle it.
// Used by the AI chatbot to pick a sensible advocate after triage.
export const CATEGORY_TO_ROLE_PREFERENCE = {
  1: [7, 3],     // Personal Legal Consultation -> Empanelled Lawyer, then Legal Agent
  2: [3],        // Consumer Rights -> Legal Agent
  3: [7, 3],     // Will & Estate -> Empanelled Lawyer, then Legal Agent
  4: [3],        // Affidavit & Notarization -> Legal Agent
  5: [3],        // Attestation Support -> Legal Agent
  6: [7, 2],     // Employment Law Advisory -> Empanelled Lawyer, then Legal Manager
  7: [2],        // Disciplinary Advisory -> Legal Manager (joint w/ HR)
  8: [5],        // POSH / Harassment -> ICC Member ONLY
  9: [4, 2],     // Workplace Conduct -> HR Manager, then Legal Manager
  10: [2],       // Vendor & Service Complaint -> Legal Manager
  11: [2],       // Whistleblower -> Legal Manager (handled separately, not a Case)
};
