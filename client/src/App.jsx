import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import SyllabusTracker from "./pages/User/SyllabusTracker.jsx";
import MainsGrind from "./pages/PYQs/MainsGrind.jsx";
import PrelimsGrind from "./pages/PYQs/PrelimsGrind";
import PyqVault from "./pages/PYQs/PyqVault.jsx";
import Footer from "./components/layout/Footer";
import { useUserData } from "./hooks/useUserData";
import { AlertCircle } from "lucide-react";
import HeroBanner from "./pages/Hero";
import LandingHero from "./pages/LandingHero";
import AuthPage from "./pages/User/AuthPage.jsx";
import { useAuth } from "./hooks/useAuth";
import Adminpannel from "./pages/Admin/Adminpannel.jsx";
import ResourceLibrary from "./pages/User/ResourceLibrary.jsx";
import ProfilePage from "./pages/User/ProfilePage.jsx";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import timerStore from "./hooks/timerStore";
import BottomNav from "./components/layout/BottomNav.jsx";
import AIMentorWorkspace from "./pages/AI/AIMentorWorkspace.jsx";
import AIMentorChat from "./pages/AI/AIMentorChat";
import MentorNotes from "./pages/User/MentorNotes.jsx";
import TestSeriesPage from "./pages/User/Testseriespage";
import FeedbackModal from "./components/FeedbackModal";
import SetupWizard, { hasSeenSetupWizard } from "./pages/User/SetupWizard.jsx";

// ─── Splash Screen ────────────────────────────────────────────────────────────
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
      <p className="text-base font-mono text-orange-400">{error}</p>
    </div>
  );
}

export default function App() {
  const { user, token, loading: authLoading, login, logout } = useAuth();

  const [activeView, setActiveView] = useState("dashboard");
  const [workspaceQuestion, setWorkspaceQuestion] = useState(null);
  const [previousView, setPreviousView] = useState("dashboard");
  const [aiMentorPrefill, setAiMentorPrefill] = useState("");
  const [fabChatOpen, setFabChatOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("upsc-theme") || "light";
  });

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (view !== "mains") setWorkspaceQuestion(null);
  };

  const handleNavigateProfile = () => handleViewChange("profile");
  const handleProfileUpdate = () => refetch?.();

  const handleQuoteClick = (quote) => {
    setAiMentorPrefill(
      `Tell me more about this quote by ${quote.src}: "${quote.text}" - its historical context, deeper philosophical meaning, and how I can use it effectively in a UPSC essay or GS answer.`
    );
    handleViewChange("ai-mentor");
  };

  // ─── Derived booleans ─────────────────────────────────────────────────────
  const isLoggedIn = !!user && !!token;
  const userId = user?.id || user?._id || null;

  // One-time post-signup setup wizard. `setupJustCompleted` is a plain React
  // state flag (not derived from localStorage on every render) so that once
  // the wizard finishes, this component re-renders and stops showing it
  // immediately - localStorage alone wouldn't trigger that re-render.
  const [setupJustCompleted, setSetupJustCompleted] = useState(false);
  const isPreExistingUser =
    !!(userData?.profile?.examDate || userData?.daily_logs?.length || (userData?.answers?.length ?? 0) > 0);
  const needsSetup =
    isLoggedIn &&
    !!userId &&
    !setupJustCompleted &&
    !isPreExistingUser &&
    !hasSeenSetupWizard(userId);

  // Show LandingHero when: not logged in AND on the dashboard view.
  // All other pages keep their own internal AuthGate gating.
  const showLandingHero = !isLoggedIn && activeView === "dashboard";

  if (authLoading) return <SplashScreen />;
  if (loading && !userData && (user || token)) return <LoadingScreen />;

  if (needsSetup) {
    return (
      <SetupWizard
        user={user}
        token={token}
        userData={userData}
        onUpdateProfile={updateProfile}
        onBulkUpdateProgress={bulkUpdateProgress}
        onRefetch={refetch}
        onComplete={() => setSetupJustCompleted(true)}
      />
    );
  }

  const userName = userData?.profile?.name || user?.name || "";
  const isWorkspace = activeView === "ai-mentor" || activeView === "notes";

  // ─── Full-page landing (unauthenticated dashboard) ────────────────────────
  // Bypasses sidebar/bottom-nav shell so the landing owns the whole screen.
  if (showLandingHero) {
    return (
      <>
        <LandingHero
          theme={theme}
          onToggleTheme={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
          onSignUp={() => setActiveView("auth")}
          onSignIn={() => setActiveView("auth")}
        />
        {/* Keep the mobile bottom nav so returning users can navigate freely */}
        <BottomNav
          activeView={activeView}
          onViewChange={handleViewChange}
          user={user}
          userData={userData}
          isLoggedIn={isLoggedIn}
          theme={theme}
          onToggleTheme={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
          onLogout={logout}
          onLoginClick={() => setActiveView("auth")}
          onNavigateProfile={handleNavigateProfile}
          userName={userName}
        />
      </>
    );
  }

  // ─── Main app shell (authenticated, or non-dashboard views) ───────────────
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
          onLogout={logout}
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setActiveView("auth")}
          userName={userName}
          onNavigateProfile={handleNavigateProfile}
        />
      </div>

      {/* ── Main Content ── */}
      <main className="lg:ml-[var(--sidebar-width,14rem)] min-h-[100dvh]">
        <div className="flex min-h-[100dvh] flex-col">
          <div className="flex-1 pb-bottom-nav lg:pb-0">
            {!isWorkspace && (
              <HeroBanner
                examDate={userData?.profile?.examDate || null}
                customQuote={userData?.profile?.quote || null}
                onQuoteClick={handleQuoteClick}
              />
            )}

            <ErrorBanner error={error} />

            <div className="page-transition">
              {activeView === "dashboard" && (
                <Dashboard
                  userData={userData}
                  todayHours={todayHours}
                  weekAvgHours={weekAvgHours}
                  overallProgress={overallProgress}
                  onLogHours={logHours}
                  onBulkUpdateSyllabus={bulkUpdateProgress}
                  user={user}
                  isLoggedIn={isLoggedIn}
                  onNavigateAuth={() => setActiveView("auth")}
                  onNavigateProfile={handleNavigateProfile}
                  onNavigate={handleViewChange}
                />
              )}
              {activeView === "syllabus" && (
                <SyllabusTracker
                  userData={userData}
                  onUpdateProgress={updateProgress}
                  onBulkUpdateProgress={bulkUpdateProgress}
                  isLoggedIn={isLoggedIn}
                  error={error}
                  onNavigateProfile={handleNavigateProfile}
                />
              )}
              {activeView === "mains" && (
                <MainsGrind
                  workspaceQuestion={workspaceQuestion}
                  user={user}
                  isLoggedIn={isLoggedIn}
                />
              )}
              {activeView === "pre" && <PrelimsGrind isLoggedIn={isLoggedIn} />}
              {activeView === "pyq-vault" && (
                <PyqVault isLoggedIn={isLoggedIn} />
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
              {activeView === "test-series" && (
                <TestSeriesPage
                  user={user}
                  onSyllabusUpdate={updateProgress}
                  onBulkSyllabusUpdate={bulkUpdateProgress}
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
              {activeView === "ai-mentor" && (
                <AIMentorWorkspace
                  isLoggedIn={isLoggedIn}
                  prefill={aiMentorPrefill}
                  onClearPrefill={() => setAiMentorPrefill("")}
                />
              )}
              {activeView === "notes" && (
                <MentorNotes
                  isLoggedIn={isLoggedIn}
                  contextHint="Notes section"
                />
              )}
            </div>

            <PWAInstallPrompt />
          </div>

          {!isWorkspace && <Footer />}
        </div>
      </main>

      {!isWorkspace && (
        <AIMentorChat
          isLoggedIn={isLoggedIn}
          compact={true}
          open={fabChatOpen}
          onOpen={() => setFabChatOpen(true)}
          onClose={() => setFabChatOpen(false)}
        />
      )}

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        user={user}
        userData={userData}
        isLoggedIn={isLoggedIn}
        theme={theme}
        onToggleTheme={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
        onLogout={logout}
        onLoginClick={() => setActiveView("auth")}
        onNavigateProfile={handleNavigateProfile}
        userName={userName}
      />
      <FeedbackModal isLoggedIn={isLoggedIn} user={user} />
    </div>
  );
}