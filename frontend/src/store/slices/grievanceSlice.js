import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { USE_REMOTE, apiRequest, isStaffRole, isAdminRole } from "../../data/dataSource";
import { createPersonResolver } from "../../utils/personLookup";

// Format Helper for current Date/Time (YYYY-MM-DD HH:MM:SS)
const getTimestamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const STATIC_ROLES = [
  { RoleID: 1, RoleName: "Admin" },
  { RoleID: 2, RoleName: "Legal Manager" },
  { RoleID: 3, RoleName: "Legal Agent" },
  { RoleID: 4, RoleName: "HR Manager" },
  { RoleID: 5, RoleName: "ICC Member" },
  { RoleID: 6, RoleName: "Employee" },
  { RoleID: 7, RoleName: "Empanelled Lawyer" },
  { RoleID: 8, RoleName: "Auditor" }
];

export const loadSharedData = createAsyncThunk(
  "grievance/loadSharedData",
  async (_, { rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const [catsRes, usersRes, officialsRes] = await Promise.all([
          apiRequest("/categories"),
          apiRequest("/users"),
          apiRequest("/officials"),
        ]);
        return {
          categories: catsRes.data || [],
          users: usersRes.data || [],
          officials: officialsRes.data || [],
          roles: STATIC_ROLES
        };
      } catch (error) {
        return rejectWithValue("Failed to fetch initial organization data. " + error.message);
      }
    } else {
      return {
        categories: [],
        users: [],
        officials: [],
        roles: STATIC_ROLES
      };
    }
  }
);

export const loadUserData = createAsyncThunk(
  "grievance/loadUserData",
  async (currentUser, { rejectWithValue }) => {
    if (!currentUser) return { cases: [], assignments: [], whistleblowerReports: [] };
    if (USE_REMOTE) {
      try {
        const isStaff = isStaffRole(currentUser.RoleID);
        const isAdmin = isAdminRole(currentUser.RoleID);

        // Fetch complaints and assignments
        const [casesRes, assignmentsRes] = await Promise.all([
          apiRequest("/complaints"),
          apiRequest("/assignments"),
        ]);

        let whistleblowerReports = [];
        if (isStaff && isAdmin) {
          const whistleblowerRes = await apiRequest("/whistleblower");
          whistleblowerReports = whistleblowerRes.data || [];
        }

        return {
          cases: casesRes.data || [],
          assignments: assignmentsRes.data || [],
          whistleblowerReports
        };
      } catch (error) {
        return rejectWithValue("Failed to load cases and assignments. " + error.message);
      }
    } else {
      return { cases: [], assignments: [], whistleblowerReports: [] };
    }
  }
);

export const loadNotifications = createAsyncThunk(
  "grievance/loadNotifications",
  async (currentUser, { rejectWithValue }) => {
    if (!currentUser) return [];
    const userId = currentUser.UserID || currentUser.OfficialID;
    if (!userId) return [];
    try {
      const res = await apiRequest(`/notifications?userId=${userId}`);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCase = createAsyncThunk(
  "grievance/addCase",
  async ({ subject, categoryId, priority, description, userId }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const uId = userId || auth.authUser?.UserID || 1;
    if (USE_REMOTE) {
      try {
        const res = await apiRequest("/complaints", {
          method: "POST",
          body: {
            UserID: String(uId),
            CategoryID: String(categoryId),
            Subject: subject,
            Description: description,
            Priority: priority || "Medium",
          }
        });
        if (res.success && res.data) {
          return { newCase: res.data };
        }
        return rejectWithValue("Failed to add case.");
      } catch (error) {
        return rejectWithValue("Failed to file complaint: " + error.message);
      }
    } else {
      const { grievance } = getState();
      const newCaseId = grievance.cases.length > 0 ? Math.max(...grievance.cases.map((c) => c.CaseID)) + 1 : 1;
      const timestamp = getTimestamp();
      const dateOnly = timestamp.split(" ")[0];

      const newCase = {
        CaseID: newCaseId,
        UserID: uId,
        CategoryID: String(categoryId),
        Subject: subject,
        Description: description,
        Priority: priority || "Medium",
        Status: "Open",
        CreatedDate: dateOnly,
        ClosedDate: null,
      };

      const historyId = grievance.statusHistory.length > 0 ? Math.max(...grievance.statusHistory.map((h) => h.HistoryID)) + 1 : 1;
      const newHistory = {
        HistoryID: historyId,
        CaseID: newCaseId,
        OldStatus: null,
        NewStatus: "Open",
        ChangedBy: uId,
        ChangedDate: timestamp,
      };

      const notifId = grievance.notifications.length > 0 ? Math.max(...grievance.notifications.map((n) => n.NotificationID)) + 1 : 1;
      const newNotif = {
        NotificationID: notifId,
        UserID: uId,
        Message: `Your new case #${newCaseId} ("${subject.substring(0, 30)}...") has been successfully filed.`,
        IsRead: false,
        CreatedDate: timestamp,
      };

      return { newCase, newHistory, newNotif };
    }
  }
);

export const addWhistleblowerReport = createAsyncThunk(
  "grievance/addWhistleblowerReport",
  async ({ subject, category, description }, { getState, rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const res = await apiRequest("/whistleblower", {
          method: "POST",
          body: {
            Subject: subject,
            Category: category,
            Description: description,
          }
        });
        if (res.success && res.data) {
          return { newReport: res.data };
        }
        return rejectWithValue("Failed to submit whistleblower report.");
      } catch (error) {
        return rejectWithValue("Failed to submit whistleblower report: " + error.message);
      }
    } else {
      const { grievance } = getState();
      const newReportId = grievance.whistleblowerReports.length > 0 ? Math.max(...grievance.whistleblowerReports.map((r) => r.ReportID)) + 1 : 1;
      const refNum = `WB-2024-${String(newReportId).padStart(4, "0")}`;
      const timestamp = getTimestamp();

      const newReport = {
        ReportID: newReportId,
        ReferenceNumber: refNum,
        Subject: subject,
        Description: description,
        Category: category,
        Status: "Submitted",
        SubmittedDate: timestamp,
      };
      return { newReport };
    }
  }
);

export const addOfficial = createAsyncThunk(
  "grievance/addOfficial",
  async (payload, { getState, rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const res = await apiRequest("/officials", {
          method: "POST",
          body: {
            StaffID: payload.staffId,
            FullName: payload.fullName,
            Email: payload.email,
            Phone: payload.phone,
            Department: payload.department,
            Designation: payload.designation,
            RoleID: String(payload.roleId),
            Specialization: payload.specialization,
            BarCouncilID: payload.barCouncilId,
            Status: "Active",
            Password: payload.password
          }
        });
        if (res.success && res.data) {
          return { newOfficial: res.data };
        }
        return rejectWithValue("Failed to add official: " + (res.message || "Unknown error"));
      } catch (error) {
        return rejectWithValue("Failed to add official: " + error.message);
      }
    } else {
      const { grievance } = getState();
      const newOfficialId = grievance.officials.length > 0 ? Math.max(...grievance.officials.map((o) => o.OfficialID)) + 1 : 1;
      const newOfficial = {
        OfficialID: newOfficialId,
        StaffID: payload.staffId,
        FullName: payload.fullName,
        Email: payload.email,
        Phone: payload.phone,
        Department: payload.department,
        Designation: payload.designation,
        RoleID: String(payload.roleId),
        Specialization: payload.specialization,
        BarCouncilID: payload.barCouncilId,
        Status: "Active",
        JoinedDate: new Date().toISOString().split("T")[0]
      };
      return { newOfficial };
    }
  }
);

export const fetchCommentsForCase = createAsyncThunk(
  "grievance/fetchCommentsForCase",
  async (caseId, { rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const res = await apiRequest(`/comments/${caseId}`);
        if (res.success && res.data) {
          return { caseId: String(caseId), comments: res.data };
        }
        return rejectWithValue("Failed to fetch comments.");
      } catch (error) {
        return rejectWithValue("Failed to fetch comments: " + error.message);
      }
    }
    return { caseId: String(caseId), comments: [] };
  }
);

export const addComment = createAsyncThunk(
  "grievance/addComment",
  async ({ caseId, userId, commentText }, { getState, rejectWithValue }) => {
    if (!commentText.trim()) return rejectWithValue("Empty comment.");
    if (USE_REMOTE) {
      try {
        const res = await apiRequest("/comments", {
          method: "POST",
          body: {
            CaseID: String(caseId),
            UserID: String(userId),
            CommentText: commentText,
          }
        });
        if (res.success && res.data) {
          return { newComment: res.data };
        }
        return rejectWithValue("Failed to add comment.");
      } catch (error) {
        return rejectWithValue("Failed to add comment: " + error.message);
      }
    } else {
      const { grievance } = getState();
      const newCommentId = grievance.comments.length > 0 ? Math.max(...grievance.comments.map((c) => c.CommentID)) + 1 : 1;
      const timestamp = getTimestamp();

      const newComment = {
        CommentID: newCommentId,
        CaseID: String(caseId),
        UserID: String(userId),
        CommentText: commentText,
        CreatedDate: timestamp,
      };
      return { newComment };
    }
  }
);

export const updateCaseStatus = createAsyncThunk(
  "grievance/updateCaseStatus",
  async ({ caseId, newStatus, actorUserId }, { getState, rejectWithValue }) => {
    const timestamp = getTimestamp();
    const dateOnly = timestamp.split(" ")[0];
    const { grievance } = getState();
    const targetCase = grievance.cases.find((c) => c.CaseID === String(caseId));
    const oldStatus = targetCase ? targetCase.Status : "Open";

    if (USE_REMOTE) {
      try {
        await apiRequest("/status", {
          method: "PUT",
          body: {
            CaseID: String(caseId),
            NewStatus: newStatus,
            ActorUserID: String(actorUserId),
          }
        });

        const historyId = grievance.statusHistory.length > 0 ? Math.max(...grievance.statusHistory.map((h) => h.HistoryID)) + 1 : 1;
        const newHistory = {
          HistoryID: historyId,
          CaseID: String(caseId),
          OldStatus: oldStatus,
          NewStatus: newStatus,
          ChangedBy: String(actorUserId),
          ChangedDate: timestamp,
        };

        return { caseId: String(caseId), newStatus, dateOnly, newHistory };
      } catch (error) {
        return rejectWithValue("Failed to update case status: " + error.message);
      }
    } else {
      const historyId = grievance.statusHistory.length > 0 ? Math.max(...grievance.statusHistory.map((h) => h.HistoryID)) + 1 : 1;
      const newHistory = {
        HistoryID: historyId,
        CaseID: String(caseId),
        OldStatus: oldStatus,
        NewStatus: newStatus,
        ChangedBy: String(actorUserId),
        ChangedDate: timestamp,
      };

      let newNotif = null;
      if (targetCase) {
        const notifId = grievance.notifications.length > 0 ? Math.max(...grievance.notifications.map((n) => n.NotificationID)) + 1 : 1;
        newNotif = {
          NotificationID: notifId,
          UserID: targetCase.UserID,
          Message: `Case #${caseId} status updated from "${oldStatus}" to "${newStatus}".`,
          IsRead: false,
          CreatedDate: timestamp,
        };
      }

      return { caseId: String(caseId), newStatus, dateOnly, newHistory, newNotif };
    }
  }
);

export const assignCase = createAsyncThunk(
  "grievance/assignCase",
  async ({ caseId, assignedToUserId, assignedByUserId }, { getState, rejectWithValue }) => {
    const timestamp = getTimestamp();
    const { grievance } = getState();

    if (USE_REMOTE) {
      try {
        const res = await apiRequest("/assignments", {
          method: "POST",
          body: {
            CaseID: String(caseId),
            AssignedToUserID: String(assignedToUserId),
            AssignedByUserID: String(assignedByUserId),
          }
        });
        if (res.success && res.data) {
          return { newAssignment: res.data, isRemote: true };
        }
        return rejectWithValue("Failed to assign case.");
      } catch (error) {
        return rejectWithValue("Failed to assign case: " + error.message);
      }
    } else {
      const targetCase = grievance.cases.find((c) => c.CaseID === String(caseId));
      const resolver = createPersonResolver(grievance.users, grievance.officials);
      const assignee = resolver.getPerson(String(assignedToUserId));
      const assigner = resolver.getPerson(String(assignedByUserId));

      const existingAssignmentIdx = grievance.assignments.findIndex((a) => a.CaseID === String(caseId));
      let updatedAssignment = null;
      let newAssignment = null;

      if (existingAssignmentIdx > -1) {
        const prevAssign = grievance.assignments[existingAssignmentIdx];
        updatedAssignment = {
          ...prevAssign,
          AssignedToUserID: String(assignedToUserId),
          AssignedByUserID: String(assignedByUserId),
          AssignedDate: timestamp,
        };
      } else {
        const newAssignId = grievance.assignments.length > 0 ? Math.max(...grievance.assignments.map((a) => a.AssignmentID)) + 1 : 1;
        newAssignment = {
          AssignmentID: newAssignId,
          CaseID: String(caseId),
          AssignedToUserID: String(assignedToUserId),
          AssignedByUserID: String(assignedByUserId),
          AssignedDate: timestamp,
        };
      }

      const notifs = [];
      if (targetCase) {
        const notifId1 = grievance.notifications.length > 0 ? Math.max(...grievance.notifications.map((n) => n.NotificationID)) + 1 : 1;
        notifs.push({
          NotificationID: notifId1,
          UserID: String(assignedToUserId),
          Message: `You have been assigned Case #${caseId} ("${targetCase.Subject.substring(0, 30)}...") by ${assigner?.FullName || "Admin"}.`,
          IsRead: false,
          CreatedDate: timestamp,
        });

        notifs.push({
          NotificationID: notifId1 + 1,
          UserID: targetCase.UserID,
          Message: `Your case #${caseId} has been assigned to ${assignee?.FullName || "Agent"}.`,
          IsRead: false,
          CreatedDate: timestamp,
        });
      }

      return { updatedAssignment, newAssignment, notifs, isRemote: false };
    }
  }
);

export const fetchAttachmentsForCase = createAsyncThunk(
  "grievance/fetchAttachmentsForCase",
  async (caseId, { rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const res = await apiRequest(`/attachments/${caseId}`);
        if (res.success && res.data) {
          return { caseId: String(caseId), attachments: res.data };
        }
        return rejectWithValue("Failed to fetch attachments.");
      } catch (error) {
        return rejectWithValue("Failed to fetch attachments: " + error.message);
      }
    }
    return { caseId: String(caseId), attachments: [] };
  }
);

export const addAttachment = createAsyncThunk(
  "grievance/addAttachment",
  async ({ caseId, fileName, fileType, uploadedByUserId }, { getState, rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const res = await apiRequest("/attachments", {
          method: "POST",
          body: {
            CaseID: String(caseId),
            FileName: fileName,
            FilePath: `/uploads/cases/${caseId}/${fileName}`,
            UploadedBy: String(uploadedByUserId),
          }
        });
        if (res.success && res.data) {
          return { newAttachment: res.data };
        }
        return rejectWithValue("Failed to add attachment.");
      } catch (error) {
        return rejectWithValue("Failed to upload/add attachment: " + error.message);
      }
    } else {
      const { grievance } = getState();
      const newAttachId = grievance.attachments.length > 0 ? Math.max(...grievance.attachments.map((a) => a.AttachmentID)) + 1 : 1;
      const timestamp = getTimestamp();

      const newAttachment = {
        AttachmentID: newAttachId,
        CaseID: String(caseId),
        FileName: fileName,
        FilePath: `/uploads/cases/${caseId}/${fileName}`,
        UploadedBy: String(uploadedByUserId),
        UploadedDate: timestamp,
      };
      return { newAttachment };
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "grievance/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        await apiRequest(`/notifications/${notificationId}/read`, {
          method: "PUT"
        });
        return String(notificationId);
      } catch (error) {
        return rejectWithValue("Failed to update notification: " + error.message);
      }
    }
    return String(notificationId);
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "grievance/markAllNotificationsAsRead",
  async (userId, { getState, rejectWithValue }) => {
    if (USE_REMOTE) {
      try {
        const { grievance } = getState();
        const unread = grievance.notifications.filter((n) => n.UserID === String(userId) && !n.IsRead);
        await Promise.all(
          unread.map((n) =>
            apiRequest(`/notifications/${n.NotificationID}/read`, {
              method: "PUT"
            })
          )
        );
        return String(userId);
      } catch (error) {
        return rejectWithValue("Failed to mark all notifications as read: " + error.message);
      }
    }
    return String(userId);
  }
);

export const fileCaseWithAdvocate = createAsyncThunk(
  "grievance/fileCaseWithAdvocate",
  async ({ subject, categoryId, priority, description, userId, advocateUserId, triageNote }, { dispatch, getState, rejectWithValue }) => {
    const { auth, grievance } = getState();
    const uId = userId || auth.authUser?.UserID || 1;

    if (USE_REMOTE) {
      try {
        const addCaseResult = await dispatch(addCase({ subject, categoryId, priority, description, userId: uId })).unwrap();
        const caseId = String(addCaseResult.newCase ? addCaseResult.newCase.CaseID : addCaseResult.newCaseId);
        if (!caseId) return null;
 
        if (advocateUserId) {
          await dispatch(assignCase({ caseId, assignedToUserId: advocateUserId, assignedByUserId: uId })).unwrap();
          await dispatch(updateCaseStatus({ caseId, newStatus: "In Progress", actorUserId: uId })).unwrap();
        }
 
        if (triageNote) {
          await dispatch(addComment({ caseId, userId: advocateUserId || uId, commentText: triageNote })).unwrap();
        }
 
        return caseId;
      } catch (error) {
        return rejectWithValue("Failed to file case with auto-assigned advocate: " + error.message);
      }
    } else {
      const newCaseId = grievance.cases.length > 0 ? Math.max(...grievance.cases.map((c) => c.CaseID)) + 1 : 1;
      const timestamp = getTimestamp();
      const dateOnly = timestamp.split(" ")[0];

      const newCase = {
        CaseID: newCaseId,
        UserID: uId,
        CategoryID: String(categoryId),
        Subject: subject,
        Description: description,
        Priority: priority || "Medium",
        Status: advocateUserId ? "In Progress" : "Open",
        CreatedDate: dateOnly,
        ClosedDate: null,
      };

      const historyId1 = grievance.statusHistory.length > 0 ? Math.max(...grievance.statusHistory.map((h) => h.HistoryID)) + 1 : 1;
      const newHistoryEntries = [
        {
          HistoryID: historyId1,
          CaseID: newCaseId,
          OldStatus: null,
          NewStatus: "Open",
          ChangedBy: uId,
          ChangedDate: timestamp,
        },
      ];

      const newAssignments = [];
      if (advocateUserId) {
        const assignId = grievance.assignments.length > 0 ? Math.max(...grievance.assignments.map((a) => a.AssignmentID)) + 1 : 1;
        newAssignments.push({
          AssignmentID: assignId,
          CaseID: newCaseId,
          AssignedToUserID: String(advocateUserId),
          AssignedByUserID: uId,
          AssignedDate: timestamp,
        });
        newHistoryEntries.push({
          HistoryID: historyId1 + 1,
          CaseID: newCaseId,
          OldStatus: "Open",
          NewStatus: "In Progress",
          ChangedBy: uId,
          ChangedDate: timestamp,
        });
      }

      let newComment = null;
      if (triageNote) {
        const newCommentId = grievance.comments.length > 0 ? Math.max(...grievance.comments.map((c) => c.CommentID)) + 1 : 1;
        newComment = {
          CommentID: newCommentId,
          CaseID: newCaseId,
          UserID: advocateUserId ? String(advocateUserId) : uId,
          CommentText: triageNote,
          CreatedDate: timestamp,
        };
      }

      const resolver = createPersonResolver(grievance.users, grievance.officials);
      const newNotifs = [];
      const notifId = grievance.notifications.length > 0 ? Math.max(...grievance.notifications.map((n) => n.NotificationID)) + 1 : 1;
      newNotifs.push({
        NotificationID: notifId,
        UserID: uId,
        Message: advocateUserId
          ? `Your case #${newCaseId} was filed and auto-assigned to an advocate by AI triage.`
          : `Your new case #${newCaseId} ("${subject.substring(0, 30)}...") has been successfully filed.`,
        IsRead: false,
        CreatedDate: timestamp,
      });

      if (advocateUserId) {
        newNotifs.push({
          NotificationID: notifId + 1,
          UserID: String(advocateUserId),
          Message: `You have been auto-assigned Case #${newCaseId} ("${subject.substring(0, 30)}...") via AI triage.`,
          IsRead: false,
          CreatedDate: timestamp,
        });
      }

      return {
        newCase,
        newHistoryEntries,
        newAssignments,
        newComment,
        newNotifs,
        newCaseId
      };
    }
  }
);

const initialState = {
  users: [],
  officials: [],
  roles: [],
  categories: [],
  cases: [],
  assignments: [],
  comments: [],
  attachments: [],
  notifications: [],
  statusHistory: [],
  whistleblowerReports: [],
  loadingShared: true,
  loadingUser: false,
  apiError: null,
};

const grievanceSlice = createSlice({
  name: "grievance",
  initialState,
  reducers: {
    setApiError(state, action) {
      state.apiError = action.payload;
    },
    clearApiError(state) {
      state.apiError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadSharedData
      .addCase(loadSharedData.pending, (state) => {
        state.loadingShared = true;
        state.apiError = null;
      })
      .addCase(loadSharedData.fulfilled, (state, action) => {
        state.loadingShared = false;
        state.categories = action.payload.categories;
        state.users = action.payload.users;
        state.officials = action.payload.officials;
        state.roles = action.payload.roles;
      })
      .addCase(loadSharedData.rejected, (state, action) => {
        state.loadingShared = false;
        state.apiError = action.payload || "Failed to load directory data.";
      })
      // loadUserData
      .addCase(loadUserData.pending, (state) => {
        state.loadingUser = true;
        state.apiError = null;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.loadingUser = false;
        state.cases = action.payload.cases;
        state.assignments = action.payload.assignments;
        state.whistleblowerReports = action.payload.whistleblowerReports;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.loadingUser = false;
        state.apiError = action.payload || "Failed to load user data.";
      })
      // loadNotifications
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.apiError = "Failed to load notifications: " + action.payload;
      })
      // addCase
      .addCase(addCase.fulfilled, (state, action) => {
        const { newCase, newHistory, newNotif } = action.payload;
        state.cases.unshift(newCase);
        if (newHistory) state.statusHistory.push(newHistory);
        if (newNotif) state.notifications.unshift(newNotif);
      })
      .addCase(addCase.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // addWhistleblowerReport
      .addCase(addWhistleblowerReport.fulfilled, (state, action) => {
        state.whistleblowerReports.unshift(action.payload.newReport);
      })
      .addCase(addWhistleblowerReport.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // addOfficial
      .addCase(addOfficial.fulfilled, (state, action) => {
        state.officials.push(action.payload.newOfficial);
      })
      .addCase(addOfficial.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // fetchCommentsForCase
      .addCase(fetchCommentsForCase.fulfilled, (state, action) => {
        const { caseId, comments } = action.payload;
        state.comments = state.comments.filter((c) => c.CaseID !== caseId).concat(comments);
      })
      .addCase(fetchCommentsForCase.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload.newComment);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // updateCaseStatus
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const { caseId, newStatus, dateOnly, newHistory, newNotif } = action.payload;
        state.cases = state.cases.map((c) =>
          c.CaseID === caseId
            ? { ...c, Status: newStatus, ClosedDate: newStatus === "Closed" ? dateOnly : null }
            : c
        );
        state.statusHistory.push(newHistory);
        if (newNotif) state.notifications.unshift(newNotif);
      })
      .addCase(updateCaseStatus.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // assignCase
      .addCase(assignCase.fulfilled, (state, action) => {
        const { newAssignment, updatedAssignment, notifs, isRemote } = action.payload;
        if (isRemote) {
          state.assignments = state.assignments
            .filter((a) => a.CaseID !== newAssignment.CaseID)
            .concat(newAssignment);
        } else {
          if (updatedAssignment) {
            state.assignments = state.assignments.map((a) =>
              a.CaseID === updatedAssignment.CaseID ? updatedAssignment : a
            );
          } else if (newAssignment) {
            state.assignments.push(newAssignment);
          }
          if (notifs && notifs.length) {
            state.notifications.unshift(...notifs);
          }
        }
      })
      .addCase(assignCase.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // fetchAttachmentsForCase
      .addCase(fetchAttachmentsForCase.fulfilled, (state, action) => {
        const { caseId, attachments } = action.payload;
        state.attachments = state.attachments.filter((a) => a.CaseID !== caseId).concat(attachments);
      })
      .addCase(fetchAttachmentsForCase.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // addAttachment
      .addCase(addAttachment.fulfilled, (state, action) => {
        state.attachments.push(action.payload.newAttachment);
      })
      .addCase(addAttachment.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) =>
          n.NotificationID === action.payload ? { ...n, IsRead: true } : n
        );
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) =>
          n.UserID === action.payload ? { ...n, IsRead: true } : n
        );
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.apiError = action.payload;
      })
      // fileCaseWithAdvocate
      .addCase(fileCaseWithAdvocate.fulfilled, (state, action) => {
        if (USE_REMOTE) return; // Managed by nested dispatches in thunk
        const { newCase, newHistoryEntries, newAssignments, newComment, newNotifs } = action.payload;
        state.cases.unshift(newCase);
        state.statusHistory.push(...newHistoryEntries);
        if (newAssignments.length) {
          state.assignments.push(...newAssignments);
        }
        if (newComment) {
          state.comments.push(newComment);
        }
        state.notifications.unshift(...newNotifs);
      })
      .addCase(fileCaseWithAdvocate.rejected, (state, action) => {
        state.apiError = action.payload;
      });
  }
});

export const { setApiError, clearApiError } = grievanceSlice.actions;

export default grievanceSlice.reducer;
