import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SyllabusTracker from "./pages/SyllabusTracker";
import MainsGrind from "./pages/MainsGrind";
import PrelimsGrind from "./pages/PrelimsGrind";
import Footer from "./components/Footer";
import { useUserData } from "./hooks/useUserData";
import { Loader2, AlertCircle, Menu, X } from "lucide-react";
import HeroBanner from "./pages/Hero";
import AIWorkplace from "./pages/AIworkplace.jsx";
import Topicwise from "./pages/Topicwise";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import Adminpannel from "./pages/AdminPanel";
// ─── Splash screen — shown while useAuth reads localStorage ──────────────────
function SplashScreen() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
          <Loader2 size={18} className="text-accent-gold animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-display font-semibold text-text-primary">UPSC Mentor</p>
          <p className="text-xs text-text-muted font-mono mt-1">Starting up…</p>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
          <Loader2 size={18} className="text-accent-gold animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-display font-semibold text-text-primary">Connecting to Mentor…</p>
          <p className="text-xs text-text-muted font-mono mt-1">Fetching your progress data</p>
        </div>
      </div>
    </div>
  );
}

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
  const [activeView, setActiveView] = useState("dashboard");
  const [workspaceQuestion, setWorkspaceQuestion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleViewChange = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
    if (view !== "mains") setWorkspaceQuestion(null);
  };

  const handlePracticeQuestion = (question) => {
    setWorkspaceQuestion(question);
    setActiveView("mains");
    setSidebarOpen(false);
  };

  // ── Splash while auth token is being read from localStorage ──────────────
  if (authLoading) return <SplashScreen />;

  // ── Data loading (only show spinner if we have a token and are still fetching) ─
  if (loading && !userData && (user || token)) return <LoadingScreen />;

  // ── 4. Full app ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-bg-surface/95 backdrop-blur border-b border-bg-border">
        {/* Logo instead of text */}
        <div
          className="w-8 h-8 rounded-lg bg-bg-muted flex items-center justify-center overflow-hidden shrink-0"
          style={{ border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <img
            src="/logo-upsc.png"
            alt="UPSC Mentor"
            className="w-full h-full object-cover object-center"
          />
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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen pt-14 lg:pt-0">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">

            <HeroBanner
              examDate={userData?.profile?.examDate || null}
              customQuote={userData?.profile?.quote || null}
              achievements={userData?.profile?.achievements || [
                { label: "JEE Advanced", done: true },
                { label: "NDA Written", done: true },
                { label: "IAS → In Progress", done: false },
              ]}
              onAchievementsChange={user ? (list) => updateProfile({ achievements: list }) : undefined}
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
              />
            )}

            {activeView === "syllabus" && (
              <SyllabusTracker
                userData={userData}
                onUpdateProgress={updateProgress}
              />
            )}

            {activeView === "mains" && (
              <MainsGrind workspaceQuestion={workspaceQuestion} />
            )}

            {activeView === "pre" && <PrelimsGrind />}
            {activeView === "ai-workplace" && (
              <AIWorkplace
                user={user}
                onNavigateAuth={() => setActiveView("auth")}
              />
            )}
            {activeView === "topic-wise" && <Topicwise />}
            {activeView === "admin" && <Adminpannel />}
            {activeView === "auth" && (
              <AuthPage onAuthSuccess={(u, t) => {
                login(u, t);
                setActiveView("dashboard");
              }} />
            )}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
