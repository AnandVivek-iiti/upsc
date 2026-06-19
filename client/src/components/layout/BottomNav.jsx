/**
 * BottomNav.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Native-app-style sticky bottom navigation for mobile.
 * Visible only on < lg breakpoint.
 * Primary 5 nav items + a "More" drawer for secondary items.
 */
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, PenTool, PenLine, Target,
  Library, MoreHorizontal, X, Moon, Sun, LogOut, LogIn,
  User, Flame, Shield, Sparkles,
} from "lucide-react";
import { AvatarCircle } from "../../pages/ProfilePage";

// ─── Primary nav (shown in the bar) ───────────────────────────────────────────
const PRIMARY_NAV = [
  { id: "dashboard",  label: "Home",     icon: LayoutDashboard },
  { id: "syllabus",   label: "Syllabus", icon: BookOpen },
  { id: "mains",      label: "Mains",    icon: PenTool },
  { id: "pre",        label: "Prelims",  icon: PenLine },
  { id: "topic-wise", label: "Topics",   icon: Target },
];

// ─── "More" drawer items ───────────────────────────────────────────────────────
const MORE_NAV = [
  { id: "resources",   label: "Resources",   icon: Library },
  { id: "ai-features", label: "AI Features", icon: Sparkles },
];

export default function BottomNav({
  activeView,
  onViewChange,
  user,
  userData,
  isLoggedIn,
  theme,
  onToggleTheme,
  onLogout,
  onLoginClick,
  onNavigateProfile,
  userName,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer on outside tap
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [moreOpen]);

  const streak = userData?.profile?.streak || 0;

  const handleNav = (id) => {
    onViewChange(id);
    setMoreOpen(false);
  };

  const isMoreActive = MORE_NAV.some((n) => n.id === activeView) ||
    ["admin", "profile"].includes(activeView);

  return (
    <>
      {/* ── More drawer backdrop ── */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* ── More drawer panel ── */}
      {moreOpen && (
        <div
          ref={drawerRef}
          className="lg:hidden fixed bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] left-3 right-3 z-50 glass-panel p-4 animate-slide-up"
          style={{ borderRadius: "20px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {userName ? (
                <>
                  <AvatarCircle name={userName} size="sm" as="div" onClick={() => { handleNav("profile"); }} className="cursor-pointer" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary leading-tight">{userName}</p>
                    {streak > 0 && (
                      <p className="text-xs font-mono text-text-muted flex items-center gap-1">
                        <Flame size={10} className="text-orange-400" /> {streak}d streak
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm font-semibold text-text-primary">More options</p>
              )}
            </div>
            <button
              onClick={() => setMoreOpen(false)}
              className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* More nav items */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {MORE_NAV.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 text-left"
                  style={
                    active
                      ? { background: "var(--accent-gold-dim)", color: "var(--accent-gold)", border: "1px solid rgba(245,158,11,0.25)" }
                      : { background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid transparent" }
                  }
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}

            {/* Profile button */}
            {isLoggedIn && (
              <button
                onClick={() => handleNav("profile")}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 text-left"
                style={
                  activeView === "profile"
                    ? { background: "var(--accent-gold-dim)", color: "var(--accent-gold)", border: "1px solid rgba(245,158,11,0.25)" }
                    : { background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid transparent" }
                }
              >
                <User size={18} />
                <span className="text-sm font-medium">Profile</span>
              </button>
            )}

            {/* Admin (if admin) */}
            {(() => {
              try {
                const u = JSON.parse(localStorage.getItem("upsc_user") || "{}");
                if (u?.role === "admin") {
                  return (
                    <button
                      onClick={() => handleNav("admin")}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 text-left"
                      style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid transparent" }}
                    >
                      <Shield size={18} />
                      <span className="text-sm font-medium">Admin</span>
                    </button>
                  );
                }
              } catch { }
              return null;
            })()}
          </div>

          {/* Divider */}
          <div className="border-t border-bg-border pt-3 flex items-center justify-between gap-3">
            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-muted text-text-secondary hover:text-text-primary transition-colors text-sm font-medium flex-1"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>

            {/* Auth */}
            {isLoggedIn ? (
              <button
                onClick={() => { onLogout?.(); setMoreOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex-1"
                style={{ background: "rgba(239,68,68,0.08)", color: "var(--accent-red)" }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            ) : (
              <button
                onClick={() => { onLoginClick?.(); setMoreOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors flex-1"
                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}
              >
                <LogIn size={15} />
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <nav className="bottom-nav lg:hidden" aria-label="Main navigation">
        <div className="flex items-stretch h-full px-1">
          {PRIMARY_NAV.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`bottom-nav-item ${active ? "active" : ""}`}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{
                    transform: active ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.15s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: active ? 600 : 500,
                    letterSpacing: "0.03em",
                    transition: "font-weight 0.15s ease",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`bottom-nav-item ${isMoreActive || moreOpen ? "active" : ""}`}
            aria-label="More options"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal
              size={22}
              strokeWidth={isMoreActive || moreOpen ? 2.5 : 1.8}
              style={{
                transform: moreOpen ? "rotate(90deg) scale(1.1)" : "scale(1)",
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
            <span style={{ fontSize: "9px", fontWeight: moreOpen ? 600 : 500, letterSpacing: "0.03em" }}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
