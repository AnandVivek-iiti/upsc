// PowerUserEmailer.jsx
// Drop this file into: src/pages/Admin/PowerUserEmailer.jsx
// Then import and render it inside Adminpannel.jsx (see integration note at bottom)

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, Users, CheckCircle2, XCircle,
  Loader2, RefreshCw, Eye, ChevronDown, ChevronUp,
  AlertCircle, UserCheck, X,
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

// ─── Small badge ──────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function PowerUserEmailer() {
  const [targets, setTargets]         = useState([]); // eligible users
  const [selected, setSelected]       = useState(new Set()); // checked user ids
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [sending, setSending]         = useState(false);
  const [results, setResults]         = useState(null); // { sent, failed, results[] }
  const [expanded, setExpanded]       = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError]             = useState("");

  // ── Load targets on mount ──────────────────────────────────────────────────
  const loadTargets = useCallback(async () => {
    setLoadingTargets(true);
    setError("");
    try {
      const data = await adminFetch("/email/power-users");
      setTargets(data.users || []);
      // Select all by default
      setSelected(new Set((data.users || []).map((u) => u.id)));
      setResults(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTargets(false);
    }
  }, []);

  useEffect(() => { loadTargets(); }, [loadTargets]);

  // ── Toggle individual user ─────────────────────────────────────────────────
  function toggleUser(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === targets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(targets.map((u) => u.id)));
    }
  }

  // ── Send emails ────────────────────────────────────────────────────────────
  async function handleSend() {
    if (selected.size === 0) return;
    const confirmed = window.confirm(
      `Send personalised outreach email to ${selected.size} power user${selected.size > 1 ? "s" : ""}?\n\nThis will send from me240003006@iiti.ac.in. Make sure GMAIL_APP_PASSWORD is set in .env.`
    );
    if (!confirmed) return;

    setSending(true);
    setError("");
    try {
      const data = await adminFetch("/email/power-users", {
        method: "POST",
        body: JSON.stringify({ user_ids: [...selected] }),
      });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // ── Email preview modal ────────────────────────────────────────────────────
  function EmailPreview() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="bg-[#18181f] border border-[#2a2a3a] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a] sticky top-0 bg-[#18181f] z-10">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-[#c9a84c]" />
              <span className="text-sm font-semibold text-[#e0e0f0]">Email Preview</span>
              <span className="text-[10px] font-mono text-[#7a7a9a] bg-[#0f0f18] px-2 py-0.5 rounded-full border border-[#2a2a3a]">
                personalised per user
              </span>
            </div>
            <button onClick={() => setPreviewOpen(false)} className="text-[#7a7a9a] hover:text-[#e0e0f0] transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-5 space-y-3 text-sm text-[#b0b0c8] leading-relaxed">
            <div className="bg-[#0f0f18] border border-[#2a2a3a] rounded-xl p-4 space-y-1.5 text-xs font-mono">
              <p><span className="text-[#7a7a9a]">From:</span> <span className="text-[#c9a84c]">"Anand Vivek | UPSC Mentor" &lt;me240003006@iiti.ac.in&gt;</span></p>
              <p><span className="text-[#7a7a9a]">Subject:</span> Thank You for Exploring UPSC Mentor 🎯</p>
            </div>
            <div className="space-y-3 pt-1">
              <p>Hi <strong className="text-[#c9a84c]">[User's First Name]</strong>,</p>
              <p>I hope your preparation is going well.</p>
              <p>I'm <strong className="text-[#e0e0f0]">Anand Vivek</strong>, a third-year Mechanical Engineering student at IIT Indore and the builder of UPSC Mentor.</p>
              <p>I noticed you've been actively using the platform recently, and I wanted to personally thank you for trying it out. Since UPSC Mentor is still in its early stages, feedback from active users is <strong className="text-[#e0e0f0]">extremely valuable</strong>.</p>
              <div className="bg-[#0f0f18] border border-[#2a2a3a] rounded-xl p-4 space-y-2">
                <p className="text-[#c9a84c] text-[11px] uppercase tracking-widest font-semibold">I'd love to know ✍️</p>
                <p className="font-semibold text-[#e0e0f0]">1. Which feature did you find most useful?</p>
                <ul className="ml-4 text-[13px] space-y-0.5 text-[#b0b0c8]">
                  {["AI Mentor","Notes Auditor","Syllabus Tracker","Dashboard & Timer","Topic Practice / PYQ Vault","Mock Tests","Something else"].map(f => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <p className="font-semibold text-[#e0e0f0] pt-1">2. What was confusing or difficult to use?</p>
                <p className="font-semibold text-[#e0e0f0]">3. What one feature would make you use UPSC Mentor more regularly?</p>
                <p className="font-semibold text-[#e0e0f0]">4. If you could change one thing about the platform, what would it be?</p>
              </div>
              <p>Feel free to reply with just a few lines. Honest feedback — positive or negative — will help me improve the platform much faster.</p>
              <p>Thank you again, and all the best for your UPSC preparation! 🙏</p>
              <div className="border-t border-[#2a2a3a] pt-3 text-xs text-[#7a7a9a] space-y-0.5">
                <p className="text-[#e0e0f0] font-semibold">Anand Vivek</p>
                <p>Roll No.: 240003006</p>
                <p>Third Year | Mechanical Engineering</p>
                <p>Indian Institute of Technology Indore</p>
                <p>📞 9675109428</p>
                <p className="text-[#c9a84c]">🔗 upscbyiitians.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {previewOpen && <EmailPreview />}

      <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#c9a84c18", border: "1px solid #c9a84c25" }}>
              <Mail size={14} style={{ color: "#c9a84c" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Power User Outreach</p>
              <p className="text-[11px] text-text-muted font-mono">
                Send personalised feedback email from me240003006@iiti.ac.in
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {targets.length > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
                {targets.length} eligible
              </span>
            )}
            {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
          </div>
        </div>

        {/* Body */}
        {expanded && (
          <div className="border-t border-bg-border px-4 sm:px-6 py-5 space-y-4">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading */}
            {loadingTargets ? (
              <div className="flex items-center gap-2 text-text-muted text-sm py-4">
                <Loader2 size={14} className="animate-spin" />
                <span>Loading eligible power users…</span>
              </div>
            ) : targets.length === 0 ? (
              <div className="flex items-center gap-2 bg-bg-muted border border-bg-border rounded-xl px-4 py-3 text-sm text-text-muted">
                <Users size={14} />
                <span>No power users found (active 3+ days in last 7 days).</span>
              </div>
            ) : (
              <>
                {/* Controls row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted hover:text-text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selected.size === targets.length}
                      onChange={toggleAll}
                      className="rounded accent-[#c9a84c]"
                    />
                    Select all ({targets.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-bg-border text-text-muted hover:text-text-primary hover:border-[#c9a84c]/40 transition-all"
                    >
                      <Eye size={12} /> Preview Email
                    </button>
                    <button
                      onClick={loadTargets}
                      disabled={loadingTargets}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-bg-border text-text-muted hover:text-text-primary transition-all"
                    >
                      <RefreshCw size={12} className={loadingTargets ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>
                </div>

                {/* User list */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {targets.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all
                        ${selected.has(user.id)
                          ? "border-[#c9a84c]/30 bg-[#c9a84c]/5"
                          : "border-bg-border bg-bg-muted/30 opacity-60"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded accent-[#c9a84c] shrink-0"
                      />
                      <UserCheck size={13} className={selected.has(user.id) ? "text-[#c9a84c]" : "text-text-muted"} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
                        <p className="text-[11px] text-text-muted font-mono truncate">{user.email}</p>
                      </div>
                      {/* Show result status if already sent */}
                      {results && (() => {
                        const r = results.results?.find((x) => x.id === user.id);
                        return r ? <StatusBadge status={r.status} /> : null;
                      })()}
                    </label>
                  ))}
                </div>

                {/* Result summary */}
                {results && (
                  <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border text-xs
                    ${results.failed === 0
                      ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/8 border-amber-500/20 text-amber-400"}`}>
                    {results.failed === 0
                      ? <CheckCircle2 size={13} className="shrink-0" />
                      : <AlertCircle size={13} className="shrink-0" />}
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
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${selected.size === 0
                      ? "bg-bg-muted text-text-muted cursor-not-allowed border border-bg-border"
                      : sending
                      ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30 cursor-not-allowed"
                      : "bg-[#c9a84c] text-[#0f0f13] hover:bg-[#e8c96d] shadow-md hover:shadow-[#c9a84c]/20"}`}
                >
                  {sending ? (
                    <><Loader2 size={14} className="animate-spin" /> Sending emails…</>
                  ) : (
                    <><Send size={14} /> Send to {selected.size} user{selected.size !== 1 ? "s" : ""}</>
                  )}
                </button>

                <p className="text-[11px] text-text-muted text-center font-mono">
                  Requires <code className="bg-bg-muted px-1 rounded">GMAIL_APP_PASSWORD</code> in server .env · Sends from me240003006@iiti.ac.in
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
