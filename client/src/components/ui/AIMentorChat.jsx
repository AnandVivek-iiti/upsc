/**
 * AIMentorChat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Inline UPSC mentor chat powered by POST /api/evaluate/chat (Gemini on backend).
 * Drop this into any page — Topicwise, PrelimsGrind, SyllabusTracker, Dashboard.
 *
 * Props:
 *   contextHint  {string}  — optional seed message (e.g. "I'm studying Polity")
 *   isLoggedIn   {bool}
 *   compact      {bool}    — smaller layout for sidebars/panels
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send, Cpu, MessageSquare, Sparkles, RefreshCw, LogIn, User, Bot,
} from "lucide-react";
import { chatWithMentor, getChatHistory, clearChatHistory } from "../../hooks/useAI";

const STARTER_QUESTIONS = [
    "How should I structure a GS2 governance answer?",
    "What are the most important topics for UPSC Prelims 2026?",
    "Explain cooperative federalism with recent examples",
    "How to write a topper-standard Ethics case study?",
    "What's the best revision strategy for GS3?",
];

function Message({ msg }) {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? "bg-accent-gold/20" : "bg-bg-muted border border-bg-border"
                }`}>
                {isUser
                    ? <User size={11} style={{ color: "var(--accent-gold)" }} />
                    : <Bot size={11} className="text-text-muted" />
                }
            </div>
            <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser
                    ? "rounded-tr-sm text-white"
                    : "rounded-tl-sm bg-bg-muted border border-bg-border text-text-primary"
                }`}
                style={isUser ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}>
                {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                ))}
            </div>
        </div>
    );
}

export default function AIMentorChat({ contextHint = "", isLoggedIn, compact = false }) {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(!compact);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, loading]);

    // ── Restore the persisted conversation whenever we have a logged-in user ──
    useEffect(() => {
        if (!isLoggedIn) { setHistory([]); return; }
        let cancelled = false;
        setHistoryLoading(true);
        getChatHistory()
            .then((res) => {
                if (cancelled) return;
                const restored = (res.history || []).map(m => ({ role: m.role, content: m.content }));
                setHistory(restored);
            })
            .catch(() => { /* best-effort — chat just starts empty if this fails */ })
            .finally(() => { if (!cancelled) setHistoryLoading(false); });
        return () => { cancelled = true; };
    }, [isLoggedIn]);

    const send = useCallback(async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput("");
        setError(null);

        const userMsg = { role: "user", content: msg };
        setHistory(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // History lives server-side now (UserData.mentor_chat) — we just send
            // the new message plus a lightweight hint of which app section this is.
            const res = await chatWithMentor({ message: msg, contextHint });
            setHistory(prev => [...prev, { role: "assistant", content: res.response }]);
        } catch (e) {
            setError(e.message);
            setHistory(prev => prev.slice(0, -1)); // remove optimistic user message
        } finally {
            setLoading(false);
        }
    }, [input, loading, contextHint]);

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    };

    const reset = () => {
        setHistory([]);
        setError(null);
        setInput("");
        clearChatHistory().catch(() => { /* best-effort */ });
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,.25)" }}>
                <LogIn size={14} className="text-accent-gold shrink-0" />
                <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                    Sign in to chat with your AI UPSC Mentor (powered by Gemini)
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel overflow-hidden">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between px-4 py-3 border-b border-bg-border"
                onClick={() => compact && setOpen(v => !v)}
                style={{ cursor: compact ? "pointer" : "default" }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.2)" }}>
                        <Sparkles size={13} className="text-accent-gold" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">AI UPSC Mentor</p>
                        <p className="text-[10px] font-mono text-text-muted">Powered by Gemini · Ask anything</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {history.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); reset(); }}
                            className="btn-ghost flex items-center gap-1 text-xs px-2 py-1">
                            <RefreshCw size={10} /> Clear
                        </button>
                    )}
                    {compact && (
                        <MessageSquare size={14} className={open ? "text-accent-gold" : "text-text-muted"} />
                    )}
                </div>
            </button>

            {(open || !compact) && (
                <>
                    {/* Messages */}
                    <div className={`overflow-y-auto space-y-3 p-4 ${compact ? "h-52" : "h-72"}`}>
                        {historyLoading && (
                            <p className="text-xs text-text-muted text-center font-mono">Restoring your conversation…</p>
                        )}

                        {!historyLoading && history.length === 0 && (
                            <div className="space-y-3">
                                <p className="text-xs text-text-muted text-center font-mono">
                                    {contextHint ? `Context: ${contextHint}` : "Ask anything about UPSC preparation"}
                                </p>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                    {STARTER_QUESTIONS.slice(0, compact ? 3 : 5).map((q, i) => (
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

                        {loading && (
                            <div className="flex gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-bg-muted border border-bg-border flex items-center justify-center shrink-0">
                                    <Cpu size={11} className="text-accent-gold animate-spin" />
                                </div>
                                <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-bg-muted border border-bg-border">
                                    <div className="flex gap-1 items-center h-4">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-gold/60 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-xs font-mono text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                {error}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-bg-border p-3 flex gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask your UPSC mentor…"
                            rows={1}
                            className="flex-1 bg-bg-muted border border-bg-border rounded-xl px-3 py-2 text-sm text-text-primary
                         focus:outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-muted resize-none"
                            style={{ minHeight: "36px", maxHeight: "96px" }}
                        />
                        <button onClick={() => send()} disabled={!input.trim() || loading}
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                            style={{ background: "var(--accent-gold)", color: "var(--bg-base)" }}>
                            <Send size={14} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}