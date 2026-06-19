import { useEffect, useState, useRef } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import Dashboard from "./pages/Dashboard";
import SyllabusTracker from "./pages/SyllabusTracker";
import MainsGrind from "./pages/MainsGrind";
import PrelimsGrind from "./pages/PrelimsGrind";
import Footer from "./components/layout/Footer";
import { useUserData } from "./hooks/useUserData";
import { AlertCircle } from "lucide-react";
import HeroBanner from "./pages/Hero";
import Topicwise from "./pages/Topicwise";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import Adminpannel from "./pages/Adminpannel.jsx";
import ResourceLibrary from "./pages/ResourceLibrary";
import ProfilePage, { AvatarCircle } from "./pages/ProfilePage";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import timerStore from "./hooks/timerStore";
import BottomNav from "./components/layout/BottomNav.jsx";
import {
  LayoutDashboard, BookOpen, PenTool, PenLine, Target, Library,
} from "lucide-react";

// ─── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--accent-gold) 1px, transparent 1px), linear-gradient(90deg, var(--accent-gold) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[400px] opacity-[0.08] rounded-full blur-[100px]"
        style={{ background: "var(--accent-gold)", transform: "translate(30%, -30%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[380px] h-[380px] opacity-[0.05] rounded-full blur-[90px]"
        style={{ background: "var(--accent-blue)", transform: "translate(-30%, 30%)" }}
      />
      <div className="glass-panel w-full max-w-xs relative z-10 p-8 text-center splash-rise">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl animate-pulse"
              style={{
                background: "rgba(245,158,11,0.12)",
                filter: "blur(16px)",
                transform: "scale(1.25)",
              }}
            />
            <div className="absolute inset-0 rounded-2xl splash-ring" />
            <div
              className="relative w-20 h-20 rounded-2xl bg-bg-muted flex items-center justify-center overflow-hidden splash-float"
              style={{ border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <img
                src="/logo-upsc.png"
                alt="UPSC Mentor"
                className="w-full h-full object-cover object-center"
                style={{ borderRadius: "inherit" }}
              />
            </div>
          </div>
        </div>
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          UPSC Mentor
        </h1>
        <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-6">
          AI-Powered Preparation
        </p>
        <div className="h-0.5 w-full bg-bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full splash-bar" style={{ background: "var(--accent-gold)" }} />
        </div>
        <p className="text-[10px] font-mono text-text-muted mt-3 tracking-wider">
          Starting up…
        </p>
      </div>
      <style>{`
        @keyframes splash-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-rise { animation: splash-rise 0.45s cubic-bezier(.22,1,.36,1) both; }
        @keyframes splash-ring-spin {
          from { transform: rotate(0deg);   opacity: 0.6; }
          50%  {                             opacity: 1;   }
          to   { transform: rotate(360deg); opacity: 0.6; }
        }
        .splash-ring {
          border: 1.5px solid transparent;
          border-top-color:  rgba(245,158,11,0.6);
          border-right-color: rgba(245,158,11,0.2);
          animation: splash-ring-spin 1.6s linear infinite;
        }
        @keyframes splash-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        .splash-float { animation: splash-float 3s ease-in-out infinite; }
        @keyframes splash-bar {
          0%   { width: 0%;  margin-left: 0;    }
          50%  { width: 70%; margin-left: 15%;  }
          100% { width: 0%;  margin-left: 100%; }
        }
        .splash-bar { animation: splash-bar 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

const LoadingScreen = SplashScreen;

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mx-3 sm:mx-6 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
      <AlertCircle size={14} className="text-orange-400 shrink-0" />
      <p className="text-sm font-mono text-orange-400">{error}</p>
    </div>
  );
}

// ─── Bottom nav items ──────────────────────────────────────────────────────────
export const BOTTOM_NAV_ITEMS = [
  { id: "dashboard",  label: "Home",      icon: LayoutDashboard },
  { id: "syllabus",   label: "Syllabus",  icon: BookOpen },
  { id: "mains",      label: "Mains",     icon: PenTool },
  { id: "pre",        label: "Prelims",   icon: PenLine },
  { id: "topic-wise", label: "Topics",    icon: Target },
  { id: "resources",  label: "Resources", icon: Library },
];

export default function App() {
  const { user, token, loading: authLoading, login, logout } = useAuth();

  const [activeView, setActiveView] = useState("dashboard");
  const [workspaceQuestion, setWorkspaceQuestion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previousView, setPreviousView] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("upsc-theme") || "light";
  });

  const {
    data: userData,
    loading,
    error,
    refetch,
    updateProgress,
    bulkUpdateProgress,
    updateProfile,
    logHours,
    overallProgress,
    todayHours,
    weekAvgHours,
  } = useUserData({ enabled: !!token, token });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("upsc-theme", theme);
  }, [theme]);

  useEffect(() => {
    const userId = user?.id || user?._id || null;
    timerStore.setUser(userId);
  }, [user]);

  const handleViewChange = (view) => {
    setPreviousView(activeView);
    setActiveView(view);
    setSidebarOpen(false);
    if (view !== "mains") setWorkspaceQuestion(null);
  };

  const handlePracticeQuestion = (question) => {
    setWorkspaceQuestion(question);
    setActiveView("mains");
    setSidebarOpen(false);
  };

  const handleNavigateProfile = () => handleViewChange("profile");
  const handleProfileUpdate = () => refetch?.();

  // Non-bottom-nav views — user can only reach via sidebar on desktop or specific links
  const isSecondaryView = ["admin", "profile", "auth", "ai-features"].includes(activeView);

  if (authLoading) return <SplashScreen />;
  if (loading && !userData && (user || token)) return <LoadingScreen />;

  const userName = userData?.profile?.name || user?.name || "";

  return (
    <div className="min-h-[100dvh]">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen z-30" style={{ width: "var(--sidebar-width, 14rem)" }}>
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          userData={userData}
          theme={theme}
          onToggleTheme={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
          isOpen={false}
          onClose={() => {}}
          onLogout={logout}
          isLoggedIn={!!user && !!token}
          onLoginClick={() => setActiveView("auth")}
          userName={userName}
          onNavigateProfile={handleNavigateProfile}
        />
      </div>

      {/* ── Mobile Sidebar Overlay Drawer ── */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div
            className="fixed top-0 left-0 h-screen z-50 lg:hidden animate-slide-left"
            role="dialog"
            aria-modal="true"
          >
            <Sidebar
              activeView={activeView}
              onViewChange={handleViewChange}
              userData={userData}
              theme={theme}
              onToggleTheme={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onLogout={logout}
              isLoggedIn={!!user && !!token}
              onLoginClick={() => setActiveView("auth")}
              userName={userName}
              onNavigateProfile={handleNavigateProfile}
            />
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <main className="lg:ml-[var(--sidebar-width,14rem)] min-h-[100dvh]">
        <div className="flex min-h-[100dvh] flex-col">
          <div className="flex-1 pb-bottom-nav lg:pb-0">
            <HeroBanner
              examDate={userData?.profile?.examDate || null}
              customQuote={userData?.profile?.quote || null}
            />
            <ErrorBanner error={error} />

            <div className="page-transition">
              {activeView === "dashboard" && (
                <Dashboard
                  userData={userData}
                  todayHours={todayHours}
                  weekAvgHours={weekAvgHours}
                  overallProgress={overallProgress}
                  onLogHours={logHours}
                  user={user}
                  isLoggedIn={!!user && !!token}
                  onNavigateAuth={() => setActiveView("auth")}
                  onNavigateProfile={handleNavigateProfile}
                />
              )}
              {activeView === "syllabus" && (
                <SyllabusTracker
                  userData={userData}
                  onUpdateProgress={updateProgress}
                  isLoggedIn={!!user && !!token}
                />
              )}
              {activeView === "mains" && (
                <MainsGrind
                  workspaceQuestion={workspaceQuestion}
                  user={user}
                  isLoggedIn={!!user && !!token}
                />
              )}
              {activeView === "pre" && <PrelimsGrind isLoggedIn={!!user && !!token} />}

              {activeView === "topic-wise" && (
                <Topicwise
                  onSyllabusUpdate={updateProgress}
                  onBulkSyllabusUpdate={bulkUpdateProgress}
                  serverAttempts={userData?.question_attempts || []}
                  isLoggedIn={!!user && !!token}
                />
              )}
              {activeView === "admin" && <Adminpannel />}
              {activeView === "resources" && (
                <ResourceLibrary
                  user={user}
                  updateProgress={updateProgress}
                  bulkUpdateProgress={bulkUpdateProgress}
                  serverAttempts={userData?.question_attempts || []}
                />
              )}
              {activeView === "profile" && (
                <ProfilePage
                  user={user}
                  token={token}
                  userData={userData}
                  onProfileUpdate={handleProfileUpdate}
                  onBack={() => handleViewChange(previousView)}
                />
              )}
              {activeView === "auth" && (
                <AuthPage
                  onAuthSuccess={(u, t) => {
                    login(u, t);
                    setActiveView("dashboard");
                  }}
                />
              )}
            </div>

            <PWAInstallPrompt />
          </div>
          <Footer />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        user={user}
        userData={userData}
        isLoggedIn={!!user && !!token}
        theme={theme}
        onToggleTheme={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
        onLogout={logout}
        onLoginClick={() => setActiveView("auth")}
        onNavigateProfile={handleNavigateProfile}
        onOpenSidebar={() => setSidebarOpen(true)}
        userName={userName}
      />
    </div>
  );
}
