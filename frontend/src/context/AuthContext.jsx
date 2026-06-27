import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isAdminRole, isAdvocateRole } from "../data/dataSource";
import {
  loginAsUser,
  loginAsStaff,
  restoreSession,
  logout,
  switchToStaffLogin,
  switchToUserLogin,
  setAuthError,
  setPortalType,
  setPortalMode
} from "../store/slices/authSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const grievanceState = useSelector((state) => state.grievance);

  const dataReady = grievanceState.users.length > 0 || grievanceState.officials.length > 0;

  useEffect(() => {
    if (dataReady && authState.restoring) {
      dispatch(restoreSession());
    }
  }, [dataReady, authState.restoring, dispatch]);

  const value = {
    authUser: authState.authUser,
    portalType: authState.portalType,
    isAdmin: authState.authUser ? isAdminRole(authState.authUser.RoleID) : false,
    isAdvocate: authState.authUser ? isAdvocateRole(authState.authUser.RoleID) : false,
    portalMode: authState.portalMode,
    authError: authState.authError,
    isAuthenticating: authState.isAuthenticating,
    restoring: authState.restoring,
    loginAsUser: (userId) => dispatch(loginAsUser(userId)).unwrap(),
    loginAsStaff: (credentials) => dispatch(loginAsStaff(credentials)).unwrap(),
    loginAsEmployee: (userId) => dispatch(loginAsUser(userId)).unwrap(),
    loginAsAdmin: (credentials) => dispatch(loginAsStaff(credentials)).unwrap(),
    logout: () => dispatch(logout()),
    switchToStaffLogin: () => dispatch(switchToStaffLogin()),
    switchToUserLogin: () => dispatch(switchToUserLogin()),
    switchToAdminLogin: () => dispatch(switchToStaffLogin()),
    switchToEmployeeLogin: () => dispatch(switchToUserLogin()),
    setAuthError: (err) => dispatch(setAuthError(err)),
    setPortalType: (type) => dispatch(setPortalType(type)),
    setPortalMode: (mode) => dispatch(setPortalMode(mode)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
