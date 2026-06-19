/**
 * AIMentorChat.jsx  —  ChatGPT-style full-page mentor chat
 * ─────────────────────────────────────────────────────────────────────────────

 * Props:
 *   contextHint  {string}  — optional seed passed to /api/evaluate/chat
 *   isLoggedIn   {bool}
 *   compact      {bool}    — renders the original small embedded widget instead
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
   ArrowUp, Send, Cpu, MessageSquare, Sparkles, RefreshCw, LogIn, User, Bot,
    Plus, Trash2, ChevronLeft, Brain, Clock, X, Menu,
} from "lucide-react";
import {
    chatWithMentor,
    listChatThreads,
    getChatThread,
    deleteChatThread,
} from "../../hooks/useAI";

// ─── Starter prompts ──────────────────────────────────────────────────────────
const STARTER_QUESTIONS = [
    "How should I structure a GS2 governance answer?",
    "What are the most important topics for UPSC Prelims 2026?",
    "Explain cooperative federalism with recent examples",
    "How to write a topper-standard Ethics case study?",
    "What's the best revision strategy for GS3?",
    "Key differences between Fundamental Rights and DPSP?",
    "Suggest a 3-month study schedule for Mains",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// ─── Single message bubble ────────────────────────────────────────────────────
function Message({ msg }) {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isUser ? "bg-accent-gold/20" : "bg-bg-muted border border-bg-border"
            }`}>
                {isUser
                    ? <User size={13} style={{ color: "var(--accent-gold)" }} />
                    : <Bot size={13} className="text-text-muted" />
                }
            </div>
            <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isUser
                        ? "rounded-tr-sm text-white"
                        : "rounded-tl-sm bg-bg-muted border border-bg-border text-text-primary"
                }`}
                style={isUser ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}
            >
                {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 && line ? "mt-2" : i > 0 ? "mt-1" : ""}>{line}</p>
                ))}
            </div>
        </div>
    );
}

// ─── Thread item in sidebar ───────────────────────────────────────────────────
function ThreadItem({ thread, active, onSelect, onDelete }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div
            className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                active
                    ? "border border-accent-gold/25"
                    : "hover:bg-bg-muted border border-transparent"
            }`}
            style={active ? { background: "var(--accent-gold-dim)" } : {}}
            onClick={() => onSelect(thread.id)}
        >
            <MessageSquare
                size={13}
                className="shrink-0 mt-0.5"
                style={{ color: active ? "var(--accent-gold)" : "var(--text-muted)" }}
            />
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${active ? "text-accent-gold" : "text-text-primary"}`}>
                    {thread.title || "New chat"}
                </p>
                <p className="text-[10px] font-mono text-text-muted mt-0.5">
                    {relativeTime(thread.updatedAt)}
                    {thread.message_count ? ` · ${Math.ceil(thread.message_count / 2)} turns` : ""}
                </p>
            </div>

            {/* Delete button */}
            {confirmDelete ? (
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        onClick={() => { onDelete(thread.id); setConfirmDelete(false); }}
                    >del</button>
                    <button
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-muted text-text-muted"
                        onClick={() => setConfirmDelete(false)}
                    >no</button>
                </div>
            ) : (
                <button
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10"
                    onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                >
                    <Trash2 size={11} className="text-text-muted hover:text-red-400" />
                </button>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIMentorChat({ contextHint = "", isLoggedIn, compact = false }) {

    // ── Compact / embedded mode — renders old-style small widget ──────────────
    if (compact) {
        return <CompactChat contextHint={contextHint} isLoggedIn={isLoggedIn} />;
    }

    // ── Full-page chat app ────────────────────────────────────────────────────
    return <FullChat contextHint={contextHint} isLoggedIn={isLoggedIn} />;
}

// ─── Compact embedded widget (unchanged from before, for page embeds) ─────────
function CompactChat({ contextHint, isLoggedIn }) {
    const [history, setHistory]           = useState([]);
    const [input, setInput]               = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState(null);
    const [threadId, setThreadId]         = useState(null);
    const [open, setOpen]                 = useState(false);
    const bottomRef                       = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

    const send = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput("");
        setError(null);
        const userMsg = { role: "user", content: msg };
        setHistory(prev => [...prev, userMsg]);
        setLoading(true);
        try {
            const res = await chatWithMentor({ message: msg, contextHint, threadId });
            if (res.thread_id) setThreadId(res.thread_id);
            setHistory(prev => [...prev, { role: "assistant", content: res.response }]);
        } catch (e) {
            setError(e.message);
            setHistory(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    }, [input, loading, contextHint, threadId]);

    if (!isLoggedIn) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,.25)" }}>
                <LogIn size={14} className="text-accent-gold shrink-0" />
                <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                    Sign in to chat with your AI UPSC Mentor
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-4 py-3 border-b border-bg-border"
                onClick={() => setOpen(v => !v)}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.2)" }}>
                        <Sparkles size={13} className="text-accent-gold" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">AI UPSC Mentor</p>
                        <p className="text-[10px] font-mono text-text-muted"> Ask anything</p>
                    </div>
                </div>
                <MessageSquare size={14} className={open ? "text-accent-gold" : "text-text-muted"} />
            </button>

            {open && (
                <>
                    <div className="overflow-y-auto space-y-3 p-4 h-52">
                        {history.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-xs text-text-muted text-center font-mono">
                                    {contextHint ? `Context: ${contextHint}` : "Ask anything about UPSC preparation"}
                                </p>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {STARTER_QUESTIONS.slice(0, 3).map((q, i) => (
                                        <button key={i} onClick={() => send(q)}
                                            className="text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all hover:bg-bg-muted"
                                            style={{ borderColor: "var(--bg-border)", color: "var(--text-muted)" }}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {history.map((msg, i) => <Message key={i} msg={msg} />)}
                        {loading && <ThinkingBubble />}
                        {error && <ErrorMsg error={error} />}
                        <div ref={bottomRef} />
                    </div>
                    <div className="border-t border-bg-border p-3 flex gap-2">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                            placeholder="Ask your UPSC mentor…"
                            rows={1}
                            className="flex-1 bg-bg-muted border border-bg-border rounded-xl px-3 py-2 text-sm text-text-primary
                                       focus:outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-muted resize-none"
                            style={{ minHeight: "36px", maxHeight: "96px" }}
                        />
                        <button onClick={() => send()} disabled={!input.trim() || loading}
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                            style={{ background: "var(--accent-gold)", color: "var(--bg-base)" }}>
                            <ArrowUp size={14} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Full-page ChatGPT-style experience ───────────────────────────────────────
function FullChat({ contextHint, isLoggedIn }) {
    // Thread list (sidebar)
    const [threads, setThreads]           = useState([]);
    const [threadsLoading, setThreadsLoading] = useState(false);

    // Active thread state
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [activeTitle, setActiveTitle]   = useState("");
    const [messages, setMessages]         = useState([]);
    const [threadLoading, setThreadLoading] = useState(false);

    // Send state
    const [input, setInput]               = useState("");
    const [sending, setSending]           = useState(false);
    const [error, setError]               = useState(null);

    // Sidebar open on mobile
    const [sidebarOpen, setSidebarOpen]   = useState(false);

    const bottomRef   = useRef(null);
    const inputRef    = useRef(null);
    const textareaRef = useRef(null);

    // ── Auto-scroll to bottom ─────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    // ── Auto-grow textarea ────────────────────────────────────────────────────
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
        }
    }, [input]);

    // ── Load thread list ──────────────────────────────────────────────────────
    const loadThreads = useCallback(async () => {
        if (!isLoggedIn) return;
        setThreadsLoading(true);
        try {
            const res = await listChatThreads();
            setThreads(res.threads || []);
        } catch { /* ignore */ }
        finally { setThreadsLoading(false); }
    }, [isLoggedIn]);

    useEffect(() => { loadThreads(); }, [loadThreads]);

    // ── Open a thread ─────────────────────────────────────────────────────────
    const openThread = useCallback(async (id) => {
        if (id === activeThreadId) { setSidebarOpen(false); return; }
        setActiveThreadId(id);
        setMessages([]);
        setError(null);
        setSidebarOpen(false);
        setThreadLoading(true);
        try {
            const res = await getChatThread(id);
            setMessages(res.thread.messages || []);
            setActiveTitle(res.thread.title || "Chat");
        } catch (e) {
            setError(e.message);
        } finally {
            setThreadLoading(false);
        }
    }, [activeThreadId]);

    // ── Delete a thread ───────────────────────────────────────────────────────
    const handleDelete = useCallback(async (id) => {
        try {
            await deleteChatThread(id);
            setThreads(prev => prev.filter(t => t.id !== id));
            if (id === activeThreadId) {
                setActiveThreadId(null);
                setMessages([]);
                setActiveTitle("");
            }
        } catch { /* ignore */ }
    }, [activeThreadId]);

    // ── New chat ──────────────────────────────────────────────────────────────
    const newChat = () => {
        setActiveThreadId(null);
        setMessages([]);
        setActiveTitle("");
        setError(null);
        setInput("");
        setSidebarOpen(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
    };

    // ── Send message ──────────────────────────────────────────────────────────
    const send = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || sending) return;
        setInput("");
        setError(null);

        const userMsg = { role: "user", content: msg };
        setMessages(prev => [...prev, userMsg]);
        setSending(true);

        try {
            const res = await chatWithMentor({
                message: msg,
                contextHint,
                threadId: activeThreadId,
            });

            // First message in a new thread — update sidebar
            if (!activeThreadId) {
                setActiveThreadId(res.thread_id);
                setActiveTitle(res.title || "New chat");
                // Refresh thread list so new thread appears
                loadThreads();
            } else if (res.title) {
                setActiveTitle(res.title);
                // Update title in local thread list too
                setThreads(prev =>
                    prev.map(t => t.id === res.thread_id ? { ...t, title: res.title, updatedAt: new Date().toISOString() } : t)
                );
            }

            setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
        } catch (e) {
            setError(e.message);
            setMessages(prev => prev.slice(0, -1)); // remove optimistic user message
        } finally {
            setSending(false);
        }
    }, [input, sending, contextHint, activeThreadId, loadThreads]);

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    };

    // ── Not logged in ─────────────────────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.2)" }}>
                        <Sparkles size={22} className="text-accent-gold" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-text-primary mb-1">AI UPSC Mentor</p>
                        <p className="text-sm text-text-muted font-mono">Sign in to start chatting</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                        style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,.25)" }}>
                        <LogIn size={13} className="text-accent-gold" />
                        <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                            Your chats are saved & remembered
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const isEmpty = messages.length === 0 && !threadLoading;

    return (
        <div
            className="flex h-[calc(100vh-56px)] lg:h-screen overflow-hidden"
            style={{ background: "var(--bg-base)" }}
        >
            {/* ── Mobile overlay ── */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ══════════════════════════════════════════════════════════════════
                THREAD SIDEBAR
            ══════════════════════════════════════════════════════════════════ */}
            <aside
                className={`
                    fixed lg:relative top-0 left-0 h-full z-30 flex flex-col shrink-0
                    border-r border-bg-border bg-bg-surface
                    transition-transform duration-300 lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
                style={{ width: "260px" }}
            >
                {/* Sidebar header */}
                <div className="px-3 pt-4 pb-3 border-b border-bg-border shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.2)" }}>
                            <Brain size={13} className="text-accent-gold" />
                        </div>
                        <p className="text-sm font-semibold text-text-primary flex-1">AI Mentor Chats</p>
                        <button
                            className="lg:hidden p-1 rounded-lg hover:bg-bg-muted text-text-muted"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* New chat button */}
                    <button
                        onClick={newChat}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-bg-muted"
                        style={{ borderColor: "rgba(245,158,11,.3)", color: "var(--accent-gold)" }}
                    >
                        <Plus size={14} />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Thread list */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                    {threadsLoading && (
                        <p className="text-[11px] font-mono text-text-muted text-center py-4">Loading chats…</p>
                    )}
                    {!threadsLoading && threads.length === 0 && (
                        <div className="text-center py-8 px-4">
                            <MessageSquare size={20} className="text-text-muted mx-auto mb-2" />
                            <p className="text-xs font-mono text-text-muted">No chats yet</p>
                            <p className="text-[11px] font-mono text-text-muted mt-1">Start a conversation below</p>
                        </div>
                    )}
                    {threads.map(t => (
                        <ThreadItem
                            key={t.id}
                            thread={t}
                            active={t.id === activeThreadId}
                            onSelect={openThread}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Memory badge */}
                <div className="px-3 pb-4 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.15)" }}>
                        <Brain size={11} className="text-accent-gold shrink-0" />
                        <p className="text-[10px] font-mono text-text-muted leading-tight">
                            Mentor remembers your progress, weak spots & goals across chats
                        </p>
                    </div>
                </div>
            </aside>

            {/* ══════════════════════════════════════════════════════════════════
                MAIN CHAT AREA
            ══════════════════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Chat header */}
                <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-bg-border bg-bg-surface/90 backdrop-blur">
                    <button
                        className="lg:hidden p-1.5 rounded-lg hover:bg-bg-muted text-text-muted"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={16} />
                    </button>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Sparkles size={14} className="text-accent-gold shrink-0" />
                        <p className="text-sm font-semibold text-text-primary truncate">
                            {activeTitle || (isEmpty ? "AI UPSC Mentor" : "New Chat")}
                        </p>

                    </div>

                    {activeThreadId && (
                        <button
                            onClick={newChat}
                            className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg hover:bg-bg-muted text-text-muted transition-all"
                        >
                            <Plus size={11} /> New
                        </button>
                    )}
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {threadLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-accent-gold/50 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    ) : isEmpty ? (
                        /* ── Welcome / empty state ── */
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.25)" }}>
                                    <Sparkles size={24} className="text-accent-gold" />
                                </div>
                                <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                                    Your AI UPSC Mentor
                                </h2>
                                <p className="text-sm text-text-muted font-mono">
                                    Remembers your progress & goals
                                </p>
                            </div>

                            {/* Starter questions grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {STARTER_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => send(q)}
                                        className="text-left px-4 py-3 rounded-xl border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-all duration-150"
                                        style={{ borderColor: "var(--bg-border)" }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ── Message list ── */
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                            {sending && <ThinkingBubble />}
                            {error && <ErrorMsg error={error} />}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* ── Input bar ── */}
                <div className="shrink-0 border-t border-bg-border bg-bg-surface/90 backdrop-blur px-4 py-3">
                    <div className="max-w-3xl mx-auto">
                        <div
                            className="flex gap-2 items-end rounded-2xl border px-3 py-2 transition-colors focus-within:border-accent-gold/40"
                            style={{ borderColor: "var(--bg-border)", background: "var(--bg-muted)" }}
                        >
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={contextHint ? `Ask about ${contextHint}…` : "Ask your UPSC mentor…"}
                                rows={1}
                                className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none
                                           placeholder:text-text-muted resize-none"
                                style={{ minHeight: "24px", maxHeight: "140px" }}
                            />
                            <button
                                onClick={() => send()}
                                disabled={!input.trim() || sending}
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-35"
                                style={{ background: "var(--accent-gold)", color: "var(--bg-base)" }}
                            >
                                {sending
                                    ? <Cpu size={13} className="animate-spin" />
                                    : <ArrowUp size={13} />
                                }
                            </button>
                        </div>
                        <p className="text-[10px] font-mono text-text-muted text-center mt-2">
                            Enter to send · Shift+Enter for new line · Chats are saved automatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function ThinkingBubble() {
    return (
        <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-bg-muted border border-bg-border flex items-center justify-center shrink-0">
                <Cpu size={13} className="text-accent-gold animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-bg-muted border border-bg-border">
                <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-gold/60 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ErrorMsg({ error }) {
    return (
        <div className="text-xs font-mono text-red-400 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 max-w-3xl mx-auto">
            {error}
        </div>
    );
}