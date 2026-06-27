import React, { useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPersonResolver } from "../utils/personLookup";
import { GrievanceContext } from "./GrievanceContext";
import {
  loadSharedData,
  loadUserData,
  loadNotifications,
  addCase,
  addWhistleblowerReport,
  addOfficial,
  fetchCommentsForCase,
  addComment,
  updateCaseStatus,
  assignCase,
  fetchAttachmentsForCase,
  addAttachment,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fileCaseWithAdvocate,
  setApiError
} from "../store/slices/grievanceSlice";

export const GrievanceProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  const authUser = useSelector((state) => state.auth.authUser);
  const grievanceState = useSelector((state) => state.grievance);

  const {
    users,
    officials,
    roles,
    categories,
    cases,
    assignments,
    comments,
    attachments,
    notifications,
    statusHistory,
    whistleblowerReports,
    loadingShared,
    loadingUser,
    apiError,
  } = grievanceState;

  const isDataLoading = useMemo(() => {
    return loadingShared || loadingUser;
  }, [loadingShared, loadingUser]);

  const { getPerson, getPersonName } = useMemo(
    () => createPersonResolver(users, officials),
    [users, officials]
  );

  // 1. Load shared/directory data on startup
  useEffect(() => {
    dispatch(loadSharedData());
  }, [dispatch]);

  // 2. Load user-specific data on login/logout
  useEffect(() => {
    dispatch(loadUserData(authUser));
  }, [authUser, dispatch]);

  // 3. Fetch notifications for the currently logged in user
  useEffect(() => {
    if (authUser) {
      dispatch(loadNotifications(authUser));
    }
  }, [authUser, dispatch]);

  // Context value wrapper mapping Context APIs to Redux thunks
  const value = {
    users,
    officials,
    roles,
    categories,
    cases,
    assignments,
    comments,
    attachments,
    notifications,
    statusHistory,
    whistleblowerReports,
    currentUser: authUser,
    setCurrentUser: () => {},
    getPerson,
    getPersonName,
    isDataLoading,
    apiError,
    
    setApiError: (err) => dispatch(setApiError(err)),
    
    addCase: async (payload) => {
      const result = await dispatch(addCase(payload)).unwrap();
      return result.newCase ? result.newCase.CaseID : result.newCaseId;
    },
    addWhistleblowerReport: async (payload) => {
      const result = await dispatch(addWhistleblowerReport(payload)).unwrap();
      return result.newReport ? result.newReport.ReferenceNumber : null;
    },
    addOfficial: (payload) =>
      dispatch(addOfficial(payload)).unwrap(),
    addComment: (caseId, userId, commentText) =>
      dispatch(addComment({ caseId, userId, commentText })),
    updateCaseStatus: (caseId, newStatus, actorUserId) =>
      dispatch(updateCaseStatus({ caseId, newStatus, actorUserId })),
    assignCase: (caseId, assignedToUserId, assignedByUserId) =>
      dispatch(assignCase({ caseId, assignedToUserId, assignedByUserId })),
    addAttachment: (caseId, fileName, fileType, uploadedByUserId) =>
      dispatch(addAttachment({ caseId, fileName, fileType, uploadedByUserId })),
    markNotificationAsRead: (notificationId) =>
      dispatch(markNotificationAsRead(notificationId)),
    markAllNotificationsAsRead: (userId) =>
      dispatch(markAllNotificationsAsRead(userId)),
    fileCaseWithAdvocate: async (payload) => {
      const result = await dispatch(fileCaseWithAdvocate(payload)).unwrap();
      return result.newCaseId || result;
    },
    fetchCommentsForCase: useCallback((caseId) => {
      dispatch(fetchCommentsForCase(caseId));
    }, [dispatch]),
    fetchAttachmentsForCase: useCallback((caseId) => {
      dispatch(fetchAttachmentsForCase(caseId));
    }, [dispatch]),
  };

  return (
    <GrievanceContext.Provider value={value}>
      {children}
    </GrievanceContext.Provider>
  );
};
