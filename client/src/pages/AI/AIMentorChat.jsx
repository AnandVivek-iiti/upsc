import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ArrowUp, Sparkles, LogIn, User, Bot, Plus, Trash2, X,
  MessageSquare, Maximize2, Minimize2, Loader2, Search,
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

// Long assistant replies get collapsed with a "Read full answer" toggle.
// Kept short on purpose — the chat bubble is a quick mentor, not the answer sheet.
const LONG_REPLY_LIMIT = 260;

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

// Trim to the nearest word boundary instead of slicing mid-word.
function truncateClean(text, limit) {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}

// ─── Quote card — used when a message is asking the mentor to break down a quote ──
function QuoteCard({ text, src }) {
  return (
    <div className="amc-quote-card">
      <span className="amc-quote-mark">“</span>
      <p className="amc-quote-text">{text}</p>
      {src && <p className="amc-quote-src">— {src}</p>}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg, isQuoteFollowup }) {
  const isUser = msg.role === "user";
  const isLong = !isUser && msg.content.length > LONG_REPLY_LIMIT;
  const [expanded, setExpanded] = useState(false);
  const shown = isLong && !expanded ? truncateClean(msg.content, LONG_REPLY_LIMIT) : msg.content;

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
      <div className="max-w-[84%] flex flex-col gap-1.5 min-w-0">
        {isQuoteFollowup && !isUser && (
          <div className="amc-quote-badge">
            <Sparkles size={10} /> Quote breakdown
          </div>
        )}

        {isUser && msg.quote ? (
          <QuoteCard text={msg.quote.text} src={msg.quote.src} />
        ) : (
          <div className={`amc-bubble ${isUser ? "amc-bubble-user" : "amc-bubble-bot"}`}>
            {shown.split("\n").filter(Boolean).map((line, i) => {
              const bullet = /^[-•]\s+/.test(line);
              return (
                <p key={i} className={`${i > 0 ? "mt-1.5" : ""} ${bullet ? "amc-bullet" : ""}`}>
                  {bullet ? line.replace(/^[-•]\s+/, "") : line}
                </p>
              );
            })}
            {isLong && !expanded && <div className="amc-fade" />}
          </div>
        )}

        {isLong && (
          <button onClick={() => setExpanded((v) => !v)} className="amc-readmore">
            {expanded ? "Show less" : "Read full answer →"}
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
      <div className="amc-bubble amc-bubble-bot flex gap-1 items-center h-[18px] py-3">
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

// History sidebar — shared between full-screen mode (always visible) so it actually
// loads and stays visible instead of silently failing to open.
function HistorySidebar({ threads, threadsLoading, threadId, onSelect, onDelete, onNew, search, onSearchChange }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return threads;
    const s = search.toLowerCase();
    return threads.filter((t) => (t.title || "new chat").toLowerCase().includes(s));
  }, [threads, search]);

  return (
    <div className="amc-fs-sidebar">
      <div className="p-3 border-b border-bg-border shrink-0 space-y-2">
        <button onClick={onNew}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[12px] font-semibold transition-colors"
          style={{ border: "1px solid rgba(59,130,246,.3)", color: "var(--accent-blue)", background: "var(--accent-blue-dim)" }}>
          <Plus size={13} /> New chat
        </button>
        <div className="amc-search">
          <Search size={12} className="shrink-0" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search history…" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto amc-scroll px-2 py-2 space-y-0.5">
        {threadsLoading && (
          <div className="flex justify-center py-6">
            <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent-blue)" }} />
          </div>
        )}
        {!threadsLoading && filtered.length === 0 && (
          <p className="text-[11px] font-mono text-text-muted text-center py-6 px-2">
            {search.trim() ? "No chats match that search." : "No saved chats yet — start one above."}
          </p>
        )}
        {filtered.map((t) => (
          <ThreadRow key={t.id} thread={t} active={t.id === threadId} onSelect={onSelect} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
export default function AIMentorChat({
  contextHint = "",
  isLoggedIn,
  compact = true,
  startExpanded = false,
  openSignal = 0,
  prefill = "",
  quoteMeta = null,
  onClearPrefill = null,
}) {
  const [open, setOpen]           = useState(!compact || startExpanded);
  const [fullScreen, setFullScreen] = useState(startExpanded);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState(null);
  const [threadId, setThreadId]   = useState(null);
  const [activeTitle, setActiveTitle] = useState("");

  const [threads, setThreads]               = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadLoading, setThreadLoading]   = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [historySearch, setHistorySearch]   = useState("");

  const bottomRef       = useRef(null);
  const textareaRef     = useRef(null);
  const panelRef         = useRef(null);
  const pendingQuoteRef  = useRef(null);
  const skipFirstSignal  = useRef(true);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending, open]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);
 useEffect(() => {
    if (skipFirstSignal.current) { skipFirstSignal.current = false; return; }
    setOpen(true);
    setFullScreen(true);
  }, [openSignal]);
 useEffect(() => {
    if (!prefill || !isLoggedIn) return;
    setOpen(true);
    pendingQuoteRef.current = quoteMeta || null;
    const t = setTimeout(() => {
      setInput(prefill);
      textareaRef.current?.focus();
      onClearPrefill?.();
    }, 150);
    return () => clearTimeout(t);
  }, [prefill, isLoggedIn]); // eslint-disable-line
 useEffect(() => {
    if (!open || fullScreen) return;
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest("[data-amc-fab]")) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, fullScreen]);

  // Escape exits full-screen back to compact, then closes
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (fullScreen) setFullScreen(false);
      else setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, fullScreen]);

  const loadThreads = useCallback(async () => {
    if (!isLoggedIn) return;
    setThreadsLoading(true);
    try { const res = await listChatThreads(); setThreads(res.threads || []); }
    catch { /* ignore — sidebar will just show the empty state */ }
    finally { setThreadsLoading(false); }
  }, [isLoggedIn]);
 useEffect(() => { if (isLoggedIn) loadThreads(); }, [isLoggedIn, loadThreads]);

  const openThread = useCallback(async (id) => {
    if (id === threadId) return;
    setThreadId(id); setMessages([]); setError(null);
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
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    const quote = pendingQuoteRef.current;
    pendingQuoteRef.current = null;
    setInput(""); // clears immediately — never lingers after sending
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: msg, quote }]);
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

  const closeAll = () => { setOpen(false); setFullScreen(false); };

  const isEmpty = messages.length === 0 && !threadLoading;

  // ── Shared chat body (used by both compact panel and full-screen workspace) ──
  function ChatBody({ starterCount }) {
    if (!isLoggedIn) {
      return (
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
      );
    }


    return (
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
              <div className="flex flex-col gap-1.5 w-full max-w-sm">
                {STARTER_QUESTIONS.slice(0, starterCount).map((q, i) => (
                  <button key={i} onClick={() => send(q)} className="amc-starter">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <Message key={i} msg={m} isQuoteFollowup={Boolean(messages[i - 1]?.quote)} />
              ))}
              {sending && <ThinkingDots />}
              {error && <ErrorBanner error={error} />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t border-bg-border p-3">
          <div className="amc-input-bar">
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
              className="amc-send-btn"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes amc-bounce { 0%, 80%, 100% { transform: scale(0.6); } 40% { transform: scale(1); } }
        @keyframes amc-pop { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes amc-ring { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); } 100% { box-shadow: 0 0 0 14px rgba(59,130,246,0); } }
        @keyframes amc-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .amc-dock {
          position: fixed;
          right: 16px;
          bottom: calc(var(--bottom-nav-h, 0px) + var(--safe-bottom, 0px) + 16px);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .amc-dock { right: 28px; bottom: calc(var(--safe-bottom, 0px) + 28px); }
        }

        .amc-fab {
          width: 56px; height: 56px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--accent-blue), #2563eb);
          color: var(--text-inverse);
          box-shadow: var(--shadow-lg);
          transition: transform .15s ease;
          animation: amc-ring 2.4s ease-out infinite;
        }
        .amc-fab:hover { transform: scale(1.05); }
        .amc-fab:active { transform: scale(0.95); }

        .amc-panel {
          animation: amc-pop 180ms cubic-bezier(0.22,1,0.36,1) both;
          display: flex; flex-direction: column; overflow: hidden;
          border-radius: 26px; border: 1px solid var(--bg-border);
          background: var(--bg-surface); box-shadow: var(--shadow-lg);
        }

        .amc-header {
          flex-shrink: 0; display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(120deg, var(--accent-blue), #1d4ed8);
          color: var(--text-inverse);
        }
        .amc-icon-btn {
          padding: 7px; border-radius: 10px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          color: inherit; transition: background-color .15s;
        }
        .amc-icon-btn:hover { background: rgba(255,255,255,0.15); }

        .amc-scroll::-webkit-scrollbar { width: 4px; }
        .amc-scroll::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 999px; }

        .amc-bubble { position: relative; padding: 11px 14px; border-radius: 18px; font-size: 13px; line-height: 1.6; overflow: hidden; }
        .amc-bubble-user { border-top-right-radius: 6px; background: linear-gradient(135deg, var(--accent-blue), #2563eb); color: var(--text-inverse); }
        .amc-bubble-bot { border-top-left-radius: 6px; background: var(--bg-muted); border: 1px solid var(--bg-border); color: var(--text-primary); }
        .amc-bullet::before { content: "•"; color: var(--accent-blue); margin-right: 6px; font-weight: 700; }
        .amc-fade { position: absolute; left: 0; right: 0; bottom: 0; height: 34px; background: linear-gradient(transparent, var(--bg-muted)); pointer-events: none; }
        .amc-readmore {
          align-self: flex-start; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace;
          color: var(--accent-blue); display: inline-flex; align-items: center; gap: 4px;
        }
        .amc-readmore:hover { text-decoration: underline; }

        .amc-quote-card {
          position: relative; padding: 18px 16px 14px 26px; border-radius: 16px;
          background: linear-gradient(135deg, var(--accent-blue-dim), rgba(245,158,11,0.07));
          border: 1px solid rgba(59,130,246,.25);
        }
        .amc-quote-mark {
          position: absolute; top: -2px; left: 8px; font-size: 32px; line-height: 1;
          color: var(--accent-gold); opacity: .55; font-family: 'Playfair Display', Georgia, serif;
        }
        .amc-quote-text { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 13.5px; line-height: 1.55; color: var(--text-primary); }
        .amc-quote-src { margin-top: 8px; font-size: 11px; font-family: 'DM Mono', monospace; color: var(--accent-gold); text-align: right; }
        .amc-quote-badge {
          display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700;
          letter-spacing: .04em; text-transform: uppercase; color: var(--accent-blue);
          background: var(--accent-blue-dim); border: 1px solid rgba(59,130,246,.25);
          padding: 3px 9px; border-radius: 20px; width: fit-content;
        }

        .amc-starter {
          text-align: left; font-size: 12px; padding: 9px 12px; border-radius: 12px;
          border: 1px solid var(--bg-border); color: var(--text-secondary);
          background: var(--bg-surface); transition: border-color .15s, color .15s, background .15s;
        }
        .amc-starter:hover { border-color: rgba(59,130,246,.4); color: var(--text-primary); background: var(--accent-blue-dim); }

        .amc-input-bar {
          display: flex; align-items: flex-end; gap: 8px; border-radius: 18px;
          padding: 9px 9px 9px 14px; border: 1px solid var(--bg-border); background: var(--bg-muted);
          transition: border-color .15s;
        }
        .amc-input-bar:focus-within { border-color: rgba(59,130,246,.45); }
        .amc-send-btn {
          width: 32px; height: 32px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--accent-blue), #2563eb); color: var(--text-inverse);
          transition: opacity .15s, transform .1s;
        }
        .amc-send-btn:disabled { opacity: .35; }
        .amc-send-btn:not(:disabled):active { transform: scale(0.93); }

        .amc-search {
          display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 10px;
          border: 1px solid var(--bg-border); background: var(--bg-surface);
        }
        .amc-search input {
          flex: 1; background: transparent; border: none; outline: none; font-size: 12px; color: var(--text-primary);
        }
        .amc-search input::placeholder { color: var(--text-muted); }

        /* ── Full-screen workspace ── */
        .amc-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(8,10,16,0.55); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          animation: amc-fade-in 160ms ease both;
        }
        .amc-fullscreen {
          width: 100%; height: 100%; background: var(--bg-surface);
          display: flex; flex-direction: column; overflow: hidden;
          animation: amc-pop 200ms cubic-bezier(.22,1,.36,1) both;
        }
        @media (min-width: 860px) {
          .amc-overlay { padding: 32px; }
          .amc-fullscreen { width: min(1080px, 100%); height: min(760px, 100%); border-radius: 28px; border: 1px solid var(--bg-border); box-shadow: var(--shadow-lg); }
        }
        .amc-fs-body { flex: 1; display: flex; min-height: 0; position: relative; }
        .amc-fs-sidebar { width: 248px; flex-shrink: 0; border-right: 1px solid var(--bg-border); display: flex; flex-direction: column; background: var(--bg-base); }
        @media (max-width: 640px) {
          .amc-fs-sidebar { position: absolute; inset: 0; z-index: 5; width: 100%; }
        }
      `}</style>

      {/* round launcher + compact panel */}
      <div className="amc-dock">
        {open && !fullScreen && (
          <div ref={panelRef} className="amc-panel" style={{ width: "min(380px, calc(100vw - 32px))", height: "min(530px, calc(100vh - 140px))" }}>
            <div className="amc-header">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/15">
                <Sparkles size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold leading-tight truncate">AI UPSC Mentor</p>
                <p className="text-[10.5px] font-mono opacity-80 leading-tight mt-0.5 truncate">
                  {contextHint || "Always here to help"}
                </p>
              </div>
              {isLoggedIn && (
                <button onClick={() => setFullScreen(true)} className="amc-icon-btn hidden sm:inline-flex" title="Open full workspace">
                  <Maximize2 size={14} />
                </button>
              )}
              <button onClick={closeAll} className="amc-icon-btn" title="Close">
                <X size={14} />
              </button>
            </div>
            <ChatBody starterCount={3} />
          </div>
        )}

        <button
          data-amc-fab
          onClick={() => { if (fullScreen) { closeAll(); } else { setOpen((v) => !v); } }}
          className="amc-fab"
          title="AI UPSC Mentor"
        >
          {open ? <X size={20} /> : <Sparkles size={20} />}
        </button>
      </div>

      {/* full-screen workspace */}
      {open && fullScreen && (
        <div className="amc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setFullScreen(false); }}>
          <div className="amc-fullscreen">
            <div className="amc-header">
              {isLoggedIn && (
                <button onClick={() => setSidebarOpen((v) => !v)} className="amc-icon-btn" title="Toggle history">
                  <MessageSquare size={15} />
                </button>
              )}
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/15">
                <Sparkles size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold leading-tight truncate">{activeTitle || "AI UPSC Mentor"}</p>
                <p className="text-[11px] font-mono opacity-80 leading-tight mt-0.5 truncate">
                  {contextHint || "Full workspace"}
                </p>
              </div>
              {isLoggedIn && (
                <button onClick={newChat} className="amc-icon-btn" title="New chat">
                  <Plus size={15} />
                </button>
              )}
              <button onClick={() => setFullScreen(false)} className="amc-icon-btn" title="Minimize">
                <Minimize2 size={15} />
              </button>
              <button onClick={closeAll} className="amc-icon-btn" title="Close">
                <X size={15} />
              </button>
            </div>

            <div className="amc-fs-body">
              {sidebarOpen && isLoggedIn && (
                <HistorySidebar
                  threads={threads}
                  threadsLoading={threadsLoading}
                  threadId={threadId}
                  onSelect={(id) => { openThread(id); if (window.innerWidth < 640) setSidebarOpen(false); }}
                  onDelete={handleDeleteThread}
                  onNew={newChat}
                  search={historySearch}
                  onSearchChange={setHistorySearch}
                />
              )}
              <div className="flex-1 flex flex-col min-w-0">
                <ChatBody starterCount={5} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}