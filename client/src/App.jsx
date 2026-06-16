import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar.jsx";
import Dashboard from "./pages/Dashboard";
import SyllabusTracker from "./pages/SyllabusTracker";
import MainsGrind from "./pages/MainsGrind";
import PrelimsGrind from "./pages/PrelimsGrind";
import Footer from "./components/layout/Footer";
import { useUserData } from "./hooks/useUserData";
import { AlertCircle, Menu, X } from "lucide-react";
import HeroBanner from "./pages/Hero";
import AIFeatures from "./pages/AIFeatures.jsx";
import Topicwise from "./pages/Topicwise";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import Adminpannel from "./pages/Adminpannel.jsx";
import ResourceLibrary from "./pages/ResourceLibrary";
import ProfilePage, { AvatarCircle } from "./pages/ProfilePage";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import timerStore from "./hooks/timerStore";

// ─── Animated Splash — exact AuthPage header style, no static logo img ───────
function SplashScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Subtle grid overlay — same as AuthPage */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--accent-gold) 1px, transparent 1px), linear-gradient(90deg, var(--accent-gold) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow top-right */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[400px] opacity-[0.08] rounded-full blur-[100px]"
        style={{ background: "var(--accent-gold)", transform: "translate(30%, -30%)" }}
      />
      {/* Radial glow bottom-left */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[380px] h-[380px] opacity-[0.05] rounded-full blur-[90px]"
        style={{ background: "var(--accent-blue)", transform: "translate(-30%, 30%)" }}
      />

      {/* Card — identical structure to AuthPage glass-panel */}
      <div className="glass-panel w-full max-w-xs relative z-10 p-8 text-center splash-rise">

        {/* ── Logo block — exact copy of AuthPage brand header ── */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            {/* Soft pulse glow */}
            <div
              className="absolute inset-0 rounded-2xl animate-pulse"
              style={{
                background: "rgba(245,158,11,0.12)",
                filter: "blur(16px)",
                transform: "scale(1.25)",
              }}
            />
            {/* Spinning border ring */}
            <div className="absolute inset-0 rounded-2xl splash-ring" />
            {/* Logo container with float — image displayed as AuthPage does */}
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

        {/* Title — matches AuthPage h1 */}
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          UPSC Mentor
        </h1>

        {/* Subtitle — matches AuthPage mono tag */}
        <p className="text-[11px] font-mono text-text-muted tracking-widest uppercase mb-6">
          AI-Powered Preparation
        </p>

        {/* Animated loading bar */}
        <div className="h-0.5 w-full bg-bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full splash-bar" style={{ background: "var(--accent-gold)" }} />
        </div>

        <p className="text-[10px] font-mono text-text-muted mt-3 tracking-wider">
          Starting up…
        </p>
      </div>

      <style>{`
        /* ── Rise-in — AuthPage uses animate-rise from index.css; replicate here ── */
        @keyframes splash-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-rise { animation: splash-rise 0.45s cubic-bezier(.22,1,.36,1) both; }

        /* ── Spinning ring — AuthPage logo-ring from index.css ── */
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

        /* ── Float — AuthPage logo-float from index.css ── */
        @keyframes splash-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        .splash-float { animation: splash-float 3s ease-in-out infinite; }

        /* ── Indeterminate loading bar ── */
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

// Data loading reuses the same splash
const LoadingScreen = SplashScreen;

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mx-3 sm:mx-6 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
      <AlertCircle size={13} className="text-orange-400 shrink-0" />
      <p className="text-xs font-mono text-orange-400">{error}</p>
    </div>
  );
}

export default function App() {
  // ── Auth state ─────────────────────────────────────────────────────────────
  const { user, token, loading: authLoading, login, logout } = useAuth();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeView, setActiveView]               = useState("dashboard");
  const [workspaceQuestion, setWorkspaceQuestion] = useState(null);
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [previousView, setPreviousView]           = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("upsc-theme") || "light";
  });

  // ── Data hook — only runs when authenticated ───────────────────────────────
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

  // ── Sync authenticated user to timerStore so hours are user-specific ───────
  useEffect(() => {
    const userId = user?.id || user?._id || null;
    timerStore.setUser(userId);
  }, [user]);

  // ── Navigation helpers ─────────────────────────────────────────────────────
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
  const handleProfileUpdate   = () => refetch?.();

  // ── Splash while auth token is being read from localStorage ───────────────
  if (authLoading) return <SplashScreen />;

  // ── Data loading spinner ───────────────────────────────────────────────────
  if (loading && !userData && (user || token)) return <LoadingScreen />;

  const userName = userData?.profile?.name || user?.name || "";

  // ── Full app ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">

      {/* ── Mobile topbar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-bg-surface/95 backdrop-blur border-b border-bg-border">
        <div
          className="w-12 h-12 flex items-center justify-center overflow-hidden shrink-0"
          style={{
            borderRadius: "10px",
            border: "1px solid rgba(245,158,11,0.2)",
            background: "var(--bg-muted)",
          }}
        >
          <img src="/logo-upsc.png" alt="UPSC Mentor" className="w-full h-full object-cover object-center" />
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-bg-muted border border-bg-border text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`
        fixed top-0 left-0 h-screen w-72 z-30 transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          userData={userData}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
          isLoggedIn={!!user && !!token}
          onLoginClick={() => setActiveView("auth")}
        />
      </div>

      {/* ── Main content ── */}
      <main className="lg:ml-72 min-h-screen pt-14 lg:pt-0">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">

            <HeroBanner
              examDate={userData?.profile?.examDate || null}
              customQuote={userData?.profile?.quote || null}
                     />

            <ErrorBanner error={error} />

            {activeView === "dashboard" && (
              <Dashboard
                userData={userData}
                todayHours={todayHours}
                weekAvgHours={weekAvgHours}
                overallProgress={overallProgress}
                onLogHours={logHours}
                user={user}
                onNavigateAuth={() => setActiveView("auth")}
                onNavigateProfile={handleNavigateProfile}
              />
            )}
            {activeView === "syllabus"    && <SyllabusTracker userData={userData} onUpdateProgress={updateProgress} />}
            {activeView === "mains"       && <MainsGrind workspaceQuestion={workspaceQuestion} />}
            {activeView === "pre"         && <PrelimsGrind />}
            {activeView === "ai-features" && <AIFeatures user={user} onNavigateAuth={() => setActiveView("auth")} />}
            {activeView === "topic-wise"  && <Topicwise onSyllabusUpdate={updateProgress} onBulkSyllabusUpdate={bulkUpdateProgress} serverAttempts={userData?.question_attempts || []} />}
            {activeView === "admin"       && <Adminpannel />}
            {activeView === "resources"   && <ResourceLibrary user={user} updateProgress={updateProgress} bulkUpdateProgress={bulkUpdateProgress} serverAttempts={userData?.question_attempts || []} />}
            {activeView === "profile"     && (
              <ProfilePage
                user={user}
                token={token}
                userData={userData}
                onProfileUpdate={handleProfileUpdate}
                onBack={() => handleViewChange(previousView)}
              />
            )}
            {activeView === "auth" && (
              <AuthPage onAuthSuccess={(u, t) => { login(u, t); setActiveView("dashboard"); }} />
            )}

            <PWAInstallPrompt />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}