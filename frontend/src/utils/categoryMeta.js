// Central icon + short-label map for Categories
export const CATEGORY_ICON_MAP = {
  "CAT-001": "🔒",  // Sexual Harassment (POSH)
  "CAT-002": "⚖️",  // Financial / Ethical Misconduct
  "CAT-003": "🎯",  // Whistleblower / Regulatory Violation
  "CAT-004": "🛡️",  // Workplace Discrimination
  "CAT-005": "🏢",  // Workplace Conduct Complaint
  "CAT-006": "📋",  // General Grievance
  
  // Legacy numeric fallbacks:
  1: "⚖️",
  2: "🛡️",
  3: "📜",
  4: "📋",
  5: "✅",
  6: "👔",
  7: "⚠️",
  8: "🔒",
  9: "🏢",
  10: "📦",
  11: "🎯",
};

export const getCategoryIcon = (categoryId) => {
  if (!categoryId) return "📁";
  return CATEGORY_ICON_MAP[categoryId] || CATEGORY_ICON_MAP[Number(categoryId)] || "📁";
};

// Roles eligible to act as a case "advocate"/handler
export const ADVOCATE_ROLE_IDS = [
  "ICC_PRESIDING_OFFICER",
  "EMPANELLED_LAWYER",
  "HR_MANAGER",
  "LEGAL_MANAGER",
  "LEGAL_AGENT",
  "ICC_MEMBER",
  "LEGAL_COUNSEL",
  "HR_HEAD",
  2, 3, 4, 5, 7
];

// Maps each CategoryID to the RoleID(s) best suited to handle it.
export const CATEGORY_TO_ROLE_PREFERENCE = {
  "CAT-001": ["ICC_PRESIDING_OFFICER", "ICC_MEMBER"],
  "CAT-002": ["LEGAL_COUNSEL", "LEGAL_MANAGER"],
  "CAT-003": ["EMPANELLED_LAWYER", "LEGAL_COUNSEL"],
  "CAT-004": ["HR_HEAD", "HR_MANAGER"],
  "CAT-005": ["HR_HEAD", "HR_MANAGER"],
  "CAT-006": ["LEGAL_COUNSEL", "LEGAL_AGENT"],
  
  // Legacy numeric fallbacks:
  1: [7, 3],
  2: [3],
  3: [7, 3],
  4: [3],
  5: [3],
  6: [7, 2],
  7: [2],
  8: [5],
  9: [4, 2],
  10: [2],
  11: [2],
};
