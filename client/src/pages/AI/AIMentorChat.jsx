import React, {
  useState, useRef, useEffect, useCallback, useMemo, memo,
} from "react";
import {
  ArrowUp, Sparkles, LogIn, User, Bot, Plus, Trash2, X,
  MessageSquare, Maximize2, Minimize2, Loader2, Search,
  BookOpen, Zap, Table2, Brain, Copy, Check, RotateCw,
} from "lucide-react";
import {
  chatWithMentor, listChatThreads, getChatThread, deleteChatThread,
} from "../../hooks/useAI";

// ─── Constants ────────────────────────────────────────────────────────────────

const STARTER_QUESTIONS = [
  "How should I structure a GS2 governance answer?",
  "Most important topics for Prelims 2026?",
  "Cooperative federalism with recent examples",
  "Topper-standard Ethics case study format?",
  "3-month revision plan for GS3?",
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

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

// ─── Markdown renderer ────────────────────────────────────────────────────────
// Parses a subset of markdown into rich React elements.
// Supports: ## headings, **bold**, *italic*, `code`, tables, bullet lists,
// numbered lists, :::memory blocks, > blockquotes, --- dividers.

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  let keyCounter = 0;
  const key = () => keyCounter++;

  while (i < lines.length) {
    const line = lines[i];

    // ── Blank line
    if (!line.trim()) { i++; continue; }

    // ── Memory card block :::memory
    if (line.trim().startsWith(":::memory")) {
      const cardLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        cardLines.push(lines[i]);
        i++;
      }
      i++; // consume closing :::
      elements.push(
        <div key={key()} className="amc-memory-card">
          <div className="amc-memory-header">
            <Brain size={12} /> Quick Recall
          </div>
          <div className="amc-memory-body">
            {cardLines.map((cl, ci) => {
              const trimmed = cl.trim();
              if (!trimmed) return null;
              const [label, ...rest] = trimmed.split(":");
              if (rest.length) {
                return (
                  <div key={ci} className="amc-memory-row">
                    <span className="amc-memory-label">{label.replace(/^[-•]\s*/, "")}</span>
                    <span className="amc-memory-val">{rest.join(":").trim()}</span>
                  </div>
                );
              }
              return <div key={ci} className="amc-memory-row"><span className="amc-memory-val">{trimmed.replace(/^[-•]\s*/, "")}</span></div>;
            })}
          </div>
        </div>
      );
      continue;
    }

    // ── Table
    if (line.includes("|") && lines[i + 1]?.includes("|") && lines[i + 1]?.includes("-")) {
      const headers = line.split("|").map(h => h.trim()).filter(Boolean);
      i += 2; // skip separator row
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean));
        i++;
      }
      elements.push(
        <div key={key()} className="amc-table-wrap">
          <table className="amc-table">
            <thead>
              <tr>{headers.map((h, hi) => <th key={hi}>{inlineFormat(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci}>{inlineFormat(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Heading ##
    if (/^##\s/.test(line)) {
      elements.push(
        <p key={key()} className="amc-heading">{line.replace(/^##\s/, "")}</p>
      );
      i++; continue;
    }

    // ── Heading #
    if (/^#\s/.test(line)) {
      elements.push(
        <p key={key()} className="amc-heading1">{line.replace(/^#\s/, "")}</p>
      );
      i++; continue;
    }

    // ── Divider ---
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={key()} className="amc-divider" />);
      i++; continue;
    }

    // ── Blockquote >
    if (/^>\s/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s/, ""));
        i++;
      }
      elements.push(
        <div key={key()} className="amc-blockquote">
          {quoteLines.map((ql, qi) => (
            <p key={qi}>{inlineFormat(ql)}</p>
          ))}
        </div>
      );
      continue;
    }

    // ── Bullet list
    if (/^[-•*]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•*]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={key()} className="amc-ul">
          {items.map((item, ii) => (
            <li key={ii}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key()} className="amc-ol">
          {items.map((item, ii) => (
            <li key={ii}>{inlineFormat(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Info card [!NOTE] / [!TIP] / [!IMPORTANT]
    if (/^\[!(NOTE|TIP|IMPORTANT|WARN)\]/.test(line.trim())) {
      const match = line.match(/^\[!(NOTE|TIP|IMPORTANT|WARN)\]\s*(.*)/);
      const type = match[1].toLowerCase();
      const rest = match[2] || "";
      const noteLines = [rest];
      i++;
      while (i < lines.length && lines[i].startsWith("  ")) {
        noteLines.push(lines[i].trim());
        i++;
      }
      elements.push(
        <div key={key()} className={`amc-callout amc-callout-${type}`}>
          <span className="amc-callout-label">{match[1]}</span>
          <span>{noteLines.map((nl, ni) => <span key={ni}>{inlineFormat(nl)} </span>)}</span>
        </div>
      );
      continue;
    }

    // ── Regular paragraph
    elements.push(
      <p key={key()} className="amc-para">{inlineFormat(line)}</p>
    );
    i++;
  }

  return elements;
}

// Inline: **bold**, *italic*, `code`
function inlineFormat(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let k = 0;

  while (remaining.length) {
    // **bold**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    // *italic*
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);
    // `code`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/s);

    const candidates = [
      boldMatch && { idx: boldMatch[1].length, type: "bold", m: boldMatch },
      italicMatch && { idx: italicMatch[1].length, type: "italic", m: italicMatch },
      codeMatch && { idx: codeMatch[1].length, type: "code", m: codeMatch },
    ].filter(Boolean);

    if (!candidates.length) break;

    candidates.sort((a, b) => a.idx - b.idx);
    const winner = candidates[0];

    if (winner.m[1]) parts.push(<span key={k++}>{winner.m[1]}</span>);

    if (winner.type === "bold") parts.push(<strong key={k++}>{winner.m[2]}</strong>);
    else if (winner.type === "italic") parts.push(<em key={k++}>{winner.m[2]}</em>);
    else if (winner.type === "code") parts.push(<code key={k++} className="amc-inline-code">{winner.m[2]}</code>);

    remaining = winner.m[3];
  }

  if (remaining) parts.push(<span key={k++}>{remaining}</span>);
  return parts.length ? parts : text;
}

// ─── Static styles ────────────────────────────────────────────────────────────

const AMC_STYLES = `
@keyframes amc-bounce {
  0%, 80%, 100% { transform: scale(0.6); }
  40% { transform: scale(1); }
}
@keyframes amc-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes amc-ring {
  0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
  100% { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
}
@keyframes amc-card-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Dock */
.amc-dock {
  position: fixed;
  right: 16px;
  bottom: calc(var(--bottom-nav-h,0px) + var(--safe-bottom,0px) + 16px);
  z-index: 10000;
  display: flex; flex-direction: column; align-items: flex-end; gap: 14px;
}
@media (min-width: 768px) {
  .amc-dock { right: 28px; bottom: calc(var(--safe-bottom,0px) + 28px); }
}

/* FAB row — wraps dismiss × and main FAB side-by-side */
.amc-fab-row {
  display: flex; align-items: center; gap: 8px;
}

/* Dismiss button — only shown on mobile when panel is closed */
.amc-fab-dismiss {
  width: 26px; height: 26px; border-radius: 9999px;
  display: none; align-items: center; justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--bg-border);
  color: var(--text-muted);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: background .15s, color .15s;
  align-self: flex-start;
  margin-top: 4px;
}
.amc-fab-dismiss:hover { background: var(--bg-muted); color: var(--text-primary); }
@media (max-width: 1023px) {
  .amc-fab-dismiss { display: flex; }
}

/* FAB */
.amc-fab {
  width: 56px; height: 56px; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-blue), #2563eb);
  color: var(--text-inverse); box-shadow: var(--shadow-lg);
  transition: transform .15s ease;
  animation: amc-ring 2.4s ease-out 3;
  cursor: pointer; border: none;
}
.amc-fab:hover { transform: scale(1.05); }
.amc-fab:active { transform: scale(0.95); }

/* Panel */
.amc-panel {
  animation: amc-pop 180ms cubic-bezier(0.22,1,0.36,1) both;
  display: flex; flex-direction: column; overflow: hidden;
  border-radius: 26px; border: 1px solid var(--bg-border);
  background: var(--bg-surface); box-shadow: var(--shadow-lg);
}

/* Workspace */
.amc-workspace {
  display: flex; flex-direction: column;
  height: 100vh; height: 100dvh; overflow: hidden;
  background: var(--bg-surface);
}
.amc-workspace-body { flex: 1; display: flex; overflow: hidden; }
.amc-workspace-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Header */
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
  cursor: pointer; border: none; background: transparent;
}
.amc-icon-btn:hover { background: rgba(255,255,255,0.15); }

/* Mobile history toggle — only relevant once the sidebar collapses off-canvas */
.amc-mobile-history-btn { display: none; }
@media (max-width: 540px) { .amc-mobile-history-btn { display: inline-flex; } }

/* Scrollbar */
.amc-scroll::-webkit-scrollbar { width: 3px; }
.amc-scroll::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 999px; }

/* Sidebar — fixed width, never covers more than 42% on larger screens.
   Below 540px there's no room for a permanent column, so it becomes a
   slide-in overlay toggled via the history button in the header instead
   of just disappearing (which used to leave mobile users with no way to
   browse, search, or delete past chats). */
.amc-fs-sidebar {
  width: clamp(180px, 28vw, 260px);
  max-width: 42%;
  flex-shrink: 0;
  border-right: 1px solid var(--bg-border);
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--bg-surface);
}
@media (max-width: 540px) {
  .amc-fs-sidebar {
    position: fixed; inset: 0; z-index: 10001;
    width: 100%; max-width: 100%;
    border-right: none;
    transform: translateX(-100%);
    transition: transform 200ms ease;
  }
  .amc-fs-sidebar.amc-sidebar-mobile-open { transform: translateX(0); }
}
.amc-sidebar-backdrop {
  display: none;
}
@media (max-width: 540px) {
  .amc-sidebar-backdrop.amc-sidebar-mobile-open {
    display: block;
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.45);
  }
}

/* Sidebar search */
.amc-search {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 10px;
  border: 1px solid var(--bg-border); background: var(--bg-muted);
}
.amc-search input {
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 12px; color: var(--text-primary);
}
.amc-search input::placeholder { color: var(--text-muted); }

/* User bubble */
.amc-bubble-user {
  display: inline-block;
  padding: 10px 14px; border-radius: 18px; border-top-right-radius: 5px;
  background: linear-gradient(135deg, var(--accent-blue), #2563eb);
  color: #fff; font-size: 13px; line-height: 1.55;
  max-width: 84%;
}

/* Bot response card */
.amc-bot-card {
  background: var(--bg-muted);
  border: 1px solid var(--bg-border);
  border-radius: 18px; border-top-left-radius: 5px;
  padding: 14px 16px;
  font-size: 13px; line-height: 1.65;
  color: var(--text-primary);
  animation: amc-card-in 200ms ease both;
  max-width: 92%;
}

/* Markdown elements inside bot card */
.amc-heading {
  font-size: 13px; font-weight: 700;
  color: var(--accent-blue);
  margin: 10px 0 4px;
  letter-spacing: 0.01em;
}
.amc-heading:first-child { margin-top: 0; }
.amc-heading1 {
  font-size: 14px; font-weight: 800;
  color: var(--text-primary);
  margin: 10px 0 5px; border-bottom: 1px solid var(--bg-border); padding-bottom: 4px;
}
.amc-para { margin: 4px 0; }
.amc-divider { border: none; border-top: 1px solid var(--bg-border); margin: 10px 0; }

.amc-ul, .amc-ol {
  margin: 5px 0 5px 14px; padding: 0;
  display: flex; flex-direction: column; gap: 3px;
}
.amc-ul { list-style: none; }
.amc-ul li { position: relative; padding-left: 14px; }
.amc-ul li::before {
  content: "▸"; position: absolute; left: 0;
  color: var(--accent-blue); font-size: 10px; top: 3px;
}
.amc-ol { list-style: decimal; }
.amc-ol li { padding-left: 2px; }

.amc-inline-code {
  background: rgba(59,130,246,.12); color: var(--accent-blue);
  padding: 1px 5px; border-radius: 5px; font-size: 11.5px; font-family: monospace;
}

/* Blockquote */
.amc-blockquote {
  border-left: 3px solid var(--accent-blue);
  margin: 8px 0; padding: 6px 12px;
  background: var(--accent-blue-dim);
  border-radius: 0 10px 10px 0;
  font-style: italic; font-size: 12.5px;
  color: var(--text-primary);
}

/* Callouts */
.amc-callout {
  display: flex; gap: 8px; align-items: flex-start;
  padding: 8px 12px; border-radius: 12px; margin: 6px 0;
  font-size: 12.5px;
}
.amc-callout-note  { background: rgba(59,130,246,.1);  border: 1px solid rgba(59,130,246,.25); }
.amc-callout-tip   { background: rgba(16,185,129,.1);  border: 1px solid rgba(16,185,129,.25); }
.amc-callout-important { background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25); }
.amc-callout-warn  { background: rgba(239,68,68,.1);   border: 1px solid rgba(239,68,68,.25); }
.amc-callout-label {
  font-size: 9px; font-weight: 800; letter-spacing: .06em;
  padding: 2px 6px; border-radius: 5px; background: currentColor;
  color: #fff; flex-shrink: 0; align-self: flex-start; margin-top: 1px;
  opacity: .85;
}

/* Memory card */
.amc-memory-card {
  border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(139,92,246,.35);
  margin: 8px 0;
  animation: amc-card-in 200ms ease both;
}
.amc-memory-header {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  background: linear-gradient(135deg, rgba(139,92,246,.25), rgba(59,130,246,.15));
  font-size: 10px; font-weight: 700; letter-spacing: .06em;
  color: #a78bfa; text-transform: uppercase;
}
.amc-memory-body { padding: 8px 12px; display: flex; flex-direction: column; gap: 5px; }
.amc-memory-row {
  display: flex; gap: 8px; align-items: baseline;
  padding-bottom: 5px; border-bottom: 1px solid var(--bg-border);
}
.amc-memory-row:last-child { border-bottom: none; padding-bottom: 0; }
.amc-memory-label {
  font-size: 11px; font-weight: 600; color: #a78bfa;
  min-width: clamp(56px, 24vw, 80px); flex-shrink: 0;
}
.amc-memory-val { font-size: 12px; color: var(--text-primary); }

/* Table */
.amc-table-wrap {
  overflow-x: auto; margin: 8px 0; border-radius: 12px;
  border: 1px solid var(--bg-border);
}
.amc-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
}
.amc-table th {
  background: var(--accent-blue-dim);
  color: var(--accent-blue); font-weight: 700;
  padding: 7px 10px; text-align: left;
  border-bottom: 1px solid rgba(59,130,246,.25);
  white-space: nowrap;
}
.amc-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--bg-border);
  color: var(--text-primary);
}
.amc-table tr:last-child td { border-bottom: none; }
.amc-table tr:nth-child(even) td { background: rgba(0,0,0,.025); }

/* Quote card (user prefill) */
.amc-quote-card {
  border-left: 2px solid var(--accent-blue);
  padding: 8px 12px; border-radius: 0 12px 12px 0;
  background: var(--accent-blue-dim); margin-bottom: 4px;
}
.amc-quote-mark { font-size: 22px; line-height: 1; color: var(--accent-blue); }
.amc-quote-text { font-size: 12px; line-height: 1.5; color: var(--text-primary); margin: 2px 0; }
.amc-quote-src  { font-size: 10px; font-family: monospace; color: var(--text-muted); }

/* Starter buttons */
.amc-starter {
  width: 100%; text-align: left;
  padding: 10px 14px; border-radius: 14px; font-size: 12.5px;
  border: 1px solid var(--bg-border); background: var(--bg-muted);
  color: var(--text-primary); cursor: pointer; transition: all .15s;
  display: flex; align-items: center; gap: 8px;
}
.amc-starter:hover {
  border-color: var(--accent-blue);
  background: var(--accent-blue-dim);
  color: var(--accent-blue);
}

/* Input bar */
.amc-input-bar {
  display: flex; align-items: flex-end; gap: 8px;
  padding: 10px 12px; border-radius: 18px;
  border: 1px solid var(--bg-border); background: var(--bg-muted);
  transition: border-color .15s;
}
.amc-input-bar:focus-within { border-color: var(--accent-blue); }
.amc-send-btn {
  width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--accent-blue); color: var(--text-inverse);
  border: none; cursor: pointer; transition: opacity .15s, transform .1s;
}
.amc-send-btn:disabled { opacity: 0.4; cursor: default; }
.amc-send-btn:not(:disabled):active { transform: scale(0.92); }
@media (max-width: 640px) {
  .amc-send-btn { width: 38px; height: 38px; border-radius: 12px; }
}

/* Read-more */
.amc-readmore {
  font-size: 11px; font-family: monospace;
  color: var(--accent-blue); background: none; border: none;
  padding: 2px 0; cursor: pointer; align-self: flex-start;
}

/* Message entrance */
@keyframes amc-msg-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.amc-msg-enter { animation: amc-msg-fade-in .22s ease-out; }

/* Per-message action row (copy / regenerate) */
.amc-msg-actions {
  display: flex; align-items: center; gap: 4px;
  opacity: 0.55; transition: opacity .15s;
}
.amc-bot-card:hover ~ .amc-msg-actions,
.amc-msg-actions:hover { opacity: 1; }
.amc-msg-action-btn {
  display: flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-family: monospace; font-weight: 500;
  color: var(--text-muted); background: none; border: none;
  padding: 4px 6px; border-radius: 6px; cursor: pointer;
  transition: color .15s, background .15s;
}
.amc-msg-action-btn:hover { color: var(--accent-blue); background: var(--accent-blue-dim); }
@media (max-width: 640px) {
  .amc-msg-actions { opacity: 0.75; }
  .amc-msg-action-btn { padding: 6px 8px; }
}
`;

// ─── QuoteCard ────────────────────────────────────────────────────────────────

const QuoteCard = memo(function QuoteCard({ text, src }) {
  return (
    <div className="amc-quote-card">
      <span className="amc-quote-mark">"</span>
      <p className="amc-quote-text">{text}</p>
      {src && <p className="amc-quote-src">— {src}</p>}
    </div>
  );
});

// ─── Message ──────────────────────────────────────────────────────────────────

const COLLAPSE_LIMIT = 900; // chars before collapsing bot replies

const Message = memo(function Message({ msg, onRegenerate }) {
  const isUser = msg.role === "user";
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const toggle = useCallback(() => setExpanded(v => !v), []);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  }, [msg.content]);

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 items-end">
        <div className="flex flex-col items-end gap-1 max-w-[84%]">
          {msg.quote && <QuoteCard text={msg.quote.text} src={msg.quote.src} />}
          <div className="amc-bubble-user">{msg.content}</div>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
          style={{ background: "var(--accent-blue-dim)", borderColor: "rgba(59,130,246,.25)" }}
        >
          <User size={12} style={{ color: "var(--accent-blue)" }} />
        </div>
      </div>
    );
  }

  // Bot message
  const isLong = msg.content.length > COLLAPSE_LIMIT;
  const displayText = isLong && !expanded
    ? msg.content.slice(0, COLLAPSE_LIMIT)
    : msg.content;

  return (
    <div className="flex gap-2 items-start amc-msg-enter">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 border"
        style={{ background: "var(--bg-muted)", borderColor: "var(--bg-border)" }}
      >
        <Bot size={12} className="text-text-muted" />
      </div>
      <div className="flex flex-col gap-1.5 min-w-0" style={{ maxWidth: "92%" }}>
        <div className="amc-bot-card">
          {renderMarkdown(displayText)}
          {isLong && !expanded && (
            <div style={{
              marginTop: 8, paddingTop: 8,
              borderTop: "1px solid var(--bg-border)"
            }}>
              <button onClick={toggle} className="amc-readmore">Read full answer →</button>
            </div>
          )}
        </div>
        {isLong && expanded && (
          <button onClick={toggle} className="amc-readmore">Show less ↑</button>
        )}
        <div className="amc-msg-actions">
          <button onClick={handleCopy} className="amc-msg-action-btn" aria-label="Copy response">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
          {onRegenerate && (
            <button onClick={onRegenerate} className="amc-msg-action-btn" aria-label="Regenerate response">
              <RotateCw size={12} />
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── ThinkingDots ─────────────────────────────────────────────────────────────

const ThinkingDots = memo(function ThinkingDots() {
  return (
    <div className="flex gap-2 items-center">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
        style={{ background: "var(--bg-muted)", borderColor: "var(--bg-border)" }}
      >
        <Bot size={12} className="text-text-muted" />
      </div>
      <div className="amc-bot-card flex gap-1 items-center py-3" style={{ padding: "10px 16px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--accent-blue)", opacity: 0.6,
              animation: `amc-bounce 1.1s ${i * 0.15}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
});

// ─── ErrorBanner ──────────────────────────────────────────────────────────────

const ErrorBanner = memo(function ErrorBanner({ error }) {
  return (
    <div className="text-[11px] font-mono px-3 py-2 rounded-xl"
      style={{ color: "#fca5a5", background: "rgba(248,113,113,.08)", border: "0.5px solid rgba(248,113,113,.25)" }}>
      {error}
    </div>
  );
});

// ─── ThreadRow ────────────────────────────────────────────────────────────────

const ThreadRow = memo(function ThreadRow({ thread, active, onSelect, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const select = useCallback(() => onSelect(thread.id), [onSelect, thread.id]);
  const confirmDelete = useCallback(e => { e.stopPropagation(); onDelete(thread.id); setConfirm(false); }, [onDelete, thread.id]);
  const cancelDelete = useCallback(e => { e.stopPropagation(); setConfirm(false); }, []);
  const askConfirm = useCallback(e => { e.stopPropagation(); setConfirm(true); }, []);

  return (
    <div onClick={select}
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
        <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-400" onClick={confirmDelete}>del</button>
          <button className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-muted text-text-muted" onClick={cancelDelete}>no</button>
        </div>
      ) : (
        <button className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10" onClick={askConfirm}>
          <Trash2 size={10.5} className="text-text-muted hover:text-red-400" />
        </button>
      )}
    </div>
  );
});

// ─── HistorySidebar ───────────────────────────────────────────────────────────

const HistorySidebar = memo(function HistorySidebar({
  threads, threadsLoading, threadId, onSelect, onDelete, onNew, search, onSearchChange,
  mobileOpen = false, onCloseMobile,
}) {
  const filtered = useMemo(() => {
    if (!search.trim()) return threads;
    const s = search.toLowerCase();
    return threads.filter(t => (t.title || "new chat").toLowerCase().includes(s));
  }, [threads, search]);

  const handleSelect = useCallback((id) => {
    onSelect(id);
    onCloseMobile?.();
  }, [onSelect, onCloseMobile]);

  const handleNew = useCallback(() => {
    onNew();
    onCloseMobile?.();
  }, [onNew, onCloseMobile]);

  return (
    <>
      <div
        className={`amc-sidebar-backdrop ${mobileOpen ? "amc-sidebar-mobile-open" : ""}`}
        onClick={onCloseMobile}
      />
      <div className={`amc-fs-sidebar ${mobileOpen ? "amc-sidebar-mobile-open" : ""}`}>
        <div className="p-3 border-b border-bg-border shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={handleNew}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[12px] font-semibold"
              style={{ border: "1px solid rgba(59,130,246,.3)", color: "var(--accent-blue)", background: "var(--accent-blue-dim)" }}>
              <Plus size={13} /> New chat
            </button>
            {onCloseMobile && (
              <button onClick={onCloseMobile} className="amc-icon-btn sm:hidden"
                style={{ color: "var(--text-muted)" }} aria-label="Close history">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="amc-search">
            <Search size={12} className="shrink-0" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={onSearchChange} placeholder="Search…" />
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
              {search.trim() ? "No chats match." : "No saved chats yet."}
            </p>
          )}
          {filtered.map(t => (
            <ThreadRow key={t.id} thread={t} active={t.id === threadId} onSelect={handleSelect} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </>
  );
});

// ─── ChatMessages ─────────────────────────────────────────────────────────────

const STARTER_ICONS = [BookOpen, Zap, Table2, Brain, Sparkles];

const ChatMessages = memo(function ChatMessages({
  messages, sending, error, threadLoading, isEmpty, starterCount, onStarterClick, bottomRef, onRegenerate,
}) {
  if (threadLoading) {
    return (
      <div className="flex-1 overflow-y-auto amc-scroll px-4 py-4 flex justify-center items-center">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent-blue)" }} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex-1 overflow-y-auto amc-scroll px-4 py-4">
        <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-blue-dim), rgba(139,92,246,.15))", border: "1px solid rgba(59,130,246,.2)" }}>
            <Sparkles size={22} style={{ color: "var(--accent-blue)" }} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-text-primary">Ask your UPSC Mentor</p>
            <p className="text-[11px] text-text-muted font-mono mt-1">Point-to-point answers.</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {STARTER_QUESTIONS.slice(0, starterCount).map((q, i) => {
              const Icon = STARTER_ICONS[i % STARTER_ICONS.length];
              return (
                <button key={i} onClick={() => onStarterClick(q)} className="amc-starter">
                  <Icon size={13} style={{ color: "var(--accent-blue)", flexShrink: 0 }} />
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const lastBotIdx = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role !== "user") return i;
    }
    return -1;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto amc-scroll px-4 py-4 space-y-4">
      {messages.map((m, i) => {
        const isLastBot = m.role !== "user" && i === lastBotIdx && !sending;
        return (
          <Message key={i} msg={m} onRegenerate={isLastBot ? onRegenerate : null} />
        );
      })}
      {sending && <ThinkingDots />}
      {error && <ErrorBanner error={error} />}
      <div ref={bottomRef} />
    </div>
  );
});

// ─── ChatInputWithRef ─────────────────────────────────────────────────────────

const ChatInputWithRef = memo(React.forwardRef(function ChatInputWithRef(
  { onSend, sending, prefillValue, onPrefillConsumed }, ref
) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setValue: v => setInput(v),
  }));

  useEffect(() => {
    if (!prefillValue) return;
    setInput(prefillValue);
    const t = setTimeout(() => {
      textareaRef.current?.focus();
      onPrefillConsumed?.();
    }, 150);
    return () => clearTimeout(t);
  }, [prefillValue]); // eslint-disable-line

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const MAX_PX = window.innerWidth < 640 ? 160 : 200;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_PX);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > MAX_PX ? "auto" : "hidden";
  }, [input]);

  const handleChange = useCallback(e => setInput(e.target.value), []);

  const handleSend = useCallback(() => {
    const msg = input.trim();
    if (!msg || sending) return;
    onSend(msg);
    setInput("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [input, sending, onSend]);

  // Enter alone inserts a newline (default textarea behavior — just let it
  // through). Ctrl+Enter (Cmd+Enter on Mac) sends, since multi-line notes-style
  // messages are now common and accidental sends on Enter were disruptive.
  const handleKey = useCallback(e => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="shrink-0 border-t border-bg-border p-3">
      <div className="amc-input-bar">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="Ask anything… (Ctrl+Enter to send)"
          rows={1}
          style={{ minHeight: 22 }}
          className="flex-1 bg-transparent text-[13px] text-text-primary focus:outline-none placeholder:text-text-muted resize-none"
        />
        <button onClick={handleSend} disabled={!input.trim() || sending} className="amc-send-btn" aria-label="Send message">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
        </button>
      </div>
    </div>
  );
}));

// ─── SignInPrompt ─────────────────────────────────────────────────────────────

const SignInPrompt = memo(function SignInPrompt() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--accent-blue-dim)" }}>
        <Sparkles size={20} style={{ color: "var(--accent-blue)" }} />
      </div>
      <p className="text-[13px] text-text-primary font-medium">Sign in to chat with your AI Mentor</p>
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono"
        style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
        <LogIn size={12} /> Your chats are saved automatically
      </div>
    </div>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIMentorChat({
  contextHint = "",
  isLoggedIn,
  compact = true,
  startExpanded = false,
  openSignal = 0,
  prefill = "",
  quoteMeta = null,
  onClearPrefill = null,
  // Controlled open state — when provided, App.jsx owns open/close
  open: controlledOpen = undefined,
  onOpen = null,
  onClose = null,
}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(!compact || startExpanded);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback((valOrFn) => {
    const next = typeof valOrFn === "function"
      ? valOrFn(isControlled ? controlledOpen : internalOpen)
      : valOrFn;
    if (isControlled) { next ? onOpen?.() : onClose?.(); }
    else { setInternalOpen(next); }
  }, [isControlled, controlledOpen, internalOpen, onOpen, onClose]);
  const [fullScreen, setFullScreen]   = useState(startExpanded);
  const [fabVisible, setFabVisible]   = useState(true);
  const [messages, setMessages]       = useState([]);
  const [sending, setSending]         = useState(false);
  const [error, setError]             = useState(null);
  const [threadId, setThreadId]       = useState(null);
  const [activeTitle, setActiveTitle] = useState("");
  const [threads, setThreads]         = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadLoading, setThreadLoading]   = useState(false);
  const [historySearch, setHistorySearch]   = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const bottomRef       = useRef(null);
  const panelRef        = useRef(null);
  const pendingQuoteRef = useRef(null);
  const skipFirstSignal = useRef(true);
  const inputRef        = useRef(null);
  const prevMsgCount    = useRef(0);
  const isSendingRef    = useRef(false);

  // Scroll only on new messages
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      prevMsgCount.current = messages.length;
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }, [messages]);

  useEffect(() => {
    if (sending) requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  }, [sending]);

  // openSignal → open full-screen
  useEffect(() => {
    if (skipFirstSignal.current) { skipFirstSignal.current = false; return; }
    setOpen(true); setFullScreen(true);
  }, [openSignal]);

  // Prefill
  useEffect(() => {
    if (!prefill || !isLoggedIn) return;
    setOpen(true);
    pendingQuoteRef.current = quoteMeta || null;
    const t = setTimeout(() => { inputRef.current?.setValue(prefill); onClearPrefill?.(); }, 200);
    return () => clearTimeout(t);
  }, [prefill, isLoggedIn]); // eslint-disable-line

  // Click-outside closes compact panel
  useEffect(() => {
    if (!open || fullScreen || !compact) return;
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest("[data-amc-fab]"))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, fullScreen, compact]);

  // Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (fullScreen) setFullScreen(false); else setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, fullScreen]);

  // Thread list
  const loadThreads = useCallback(async () => {
    if (!isLoggedIn) return;
    setThreadsLoading(true);
    try { const res = await listChatThreads(); setThreads(res.threads || []); }
    catch { /* sidebar shows empty state */ }
    finally { setThreadsLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { if (isLoggedIn) loadThreads(); }, [isLoggedIn, loadThreads]);

  const openThread = useCallback(async (id) => {
    if (id === threadId) return;
    setThreadId(id); setMessages([]); setError(null); setThreadLoading(true);
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
      setThreads(prev => prev.filter(t => t.id !== id));
      if (id === threadId) { setThreadId(null); setMessages([]); setActiveTitle(""); }
    } catch { /* ignore */ }
  }, [threadId]);

  const newChat = useCallback(() => {
    setThreadId(null); setMessages([]); setActiveTitle(""); setError(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const send = useCallback(async (text) => {
    const msg = typeof text === "string" ? text.trim() : "";
    if (!msg || isSendingRef.current) return;

    const quote = pendingQuoteRef.current;
    pendingQuoteRef.current = null;

    setError(null);
    setMessages(prev => [...prev, { role: "user", content: msg, quote }]);
    setSending(true);
    isSendingRef.current = true;

    try {
      const res = await chatWithMentor({ message: msg, contextHint, threadId });
      if (!threadId) {
        setThreadId(res.thread_id);
        setActiveTitle(res.title || "New chat");
        loadThreads();
      } else if (res.title) {
        setActiveTitle(res.title);
      }
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
    } catch (e) {
      setError(e.message);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
      isSendingRef.current = false;
    }
  }, [contextHint, threadId, loadThreads]);

  // Drops the trailing assistant reply and re-asks the last user message —
  // used by the "regenerate" button on bot messages. Does NOT touch or
  // duplicate the user bubble itself.
 const regenerate = useCallback(async () => {
  if (isSendingRef.current) return;

  let lastUserMsg = "";

  setMessages(prev => {
    let lastUserIdx = -1;

    for (let i = prev.length - 1; i >= 0; i--) {
      if (prev[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }

    if (lastUserIdx === -1) return prev;

    lastUserMsg = prev[lastUserIdx].content;

    // remove previous assistant response
    return prev.slice(0, lastUserIdx + 1);
  });

  if (!lastUserMsg) return;

  setError(null);
  setSending(true);
  isSendingRef.current = true;

  try {
    const res = await chatWithMentor({
      message: lastUserMsg,
      contextHint,
      threadId,
    });

    if (res.title) setActiveTitle(res.title);

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: res.response,
      },
    ]);
  } catch (e) {
    setError(e.message);
  } finally {
    setSending(false);
    isSendingRef.current = false;
  }
}, [contextHint, threadId]);

  const handleSearchChange = useCallback(e => setHistorySearch(e.target.value), []);
  const closeAll         = useCallback(() => { setOpen(false); setFullScreen(false); }, []);
  const toggleFullScreen = useCallback(() => setFullScreen(v => !v), []);
  const handleOpen       = useCallback(() => { setFabVisible(true); setOpen(true); }, []);

  const isEmpty = messages.length === 0 && !threadLoading;

  const chatContent = isLoggedIn ? (
    <>
      <ChatMessages
        messages={messages} sending={sending} error={error}
        threadLoading={threadLoading} isEmpty={isEmpty}
        starterCount={fullScreen ? 5 : 3}
        onStarterClick={send} bottomRef={bottomRef}
        onRegenerate={regenerate}
      />
      <ChatInputWithRef ref={inputRef} onSend={send} sending={sending} />
    </>
  ) : <SignInPrompt />;

  const sidebarProps = {
    threads, threadsLoading, threadId,
    onSelect: openThread, onDelete: handleDeleteThread,
    onNew: newChat, search: historySearch, onSearchChange: handleSearchChange,
    mobileOpen: mobileSidebarOpen, onCloseMobile: () => setMobileSidebarOpen(false),
  };
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen(v => !v), []);

  // ── Workspace (compact === false) ─────────────────────────────────────────
  if (!compact) {
    return (
      <>
        <style>{AMC_STYLES}</style>
        <div className="amc-workspace">
          <div className="amc-header" style={{ borderRadius: 0 }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,.15)" }}>
              <Sparkles size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-tight truncate">{activeTitle || "UPSC AI Mentor"}</p>
              <p className="text-[10px] opacity-70 font-mono">Point-to-point answers</p>
            </div>
            <button onClick={toggleMobileSidebar} className="amc-icon-btn amc-mobile-history-btn" aria-label="Chat history">
              <MessageSquare size={16} />
            </button>
            <button onClick={newChat} className="amc-icon-btn"><Plus size={16} /></button>
          </div>
          <div className="amc-workspace-body">
            <HistorySidebar {...sidebarProps} />
            <div className="amc-workspace-chat">{chatContent}</div>
          </div>
        </div>
      </>
    );
  }

  // ── Compact / floating ───────────────────────────────────────────────────
  if (!fabVisible) return null;

  return (
    <>
      <style>{AMC_STYLES}</style>
      <div className="amc-dock">
        {open && (
          <div
            ref={panelRef}
            className="amc-panel"
            style={fullScreen
              ? {
                  position: "fixed", inset: 0, borderRadius: 0,
                  zIndex: 10002, animation: "none",
                  display: "flex", flexDirection: "row",
                }
              : {
                  width: "min(420px, calc(100vw - 32px))",
                  height: "min(620px, calc(100dvh - 100px))",
                  zIndex: 10002,
                }
            }
          >
            {fullScreen && <HistorySidebar {...sidebarProps} />}

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
              <div className="amc-header">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,.15)" }}>
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-tight truncate">{activeTitle || "UPSC AI Mentor"}</p>
                  <p className="text-[10px] opacity-70 font-mono">Point-to-point answers</p>
                </div>
                <button onClick={newChat} className="amc-icon-btn"><Plus size={16} /></button>
                {fullScreen && (
                  <button onClick={toggleMobileSidebar} className="amc-icon-btn amc-mobile-history-btn" aria-label="Chat history">
                    <MessageSquare size={15} />
                  </button>
                )}
                <button onClick={toggleFullScreen} className="amc-icon-btn">
                  {fullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button onClick={closeAll} className="amc-icon-btn"><X size={15} /></button>
              </div>
              {chatContent}
            </div>
          </div>
        )}

        <div className="amc-fab-row">
          {!open && (
            <button
              className="amc-fab-dismiss"
              onClick={() => setFabVisible(false)}
              aria-label="Hide AI Mentor"
            >
              <X size={13} />
            </button>
          )}
          <button data-amc-fab onClick={handleOpen} className="amc-fab" aria-label="Open AI Mentor">
            <Sparkles size={22} />
          </button>
        </div>
      </div>
    </>
  );

  }