// PowerUserEmailer.jsx
// Segmented email composer with live HTML preview.
// Drop into: src/pages/Admin/PowerUserEmailer.jsx

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, Users, CheckCircle2, XCircle,
  Loader2, RefreshCw, Eye, ChevronDown, ChevronUp,
  AlertCircle, UserCheck, X, Sparkles, Flame, Clock, Map,
  Monitor,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("upsc_token");
  const res = await fetch(`${BASE}/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Segment config ───────────────────────────────────────────────────────────
const SEGMENTS = {
  new: {
    label: "Just signed up",
    icon: Sparkles,
    accent: "#3B6D11",
    accentBg: "#EAF3DE",
    eyebrow: "Welcome aboard",
    desc: "Users who signed up in the last 24 hours. Highest-leverage moment — get them to their first win before they churn.",
    subject: "Welcome to UPSC Mentor — here's where to start 🎯",
    signOff: "Good luck,",
    greetingLine: "Welcome to UPSC Mentor! I'm Anand, one of the builders behind the platform.",
    intro: "You've joined at a great time. Here's the simplest path to get value from day one:",
    steps: [
      { title: "Set your exam date", body: "Go to your Profile page and lock in your Prelims target. The countdown starts ticking — which is surprisingly motivating." },
      { title: "Mark your syllabus", body: "Open the Syllabus Tracker and set 3–5 modules to \"In Progress\". It takes 2 minutes and gives you a clear view of what you're walking into." },
      { title: "Start the timer", body: "Hit the study timer on your dashboard before your next session. It syncs across devices — so your phone and laptop both track the same day." },
    ],
    closing: "That's it. No pressure to do everything at once.",
    closing2: "If you have questions, just reply to this email — I read every one.",
  },
  power: {
    label: "Power users",
    icon: Flame,
    accent: "#854F0B",
    accentBg: "#FAEEDA",
    eyebrow: "A note from the founder",
    desc: "Users who studied 3+ days in the last 7 days. Your most engaged cohort — worth nurturing and getting feedback from.",
    subject: "You're one of our most dedicated users — a quick note",
    signOff: "Keep going,",
    greetingLine: "I wanted to reach out personally.",
    intro: "You're one of the most consistent users on UPSC Mentor right now — studying multiple days in a row puts you in the top tier of our early community.",
    steps: [
      { title: "AI Diagnostic Reports", body: "After your next mock test, the AI generates a 7-day recovery study plan targeting your exact weak topics. If you haven't tried it yet, it's worth one test attempt." },
      { title: "The AI Mentor Workspace", body: "Unlike the chat bubble, the full workspace lets you run separate threads — one for GS4 case studies, one for Economy, for example. Your mentor remembers context across sessions." },
      { title: "Handwritten answer evaluation", body: "If you're doing Mains practice, you can photograph a handwritten answer and the AI evaluates it the same way — useful for replicating actual exam conditions." },
    ],
    closing: "I'd genuinely love to hear what's working for you and what's not. Any feedback shapes what we build next.",
    closing2: "",
  },
  idle: {
    label: "Gone quiet",
    icon: Clock,
    accent: "#993C1D",
    accentBg: "#FAECE7",
    eyebrow: "Quick check-in",
    desc: "Signed up but haven't engaged meaningfully. Time to re-engage with a low-friction entry point.",
    subject: "Still preparing? UPSC Mentor has a shortcut for you",
    signOff: "Still rooting for you,",
    greetingLine: "You signed up for UPSC Mentor a little while back — I just wanted to check in.",
    intro: "If the platform felt overwhelming at first, that's fair. Here's the simplest possible entry point: one subject, one timer, 30 minutes.",
    steps: [
      { title: "Open the dashboard", body: "Pick one subject from the study timer (Polity is a popular start) and run a 30-minute focused session. That single action unlocks the analytics that make everything else useful." },
      { title: "Your syllabus is ready", body: "All 48 modules are already loaded, mapped to the official UPSC notification. You don't have to build anything." },
    ],
    closing: "If you hit a wall or the platform isn't clicking, just reply here and tell me what you're trying to do. I'll help you figure out the fastest path.",
    closing2: "",
  },
  feature: {
    label: "Feature explorers",
    icon: Map,
    accent: "#3C3489",
    accentBg: "#EEEDFE",
    eyebrow: "For our power explorers",
    desc: "Users who've used 3+ features. Rarest segment, highest LTV signal. Treat them like beta testers.",
    subject: "You've found the depth — here's what's coming next",
    signOff: "Thank you for exploring,",
    greetingLine: "You're one of a small group of users who's actually explored multiple areas of UPSC Mentor — the syllabus tracker, mock tests, AI mentor, and more.",
    intro: "That kind of usage tells us you're using the platform as it was designed: as an integrated preparation workspace, not just a single tool. A few things you might not have discovered yet:",
    steps: [
      { title: "Spaced repetition queue", body: "When you mark a question as difficult in Prelims Grind, it gets added to a revision queue with SM-2 style scheduling. Over time this becomes a highly personalised review bank." },
      { title: "Cross-module memory", body: "Your AI Mentor carries memory of your weak topics across sessions. If mock tests surface gaps, the Mentor already knows about them in your next chat." },
      { title: "Re-analysis of past tests", body: "Any test attempt can be re-analysed on demand — useful if you've done focused study on a weak topic and want to check if your diagnostic would look different now." },
    ],
    closing: "I'd really value 5 minutes of your feedback — what's working, what's confusing, what you wish existed. You're exactly the user I want to talk to. Happy to jump on a quick call if that's easier.",
    closing2: "",
  },
};

// ─── Build preview HTML (mirrors emailController.js) ─────────────────────────
function buildPreviewHTML(seg, previewName = "User") {
  const c = SEGMENTS[seg];
  const name = (previewName.split(" ")[0] || "there");
  const firstName = name.charAt(0).toUpperCase() + name.slice(1);

  const stepsHTML = c.steps
    .map(
      (s) => `
      <p style="margin:0 0 4px;font-size:14px;color:#0f2044;font-weight:600;">${s.title}</p>
      <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.7;">${s.body}</p>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#ffffff;border-radius:16px;border:1px solid #dde3ed;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#f0d98a 0%,#fdf6e3 100%);padding:24px 28px;text-align:center;border-bottom:1px solid #dde3ed;">
            <img src="/logo-192.png" alt="UPSC Mentor" width="56" height="56"
              style="border-radius:12px;margin:0 auto 12px;display:block;" />
            <p style="margin:0;font-size:18px;font-weight:700;color:#0f2044;">UPSC Mentor</p>
            <p style="margin:4px 0 0;font-size:10px;color:#9a8546;letter-spacing:1px;text-transform:uppercase;">Rebuilding UPSC prep · One IITian at a time</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 20px;">
            <p style="margin:0 0 14px;font-size:10px;font-weight:700;color:${c.accent};text-transform:uppercase;letter-spacing:1px;">${c.eyebrow}</p>
            <p style="margin:0 0 14px;font-size:15px;color:#0f2044;line-height:1.7;">Hi <strong style="color:${c.accent};">${firstName}</strong>,</p>
            <p style="margin:0 0 12px;font-size:13px;color:#374151;line-height:1.8;">${c.greetingLine}</p>
            <p style="margin:0 0 18px;font-size:13px;color:#374151;line-height:1.8;">${c.intro}</p>
            <div style="background:${c.accentBg};border:1px solid ${c.accent}22;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
              ${stepsHTML}
            </div>
            <p style="margin:0 0 10px;font-size:13px;color:#374151;line-height:1.8;">${c.closing}</p>
            ${c.closing2 ? `<p style="margin:0 0 20px;font-size:13px;color:#374151;line-height:1.8;">${c.closing2}</p>` : ""}
            <div style="text-align:center;margin:12px 0 6px;">
              <a href="https://www.upscbyiitians.in" style="display:inline-block;background:linear-gradient(135deg,#c9a227,#e8c96d);color:#0f2044;font-size:12px;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;">
                Visit UPSC Mentor →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 24px;border-top:1px solid #dde3ed;">
            <p style="margin:0 0 5px;font-size:12px;color:#374151;">${c.signOff}</p>
            <p style="margin:0 0 2px;font-size:13px;color:#0f2044;font-weight:700;">Anand Vivek</p>
            <p style="margin:0 0 2px;font-size:11px;color:#6b7280;">Roll No.: 240003006 · Third Year | Mechanical Engineering</p>
            <p style="margin:0 0 2px;font-size:11px;color:#6b7280;">Indian Institute of Technology Indore · 📞 9675109428</p>
            <a href="https://www.upscbyiitians.in" style="font-size:11px;color:#c9a227;text-decoration:none;">🔗 upscbyiitians.in</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fb;padding:10px 28px;text-align:center;border-top:1px solid #dde3ed;">
            <p style="margin:0;font-size:9px;color:#9aa3b2;">You're receiving this because you're a UPSC Mentor user. This is a personal note from the founder — feel free to reply directly.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "sent")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={9} /> sent
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={9} /> failed
      </span>
    );
  return null;
}

// ─── HTML Preview Modal ───────────────────────────────────────────────────────
function HtmlPreviewModal({ seg, onClose }) {
  const [previewName, setPreviewName] = useState("Priya");
  const c = SEGMENTS[seg];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6">
      <div
        className="bg-[#18181f] border border-[#2a2a3a] rounded-2xl w-full shadow-2xl flex flex-col"
        style={{ maxWidth: 680, maxHeight: "92vh" }}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2a3a] shrink-0">
          <div className="flex items-center gap-2.5">
            <Monitor size={14} style={{ color: c.accent }} />
            <span className="text-sm font-semibold text-[#e0e0f0]">HTML Email Preview</span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              style={{ background: c.accentBg + "22", color: c.accent, borderColor: c.accent + "44" }}
            >
              {c.label}
            </span>
          </div>
          <button onClick={onClose} className="text-[#7a7a9a] hover:text-[#e0e0f0] transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#2a2a3a] bg-[#0f0f18] text-xs font-mono shrink-0 flex-wrap gap-y-1.5">
          <span className="text-[#7a7a9a]">From:</span>
          <span style={{ color: c.accent }}>"Anand Vivek | UPSC Mentor" &lt;me240003006@iiti.ac.in&gt;</span>
          <span className="text-[#7a7a9a] ml-2">Subject:</span>
          <span className="text-[#e0e0f0] truncate max-w-[260px]">{c.subject}</span>
        </div>

        <div className="flex items-center gap-2 px-5 py-2 border-b border-[#2a2a3a] bg-[#0f0f18] shrink-0">
          <span className="text-[11px] text-[#7a7a9a] font-mono">Preview name:</span>
          <input
            type="text"
            value={previewName}
            onChange={(e) => setPreviewName(e.target.value)}
            className="bg-[#18181f] border border-[#2a2a3a] rounded-lg px-2.5 py-1 text-[12px] text-[#e0e0f0] font-mono w-36 focus:outline-none focus:border-[#c9a84c]/50"
            placeholder="First name…"
          />
          <span className="text-[10px] text-[#555570]">personalised per recipient</span>
        </div>

        <div className="flex-1 overflow-hidden rounded-b-2xl bg-[#f8f9fb]">
          <iframe
            title="Email HTML Preview"
            srcDoc={buildPreviewHTML(seg, previewName)}
            className="w-full h-full border-0"
            style={{ minHeight: 480 }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mini inline preview ──────────────────────────────────────────────────────
function MiniPreview({ seg, accent, accentBg }) {
  return (
    <div className="relative overflow-hidden" style={{ height: 320, background: accentBg + "22" }}>
      <div
        style={{
          position: "absolute", top: 0, left: 0,
          width: 600, height: 600,
          transform: "scale(0.5)", transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        <iframe
          title="Mini Email Preview"
          srcDoc={buildPreviewHTML(seg, "Priya")}
          className="border-0"
          style={{ width: 600, height: 600 }}
          sandbox="allow-same-origin"
        />
      </div>
      <div
        className="absolute inset-0 flex items-end justify-center pb-3 cursor-pointer"
        style={{ background: `linear-gradient(to bottom, transparent 50%, ${accentBg}cc 100%)` }}
      >
        <span className="text-[10px] font-mono" style={{ color: accent }}>
          ↑ Click "Full preview" to interact
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PowerUserEmailer() {
  const [activeSeg, setActiveSeg]           = useState("new");
  const [allUsers, setAllUsers]             = useState([]);   // full user list, loaded once
  const [selected, setSelected]             = useState(new Set());
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [sending, setSending]               = useState(false);
  const [results, setResults]               = useState(null);
  const [expanded, setExpanded]             = useState(true);
  const [previewOpen, setPreviewOpen]       = useState(false);
  const [searchQ, setSearchQ]               = useState("");
  const [error, setError]                   = useState("");

  const filteredUsers = searchQ.trim()
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQ.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQ.toLowerCase())
      )
    : allUsers;

  // ── Load ALL users once ───────────────────────────────────────────────────
  // Segment selection controls the email template, not who is visible.
  // Every user can receive any segment email — pick recipients manually.
  const loadAllUsers = useCallback(async () => {
    setLoadingTargets(true);
    setError("");
    try {
      const data = await adminFetch("/users?page=1&limit=500&sort=name&dir=asc");
      const users = (data.users || []).map((u) => ({ id: u.id, name: u.name, email: u.email }));
      setAllUsers(users);
      // Auto-select everyone on first load
      setSelected(new Set(users.map((u) => u.id)));
      setResults(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTargets(false);
    }
  }, []);

  useEffect(() => { loadAllUsers(); }, [loadAllUsers]);

  // ── Segment switch — keep user list, just reset search + results ──────────
  function switchSeg(seg) {
    setActiveSeg(seg);
    setSearchQ("");
    setResults(null);
    setError("");
    // Re-select everyone when switching template
    setSelected(new Set(allUsers.map((u) => u.id)));
  }

  function toggleUser(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (filteredUsers.length > 0 && filteredUsers.every((u) => selected.has(u.id))) {
      const next = new Set(selected);
      filteredUsers.forEach((u) => next.delete(u.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filteredUsers.forEach((u) => next.add(u.id));
      setSelected(next);
    }
  }

  async function handleSend() {
    if (selected.size === 0) return;
    const c = SEGMENTS[activeSeg];
    const confirmed = window.confirm(
      `Send "${c.label}" email to ${selected.size} user${selected.size > 1 ? "s" : ""}?\n\nSegment: ${c.label}\nSubject: ${c.subject}\n\nSends from me240003006@iiti.ac.in via Gmail App Password.`
    );
    if (!confirmed) return;

    setSending(true);
    setError("");
    try {
      const data = await adminFetch("/email/power-users", {
        method: "POST",
        body: JSON.stringify({ user_ids: [...selected], segment: activeSeg }),
      });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const segKeys = Object.keys(SEGMENTS);
  const c = SEGMENTS[activeSeg];

  return (
    <>
      {previewOpen && (
        <HtmlPreviewModal seg={activeSeg} onClose={() => setPreviewOpen(false)} />
      )}

      <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">

        {/* ── Card header ── */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#c9a84c18", border: "1px solid #c9a84c25" }}
            >
              <Mail size={14} style={{ color: "#c9a84c" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Email Composer</p>
              <p className="text-[11px] text-text-muted font-mono">
                Segmented outreach · {segKeys.length} audience segments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allUsers.length > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
                {allUsers.length} users
              </span>
            )}
            {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
          </div>
        </div>

        {/* ── Expanded body ── */}
        {expanded && (
          <div className="border-t border-bg-border">

            {/* Segment tabs */}
            <div className="flex gap-1.5 px-4 sm:px-6 pt-4 pb-3 flex-wrap">
              {segKeys.map((seg) => {
                const sc = SEGMENTS[seg];
                const Icon = sc.icon;
                const isActive = activeSeg === seg;
                return (
                  <button
                    key={seg}
                    onClick={() => switchSeg(seg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all"
                    style={
                      isActive
                        ? { background: sc.accentBg, color: sc.accent, borderColor: sc.accent }
                        : { background: "transparent", color: "var(--color-text-muted, #888)", borderColor: "var(--color-border, #333)" }
                    }
                  >
                    <Icon size={11} />
                    {sc.label}
                  </button>
                );
              })}
            </div>

            {/* Segment description */}
            <div
              className="mx-4 sm:mx-6 mb-3 px-3 py-2 rounded-lg text-[11px] border-l-2"
              style={{ background: c.accentBg + "55", borderColor: c.accent, color: c.accent }}
            >
              {c.desc}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 sm:px-6 pb-5">

              {/* ── Left: user list ── */}
              <div className="space-y-3">
                <div className="bg-bg-muted border border-bg-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-bg-border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
                      <span className="text-xs font-semibold text-text-primary">Recipients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-muted font-mono">
                        {selected.size} / {allUsers.length} selected
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); loadAllUsers(); }}
                        disabled={loadingTargets}
                        className="text-text-muted hover:text-text-primary transition-colors p-0.5 rounded"
                        title="Refresh"
                      >
                        <RefreshCw size={11} className={loadingTargets ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>

                  <div className="px-3 pt-2.5 pb-2">
                    {/* Search */}
                    <div className="relative mb-2">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-full bg-bg-surface border border-bg-border rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#c9a84c]/50 font-mono"
                      />
                    </div>

                    {/* Select all */}
                    <label className="flex items-center gap-2 text-[11px] text-text-muted cursor-pointer mb-2 hover:text-text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && filteredUsers.every((u) => selected.has(u.id))}
                        onChange={toggleAll}
                        className="rounded"
                        style={{ accentColor: c.accent }}
                      />
                      {filteredUsers.length > 0 && filteredUsers.every((u) => selected.has(u.id))
                        ? `Deselect all (${filteredUsers.length})`
                        : `Select all (${filteredUsers.length})`}
                    </label>

                    {/* Error */}
                    {error && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-[11px] text-red-400 mb-2">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* User list */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                      {loadingTargets ? (
                        <div className="flex items-center gap-2 text-text-muted text-xs py-6 justify-center">
                          <Loader2 size={13} className="animate-spin" />
                          <span>Loading users…</span>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center gap-1.5 text-text-muted text-xs py-6 text-center">
                          <Users size={18} className="opacity-40" />
                          <span>{searchQ ? "No users match your search" : "No users found"}</span>
                        </div>
                      ) : (
                        filteredUsers.map((user) => {
                          const isSelected = selected.has(user.id);
                          const result = results?.results?.find((r) => r.id === user.id);
                          return (
                            <label
                              key={user.id}
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all"
                              style={
                                isSelected
                                  ? { borderColor: c.accent + "55", background: c.accentBg + "44" }
                                  : { borderColor: "var(--color-border, #333)", background: "transparent", opacity: 0.6 }
                              }
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleUser(user.id)}
                                className="rounded shrink-0"
                                style={{ accentColor: c.accent }}
                              />
                              <UserCheck size={12} style={{ color: isSelected ? c.accent : undefined }} className={isSelected ? "" : "text-text-muted"} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-text-primary truncate">{user.name}</p>
                                <p className="text-[10px] text-text-muted font-mono truncate">{user.email}</p>
                              </div>
                              {result && <StatusBadge status={result.status} />}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Email settings */}
                <div className="bg-bg-muted border border-bg-border rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-bg-border">
                    <span className="text-xs font-semibold text-text-primary">Email settings</span>
                  </div>
                  <div className="px-3 py-3 space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-text-muted mb-1 font-mono uppercase tracking-wide">From</label>
                      <input
                        readOnly
                        value="Anand — UPSC Mentor"
                        className="w-full bg-bg-surface border border-bg-border rounded-lg px-2.5 py-1.5 text-[12px] text-text-muted font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-muted mb-1 font-mono uppercase tracking-wide">Subject</label>
                      <input
                        readOnly
                        value={c.subject}
                        className="w-full bg-bg-surface border border-bg-border rounded-lg px-2.5 py-1.5 text-[12px] text-text-primary font-mono focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-text-muted font-mono">
                      Subject & body are segment-specific and defined in{" "}
                      <code className="bg-bg-surface px-1 rounded">emailController.js</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Right: preview + send ── */}
              <div className="space-y-3">
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: c.accent + "33" }}>
                  <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: c.accent + "22", background: c.accentBg + "44" }}>
                    <div className="flex items-center gap-2">
                      <Eye size={12} style={{ color: c.accent }} />
                      <span className="text-[11px] font-semibold" style={{ color: c.accent }}>Live preview</span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: c.accent + "22", color: c.accent }}
                      >
                        {c.label}
                      </span>
                    </div>
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
                      style={{ borderColor: c.accent + "55", color: c.accent, background: c.accentBg + "66" }}
                    >
                      <Monitor size={10} /> Full preview
                    </button>
                  </div>
                  <MiniPreview seg={activeSeg} accent={c.accent} accentBg={c.accentBg} />
                </div>

                {/* Result summary */}
                {results && (
                  <div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 border text-xs ${
                      results.failed === 0
                        ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/8 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {results.failed === 0 ? <CheckCircle2 size={13} className="shrink-0" /> : <AlertCircle size={13} className="shrink-0" />}
                    <span>
                      {results.sent} sent successfully
                      {results.failed > 0 ? `, ${results.failed} failed` : " — all done!"}
                    </span>
                  </div>
                )}

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={sending || selected.size === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={
                    selected.size === 0
                      ? { background: "var(--color-bg-muted)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", cursor: "not-allowed" }
                      : sending
                      ? { background: c.accentBg, color: c.accent, border: `1px solid ${c.accent}55`, cursor: "not-allowed" }
                      : { background: c.accent, color: "#fff", boxShadow: `0 4px 14px ${c.accent}44` }
                  }
                >
                  {sending ? (
                    <><Loader2 size={14} className="animate-spin" /> Sending emails…</>
                  ) : (
                    <><Send size={14} /> Send to {selected.size} user{selected.size !== 1 ? "s" : ""}</>
                  )}
                </button>

                <p className="text-[10px] text-text-muted text-center font-mono">
                  Requires <code className="bg-bg-muted px-1 rounded">GMAIL_APP_PASSWORD</code> in server .env
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
