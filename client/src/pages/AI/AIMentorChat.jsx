import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp, Sparkles, LogIn, User, Bot, Plus, Trash2, X,
  MessageSquare, Maximize2, Minimize2, Loader2,
} from "lucide-react";
import {
  chatWithMentor,
  listChatThreads,
  getChatThread,
  deleteChatThread,
} from "../../hooks/useAI";

const STARTER_QUESTIONS = [
  "How should I structure a GS2 governance answer?",
  "Most important topics for Prelims 2026?",
  "Cooperative federalism with recent examples",
  "Topper-standard Ethics case study format?",
  "3-month revision plan for GS3?",
];

// Long assistant replies get collapsed with a "show more" toggle
const LONG_REPLY_LIMIT = 420;

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  const isLong = !isUser && msg.content.length > LONG_REPLY_LIMIT;
  const [expanded, setExpanded] = useState(false);
  const shown = isLong && !expanded
    ? msg.content.slice(0, LONG_REPLY_LIMIT).trim() + "…"
    : msg.content;

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border"
        style={isUser
          ? { background: "var(--accent-blue-dim)", borderColor: "rgba(59,130,246,.25)" }
          : { background: "var(--bg-muted)", borderColor: "var(--bg-border)" }}
      >
        {isUser
          ? <User size={12.5} style={{ color: "var(--accent-blue)" }} />
          : <Bot size={12.5} className="text-text-muted" />}
      </div>
      <div className="max-w-[82%] flex flex-col gap-1.5 min-w-0">
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
            isUser ? "rounded-tr-md" : "rounded-tl-md bg-bg-muted border border-bg-border text-text-primary"
          }`}
          style={isUser ? { background: "var(--accent-blue)", color: "var(--text-inverse)" } : {}}
        >
          {shown.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line}</p>
          ))}
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] font-mono self-start hover:underline"
            style={{ color: "var(--accent-blue)" }}
          >
            {expanded ? "Show less" : "Show full answer →"}
          </button>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
        style={{ background: "var(--bg-muted)", borderColor: "var(--bg-border)" }}>
        <Bot size={12.5} className="text-text-muted" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-bg-muted border border-bg-border flex gap-1 items-center h-[18px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent-blue)", opacity: 0.55, animation: `amc-bounce 1.1s ${i * 0.15}s infinite ease-in-out` }} />
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ error }) {
  return (
    <div className="text-[11px] font-mono px-3 py-2 rounded-xl"
      style={{ color: "#fca5a5", background: "rgba(248,113,113,.08)", border: "0.5px solid rgba(248,113,113,.25)" }}>
      {error}
    </div>
  );
}

function ThreadRow({ thread, active, onSelect, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div
      onClick={() => onSelect(thread.id)}
      className="group relative flex items-start gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-colors"
      style={active
        ? { background: "var(--accent-blue-dim)", border: "1px solid rgba(59,130,246,.25)" }
        : { border: "1px solid transparent" }}
    >
      <MessageSquare size={12} className="shrink-0 mt-0.5"
        style={{ color: active ? "var(--accent-blue)" : "var(--text-muted)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium truncate"
          style={{ color: active ? "var(--accent-blue)" : "var(--text-primary)" }}>
          {thread.title || "New chat"}
        </p>
        <p className="text-[10px] font-mono text-text-muted mt-0.5">{relativeTime(thread.updatedAt)}</p>
      </div>
      {confirm ? (
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-400"
            onClick={() => { onDelete(thread.id); setConfirm(false); }}>del</button>
          <button className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-muted text-text-muted"
            onClick={() => setConfirm(false)}>no</button>
        </div>
      ) : (
        <button className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10"
          onClick={(e) => { e.stopPropagation(); setConfirm(true); }}>
          <Trash2 size={10.5} className="text-text-muted hover:text-red-400" />
        </button>
      )}
    </div>
  );
}

// ─── Main export: floating round launcher + popup panel ──────────────────────
// Props:
//   contextHint     – string hint passed to the AI for this page
//   isLoggedIn      – bool
//   compact         – if true (default), panel starts closed (just the FAB).
//                     Pass compact={false} to have it open automatically.
//   prefill         – string to pre-fill the input (e.g. from a quote click)
//   onClearPrefill  – callback to clear prefill after it's been applied
export default function AIMentorChat({
  contextHint = "",
  isLoggedIn,
  compact = true,
  prefill = "",
  onClearPrefill = null,
}) {
  const [open, setOpen]         = useState(!compact);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [activeTitle, setActiveTitle] = useState("");

  const [threads, setThreads]               = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadLoading, setThreadLoading]   = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const panelRef    = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending, open]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  // Apply prefill (e.g. quote click) — opens the panel and focuses the input
  useEffect(() => {
    if (!prefill || !isLoggedIn) return;
    setOpen(true);
    const t = setTimeout(() => {
      setInput(prefill);
      textareaRef.current?.focus();
      onClearPrefill?.();
    }, 150);
    return () => clearTimeout(t);
  }, [prefill, isLoggedIn]); // eslint-disable-line

  // Close on outside click (desktop convenience)
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest("[data-amc-fab]")) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const loadThreads = useCallback(async () => {
    if (!isLoggedIn) return;
    setThreadsLoading(true);
    try { const res = await listChatThreads(); setThreads(res.threads || []); }
    catch { /* ignore */ }
    finally { setThreadsLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { if (expanded) loadThreads(); }, [expanded, loadThreads]);

  const openThread = useCallback(async (id) => {
    if (id === threadId) { setSidebarOpen(false); return; }
    setThreadId(id); setMessages([]); setError(null); setSidebarOpen(false);
    setThreadLoading(true);
    try {
      const res = await getChatThread(id);
      setMessages(res.thread.messages || []);
      setActiveTitle(res.thread.title || "Chat");
    } catch (e) { setError(e.message); }
    finally { setThreadLoading(false); }
  }, [threadId]);

  const handleDeleteThread = useCallback(async (id) => {
    try {
      await deleteChatThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (id === threadId) { setThreadId(null); setMessages([]); setActiveTitle(""); }
    } catch { /* ignore */ }
  }, [threadId]);

  const newChat = () => {
    setThreadId(null); setMessages([]); setActiveTitle(""); setError(null); setInput("");
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput(""); // clears immediately — never lingers after sending
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setSending(true);
    try {
      const res = await chatWithMentor({ message: msg, contextHint, threadId });
      if (!threadId) {
        setThreadId(res.thread_id);
        setActiveTitle(res.title || "New chat");
        loadThreads();
      } else if (res.title) {
        setActiveTitle(res.title);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (e) {
      setError(e.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [input, sending, contextHint, threadId, loadThreads]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isEmpty = messages.length === 0 && !threadLoading;
  const panelWidth  = expanded ? "min(880px, calc(100vw - 32px))" : "min(380px, calc(100vw - 32px))";
  const panelHeight = expanded ? "min(620px, calc(100vh - 140px))" : "min(530px, calc(100vh - 140px))";

  return (
    <>
      <style>{`
        @keyframes amc-bounce { 0%, 80%, 100% { transform: scale(0.6); } 40% { transform: scale(1); } }
        @keyframes amc-pop { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes amc-ring { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); } 100% { box-shadow: 0 0 0 14px rgba(59,130,246,0); } }
        .amc-dock {
          position: fixed;
          right: 16px;
          bottom: calc(var(--bottom-nav-h, 0px) + var(--safe-bottom, 0px) + 16px);
          z-index: 60;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .amc-dock { right: 28px; bottom: calc(var(--safe-bottom, 0px) + 28px); }
        }
        .amc-fab { animation: amc-ring 2.4s ease-out infinite; }
        .amc-panel { animation: amc-pop 180ms cubic-bezier(0.22,1,0.36,1) both; }
        .amc-scroll::-webkit-scrollbar { width: 4px; }
        .amc-scroll::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 999px; }
      `}</style>

      <div className="amc-dock">
        {open && (
          <div
            ref={panelRef}
            className="amc-panel flex flex-col overflow-hidden rounded-[26px] border"
            style={{
              width: panelWidth,
              height: panelHeight,
              background: "var(--bg-surface)",
              borderColor: "var(--bg-border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* header */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3.5"
              style={{ background: "var(--accent-blue)", color: "var(--text-inverse)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/15">
                <Sparkles size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold leading-tight truncate">
                  {expanded ? (activeTitle || "AI UPSC Mentor") : "AI UPSC Mentor"}
                </p>
                <p className="text-[10.5px] font-mono opacity-80 leading-tight mt-0.5 truncate">
                  {contextHint || "Always here to help"}
                </p>
              </div>
              {expanded && isLoggedIn && (
                <button onClick={() => setSidebarOpen((v) => !v)}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                  <MessageSquare size={14} />
                </button>
              )}
              {isLoggedIn && (
                <button onClick={() => setExpanded((v) => !v)}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors hidden sm:inline-flex">
                  {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 flex min-h-0">
              {/* thread sidebar (expanded mode only) */}
              {expanded && sidebarOpen && isLoggedIn && (
                <div className="w-[200px] shrink-0 border-r border-bg-border flex flex-col">
                  <div className="p-2.5 shrink-0">
                    <button onClick={newChat}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[12px] font-medium transition-colors"
                      style={{ border: "1px solid rgba(59,130,246,.3)", color: "var(--accent-blue)" }}>
                      <Plus size={13} /> New chat
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto amc-scroll px-2 pb-2 space-y-0.5">
                    {threadsLoading && <p className="text-[10px] font-mono text-text-muted text-center py-3">Loading…</p>}
                    {!threadsLoading && threads.length === 0 && (
                      <p className="text-[10px] font-mono text-text-muted text-center py-6">No chats yet</p>
                    )}
                    {threads.map((t) => (
                      <ThreadRow key={t.id} thread={t} active={t.id === threadId} onSelect={openThread} onDelete={handleDeleteThread} />
                    ))}
                  </div>
                </div>
              )}

              {/* messages + input */}
              <div className="flex-1 flex flex-col min-w-0">
                {!isLoggedIn ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-blue-dim)" }}>
                      <Sparkles size={20} style={{ color: "var(--accent-blue)" }} />
                    </div>
                    <p className="text-[13px] text-text-primary font-medium">Sign in to chat with your AI Mentor</p>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono"
                      style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
                      <LogIn size={12} /> Your chats are saved automatically
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto amc-scroll px-4 py-4 space-y-4">
                      {threadLoading ? (
                        <div className="flex justify-center py-10">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full"
                                style={{ background: "var(--accent-blue)", animation: `amc-bounce 1.1s ${i * 0.15}s infinite ease-in-out` }} />
                            ))}
                          </div>
                        </div>
                      ) : isEmpty ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-2">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-blue-dim)" }}>
                            <Sparkles size={20} style={{ color: "var(--accent-blue)" }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-text-primary">Ask your UPSC Mentor</p>
                            <p className="text-[11px] text-text-muted font-mono mt-0.5">Quick, focused answers</p>
                          </div>
                          <div className="flex flex-col gap-1.5 w-full">
                            {STARTER_QUESTIONS.slice(0, expanded ? 5 : 3).map((q, i) => (
                              <button key={i} onClick={() => send(q)}
                                className="text-left text-[12px] px-3 py-2 rounded-xl border transition-colors hover:bg-bg-muted"
                                style={{ borderColor: "var(--bg-border)", color: "var(--text-secondary)" }}>
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          {messages.map((m, i) => <Message key={i} msg={m} />)}
                          {sending && <ThinkingDots />}
                          {error && <ErrorBanner error={error} />}
                        </>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    <div className="shrink-0 border-t border-bg-border p-3">
                      <div className="flex items-end gap-2 rounded-2xl border px-3 py-2 transition-colors"
                        style={{ borderColor: "var(--bg-border)", background: "var(--bg-muted)" }}>
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKey}
                          placeholder="Ask anything…"
                          rows={1}
                          className="flex-1 bg-transparent text-[13px] text-text-primary focus:outline-none placeholder:text-text-muted resize-none"
                          style={{ minHeight: 22, maxHeight: 120 }}
                        />
                        <button
                          onClick={() => send()}
                          disabled={!input.trim() || sending}
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-35"
                          style={{ background: "var(--accent-blue)", color: "var(--text-inverse)" }}
                        >
                          {sending ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* round floating launcher */}
        <button
          data-amc-fab
          onClick={() => setOpen((v) => !v)}
          className="amc-fab w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--accent-blue)", color: "var(--text-inverse)", boxShadow: "var(--shadow-lg)" }}
          title="AI UPSC Mentor"
        >
          {open ? <X size={20} /> : <Sparkles size={20} />}
        </button>
      </div>
    </>
  );
}
