import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, resolvePortalType, isUserRole } from "../../data/dataSource";

const SESSION_KEY = "legaldesk_session";
const SESSION_TYPE_KEY = "legaldesk_session_type";

export const loginAsUser = createAsyncThunk(
  "auth/loginAsUser",
  async (userId, { getState, rejectWithValue }) => {
    const { grievance } = getState();
    const user = grievance.users.find((u) => u.UserID === Number(userId));
    if (!user) {
      return rejectWithValue("Could not find that employee record.");
    }
    if (!isUserRole(user.RoleID)) {
      return rejectWithValue("This profile is not registered for the User Portal.");
    }
    
    sessionStorage.setItem(SESSION_KEY, String(user.UserID));
    sessionStorage.setItem(SESSION_TYPE_KEY, "user");
    return { user: { ...user, personType: "user" }, portalType: "user", portalMode: "user" };
  }
);

export const loginAsStaff = createAsyncThunk(
  "auth/loginAsStaff",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const res = await apiRequest("/login", {
        method: "POST",
        body: { Identifier: identifier, Password: password }
      });
      if (!res.success) {
        return rejectWithValue(res.message || "Login failed.");
      }
      const official = res.data;
      const type = resolvePortalType(official.RoleID);
      if (type === "user") {
        return rejectWithValue("This account does not have Staff Portal access.");
      }
      
      const officialId = Number(official.OfficialID || official.UserID);
      sessionStorage.setItem(SESSION_KEY, String(officialId));
      sessionStorage.setItem(SESSION_TYPE_KEY, "official");
      return {
        user: { ...official, OfficialID: officialId, UserID: officialId, personType: "official" },
        portalType: type,
        portalMode: "staff"
      };
    } catch (err) {
      return rejectWithValue(err.message || "Login failed.");
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { getState }) => {
    const { grievance } = getState();
    const savedId = sessionStorage.getItem(SESSION_KEY);
    const savedType = sessionStorage.getItem(SESSION_TYPE_KEY);
    if (savedId && savedType) {
      if (savedType === "user") {
        const u = grievance.users.find((usr) => usr.UserID === Number(savedId));
        if (u && isUserRole(u.RoleID)) {
          return { user: { ...u, personType: "user" }, portalType: "user", portalMode: "user" };
        }
      } else if (savedType === "official") {
        const o = grievance.officials.find((off) => off.OfficialID === Number(savedId));
        if (o) {
          const type = resolvePortalType(o.RoleID);
          return {
            user: { ...o, OfficialID: o.OfficialID, UserID: o.OfficialID, personType: "official" },
            portalType: type,
            portalMode: "staff"
          };
        }
      }
    }
    return null;
  }
);

const initialState = {
  authUser: null,
  portalMode: "user", // "user" | "staff"
  portalType: null, // "user" | "admin" | "advocate"
  authError: "",
  isAuthenticating: false,
  restoring: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthError(state, action) {
      state.authError = action.payload;
    },
    logout(state) {
      state.authUser = null;
      state.portalType = null;
      state.portalMode = "user";
      state.authError = "";
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_TYPE_KEY);
    },
    switchToStaffLogin(state) {
      state.authUser = null;
      state.portalType = null;
      state.portalMode = "staff";
      state.authError = "";
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_TYPE_KEY);
    },
    switchToUserLogin(state) {
      state.authUser = null;
      state.portalType = null;
      state.portalMode = "user";
      state.authError = "";
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_TYPE_KEY);
    },
    setPortalType(state, action) {
      state.portalType = action.payload;
    },
    setPortalMode(state, action) {
      state.portalMode = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // loginAsUser
      .addCase(loginAsUser.fulfilled, (state, action) => {
        state.authUser = action.payload.user;
        state.portalType = action.payload.portalType;
        state.portalMode = action.payload.portalMode;
        state.authError = "";
      })
      .addCase(loginAsUser.rejected, (state, action) => {
        state.authError = action.payload || "Login failed.";
      })
      // loginAsStaff
      .addCase(loginAsStaff.pending, (state) => {
        state.isAuthenticating = true;
        state.authError = "";
      })
      .addCase(loginAsStaff.fulfilled, (state, action) => {
        state.isAuthenticating = false;
        state.authUser = action.payload.user;
        state.portalType = action.payload.portalType;
        state.portalMode = action.payload.portalMode;
        state.authError = "";
      })
      .addCase(loginAsStaff.rejected, (state, action) => {
        state.isAuthenticating = false;
        state.authError = action.payload || "Login failed.";
      })
      // restoreSession
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoring = false;
        if (action.payload) {
          state.authUser = action.payload.user;
          state.portalType = action.payload.portalType;
          state.portalMode = action.payload.portalMode;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.restoring = false;
      });
  }
});

export const {
  setAuthError,
  logout,
  switchToStaffLogin,
  switchToUserLogin,
  setPortalType,
  setPortalMode
} = authSlice.actions;

export default authSlice.reducer;
