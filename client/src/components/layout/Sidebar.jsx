import {
  LayoutDashboard, BookOpen, PenLine, PenTool, Archive, Flame, Target,
  ChevronRight, Moon, Sun, LogOut, LogIn, Shield, Library, Sparkles, User,
} from "lucide-react";
import { AvatarCircle } from "../../pages/ProfilePage";

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",      icon: LayoutDashboard },
  { id: "syllabus",    label: "Syllabus Tracker", icon: BookOpen },
  { id: "mains",       label: "Mains Drill",    icon: PenTool },
  { id: "pre",         label: "Prelims Grind",  icon: PenLine },
  { id: "topic-wise",  label: "Topic-wise",     icon: Target },
  { id: "resources",   label: "Resources",      icon: Library },
];

export default function Sidebar({
  activeView, onViewChange, userData, theme, onToggleTheme,
  isOpen, onClose, onLogout, isLoggedIn, onLoginClick,
  userName, onNavigateProfile,
}) {
  const streak = userData?.profile?.streak || 0;
  const longestStreak = userData?.profile?.longest_streak || 0;
  const targetYear = userData?.profile?.target_year || 2027;
  const examDateStr = userData?.profile?.examDate || null;
  const examDateObj = examDateStr ? new Date(examDateStr) : null;

  const daysLeft = examDateObj
    ? Math.ceil((examDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const examLabel = examDateObj
    ? examDateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
    : "not set";

  const handleNav = (id) => {
    onViewChange(id);
    onClose?.();
  };

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("upsc_user") || "{}"); } catch { return {}; }
  })();
  const visibleItems = storedUser?.role === "admin"
    ? [...NAV_ITEMS, { id: "admin", label: "Admin Panel", icon: Shield }]
    : NAV_ITEMS;

  return (
    <aside className="h-full flex flex-col border-r border-bg-border bg-bg-surface" style={{ width: "var(--sidebar-width, 14rem)" }}>
      {/* ── Brand ── */}
      <div className="px-4 pt-5 pb-4 border-b border-bg-border flex items-center gap-3 shrink-0">
        <div
          className="w-9 h-9 rounded-xl bg-bg-muted flex items-center justify-center overflow-hidden shrink-0"
          style={{ border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <img src="/logo-upsc.png" alt="UPSC Mentor" className="w-full h-full object-cover object-center" />
        </div>
        <div>
          <p className="font-display font-semibold text-base text-text-primary leading-tight">UPSC Mentor</p>
          <p className="text-[11px] text-text-muted font-mono">CSE {targetYear}</p>
        </div>
      </div>

      {/* ── Profile (if logged in) ── */}
      {isLoggedIn && userName && (
        <button
          onClick={() => handleNav("profile")}
          className="mx-3 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-bg-border bg-bg-muted hover:border-accent-gold/30 hover:bg-bg-elevated transition-all duration-150 group"
        >
          <AvatarCircle name={userName} size="sm" as="div" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-text-primary truncate leading-tight">{userName}</p>
            <p className="text-[10px] font-mono text-text-muted group-hover:text-accent-gold transition-colors">View profile →</p>
          </div>
        </button>
      )}

      {/* ── Theme toggle ── */}
      <div className="px-3 pt-3 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center gap-2 rounded-xl border border-bg-border bg-bg-muted px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-150"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          <span className="font-body text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                active ? "border border-accent-gold/20" : "text-text-secondary hover:text-text-primary hover:bg-bg-muted border border-transparent"
              }`}
              style={active ? { background: "var(--accent-gold-dim)", color: "var(--accent-gold)" } : {}}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} style={active ? { color: "var(--accent-gold)" } : {}} />
              <span className="font-body text-sm font-medium">{label}</span>
              {active && (
                <ChevronRight size={11} className="ml-auto opacity-50" style={{ color: "var(--accent-gold)" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 space-y-2 shrink-0">
        {isLoggedIn ? (
          <button
            onClick={() => { onLogout?.(); onClose?.(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-mono border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-all duration-150"
            style={{ color: "var(--accent-red, #ef4444)" }}
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        ) : (
          <button
            onClick={() => { onLoginClick?.(); onClose?.(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-mono border border-accent-gold/20 hover:bg-accent-gold/10 transition-all duration-150"
            style={{ color: "var(--accent-gold)" }}
          >
            <LogIn size={12} />
            <span>Sign in / Register</span>
          </button>
        )}

        {/* Streak + countdown */}
        <div className="glass-panel p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame size={13} className="text-orange-400" />
              <span className="text-xs font-mono text-text-muted">Streak</span>
            </div>
            <span className="text-base font-display font-bold text-text-primary">{streak}d</span>
          </div>

          {daysLeft !== null && (
            <div className="border-t border-bg-border pt-2 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Exam in</span>
                <span
                  className="text-2xl font-display font-bold"
                  style={{
                    color: daysLeft <= 30
                      ? "var(--accent-red)"
                      : daysLeft <= 90
                      ? "var(--accent-gold)"
                      : "var(--accent-green)",
                  }}
                >
                  {daysLeft}d
                </span>
              </div>
              <p className="text-[10px] font-mono text-text-muted">{examLabel}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
