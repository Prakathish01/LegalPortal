import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { GrievanceProvider } from "./context/GrievanceProvider";
import { GrievanceContext } from "./context/GrievanceContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth
import LoginScreen from "./components/auth/LoginScreen";

// Admin / Staff console
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardOverview from "./components/views/DashboardOverview";
import CasesView from "./components/views/CasesView";
import CaseDetail from "./components/views/CaseDetail";
import UsersView from "./components/views/UsersView";
import WhistleblowerView from "./components/views/WhistleblowerView";

// Employee self-service portal
import EmployeeSidebar from "./components/employee/EmployeeSidebar";
import EmployeeHeader from "./components/employee/EmployeeHeader";
import EmployeeHome from "./components/employee/EmployeeHome";
import EmployeeMyCases from "./components/employee/EmployeeMyCases";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeeWhistleblower from "./components/employee/EmployeeWhistleblower";
import FAQView from "./components/employee/FAQView";
import FloatingChatLauncher from "./components/employee/FloatingChatLauncher";
import AIAdvocateChat from "./components/chatbot/AIAdvocateChat";
import NewCaseModal from "./components/modals/NewCaseModal";
import AdvocateSidebar from "./components/advocate/AdvocateSidebar";
import AdvocateDashboard from "./components/advocate/AdvocateDashboard";
import AdvocateProfile from "./components/advocate/AdvocateProfile";
import ChatroomsView from "./components/views/ChatroomsView";
import ApiErrorBanner from "./components/layout/ApiErrorBanner";

/**
 * In-app data loading overlay — shows inside the main content area
 * while user-specific data is being fetched.
 */
function DataLoadingOverlay() {
  return (
    <div className="data-loading-overlay">
      <div className="data-loading-card">
        <div className="data-loading-icon">☁️</div>
        <div className="data-loading-spinner"></div>
        <h3 className="data-loading-title">Fetching your data from the cloud</h3>
        <p className="data-loading-subtitle">
          Securely loading cases, assignments, and notifications from AWS&hellip;<br />
          This usually takes just a moment.
        </p>
        <div className="skeleton-rows">
          <div className="skeleton-row">
            <div className="skeleton-circle"></div>
            <div className="skeleton-bar" style={{ flex: 1 }}></div>
            <div className="skeleton-bar" style={{ width: 60 }}></div>
          </div>
          <div className="skeleton-row">
            <div className="skeleton-circle"></div>
            <div className="skeleton-bar" style={{ flex: 1 }}></div>
            <div className="skeleton-bar" style={{ width: 80 }}></div>
          </div>
          <div className="skeleton-row">
            <div className="skeleton-circle"></div>
            <div className="skeleton-bar" style={{ flex: 1 }}></div>
            <div className="skeleton-bar" style={{ width: 50 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ADMIN / STAFF CONSOLE
 */
function AdminLayout() {
  const { authUser } = useAuth();
  const { setCurrentUser, isDataLoading } = useContext(GrievanceContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authUser) {
      setCurrentUser({ ...authUser, UserID: authUser.OfficialID || authUser.UserID });
    }
  }, [authUser, setCurrentUser]);

  // Parse path: /admin/dashboard, /admin/cases, /admin/cases/:id, /admin/users, /admin/whistleblower
  const pathParts = location.pathname.split("/").filter(Boolean); // ["admin", "view", "id"]
  const activeView = pathParts[1] || "dashboard";
  const selectedCaseId = activeView === "cases" && pathParts[2] ? pathParts[2] : null;

  const getViewLabel = () => {
    switch (activeView) {
      case "dashboard":
        return "Command Overview";
      case "cases":
        return selectedCaseId ? "Case Details" : "Grievance Cases";
      case "users":
        return "Directory & Roles";
      case "whistleblower":
        return "Secure Whistleblower Portal";
      default:
        return "Overview";
    }
  };

  const handleSelectCase = (caseItem) => {
    navigate(`/admin/cases/${caseItem.CaseID}`);
  };

  const handleBackToCases = () => {
    navigate("/admin/cases");
  };

  const handleSetView = (viewId) => {
    navigate(`/admin/${viewId}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={handleSetView} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeViewLabel={getViewLabel()} />

        <main className="flex-1 overflow-y-auto p-6 box-border">
          <ApiErrorBanner />
          {isDataLoading ? <DataLoadingOverlay /> : <>
            {activeView === "dashboard" && (
              <DashboardOverview onSelectCase={handleSelectCase} onViewChange={handleSetView} />
            )}

            {activeView === "cases" &&
              (selectedCaseId ? (
                <CaseDetail caseId={selectedCaseId} onBack={handleBackToCases} />
              ) : (
                <CasesView onSelectCase={handleSelectCase} />
              ))}

            {activeView === "users" && <UsersView />}

            {activeView === "whistleblower" && <WhistleblowerView />}
          </>}
        </main>
      </div>
    </div>
  );
}

/**
 * ADVOCATE / LEGAL STAFF PORTAL
 */
function AdvocateLayout() {
  const { authUser } = useAuth();
  const { assignments, setCurrentUser, isDataLoading } = useContext(GrievanceContext);
  const officialId = authUser?.OfficialID || authUser?.UserID;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authUser) {
      setCurrentUser({ ...authUser, UserID: authUser.OfficialID || authUser.UserID });
    }
  }, [authUser, setCurrentUser]);

  // Parse path: /advocate/dashboard, /advocate/assignments, /advocate/assignments/:id, /advocate/profile
  const pathParts = location.pathname.split("/").filter(Boolean); // ["advocate", "view", "id"]
  const activeView = pathParts[1] || "dashboard";
  const selectedCaseId = (activeView === "assignments" || activeView === "chats") && pathParts[2] ? pathParts[2] : null;

  const assignedCount = assignments.filter((a) => String(a.AssignedToUserID) === String(officialId)).length;

  const getViewLabel = () => {
    if (activeView === "dashboard") return "My Dashboard";
    if (activeView === "profile") return "My Profile";
    if (activeView === "chats") return selectedCaseId ? "Case Messages" : "Direct Message Channels";
    return selectedCaseId ? "Case Details" : "Assigned Cases";
  };

  const handleSelectCase = (caseItem) => {
    navigate(`/advocate/assignments/${caseItem.CaseID}`);
  };

  const handleSelectChat = (caseItem) => {
    navigate(`/advocate/chats/${caseItem.CaseID}`);
  };

  const handleBackToCases = () => {
    navigate("/advocate/assignments");
  };

  const handleBackToChats = () => {
    navigate("/advocate/chats");
  };

  const handleSetView = (viewId) => {
    navigate(`/advocate/${viewId}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AdvocateSidebar activeView={activeView} setActiveView={handleSetView} assignedCount={assignedCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeViewLabel={getViewLabel()} />

        <main className="flex-1 overflow-y-auto p-6 box-border">
          <ApiErrorBanner />
          {isDataLoading ? <DataLoadingOverlay /> : <>
            {activeView === "dashboard" && (
              <AdvocateDashboard onSelectCase={handleSelectCase} setActiveView={handleSetView} />
            )}

            {activeView === "assignments" &&
              (selectedCaseId ? (
                <CaseDetail caseId={selectedCaseId} onBack={handleBackToCases} isAdvocateView />
              ) : (
                <CasesView onSelectCase={handleSelectCase} assignedToId={officialId} />
              ))}

            {activeView === "chats" &&
              (selectedCaseId ? (
                <CaseDetail caseId={selectedCaseId} onBack={handleBackToChats} isAdvocateView defaultTab="comments" />
              ) : (
                <ChatroomsView onSelectCase={handleSelectChat} />
              ))}

            {activeView === "profile" && <AdvocateProfile />}
          </>}
        </main>
      </div>
    </div>
  );
}

/**
 * USER PORTAL — own cases and profile only
 */
function UserLayout() {
  const { cases, setCurrentUser, isDataLoading } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (authUser) {
      setCurrentUser({ ...authUser, UserID: authUser.UserID });
    }
  }, [authUser, setCurrentUser]);

  // Parse path: /employee/home, /employee/cases, /employee/cases/:id, /employee/whistleblower, /employee/faq, /employee/profile
  const pathParts = location.pathname.split("/").filter(Boolean); // ["employee", "view", "id"]
  let activeView = pathParts[1] || "home";

  let selectedCaseId = null;
  if (activeView === "cases") {
    if (pathParts[2]) {
      activeView = "case-detail";
      selectedCaseId = pathParts[2];
    } else {
      activeView = "my-cases";
    }
  }

  const myCaseCount = cases.filter((c) => c.UserID === authUser?.UserID).length;

  const handleSelectCase = (caseItem) => {
    navigate(`/employee/cases/${caseItem.CaseID}`);
  };

  const handleBackFromCase = () => {
    navigate("/employee/cases");
  };

  const handleSetView = (viewId) => {
    if (viewId === "file") {
      setShowNewCaseModal(true);
      return;
    }
    if (viewId === "ai-chat") {
      setShowChat(true);
      return;
    }
    const path = viewId === "my-cases" ? "cases" : viewId;
    navigate(`/employee/${path}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <EmployeeSidebar activeView={activeView} setActiveView={handleSetView} myCaseCount={myCaseCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <EmployeeHeader activeView={activeView === "case-detail" ? "my-cases" : activeView} />

        <main className="flex-1 overflow-y-auto p-6 box-border">
          <ApiErrorBanner />
          {isDataLoading ? <DataLoadingOverlay /> : <>
            {activeView === "home" && (
              <EmployeeHome setActiveView={handleSetView} onSelectCase={handleSelectCase} />
            )}

            {activeView === "my-cases" && (
              <EmployeeMyCases onSelectCase={handleSelectCase} setActiveView={handleSetView} />
            )}

            {activeView === "case-detail" && selectedCaseId && (
              <CaseDetail caseId={selectedCaseId} onBack={handleBackFromCase} isEmployeeView />
            )}

            {activeView === "whistleblower" && <EmployeeWhistleblower />}

            {activeView === "faq" && <FAQView />}

            {activeView === "profile" && <EmployeeProfile />}
          </>}
        </main>
      </div>

      {/* Floating AI Advocate launcher */}
      <FloatingChatLauncher onClick={() => setShowChat(true)} />

      {showNewCaseModal && (
        <NewCaseModal
          onClose={() => setShowNewCaseModal(false)}
          actingUserId={authUser?.UserID}
        />
      )}

      {showChat && (
        <AIAdvocateChat
          onClose={() => setShowChat(false)}
          onCaseCreated={(caseId) => {
            setShowChat(false);
            navigate(`/employee/cases/${caseId}`);
          }}
        />
      )}
    </div>
  );
}

/**
 * ROOT ROUTER
 */
function RootRouter() {
  const { authUser, restoring, portalType } = useAuth();
  const { isDataLoading } = useContext(GrievanceContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirects on login status changes
  useEffect(() => {
    if (!restoring && !isDataLoading) {
      if (!authUser) {
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      } else {
        if (location.pathname === "/login" || location.pathname === "/") {
          if (portalType === "admin") navigate("/admin/dashboard");
          else if (portalType === "advocate") navigate("/advocate/dashboard");
          else navigate("/employee/home");
        }
      }
    }
  }, [authUser, restoring, isDataLoading, portalType, location.pathname, navigate]);

  if (restoring || (!authUser && isDataLoading)) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center text-white font-sans"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(218, 55%, 15%), hsl(218, 60%, 8%))",
        }}
      >
        <div className="spinner-container">
          <div className="premium-spinner"></div>
          <h2 className="mt-6 text-base font-semibold tracking-tight text-gray-100 my-1">
            Loading LegalDesk
          </h2>
          <p className="text-xs text-[hsl(217,25%,65%)] m-0 font-normal">
            Syncing records with AWS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/admin/*" element={authUser && portalType === "admin" ? <AdminLayout /> : <Navigate to="/login" />} />
      <Route path="/advocate/*" element={authUser && portalType === "advocate" ? <AdvocateLayout /> : <Navigate to="/login" />} />
      <Route path="/employee/*" element={authUser && portalType === "user" ? <UserLayout /> : <Navigate to="/login" />} />
      <Route path="*" element={
        <Navigate to={
          authUser ? (
            portalType === "admin" ? "/admin/dashboard" : portalType === "advocate" ? "/advocate/dashboard" : "/employee/home"
          ) : "/login"
        } />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <GrievanceProvider>
      <AuthProvider>
        <BrowserRouter>
          <RootRouter />
        </BrowserRouter>
      </AuthProvider>
    </GrievanceProvider>
  );
}
