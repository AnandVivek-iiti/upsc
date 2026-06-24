import React, {
  useState, useRef, useEffect, useCallback, useMemo, memo,
} from "react";
import {
  Plus, Search, Trash2, X, ChevronLeft, Clock, Check, Loader2,
  Sparkles, AlertTriangle, Zap, Wand2, Eye, EyeOff, Copy,
  RotateCcw, GraduationCap, LogIn, NotebookPen, BookOpen,
  ListFilter, PenLine, History,
} from "lucide-react";
import {
  improveNotes, findMistakesInNotes, generateRevisionNotes, convertToMainsFormat,
} from "../../hooks/useAI";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "upsc_notes_v1";
const AUTOSAVE_DEBOUNCE_MS = 1400;
const MIN_CONTENT_FOR_AI = 40;
const UNDO_SNAPSHOT_DEBOUNCE_MS = 2000; // push a snapshot every 2s of inactivity
const MAX_UNDO_DEPTH = 40;

const TOPICS = [
  { id: "polity", label: "Polity", color: "#f87171" },
  { id: "history", label: "History", color: "#c084fc" },
  { id: "economy", label: "Economy", color: "#34d399" },
  { id: "geography", label: "Geography", color: "#60a5fa" },
  { id: "sociology", label: "Sociology", color: "#5eead4" },
  { id: "ethics", label: "Ethics", color: "#f59e0b" },
  { id: "environment", label: "Environment", color: "#84cc16" },
  { id: "scitech", label: "Science & Tech", color: "#f9a8d4" },
];

const AI_ACTIONS = [
  { id: "improve",  label: "Improve Notes",          short: "Improve",  icon: Wand2,         fn: improveNotes,         accent: "#60a5fa", versionKey: "enhanced" },
  { id: "mistakes", label: "Find Mistakes",           short: "Mistakes", icon: AlertTriangle, fn: findMistakesInNotes,  accent: "#f59e0b", versionKey: null        },
  { id: "revision", label: "Generate Revision Notes", short: "Revise",   icon: Zap,           fn: generateRevisionNotes,accent: "#34d399", versionKey: "revision"  },
  { id: "mains",    label: "Convert to Mains Format", short: "Mains",    icon: GraduationCap, fn: convertToMainsFormat, accent: "#a78bfa", versionKey: "mains"     },
];

// Version tabs shown in the editor (original is always first)
const VERSION_TABS = [
  { key: "original",  label: "Original",  color: "var(--text-muted)" },
  { key: "enhanced",  label: "Enhanced",  color: "#60a5fa" },
  { key: "revision",  label: "Revision",  color: "#34d399" },
  { key: "mains",     label: "Mains",     color: "#a78bfa" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function uid() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadNotesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistNotesToStorage(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function wordCount(text) {
  const t = (text || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

function topicMeta(id) {
  return TOPICS.find(t => t.id === id) || null;
}

function snippet(text, max = 86) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "No content yet.";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function clampScore(n) {
  const v = Number(n);
  return Math.max(0, Math.min(10, Number.isFinite(v) ? v : 0));
}

function scoreColor(v) {
  if (v >= 8) return "#34d399";
  if (v >= 6) return "#f59e0b";
  return "#f87171";
}

function sanitizeAIError(raw) {
  if (!raw) return "Something went wrong. Try again.";
  console.warn("[AI Mentor] raw error:", raw);
  if (/429|quota|rate limit|too many requests/i.test(raw)) {
    return "Your AI mentor hit a provider's rate limit. This usually clears in a few seconds — tap Regenerate to try again (it'll automatically try a different model).";
  }
  if (/too short|low-effort/i.test(raw)) {
    return "That attempt came back too thin to be useful. Tap Regenerate — it'll try a stronger model.";
  }
  if (/network|fetch failed|econnreset|timeout|enotfound/i.test(raw)) {
    return "Couldn't reach the AI mentor. Check your connection and tap Regenerate.";
  }
  if (/no ai providers configured|all ai providers failed/i.test(raw)) {
    return "The AI mentor is unavailable right now — no AI provider could complete this request. Please try again shortly.";
  }
  return "Something went wrong on the AI mentor's end. Tap Regenerate, or try again in a moment.";
}

// ─── Markdown‑lite renderer (reading mode) ─────────────────────────────────

function inlineFormat(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let k = 0;
  while (remaining.length) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/s);
    const candidates = [
      boldMatch && { idx: boldMatch[1].length, type: "bold", m: boldMatch },
      codeMatch && { idx: codeMatch[1].length, type: "code", m: codeMatch },
    ].filter(Boolean);
    if (!candidates.length) break;
    candidates.sort((a, b) => a.idx - b.idx);
    const winner = candidates[0];
    if (winner.m[1]) parts.push(<span key={k++}>{winner.m[1]}</span>);
    if (winner.type === "bold") parts.push(<strong key={k++}>{winner.m[2]}</strong>);
    else parts.push(<code key={k++} className="mn-inline-code">{winner.m[2]}</code>);
    remaining = winner.m[3];
  }
  if (remaining) parts.push(<span key={k++}>{remaining}</span>);
  return parts.length ? parts : text;
}

function renderRich(text) {
  if (!text) return null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const elements = [];
  let i = 0;
  let keyCounter = 0;
  const key = () => keyCounter++;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (line.trim().startsWith(":::memory")) {
      const cardLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) { cardLines.push(lines[i]); i++; }
      i++;
      elements.push(
        <div key={key()} className="mn-memory-card">
          <div className="mn-memory-header"><Sparkles size={11} /> Quick Recall</div>
          <div className="mn-memory-body">
            {cardLines.map((cl, ci) => {
              const trimmed = cl.trim();
              if (!trimmed) return null;
              const [label, ...rest] = trimmed.split(":");
              if (rest.length) {
                return (
                  <div key={ci} className="mn-memory-row">
                    <span className="mn-memory-label">{label.replace(/^[-•]\s*/, "")}</span>
                    <span className="mn-memory-val">{rest.join(":").trim()}</span>
                  </div>
                );
              }
              return <div key={ci} className="mn-memory-row"><span className="mn-memory-val">{trimmed.replace(/^[-•]\s*/, "")}</span></div>;
            })}
          </div>
        </div>
      );
      continue;
    }

    if (/^\[!(NOTE|TIP|IMPORTANT|WARN)\]/.test(line.trim())) {
      const match = line.match(/^\[!(NOTE|TIP|IMPORTANT|WARN)\]\s*(.*)/);
      const type = match[1].toLowerCase();
      elements.push(
        <div key={key()} className={`mn-callout mn-callout-${type}`}>
          <span className="mn-callout-label">{match[1]}</span>
          <span>{inlineFormat(match[2] || "")}</span>
        </div>
      );
      i++; continue;
    }

    if (/^##\s/.test(line)) {
      elements.push(<p key={key()} className="mn-heading">{line.replace(/^##\s/, "")}</p>);
      i++; continue;
    }
    if (/^#\s/.test(line)) {
      elements.push(<p key={key()} className="mn-heading1">{line.replace(/^#\s/, "")}</p>);
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={key()} className="mn-divider" />); i++; continue; }

    if (/^[-•*]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•*]\s/, "")); i++;
      }
      elements.push(<ul key={key()} className="mn-ul">{items.map((it, ii) => <li key={ii}>{inlineFormat(it)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, "")); i++;
      }
      elements.push(<ol key={key()} className="mn-ol">{items.map((it, ii) => <li key={ii}>{inlineFormat(it)}</li>)}</ol>);
      continue;
    }

    elements.push(<p key={key()} className="mn-para">{inlineFormat(line)}</p>);
    i++;
  }
  return elements;
}

// ─── New: Premium AI content renderer ──────────────────────────────────────

function renderAIContent(text, { actionId = null } = {}) {
  if (!text) return null;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  const renderInline = (str) => inlineFormat(str);

  const renderBlock = (block) => {
    switch (block.type) {
      case 'heading':
        return <div key={block._key} className={`mn-ai-heading mn-ai-heading-${block.level}`}>{renderInline(block.text)}</div>;
      case 'paragraph':
        return <p key={block._key} className="mn-ai-para">{renderInline(block.text)}</p>;
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return <ListTag key={block._key} className={`mn-ai-list ${block.ordered ? 'mn-ai-ol' : 'mn-ai-ul'}`}>
          {block.items.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}
        </ListTag>;
      case 'table':
        return (
          <div key={block._key} className="mn-ai-table-wrap">
            <table className="mn-ai-table">
              <thead><tr>{block.headers.map((h, idx) => <th key={idx}>{renderInline(h)}</th>)}</tr></thead>
              <tbody>{block.rows.map((row, idx) => <tr key={idx}>{row.map((cell, j) => <td key={j}>{renderInline(cell)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      case 'special':
        const icons = {
          INTRODUCTION: '📌',
          BODY: '📚',
          CONCLUSION: '🎯',
          'WAY FORWARD': '🚀',
        };
        const icon = icons[block.label] || '📌';
        const labelDisplay = block.label.charAt(0) + block.label.slice(1).toLowerCase();
        return (
          <div key={block._key} className="mn-ai-special-card">
            <div className="mn-ai-special-header">
              <span className="mn-ai-special-icon">{icon}</span>
              <span className="mn-ai-special-label">{labelDisplay}</span>
            </div>
            <div className="mn-ai-special-body">
              {block.content.map((subBlock, idx) => renderBlock({ ...subBlock, _key: `special-${idx}` }))}
            </div>
          </div>
        );
      case 'memory-card':
        const cardLines = block.content.map(l => l.trim()).filter(Boolean);
        return (
          <div key={block._key} className="mn-memory-card">
            <div className="mn-memory-header"><Sparkles size={11} /> {block.title}</div>
            <div className="mn-memory-body">
              {cardLines.map((cl, ci) => {
                const [label, ...rest] = cl.split(":");
                if (rest.length) {
                  return (
                    <div key={ci} className="mn-memory-row">
                      <span className="mn-memory-label">{label.replace(/^[-•]\s*/, "")}</span>
                      <span className="mn-memory-val">{rest.join(":").trim()}</span>
                    </div>
                  );
                }
                return <div key={ci} className="mn-memory-row"><span className="mn-memory-val">{cl.replace(/^[-•]\s*/, "")}</span></div>;
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const revisionKeywords = ['quick recall', 'important facts', 'exam traps', 'pyq linkages', '30 second revision'];
      if (revisionKeywords.some(kw => text.toLowerCase().includes(kw))) {
        const cardContent = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextTrim = nextLine.trim();
          if (!nextTrim || /^#{1,3}\s/.test(nextTrim)) break;
          cardContent.push(nextLine);
          i++;
        }
        blocks.push({ type: 'memory-card', title: text, content: cardContent, _key: `memory-${blocks.length}` });
        continue;
      }
      blocks.push({ type: 'heading', level, text, _key: `h-${blocks.length}` });
      i++;
      continue;
    }

    // Special sections
    const specialMatch = trimmed.match(/^(INTRODUCTION|BODY|CONCLUSION|WAY FORWARD)\s*:\s*$/i);
    if (specialMatch) {
      const label = specialMatch[1].toUpperCase();
      i++;
      const contentBlocks = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        const nextTrim = nextLine.trim();
        if (!nextTrim) { i++; continue; }
        if (/^(INTRODUCTION|BODY|CONCLUSION|WAY FORWARD)\s*:\s*$/i.test(nextTrim) || /^#{1,3}\s/.test(nextTrim)) {
          break;
        }
        contentBlocks.push({ type: 'paragraph', text: nextLine, _key: `special-${blocks.length}-${contentBlocks.length}` });
        i++;
      }
      blocks.push({ type: 'special', label, content: contentBlocks, _key: `special-${blocks.length}` });
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && /^\|[\s\-:]+\|$/.test(lines[i + 1].trim())) {
      const headers = trimmed.slice(1, -1).split('|').map(s => s.trim());
      i += 2;
      const rows = [];
      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;
        const cells = rowLine.slice(1, -1).split('|').map(s => s.trim());
        rows.push(cells);
        i++;
      }
      blocks.push({ type: 'table', headers, rows, _key: `table-${blocks.length}` });
      continue;
    }

    // Lists
    const listMatch = trimmed.match(/^(\d+\.\s|[-•*]\s)/);
    if (listMatch) {
      const isOrdered = !!listMatch[1].match(/^\d/);
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const lTrim = l.trim();
        if (!lTrim) break;
        const m = lTrim.match(/^(\d+\.\s|[-•*]\s)(.*)/);
        if (!m) break;
        items.push(m[2].trim());
        i++;
      }
      blocks.push({ type: 'list', ordered: isOrdered, items, _key: `list-${blocks.length}` });
      continue;
    }

    // Paragraph (may span multiple lines)
    let paraLines = [];
    while (i < lines.length) {
      const l = lines[i];
      const lTrim = l.trim();
      if (!lTrim) break;
      if (/^#{1,3}\s/.test(lTrim) || /^(\d+\.\s|[-•*]\s)/.test(lTrim) || /^\|.*\|$/.test(lTrim) || /^(INTRODUCTION|BODY|CONCLUSION|WAY FORWARD)\s*:\s*$/i.test(lTrim)) {
        break;
      }
      paraLines.push(l);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n'), _key: `p-${blocks.length}` });
    }
  }

  const rendered = blocks.map((block, idx) => renderBlock({ ...block, _key: block._key || idx }));
  return <div className="mn-ai-content">{rendered}</div>;
}

// ─── "Find Mistakes" structured‑report parser ───────────────────────────────

function parseMistakesReport(raw) {
  if (!raw) return null;
  const k = (raw.match(/SCORE_KNOWLEDGE:\s*(\d{1,2})/i) || [])[1];
  const c = (raw.match(/SCORE_CLARITY:\s*(\d{1,2})/i) || [])[1];
  const r = (raw.match(/SCORE_RETENTION:\s*(\d{1,2})/i) || [])[1];
  if (k === undefined || c === undefined || r === undefined) return null;

  const section = (label, stopLabels) => {
    const stop = stopLabels.length ? `(?:${stopLabels.join("|")})` : "$";
    const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=${stop})`, "i");
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };
  const missingRaw = section("MISSING", ["TRAPS:", "REVISION:"]);
  const trapsRaw = section("TRAPS", ["REVISION:"]);
  const revisionRaw = section("REVISION", []);

  const toList = (block) => block.split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

  return {
    knowledge: clampScore(k),
    clarity: clampScore(c),
    retention: clampScore(r),
    missing: toList(missingRaw),
    traps: toList(trapsRaw),
    revision: revisionRaw.replace(/^[-•*]\s*/, ""),
  };
}

function mistakesReportToText(report) {
  if (!report) return "";
  return [
    `Knowledge Accuracy: ${report.knowledge}/10`,
    `Conceptual Clarity: ${report.clarity}/10`,
    `Retention Potential: ${report.retention}/10`,
    "",
    "Important Missing Points:",
    ...report.missing.map(m => `- ${m}`),
    "",
    "Memory Traps:",
    ...report.traps.map(t => `- ${t}`),
    "",
    "30 Second Revision:",
    report.revision,
  ].join("\n");
}

// ─── Static styles ────────────────────────────────────────────────────────────

const MN_STYLES = `
@keyframes mn-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes mn-pop  { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes mn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mn-pulse-dot { 0%,80%,100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
@keyframes mn-bar-fill { from { width: 0%; } }

.mn-workspace {
  height: 100%; min-height: 100vh; width: 100%; max-width: 100%;
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--bg-base); box-sizing: border-box;
}
.mn-workspace *, .mn-workspace *::before, .mn-workspace *::after { box-sizing: border-box; min-width: 0; }

.mn-header {
  flex-shrink: 0; display: flex; align-items: center; gap: 10px;
  padding: max(14px, env(safe-area-inset-top)) clamp(14px, 3vw, 22px) 14px;
  border-bottom: 1px solid var(--bg-border);
  background: var(--bg-surface);
}
.mn-header-icon {
  width: 34px; height: 34px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent-gold-dim), rgba(245,158,11,.08));
  border: 1px solid rgba(245,158,11,.25); color: var(--accent-gold);
}

.mn-body { flex: 1; display: flex; overflow: hidden; min-height: 0; min-width: 0; }

/* Sidebar */
.mn-sidebar {
  width: 100%; flex-shrink: 0; flex-direction: column; overflow: hidden;
  border-right: 1px solid var(--bg-border); background: var(--bg-surface);
}
@media (min-width: 1024px) { .mn-sidebar { width: min(320px, 30vw); } }
@media (min-width: 1440px) { .mn-sidebar { width: 340px; } }

.mn-search {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 12px; border-radius: 12px;
  border: 1px solid var(--bg-border); background: var(--bg-muted);
}
.mn-search input { flex: 1; background: transparent; border: none; outline: none; font-size: 13px; color: var(--text-primary); min-width: 0; }
.mn-search input::placeholder { color: var(--text-muted); }

.mn-topic-rail { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.mn-topic-rail::-webkit-scrollbar { display: none; }
@media (min-width: 480px) { .mn-topic-rail { flex-wrap: wrap; overflow-x: visible; } }

.mn-chip {
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 6px 11px; border-radius: 20px; font-size: 11.5px; font-weight: 600;
  border: 1px solid var(--bg-border); background: var(--bg-muted); color: var(--text-secondary);
  cursor: pointer; transition: all .15s ease; white-space: nowrap;
  min-height: 30px;
}
.mn-chip:active { transform: scale(0.96); }
.mn-chip-dot { width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0; }

.mn-scroll::-webkit-scrollbar { width: 4px; }
.mn-scroll::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 999px; }

/* Note row */
.mn-note-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 12px; border-radius: 14px; cursor: pointer;
  border: 1px solid transparent; transition: background-color .15s, border-color .15s;
  min-height: 44px;
}
.mn-note-row:hover { background: var(--bg-muted); }
.mn-note-row.active { background: var(--accent-gold-dim); border-color: rgba(245,158,11,.25); }
.mn-note-bar { width: 3px; align-self: stretch; border-radius: 999px; flex-shrink: 0; min-height: 36px; }

/* Editor pane */
.mn-editor { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-base); }

.mn-toolbar { flex-shrink: 0; border-bottom: 1px solid var(--bg-border); background: var(--bg-surface); }

.mn-title-input {
  width: 100%; border: none; outline: none; background: transparent;
  font-size: clamp(18px, 2.4vw, 22px); font-weight: 700; color: var(--text-primary);
  line-height: 1.3;
}
.mn-title-input::placeholder { color: var(--text-muted); font-weight: 600; }

.mn-content-area { flex: 1; overflow-y: auto; min-height: 0; }
.mn-content-inner { max-width: 800px; margin: 0 auto; width: 100%; height: 100%; }

.mn-textarea {
  width: 100%; height: 100%; border: none; outline: none; resize: none; background: transparent;
  color: var(--text-primary); font-size: clamp(14.5px, 1.6vw, 15.5px); line-height: 1.85;
  font-family: inherit;
}
.mn-textarea::placeholder { color: var(--text-muted); }

/* Reading mode */
.mn-reading { max-width: 680px; margin: 0 auto; }
.mn-reading .mn-para { font-size: 16px; line-height: 1.9; color: var(--text-primary); margin: 10px 0; }
.mn-reading .mn-heading1 { font-size: 22px; margin-top: 20px; }
.mn-reading .mn-heading { font-size: 17px; margin-top: 18px; }

/* Rich text shared classes */
.mn-heading { font-size: 13.5px; font-weight: 700; color: var(--accent-gold); margin: 14px 0 5px; letter-spacing: .01em; }
.mn-heading:first-child { margin-top: 0; }
.mn-heading1 { font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 14px 0 6px; border-bottom: 1px solid var(--bg-border); padding-bottom: 5px; }
.mn-para { margin: 5px 0; color: var(--text-primary); line-height: 1.7; font-size: 13.5px; overflow-wrap: anywhere; }
.mn-divider { border: none; border-top: 1px solid var(--bg-border); margin: 14px 0; }
.mn-ul, .mn-ol { margin: 6px 0 6px 16px; padding: 0; display: flex; flex-direction: column; gap: 4px; max-width: 100%; }
.mn-ul { list-style: none; }
.mn-ul li { position: relative; padding-left: 15px; font-size: 13.5px; color: var(--text-primary); line-height: 1.6; overflow-wrap: anywhere; }
.mn-ul li::before { content: "▸"; position: absolute; left: 0; color: var(--accent-gold); font-size: 10px; top: 3px; }
.mn-ol { list-style: decimal; }
.mn-ol li { padding-left: 2px; font-size: 13.5px; color: var(--text-primary); line-height: 1.6; overflow-wrap: anywhere; }
.mn-inline-code { background: rgba(245,158,11,.12); color: var(--accent-gold); padding: 1px 5px; border-radius: 5px; font-size: 12px; font-family: monospace; overflow-wrap: anywhere; }

.mn-memory-card { border-radius: 14px; overflow: hidden; border: 1px solid rgba(139,92,246,.35); margin: 10px 0; max-width: 100%; }
.mn-memory-header { display: flex; align-items: center; gap: 6px; padding: 7px 12px; background: linear-gradient(135deg, rgba(139,92,246,.22), rgba(59,130,246,.13)); font-size: 10px; font-weight: 700; letter-spacing: .06em; color: #a78bfa; text-transform: uppercase; }
.mn-memory-body { padding: 9px 12px; display: flex; flex-direction: column; gap: 6px; }
.mn-memory-row { display: flex; gap: 8px; align-items: baseline; padding-bottom: 6px; border-bottom: 1px solid var(--bg-border); flex-wrap: wrap; }
.mn-memory-row:last-child { border-bottom: none; padding-bottom: 0; }
.mn-memory-label { font-size: 11.5px; font-weight: 600; color: #a78bfa; min-width: clamp(64px, 36%, 96px); flex-shrink: 0; }
.mn-memory-val { font-size: 12.5px; color: var(--text-primary); overflow-wrap: anywhere; flex: 1; min-width: 60px; }

.mn-callout { display: flex; gap: 8px; align-items: flex-start; padding: 9px 12px; border-radius: 12px; margin: 8px 0; font-size: 13px; overflow-wrap: anywhere; }
.mn-callout-note { background: rgba(59,130,246,.1); border: 1px solid rgba(59,130,246,.25); }
.mn-callout-tip { background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25); }
.mn-callout-important { background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25); }
.mn-callout-warn { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25); }
.mn-callout-label { font-size: 9px; font-weight: 800; letter-spacing: .06em; padding: 2px 6px; border-radius: 5px; background: currentColor; color: #fff; flex-shrink: 0; align-self: flex-start; margin-top: 1px; opacity: .85; }

/* ---- Premium AI content styling (responsive, clamp-based for small phones) ---- */
.mn-ai-content {
  font-size: clamp(13.5px, 3.6vw, 15px);
  line-height: 1.75;
  color: var(--text-primary);
}
.mn-ai-content .mn-ai-heading {
  font-weight: 700;
  margin: 1.2em 0 0.4em;
  line-height: 1.3;
}
.mn-ai-content .mn-ai-heading-1 {
  font-size: clamp(19px, 5.2vw, 23px);
  border-bottom: 2px solid var(--bg-border);
  padding-bottom: 0.3em;
}
.mn-ai-content .mn-ai-heading-2 {
  font-size: clamp(17px, 4.4vw, 19.5px);
}
.mn-ai-content .mn-ai-heading-3 {
  font-size: clamp(15px, 3.8vw, 16.5px);
  color: var(--accent-gold);
}
.mn-ai-content .mn-ai-para {
  margin: 0.6em 0;
  line-height: 1.75;
}
.mn-ai-content .mn-ai-list {
  margin: 0.6em 0 0.6em 1.5em;
  padding: 0;
}
.mn-ai-content .mn-ai-ul {
  list-style: none;
}
.mn-ai-content .mn-ai-ul li {
  padding-left: 0.1em;
}
.mn-ai-content .mn-ai-ul li::before {
  content: "▸";
  color: var(--accent-gold);
  margin-right: 0.5em;
}
.mn-ai-content .mn-ai-ol {
  list-style: decimal;
}
.mn-ai-content .mn-ai-list li {
  margin-bottom: 0.35em;
  overflow-wrap: anywhere;
}
.mn-ai-content .mn-ai-table-wrap {
  overflow-x: auto;
  margin: 1em 0;
  -webkit-overflow-scrolling: touch;
  border-radius: 10px;
}
.mn-ai-content .mn-ai-table {
  width: 100%;
  border-collapse: collapse;
  font-size: clamp(12px, 3.2vw, 13.5px);
}
.mn-ai-content .mn-ai-table th,
.mn-ai-content .mn-ai-table td {
  border: 1px solid var(--bg-border);
  padding: 0.5em 0.7em;
  text-align: left;
}
.mn-ai-content .mn-ai-table th {
  background: var(--bg-muted);
  font-weight: 700;
}
.mn-ai-content .mn-ai-special-card {
  border-radius: 16px;
  border: 1px solid rgba(245,158,11,0.25);
  background: var(--bg-surface);
  margin: 1.2em 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.mn-ai-content .mn-ai-special-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75em 1.1em;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(167,139,250,0.05));
  border-bottom: 1px solid var(--bg-border);
  font-weight: 700;
  font-size: clamp(14.5px, 3.8vw, 16px);
}
.mn-ai-content .mn-ai-special-icon {
  font-size: 1.15em;
}
.mn-ai-content .mn-ai-special-body {
  padding: 0.8em 1.1em 1.1em;
}
.mn-ai-content .mn-ai-special-body .mn-ai-para:last-child {
  margin-bottom: 0;
}
.mn-ai-content .mn-ai-special-body .mn-ai-list:last-child {
  margin-bottom: 0;
}
.mn-ai-content .mn-memory-card {
  margin: 1.2em 0;
}

.mn-save-dot { width: 6px; height: 6px; border-radius: 999px; flex-shrink: 0; }

/* Version tab bar */
.mn-version-tab-bar {
  display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none;
  padding: 0 16px; border-bottom: 1px solid var(--bg-border); background: var(--bg-surface);
  flex-shrink: 0; min-height: 38px;
}
.mn-version-tab-bar::-webkit-scrollbar { display: none; }
.mn-version-tab {
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 7px 12px; font-size: 11.5px; font-weight: 600; border: none; background: transparent;
  color: var(--text-muted); cursor: pointer; position: relative; white-space: nowrap;
  transition: color .15s ease; border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.mn-version-tab:hover { color: var(--text-primary); }
.mn-version-tab.active { color: var(--tab-color, var(--text-primary)); border-bottom-color: var(--tab-color, var(--text-primary)); }
.mn-version-tab-dot { width: 6px; height: 6px; border-radius: 999px; flex-shrink: 0; }
.mn-version-tab-clear {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 999px; border: none; background: rgba(255,255,255,.12);
  color: inherit; cursor: pointer; opacity: .7; padding: 0; flex-shrink: 0;
  transition: opacity .15s, background .15s;
}
.mn-version-tab-clear:hover { opacity: 1; background: rgba(255,255,255,.22); }

/* Version content panel */
.mn-version-content { max-width: 800px; margin: 0 auto; width: 100%; animation: mn-rise 200ms ease both; }
.mn-version-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: 32px 20px; gap: 16px; }
.mn-version-empty-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* AI action rail */
.mn-ai-rail { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.mn-ai-rail::-webkit-scrollbar { display: none; }
@media (min-width: 640px) { .mn-ai-rail { flex-wrap: wrap; overflow-x: visible; } }
.mn-ai-btn {
  display: flex; align-items: center; gap: 7px; flex-shrink: 0;
  padding: 9px 14px; border-radius: 13px; font-size: 12.5px; font-weight: 600;
  border: 1px solid var(--bg-border); background: var(--bg-surface); color: var(--text-primary);
  cursor: pointer; transition: all .15s ease; min-height: 40px;
}
.mn-ai-btn:hover { border-color: var(--ai-accent, var(--accent-blue)); color: var(--ai-accent, var(--accent-blue)); }
.mn-ai-btn:active { transform: scale(0.97); }
.mn-ai-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.mn-ai-btn:disabled:hover { border-color: var(--bg-border); color: var(--text-primary); }

/* Drawer / modal ─────────────────────────────────────────────────────────
   Mobile: a near-fullscreen sheet that starts just under the status bar
   ("start from top") and always leaves a 10px gap above the device's
   bottom edge / the host app's bottom nav bar ("margin from bottom"),
   so the footer action row is never hidden underneath it.
   --bottom-nav-height can be set by the host app; 60px is a sane fallback. */
.mn-drawer-backdrop {
  position: fixed; inset: 0; z-index: 9990; background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px); animation: mn-fade 160ms ease both;
}
.mn-drawer {
  position: fixed; z-index: 9991; background: var(--bg-surface);
  display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--bg-border);
  left: 0; right: 0; width: 100%;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  bottom: calc(var(--bottom-nav-height, 60px) + 10px + env(safe-area-inset-bottom, 0px));
  border-radius: 22px;
  animation: mn-pop 220ms cubic-bezier(0.22,1,0.36,1) both;
  box-shadow: var(--shadow-lg);
}
@media (min-width: 768px) {
  .mn-drawer {
    left: 50%; right: auto; transform: translateX(-50%);
    top: 24px; bottom: 24px;
    width: min(700px, calc(100vw - 48px));
    max-height: calc(100dvh - 48px);
    --bottom-nav-height: 0px;
  }
}

.mn-drawer-handle { display: flex; justify-content: center; flex-shrink: 0; padding: 9px 0 2px; }
.mn-drawer-handle span { width: 34px; height: 4px; border-radius: 999px; background: var(--bg-border); }
@media (min-width: 768px) { .mn-drawer-handle { display: none; } }

.mn-drawer-header { flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: 10px 18px 14px; border-bottom: 1px solid var(--bg-border); }
.mn-drawer-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 16px 18px 20px; min-height: 0; overflow-wrap: anywhere; }
.mn-drawer-footer {
  flex-shrink: 0; display: flex; align-items: center; gap: 8px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--bg-border); background: var(--bg-surface); flex-wrap: wrap;
}
.mn-drawer-footer .mn-pill-btn { flex: 1 1 auto; justify-content: center; }
.mn-drawer-footer .mn-pill-btn-primary,
.mn-drawer-footer .mn-pill-btn-full { flex: 1 1 100%; order: 99; }
@media (min-width: 480px) {
  .mn-drawer-footer .mn-pill-btn-primary,
  .mn-drawer-footer .mn-pill-btn-full { flex: 1 1 auto; order: initial; }
}

.mn-pill-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border-radius: 11px; font-size: 12.5px; font-weight: 600;
  border: 1px solid var(--bg-border); background: var(--bg-muted); color: var(--text-primary);
  cursor: pointer; transition: all .15s ease; min-height: 40px;
}
.mn-pill-btn:hover { background: var(--bg-border); }
.mn-pill-btn:active { transform: scale(0.97); }
.mn-pill-btn-primary { background: var(--accent-blue); color: #fff; border-color: transparent; }
.mn-pill-btn-primary:hover { background: #2563eb; opacity: 1; }
.mn-pill-btn-armed { background: var(--accent-red); color: #fff; border-color: transparent; }

/* Score bars */
.mn-score-row { display: flex; align-items: center; gap: 8px; margin-bottom: 11px; flex-wrap: wrap; row-gap: 4px; }
.mn-score-label { width: clamp(92px, 38%, 132px); flex-shrink: 0; font-size: 11.5px; font-weight: 600; color: var(--text-secondary); line-height: 1.25; }
.mn-score-track { flex: 1; min-width: 80px; height: 7px; border-radius: 999px; background: var(--bg-muted); overflow: hidden; }
.mn-score-fill { height: 100%; border-radius: 999px; animation: mn-bar-fill 600ms cubic-bezier(.22,1,.36,1) both; }
.mn-score-val { width: 30px; flex-shrink: 0; text-align: right; font-size: 11.5px; font-weight: 700; font-family: monospace; }

.mn-revision-box {
  border-radius: 16px; padding: 14px 16px; margin-top: 6px;
  background: linear-gradient(135deg, var(--accent-gold-dim), rgba(245,158,11,.04));
  border: 1px solid rgba(245,158,11,.3);
}

/* Buttons / icon buttons */
.mn-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
  color: var(--text-muted); background: transparent; border: none; cursor: pointer;
  transition: background-color .15s, color .15s;
}
.mn-icon-btn:hover { background: var(--bg-muted); color: var(--text-primary); }

/* Empty states */
.mn-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: 32px 20px; gap: 16px; max-width: 100%; }
.mn-empty-icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--accent-gold-dim), rgba(167,139,250,.12)); border: 1px solid rgba(245,158,11,.2); flex-shrink: 0; }

@media (max-width: 1023px) {
  .mn-mobile-ai-bar {
    position: sticky;
    bottom: 0;
    z-index: 20;
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
    background: var(--bg-surface);
    border-top: 1px solid var(--bg-border);
  }
  .mn-content-area {
    padding-bottom: 120px !important;
  }
}
@media (max-width: 374px) {
  .mn-header { padding-left: 12px; padding-right: 12px; }
  .mn-empty { padding: 24px 14px; }
  .mn-drawer-header { padding: 8px 14px 12px; }
  .mn-drawer-body { padding: 14px 14px 18px; }
  .mn-drawer-footer { padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)); }
}

/* ── Version Tabs ─────────────────────────────────────────────────────────── */
.mn-version-tabbar {
  flex-shrink: 0; display: flex; align-items: stretch; gap: 0;
  overflow-x: auto; scrollbar-width: none;
  border-bottom: 1px solid var(--bg-border);
  background: var(--bg-surface);
  padding: 0 12px;
}
.mn-version-tabbar::-webkit-scrollbar { display: none; }
.mn-version-tab {
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 7px 12px; font-size: 11.5px; font-weight: 600;
  border: none; background: transparent; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  color: var(--text-muted); transition: color .15s, border-color .15s;
  min-height: 36px; white-space: nowrap; font-family: inherit;
}
.mn-version-tab:hover { color: var(--text-primary); }
.mn-version-tab.active { color: var(--text-primary); border-bottom-color: currentColor; }
.mn-version-tab-dot {
  width: 6px; height: 6px; border-radius: 999px; flex-shrink: 0;
}
.mn-version-tab-clear {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 4px; font-size: 10px;
  border: none; background: transparent; color: var(--text-muted);
  cursor: pointer; opacity: 0.5; transition: opacity .15s, background .15s;
  margin-left: 2px; flex-shrink: 0;
}
.mn-version-tab-clear:hover { opacity: 1; background: rgba(248,113,113,.15); color: #f87171; }

/* Version slot empty state */
.mn-version-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; height: 100%; padding: 40px 24px; text-align: center;
}

/* Version content area — read-only rendered view */
.mn-version-view {
  max-width: 720px; margin: 0 auto; width: 100%;
  padding-bottom: 40px;
}
`;

// ─── Small atoms ──────────────────────────────────────────────────────────────

const TopicChip = memo(function TopicChip({ topic, active, onClick, showLabel = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mn-chip"
      style={active ? { borderColor: `${topic.color}66`, background: `${topic.color}1f`, color: topic.color } : undefined}
    >
      <span className="mn-chip-dot" style={{ background: topic.color }} />
      {showLabel && topic.label}
    </button>
  );
});

const SaveIndicator = memo(function SaveIndicator({ status, lastSavedAt }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
        <Loader2 size={11} className="animate-spin" /> Saving…
      </span>
    );
  }
  if (status === "saved" && lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
        <span className="mn-save-dot" style={{ background: "#34d399" }} />
        Saved {relativeTime(lastSavedAt)}
      </span>
    );
  }
  return <span className="text-[11px] font-mono text-text-muted">Not saved yet</span>;
});

// ─── Version Tab Bar ─────────────────────────────────────────────────────────

const VersionTabBar = memo(function VersionTabBar({ activeTab, onTabChange, versions, onClearVersion }) {
  return (
    <div className="mn-version-tabbar">
      {VERSION_TABS.map(tab => {
        const hasContent = tab.key === "original" || !!(versions?.[tab.key]);
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            className={`mn-version-tab ${isActive ? "active" : ""}`}
            style={{ color: isActive ? (tab.key === "original" ? "var(--text-primary)" : tab.color) : undefined }}
            onClick={() => onTabChange(tab.key)}
            title={
              tab.key === "original" ? "Your original note" :
              hasContent ? `View ${tab.label} version` :
              `No ${tab.label} version yet — run the AI action to generate one`
            }
          >
            {tab.key !== "original" && (
              <span
                className="mn-version-tab-dot"
                style={{ background: hasContent ? tab.color : "var(--bg-border)" }}
              />
            )}
            {tab.label}
            {tab.key === "original" && (
              <span style={{
                fontSize: 9, fontFamily: "monospace", padding: "1px 5px",
                borderRadius: 4, background: "rgba(245,158,11,0.12)",
                color: "var(--accent-gold)", border: "0.5px solid rgba(245,158,11,0.3)",
                marginLeft: 4, letterSpacing: "0.04em",
              }}>editable</span>
            )}
            {tab.key !== "original" && hasContent && (
              <button
                className="mn-version-tab-clear"
                onClick={e => { e.stopPropagation(); onClearVersion(tab.key); }}
                title={`Clear ${tab.label} version`}
                aria-label={`Clear ${tab.label} version`}
              >&#x2715;</button>
            )}
          </button>
        );
      })}
    </div>
  );
});

// ─── Empty version slot ───────────────────────────────────────────────────────

const EmptyVersionSlot = memo(function EmptyVersionSlot({ tab, onRunAction }) {
  const action = AI_ACTIONS.find(a => a.versionKey === tab.key);
  if (!action) return null;
  const Icon = action.icon;
  return (
    <div className="mn-version-empty">
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${action.accent}18`, border: `1px solid ${action.accent}30`,
      }}>
        <Icon size={22} style={{ color: action.accent }} />
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
          No {tab.label} version yet
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", lineHeight: 1.6, maxWidth: 280 }}>
          Run <strong style={{ color: action.accent }}>{action.label}</strong> from the toolbar below to generate and save it here. Your original note is never changed.
        </p>
      </div>
      <button
        onClick={onRunAction}
        className="mn-pill-btn"
        style={{ background: `${action.accent}18`, borderColor: `${action.accent}44`, color: action.accent }}
      >
        <Icon size={13} /> {action.label}
      </button>
    </div>
  );
});

// ─── Score Bar ───────────────────────────────────────────────────────────────

const ScoreBar = memo(function ScoreBar({ label, value }) {
  const color = scoreColor(value);
  return (
    <div className="mn-score-row">
      <span className="mn-score-label">{label}</span>
      <div className="mn-score-track"><div className="mn-score-fill" style={{ width: `${value * 10}%`, background: color }} /></div>
      <span className="mn-score-val" style={{ color }}>{value}/10</span>
    </div>
  );
});

// ─── Empty states ─────────────────────────────────────────────────────────────

const EmptyNotesList = memo(function EmptyNotesList({ onCreate, filtered }) {
  return (
    <div className="mn-empty">
      <div className="mn-empty-icon"><NotebookPen size={26} style={{ color: "var(--accent-gold)" }} /></div>
      <div>
        <p className="text-[14px] font-bold text-text-primary">{filtered ? "No notes match" : "No notes yet"}</p>
        <p className="text-[12px] text-text-muted mt-1 max-w-[220px]">
          {filtered ? "Try a different search or topic filter." : "Start your first set of UPSC notes — organised by topic, saved automatically."}
        </p>
      </div>
      {!filtered && (
        <button onClick={onCreate} className="mn-pill-btn mn-pill-btn-primary">
          <Plus size={14} /> New note
        </button>
      )}
    </div>
  );
});

const EmptyEditor = memo(function EmptyEditor({ onCreate }) {
  return (
    <div className="mn-empty" style={{ height: "100%" }}>
      <div className="mn-empty-icon"><BookOpen size={26} style={{ color: "var(--accent-gold)" }} /></div>
      <div>
        <p className="font-display text-[19px] font-bold text-text-primary">Your second brain for UPSC</p>
        <p className="text-[13px] text-text-muted mt-2 max-w-[320px] leading-relaxed">
          Capture concepts in your own words, tag them by subject, then let your AI mentor polish, audit and convert them — right when you need it.
        </p>
      </div>
      <button onClick={onCreate} className="mn-pill-btn mn-pill-btn-primary">
        <Plus size={15} /> Write your first note
      </button>
    </div>
  );
});

// ─── Sidebar: note list ───────────────────────────────────────────────────────

const NoteRow = memo(function NoteRow({ note, active, onSelect, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const meta = topicMeta(note.topic);
  const select = useCallback(() => onSelect(note.id), [onSelect, note.id]);
  const askConfirm = useCallback(e => { e.stopPropagation(); setConfirm(true); }, []);
  const cancel = useCallback(e => { e.stopPropagation(); setConfirm(false); }, []);
  const confirmDel = useCallback(e => { e.stopPropagation(); onDelete(note.id); }, [onDelete, note.id]);

  return (
    <div onClick={select} className={`mn-note-row ${active ? "active" : ""}`}>
      <div className="mn-note-bar" style={{ background: meta ? meta.color : "var(--bg-border)" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-text-primary truncate flex-1">{note.title || "Untitled note"}</p>
        </div>
        <p className="text-[11.5px] text-text-muted mt-0.5 truncate">{snippet(note.content)}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {meta && <span className="text-[10px] font-mono font-semibold" style={{ color: meta.color }}>{meta.label}</span>}
          <span className="text-[10px] font-mono text-text-muted">· {relativeTime(note.updatedAt)}</span>
        </div>
      </div>
      {confirm ? (
        <div className="flex gap-1 shrink-0 items-center">
          <button onClick={confirmDel} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-red-500/15 text-red-400 font-semibold">Delete</button>
          <button onClick={cancel} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-bg-muted text-text-muted">Cancel</button>
        </div>
      ) : (
        <button onClick={askConfirm} className="mn-icon-btn shrink-0" style={{ width: 30, height: 30 }} aria-label="Delete note">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
});

const Sidebar = memo(function Sidebar({
  notes, activeId, onSelect, onDelete, onCreate, search, onSearchChange,
  topicFilter, onTopicFilter, paneVisible,
}) {
  const filtered = useMemo(() => {
    let list = notes;
    if (topicFilter) list = list.filter(n => n.topic === topicFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(n =>
        (n.title || "").toLowerCase().includes(s) || (n.content || "").toLowerCase().includes(s));
    }
    return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, search, topicFilter]);

  return (
    <div className={`mn-sidebar ${paneVisible ? "flex" : "hidden"} lg:flex`}>
      <div className="p-3 border-b border-bg-border shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-[15px] font-bold text-text-primary">Notes</h2>
          <button onClick={onCreate} className="mn-icon-btn" style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }} aria-label="New note">
            <Plus size={17} />
          </button>
        </div>
        <div className="mn-search">
          <Search size={13} className="shrink-0" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={onSearchChange} placeholder="Search your notes…" />
        </div>
        <div className="mn-topic-rail">
          <TopicChip topic={{ color: "var(--text-muted)", label: "All" }} active={!topicFilter} onClick={() => onTopicFilter(null)} />
          {TOPICS.map(t => (
            <TopicChip key={t.id} topic={t} active={topicFilter === t.id} onClick={() => onTopicFilter(t.id)} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mn-scroll px-2 py-2 pb-bottom-nav lg:pb-2 space-y-1">
        {filtered.length === 0
          ? <EmptyNotesList onCreate={onCreate} filtered={!!search.trim() || !!topicFilter} />
          : filtered.map(n => (
            <NoteRow key={n.id} note={n} active={n.id === activeId} onSelect={onSelect} onDelete={onDelete} />
          ))}
      </div>
    </div>
  );
});

// ─── AI result body ───────────────────────────────────────────────────────────

const MistakesScorecard = memo(function MistakesScorecard({ report }) {
  return (
    <div className="space-y-5">
      <div>
        <ScoreBar label="Knowledge Accuracy" value={report.knowledge} />
        <ScoreBar label="Conceptual Clarity" value={report.clarity} />
        <ScoreBar label="Retention Potential" value={report.retention} />
      </div>

      {report.missing.length > 0 && (
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-text-muted mb-2">Important Missing Points</p>
          <div className="space-y-1.5">
            {report.missing.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.traps.length > 0 && (
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-text-muted mb-2">Memory Traps</p>
          <div className="space-y-1.5">
            {report.traps.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] font-mono text-text-primary px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.18)" }}>
                <Zap size={12} className="shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.revision && (
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-text-muted mb-2">30 Second Revision</p>
          <div className="mn-revision-box">
            <p className="text-[13.5px] leading-relaxed text-text-primary">{report.revision}</p>
          </div>
        </div>
      )}
    </div>
  );
});

const AIResultBody = memo(function AIResultBody({ actionId, loading, error, result }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: "var(--accent-blue)", animation: `mn-pulse-dot 1.1s ${i * 0.15}s infinite ease-in-out` }} />
          ))}
        </div>
        <p className="text-[12px] font-mono text-text-muted">Reading your notes…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-[12px] font-mono px-3 py-3 rounded-xl" style={{ color: "#fca5a5", background: "rgba(248,113,113,.08)", border: "0.5px solid rgba(248,113,113,.25)" }}>
        {error}
      </div>
    );
  }
  if (!result) return null;

  if (actionId === "mistakes") {
    const report = parseMistakesReport(result);
    if (report) return <MistakesScorecard report={report} />;
  }
  return <div>{renderAIContent(result, { actionId })}</div>;
});

// ─── AI result drawer ─────────────────────────────────────────────────────────

function AIDrawer({
  open, action, loading, error, result, onClose, onRegenerate, onSaveVersion, onAppendRecap,
}) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => { setCopied(false); }, [result, open]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [open, action?.id, loading, result]);

  if (!open || !action) return null;
  const Icon = action.icon;

  const copyText = () => {
    const text = action.id === "mistakes" ? (parseMistakesReport(result) ? mistakesReportToText(parseMistakesReport(result)) : result) : result;
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const canSave = !!action.versionKey && !!result && !loading && !error;
  const canAppendRecap = action.id === "mistakes" && !!result && !loading && !error && !!parseMistakesReport(result);

  // Human-readable tab name for the save button
  const tabLabel = action.versionKey
    ? VERSION_TABS.find(t => t.key === action.versionKey)?.label || action.versionKey
    : null;

  return (
    <>
      <div className="mn-drawer-backdrop" onClick={onClose} />
      <div className="mn-drawer" role="dialog" aria-modal="true" aria-label={action.label}>
        <div className="mn-drawer-handle"><span /></div>
        <div className="mn-drawer-header">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${action.accent}1f`, color: action.accent }}>
            <Icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-text-primary leading-tight truncate">{action.label}</p>
            <p className="text-[10.5px] font-mono text-text-muted mt-0.5">
              AI Mentor · saved to <span style={{ color: action.accent }}>{tabLabel ?? "note"}</span> tab
            </p>
          </div>
          <button onClick={onClose} className="mn-icon-btn" aria-label="Close"><X size={17} /></button>
        </div>

        <div className="mn-drawer-body mn-scroll mn-ai-content" ref={bodyRef}>
          <AIResultBody actionId={action.id} loading={loading} error={error} result={result} />
        </div>

        {!loading && result && !error && (
          <div className="mn-drawer-footer">
            <button onClick={copyText} className="mn-pill-btn">
              {copied ? <Check size={14} style={{ color: "#34d399" }} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={onRegenerate} className="mn-pill-btn">
              <RotateCcw size={14} /> Regenerate
            </button>
            {canAppendRecap && (
              <button onClick={onAppendRecap} className="mn-pill-btn mn-pill-btn-full">
                <Plus size={14} /> Add recap to original
              </button>
            )}
            {canSave && (
              <button onClick={() => onSaveVersion(action.versionKey)} className="mn-pill-btn mn-pill-btn-primary">
                <Check size={14} /> Save to {tabLabel} tab
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sign-in gate ─────────────────────────────────────────────────────────────

const SignInGate = memo(function SignInGate({ onClose }) {
  return (
    <>
      <div className="mn-drawer-backdrop" onClick={onClose} />
      <div className="mn-drawer" role="dialog" aria-modal="true">
        <div className="mn-drawer-handle"><span /></div>
        <div className="mn-drawer-header">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-text-primary">Sign in for AI tools</p>
          </div>
          <button onClick={onClose} className="mn-icon-btn" aria-label="Close"><X size={17} /></button>
        </div>
        <div className="mn-drawer-body flex flex-col items-center text-center gap-3 py-8">
          <p className="text-[13px] text-text-secondary max-w-[300px]">
            Your notes stay saved on this device either way. Sign in to let your AI mentor improve, audit and reformat them.
          </p>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono" style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
            <LogIn size={12} /> Tap your profile to sign in
          </div>
        </div>
      </div>
    </>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorNotes({ isLoggedIn = false, contextHint = "Notes section" }) {
  const [notes, setNotes] = useState(() => loadNotesFromStorage());
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState(null);
  const [mobilePane, setMobilePane] = useState("list");
  const [readingMode, setReadingMode] = useState(false);

  const [draft, setDraft] = useState({ title: "", topic: null, content: "" });
  const [activeTab, setActiveTab] = useState("original"); // "original" | "enhanced" | "revision" | "mains"
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [signInGateOpen, setSignInGateOpen] = useState(false);

  const saveTimer = useRef(null);
  const textareaRef = useRef(null);
  const titleRef = useRef(null);
  const skipNextSave = useRef(true);

  // ── Undo history (per-note content snapshots) ─────────────────────────────
  // contentHistory: { [noteId]: string[] }  — oldest first, newest last
  const contentHistory = useRef({});
  const undoSnapshotTimer = useRef(null);
  const [canUndo, setCanUndo] = useState(false);

  const activeNote = useMemo(() => notes.find(n => n.id === activeId) || null, [notes, activeId]);

  // ── Load draft whenever the active note changes ──────────────────────────
  useEffect(() => {
    skipNextSave.current = true;
    setActiveTab("original");
    if (activeNote) {
      setDraft({ title: activeNote.title || "", topic: activeNote.topic || null, content: activeNote.content || "" });
      setSaveStatus("saved");
      setLastSavedAt(activeNote.updatedAt);
    } else {
      setDraft({ title: "", topic: null, content: "" });
      setSaveStatus("idle");
      setLastSavedAt(null);
    }
  }, [activeId]); // eslint-disable-line

  // ── Auto-resize the textarea ──────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.content, readingMode]);

  // ── Auto-save (debounced) ─────────────────────────────────────────────────
  const persistDraft = useCallback((id, nextDraft) => {
    setSaveStatus("saving");
    setNotes(prev => {
      const now = new Date().toISOString();
      const updated = prev.map(n => n.id === id ? { ...n, ...nextDraft, updatedAt: now } : n);
      persistNotesToStorage(updated);
      setLastSavedAt(now);
      return updated;
    });
    setSaveStatus("saved");
  }, []);

  useEffect(() => {
    if (!activeId) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistDraft(activeId, draft), AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [draft, activeId, persistDraft]);

  // Flush on unmount / tab switch
  useEffect(() => {
    const flush = () => { if (activeId) { clearTimeout(saveTimer.current); persistDraft(activeId, draft); } };
    document.addEventListener("visibilitychange", flush);
    return () => { document.removeEventListener("visibilitychange", flush); flush(); };
  }, [activeId, draft, persistDraft]); // eslint-disable-line

  // ── Note CRUD ──────────────────────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    const now = new Date().toISOString();
    const note = { id: uid(), title: "", topic: topicFilter || null, content: "", versions: {}, createdAt: now, updatedAt: now };
    setNotes(prev => {
      const updated = [note, ...prev];
      persistNotesToStorage(updated);
      return updated;
    });
    setActiveId(note.id);
    setMobilePane("editor");
    setReadingMode(false);
    setTimeout(() => titleRef.current?.focus(), 80);
  }, [topicFilter]);

  const handleSelect = useCallback((id) => {
    setActiveId(id);
    setMobilePane("editor");
    setReadingMode(false);
  }, []);

  const handleDelete = useCallback((id) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      persistNotesToStorage(updated);
      return updated;
    });
    setActiveId(prev => (prev === id ? null : prev));
  }, []);

  const handleBackToList = useCallback(() => setMobilePane("list"), []);

  // ── Draft field handlers ──────────────────────────────────────────────────
  const setTitle = useCallback((title) => setDraft(d => ({ ...d, title })), []);
  const setTopic = useCallback((topic) => setDraft(d => ({ ...d, topic })), []);

  // Snapshot the current content into undo history (debounced — 2s idle)
  const pushUndoSnapshot = useCallback((id, content) => {
    const hist = contentHistory.current[id] || [];
    const last = hist[hist.length - 1];
    if (last === content) return;
    const next = [...hist, content].slice(-MAX_UNDO_DEPTH);
    contentHistory.current[id] = next;
    setCanUndo(next.length > 1);
  }, []);

  const setContent = useCallback((content) => {
    setDraft(d => ({ ...d, content }));
    // Debounced snapshot for undo history
    clearTimeout(undoSnapshotTimer.current);
    undoSnapshotTimer.current = setTimeout(() => {
      setActiveId(id => { if (id) pushUndoSnapshot(id, content); return id; });
    }, UNDO_SNAPSHOT_DEBOUNCE_MS);
  }, [pushUndoSnapshot]);

  // Sync canUndo when note switches
  useEffect(() => {
    if (!activeId) { setCanUndo(false); return; }
    const hist = contentHistory.current[activeId] || [];
    setCanUndo(hist.length > 1);
  }, [activeId]);

  // Seed undo history when opening a note for the first time
  useEffect(() => {
    if (!activeId || !activeNote) return;
    if (!contentHistory.current[activeId]) {
      contentHistory.current[activeId] = [activeNote.content || ""];
      setCanUndo(false);
    }
  }, [activeId, activeNote]);

  // ── Undo handler ──────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (!activeId) return;
    const hist = contentHistory.current[activeId] || [];
    if (hist.length <= 1) return;
    const next = hist.slice(0, -1);
    contentHistory.current[activeId] = next;
    const prevContent = next[next.length - 1];
    setDraft(d => ({ ...d, content: prevContent }));
    setCanUndo(next.length > 1);
    clearTimeout(saveTimer.current);
    persistDraft(activeId, { content: prevContent });
  }, [activeId, persistDraft]);

  // Ctrl+Z / Cmd+Z intercept (only when textarea is focused)
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (document.activeElement === textareaRef.current) {
          const hist = contentHistory.current[activeId] || [];
          if (hist.length > 1) { e.preventDefault(); handleUndo(); }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, handleUndo]);

  // ── AI actions ─────────────────────────────────────────────────────────────
  const runAction = useCallback(async (action) => {
    if (!isLoggedIn) { setSignInGateOpen(true); return; }
    setActiveAction(action);
    setDrawerOpen(true);
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await action.fn({ title: draft.title, topic: topicMeta(draft.topic)?.label, content: draft.content });
      setAiResult(res);
    } catch (e) {
      setAiError(sanitizeAIError(e.message));
    } finally {
      setAiLoading(false);
    }
  }, [isLoggedIn, draft]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // ── Save AI result into a version slot (never overwrites original content) ─
  const handleSaveVersion = useCallback((versionKey) => {
    if (!aiResult || !activeId || !versionKey) return;
    const now = new Date().toISOString();

    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id !== activeId) return n;
        return {
          ...n,
          versions: { ...(n.versions || {}), [versionKey]: aiResult },
          updatedAt: now,
        };
      });
      persistNotesToStorage(updated);
      return updated;
    });

    setLastSavedAt(now);
    setSaveStatus("saved");
    setDrawerOpen(false);
    // Switch to the newly saved tab
    setActiveTab(versionKey);
  }, [aiResult, activeId]);

  // ── Clear a version slot ──────────────────────────────────────────────────
  const handleClearVersion = useCallback((versionKey) => {
    if (!activeId || !versionKey) return;
    const now = new Date().toISOString();
    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id !== activeId) return n;
        const versions = { ...(n.versions || {}) };
        delete versions[versionKey];
        return { ...n, versions, updatedAt: now };
      });
      persistNotesToStorage(updated);
      return updated;
    });
    setActiveTab("original");
  }, [activeId]);

  // ── Add recap to note (immediate persist) ───────────────────────────────
  const handleAppendRecap = useCallback(() => {
    const report = parseMistakesReport(aiResult);
    if (!report || !activeId) return;
    const now = new Date().toISOString();
    const block = `\n\n---\n## AI Review — ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}\n**Scores:** Knowledge ${report.knowledge}/10 · Clarity ${report.clarity}/10 · Retention ${report.retention}/10\n\n**Missing Points**\n${report.missing.map(m => `- ${m}`).join("\n")}\n\n**Memory Traps**\n${report.traps.map(t => `- ${t}`).join("\n")}\n\n**30 Second Revision**\n${report.revision}\n`;
    const newContent = `${draft.content}${block}`;

    setDraft(d => ({ ...d, content: newContent }));

    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === activeId
          ? { ...n, content: newContent, updatedAt: now }
          : n
      );
      persistNotesToStorage(updated);
      return updated;
    });

    setLastSavedAt(now);
    setSaveStatus("saved");
    setDrawerOpen(false);
  }, [aiResult, activeId, draft.content]);

  // ── Render ───────────────────────────────────────────────────────────────

  const aiDisabled = draft.content.trim().length < MIN_CONTENT_FOR_AI;
  const meta = topicMeta(draft.topic);

  return (
    <>
      <style>{MN_STYLES}</style>
      <div className="mn-workspace">
        <div className="mn-header">
          <div className="mn-header-icon"><NotebookPen size={17} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-text-primary leading-tight">Notes</p>
            <p className="text-[10px] font-mono text-text-muted">Write once. Revise fast.</p>
          </div>
          {mobilePane === "editor" && activeNote && (
            <>
              {activeTab === "original" && !readingMode && (
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="mn-icon-btn lg:hidden"
                  aria-label="Undo last change"
                  title="Undo"
                  style={{ opacity: canUndo ? 1 : 0.35 }}
                >
                  <History size={17} />
                </button>
              )}
              {activeTab === "original" && (
                <button onClick={() => setReadingMode(v => !v)} className="mn-icon-btn lg:hidden" aria-label="Toggle reading mode">
                  {readingMode ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              )}
            </>
          )}
        </div>

        <div className="mn-body">
          <Sidebar
            notes={notes}
            activeId={activeId}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onCreate={handleCreate}
            search={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            topicFilter={topicFilter}
            onTopicFilter={setTopicFilter}
            paneVisible={mobilePane === "list"}
          />

          <div className={`mn-editor ${mobilePane === "editor" ? "flex" : "hidden"} lg:flex`}>
            {!activeNote ? (
              <EmptyEditor onCreate={handleCreate} />
            ) : (
              <>
                {/* ── Toolbar: title, topic chips, undo/read toggle ── */}
                <div className="mn-toolbar">
                  <div className="px-4 pt-3.5 pb-3 flex items-start gap-2">
                    <button onClick={handleBackToList} className="mn-icon-btn lg:hidden shrink-0 -ml-1.5" aria-label="Back to notes">
                      <ChevronLeft size={19} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <input
                        ref={titleRef}
                        value={draft.title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled note"
                        className="mn-title-input"
                        aria-label="Note title"
                        readOnly={activeTab !== "original"}
                        style={{ opacity: activeTab !== "original" ? 0.7 : 1 }}
                      />
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {activeTab === "original" ? (
                          <>
                            <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
                            <span className="text-[11px] font-mono text-text-muted">· {wordCount(draft.content)} words</span>
                          </>
                        ) : (
                          <span className="text-[11px] font-mono text-text-muted">
                            {(() => {
                              const tab = VERSION_TABS.find(t => t.key === activeTab);
                              return (
                                <span style={{ color: tab?.color }}>
                                  {tab?.label} version · read-only
                                </span>
                              );
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Only show read/edit toggle on original tab */}
                    {activeTab === "original" && (
                      <button onClick={() => setReadingMode(v => !v)} className="mn-icon-btn hidden lg:inline-flex" aria-label="Toggle reading mode" title="Reading mode">
                        {readingMode ? <PenLine size={17} /> : <Eye size={17} />}
                      </button>
                    )}
                    {activeTab === "original" && !readingMode && (
                      <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className="mn-icon-btn hidden lg:inline-flex"
                        aria-label="Undo last change"
                        title="Undo (Ctrl+Z)"
                        style={{ opacity: canUndo ? 1 : 0.35 }}
                      >
                        <History size={16} />
                      </button>
                    )}
                  </div>

                  {/* Topic chips — only on original tab in edit mode */}
                  {activeTab === "original" && !readingMode && (
                    <div className="px-4 pb-3">
                      <div className="mn-topic-rail">
                        <TopicChip topic={{ color: "var(--text-muted)", label: "No topic" }} active={!draft.topic} onClick={() => setTopic(null)} />
                        {TOPICS.map(t => (
                          <TopicChip key={t.id} topic={t} active={draft.topic === t.id} onClick={() => setTopic(t.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Version Tab Bar ── */}
                <VersionTabBar
                  activeTab={activeTab}
                  onTabChange={tab => { setActiveTab(tab); setReadingMode(false); }}
                  versions={activeNote.versions}
                  onClearVersion={handleClearVersion}
                />

                {/* ── Content Area: switches by active tab ── */}
                <div className="mn-content-area mn-scroll px-4 sm:px-6 py-5 pb-bottom-nav lg:pb-5">
                  <div className="mn-content-inner">

                    {/* ORIGINAL TAB */}
                    {activeTab === "original" && (
                      readingMode ? (
                        <div className="mn-reading" style={{ animation: "mn-rise 200ms ease both" }}>
                          {meta && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold mb-3" style={{ color: meta.color }}>
                              <span className="mn-chip-dot" style={{ background: meta.color }} /> {meta.label}
                            </span>
                          )}
                          <h1 className="font-display text-[26px] font-bold text-text-primary leading-tight mb-4">{draft.title || "Untitled note"}</h1>
                          {draft.content.trim() ? renderRich(draft.content) : (
                            <p className="text-[13px] text-text-muted font-mono">This note is empty. Switch back to writing mode to add content.</p>
                          )}
                        </div>
                      ) : (
                        <textarea
                          ref={textareaRef}
                          value={draft.content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Start writing — concepts, dates, articles, your own words…"
                          className="mn-textarea"
                          style={{ minHeight: "40vh" }}
                          aria-label="Note content"
                        />
                      )
                    )}

                    {/* ENHANCED / REVISION / MAINS TABS — rendered AI content */}
                    {activeTab !== "original" && (() => {
                      const tab = VERSION_TABS.find(t => t.key === activeTab);
                      const versionContent = activeNote.versions?.[activeTab];
                      const matchingAction = AI_ACTIONS.find(a => a.versionKey === activeTab);

                      if (!versionContent) {
                        return (
                          <EmptyVersionSlot
                            tab={tab}
                            onRunAction={() => {
                              if (matchingAction) runAction(matchingAction);
                            }}
                          />
                        );
                      }

                      return (
                        <div className="mn-version-view" style={{ animation: "mn-rise 200ms ease both" }}>
                          {/* Version header badge */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            marginBottom: 20, flexWrap: "wrap",
                          }}>
                            <span style={{
                              fontSize: 10, fontFamily: "monospace", padding: "3px 10px",
                              borderRadius: 20, fontWeight: 700, letterSpacing: "0.06em",
                              background: `${tab.color}18`, color: tab.color,
                              border: `0.5px solid ${tab.color}44`,
                            }}>
                              {tab.label.toUpperCase()} VERSION
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                              {wordCount(versionContent)} words · read-only
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(versionContent);
                              }}
                              className="mn-pill-btn"
                              style={{ padding: "4px 10px", fontSize: 11, minHeight: 28, marginLeft: "auto" }}
                              title="Copy to clipboard"
                            >
                              <Copy size={11} /> Copy
                            </button>
                            {matchingAction && (
                              <button
                                onClick={() => runAction(matchingAction)}
                                disabled={aiDisabled}
                                className="mn-pill-btn"
                                style={{
                                  padding: "4px 10px", fontSize: 11, minHeight: 28,
                                  borderColor: `${tab.color}44`, color: tab.color,
                                  background: `${tab.color}10`,
                                }}
                                title="Regenerate this version"
                              >
                                <RotateCcw size={11} /> Regenerate
                              </button>
                            )}
                          </div>

                          {/* Rendered AI content */}
                          {renderAIContent(versionContent, { actionId: matchingAction?.id })}
                        </div>
                      );
                    })()}

                  </div>
                </div>

                {/* ── AI Action Rail (only shown on original tab) ── */}
                {activeTab === "original" && !readingMode && (
                  <div className="mn-toolbar mn-mobile-ai-bar lg:static lg:border-t-0 lg:px-4 lg:pb-4 lg:pt-0" style={{ borderTop: "1px solid var(--bg-border)" }}>
                    <div className="mn-ai-rail px-1 lg:px-0 pt-0 lg:pt-3">
                      {AI_ACTIONS.map(action => {
                        const Icon = action.icon;
                        const hasVersion = !!(action.versionKey && activeNote.versions?.[action.versionKey]);
                        return (
                          <button
                            key={action.id}
                            onClick={() => runAction(action)}
                            disabled={aiDisabled}
                            className="mn-ai-btn"
                            style={{ "--ai-accent": action.accent, position: "relative" }}
                            title={aiDisabled ? "Write a few more sentences first" : action.label}
                          >
                            <Icon size={14} style={{ color: action.accent }} />
                            <span className="hidden sm:inline">{action.label}</span>
                            <span className="sm:hidden">{action.short}</span>
                            {/* Green dot indicates a saved version exists */}
                            {hasVersion && (
                              <span style={{
                                position: "absolute", top: 5, right: 5,
                                width: 6, height: 6, borderRadius: "50%",
                                background: action.accent, opacity: 0.85,
                              }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <AIDrawer
          open={drawerOpen}
          action={activeAction}
          loading={aiLoading}
          error={aiError}
          result={aiResult}
          onClose={closeDrawer}
          onRegenerate={() => runAction(activeAction)}
          onSaveVersion={handleSaveVersion}
          onAppendRecap={handleAppendRecap}
        />
      )}

      {signInGateOpen && <SignInGate onClose={() => setSignInGateOpen(false)} />}
    </>
  );
}