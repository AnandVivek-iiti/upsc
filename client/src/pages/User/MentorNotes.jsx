import React, {
  useState, useRef, useEffect, useCallback, useMemo, memo,
} from "react";
import {
  Plus, Search, Trash2, X, ChevronLeft, Check, Loader2,
  Sparkles, AlertTriangle, Zap, Wand2, Eye, EyeOff, Copy,
  RotateCcw, GraduationCap, LogIn, NotebookPen, BookOpen,
  PenLine, History,
} from "lucide-react";
import {
  improveNotes, findMistakesInNotes, generateRevisionNotes, convertToMainsFormat,
} from "../../hooks/useAI";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "upsc_notes_v1";
const AUTOSAVE_DEBOUNCE_MS = 1400;
const MIN_CONTENT_FOR_AI = 40;
const UNDO_SNAPSHOT_DEBOUNCE_MS = 2000;
const MAX_UNDO_DEPTH = 40;

const TOPICS = [
  { id: "polity",      label: "Polity",        color: "#f87171" },
  { id: "history",     label: "History",       color: "#c084fc" },
  { id: "economy",     label: "Economy",       color: "#34d399" },
  { id: "geography",   label: "Geography",     color: "#60a5fa" },
  { id: "sociology",   label: "Sociology",     color: "#5eead4" },
  { id: "ethics",      label: "Ethics",        color: "#f59e0b" },
  { id: "environment", label: "Environment",   color: "#84cc16" },
  { id: "scitech",     label: "Science & Tech",color: "#f9a8d4" },
];

const AI_ACTIONS = [
  { id: "improve",  label: "Improve Notes",          short: "Improve",  icon: Wand2,         fn: improveNotes,         accent: "#60a5fa", versionKey: "enhanced" },
  { id: "mistakes", label: "Find Mistakes",           short: "Mistakes", icon: AlertTriangle, fn: findMistakesInNotes,  accent: "#f59e0b", versionKey: null        },
  { id: "revision", label: "Generate Revision Notes", short: "Revise",   icon: Zap,           fn: generateRevisionNotes,accent: "#34d399", versionKey: "revision"  },
  { id: "mains",    label: "Convert to Mains Format", short: "Mains",    icon: GraduationCap, fn: convertToMainsFormat, accent: "#a78bfa", versionKey: "mains"     },
];

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
  } catch { return []; }
}
function persistNotesToStorage(notes) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); return true; }
  catch { return false; }
}
function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5)  return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function wordCount(text) {
  const t = (text || "").trim();
  return t ? t.split(/\s+/).length : 0;
}
function topicMeta(id) { return TOPICS.find(t => t.id === id) || null; }
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
  if (/429|quota|rate limit|too many requests/i.test(raw))
    return "Your AI mentor hit a provider's rate limit. This usually clears in a few seconds — tap Regenerate to try again.";
  if (/too short|low-effort/i.test(raw))
    return "That attempt came back too thin to be useful. Tap Regenerate — it'll try a stronger model.";
  if (/network|fetch failed|econnreset|timeout|enotfound/i.test(raw))
    return "Couldn't reach the AI mentor. Check your connection and tap Regenerate.";
  if (/no ai providers configured|all ai providers failed/i.test(raw))
    return "The AI mentor is unavailable right now. Please try again shortly.";
  return "Something went wrong on the AI mentor's end. Tap Regenerate, or try again in a moment.";
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

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
    else parts.push(
      <code key={k++}
        className="bg-[rgba(245,158,11,0.12)] text-[var(--accent-gold)] px-1 py-0.5 rounded text-[12px] font-mono break-all">
        {winner.m[2]}
      </code>
    );
    remaining = winner.m[3];
  }
  if (remaining) parts.push(<span key={k++}>{remaining}</span>);
  return parts.length ? parts : text;
}

function renderRich(text) {
  if (!text) return null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const elements = [];
  let i = 0; let kc = 0;
  const key = () => kc++;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.trim().startsWith(":::memory")) {
      const cardLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) { cardLines.push(lines[i]); i++; }
      i++;
      elements.push(
        <div key={key()} className="rounded-2xl overflow-hidden border border-[rgba(139,92,246,0.35)] my-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#a78bfa] uppercase"
            style={{ background: "linear-gradient(135deg,rgba(139,92,246,.22),rgba(59,130,246,.13))" }}>
            <Sparkles size={11} /> Quick Recall
          </div>
          <div className="px-3 py-2.5 flex flex-col gap-1.5">
            {cardLines.map((cl, ci) => {
              const trimmed = cl.trim();
              if (!trimmed) return null;
              const [label, ...rest] = trimmed.split(":");
              if (rest.length) return (
                <div key={ci} className="flex gap-2 items-baseline pb-1.5 border-b border-[var(--bg-border)] last:border-0 last:pb-0 flex-wrap">
                  <span className="text-[11.5px] font-semibold text-[#a78bfa] min-w-[64px] shrink-0">{label.replace(/^[-•]\s*/,"")}</span>
                  <span className="text-[12.5px] text-[var(--text-primary)] break-all flex-1">{rest.join(":").trim()}</span>
                </div>
              );
              return <div key={ci} className="flex gap-2 pb-1.5 border-b border-[var(--bg-border)] last:border-0 last:pb-0">
                <span className="text-[12.5px] text-[var(--text-primary)]">{trimmed.replace(/^[-•]\s*/,"")}</span>
              </div>;
            })}
          </div>
        </div>
      );
      continue;
    }
    if (/^\[!(NOTE|TIP|IMPORTANT|WARN)\]/.test(line.trim())) {
      const match = line.match(/^\[!(NOTE|TIP|IMPORTANT|WARN)\]\s*(.*)/);
      const typeMap = { NOTE:"blue", TIP:"green", IMPORTANT:"amber", WARN:"red" };
      const colorMap = {
        blue:  { bg:"rgba(59,130,246,.1)",  border:"rgba(59,130,246,.25)"  },
        green: { bg:"rgba(16,185,129,.1)",  border:"rgba(16,185,129,.25)"  },
        amber: { bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.25)"  },
        red:   { bg:"rgba(239,68,68,.1)",   border:"rgba(239,68,68,.25)"   },
      };
      const c = colorMap[typeMap[match[1]]];
      elements.push(
        <div key={key()} className="flex gap-2 items-start px-3 py-2.5 rounded-xl my-2 text-[13px] break-words"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded shrink-0 bg-current text-white opacity-85 mt-0.5">{match[1]}</span>
          <span>{inlineFormat(match[2]||"")}</span>
        </div>
      );
      i++; continue;
    }
    if (/^##\s/.test(line)) {
      elements.push(<p key={key()} className="text-[13.5px] font-bold text-[var(--accent-gold)] mt-3.5 mb-1.5 tracking-tight">{line.replace(/^##\s/,"")}</p>);
      i++; continue;
    }
    if (/^#\s/.test(line)) {
      elements.push(<p key={key()} className="text-[15px] font-extrabold text-[var(--text-primary)] mt-3.5 mb-1.5 border-b border-[var(--bg-border)] pb-1">{line.replace(/^#\s/,"")}</p>);
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={key()} className="border-0 border-t border-[var(--bg-border)] my-3.5" />); i++; continue; }
    if (/^[-•*]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-•*]\s/,"")); i++; }
      elements.push(
        <ul key={key()} className="my-1.5 flex flex-col gap-1 list-none pl-0">
          {items.map((it,ii)=>(
            <li key={ii} className="relative pl-4 text-[13.5px] text-[var(--text-primary)] leading-relaxed break-words">
              <span className="absolute left-0 top-[3px] text-[var(--accent-gold)] text-[10px]">▸</span>
              {inlineFormat(it)}
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s/,"")); i++; }
      elements.push(
        <ol key={key()} className="my-1.5 flex flex-col gap-1 list-decimal pl-5">
          {items.map((it,ii)=>(
            <li key={ii} className="text-[13.5px] text-[var(--text-primary)] leading-relaxed break-words">{inlineFormat(it)}</li>
          ))}
        </ol>
      );
      continue;
    }
    elements.push(<p key={key()} className="my-1 text-[var(--text-primary)] leading-[1.7] text-[13.5px] break-words">{inlineFormat(line)}</p>);
    i++;
  }
  return elements;
}

// ─── AI content renderer ──────────────────────────────────────────────────────

function renderAIContent(text, { actionId = null } = {}) {
  if (!text) return null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  const renderBlock = (block) => {
    switch (block.type) {
      case "heading": {
        const sizeMap = {
          1: "text-[clamp(19px,5.2vw,23px)] border-b-2 border-[var(--bg-border)] pb-1",
          2: "text-[clamp(17px,4.4vw,19.5px)]",
          3: "text-[clamp(15px,3.8vw,16.5px)] text-[var(--accent-gold)]",
        };
        return <div key={block._key} className={`font-bold mt-5 mb-2 leading-tight ${sizeMap[block.level]||sizeMap[2]}`}>{inlineFormat(block.text)}</div>;
      }
      case "paragraph":
        return <p key={block._key} className="my-2 leading-[1.75] break-words">{inlineFormat(block.text)}</p>;
      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        return (
          <Tag key={block._key} className={`my-2 ${block.ordered?"list-decimal pl-6":"list-none pl-0"}`}>
            {block.items.map((item,idx)=>(
              <li key={idx} className={`mb-1 break-words ${!block.ordered?"relative pl-4":""}`}>
                {!block.ordered && <span className="absolute left-0 top-[3px] text-[var(--accent-gold)] text-[10px]">▸</span>}
                {inlineFormat(item)}
              </li>
            ))}
          </Tag>
        );
      }
      case "table":
        return (
          <div key={block._key} className="overflow-x-auto my-4 -webkit-overflow-scrolling-touch rounded-xl">
            <table className="w-full border-collapse text-[clamp(12px,3.2vw,13.5px)]">
              <thead>
                <tr>{block.headers.map((h,idx)=>(
                  <th key={idx} className="border border-[var(--bg-border)] px-3 py-2 text-left font-bold bg-[var(--bg-muted)]">{inlineFormat(h)}</th>
                ))}</tr>
              </thead>
              <tbody>{block.rows.map((row,idx)=>(
                <tr key={idx}>{row.map((cell,j)=>(
                  <td key={j} className="border border-[var(--bg-border)] px-3 py-2 text-left">{inlineFormat(cell)}</td>
                ))}</tr>
              ))}</tbody>
            </table>
          </div>
        );
      case "special": {
        const icons = { INTRODUCTION:"📌", BODY:"📚", CONCLUSION:"🎯", "WAY FORWARD":"🚀" };
        const icon = icons[block.label] || "📌";
        const labelDisplay = block.label.charAt(0) + block.label.slice(1).toLowerCase();
        return (
          <div key={block._key} className="rounded-2xl border border-[rgba(245,158,11,0.25)] bg-[var(--bg-surface)] my-5 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-3 font-bold text-[clamp(14.5px,3.8vw,16px)] border-b border-[var(--bg-border)]"
              style={{ background:"linear-gradient(135deg,rgba(245,158,11,0.08),rgba(167,139,250,0.05))" }}>
              <span className="text-[1.15em]">{icon}</span>
              <span>{labelDisplay}</span>
            </div>
            <div className="px-4 pt-3 pb-4">
              {block.content.map((subBlock,idx)=>renderBlock({...subBlock,_key:`special-${idx}`}))}
            </div>
          </div>
        );
      }
      case "memory-card": {
        const cardLines = block.content.map(l=>l.trim()).filter(Boolean);
        return (
          <div key={block._key} className="rounded-2xl overflow-hidden border border-[rgba(139,92,246,0.35)] my-5">
            <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold tracking-widest text-[#a78bfa] uppercase"
              style={{ background:"linear-gradient(135deg,rgba(139,92,246,.22),rgba(59,130,246,.13))" }}>
              <Sparkles size={11}/> {block.title}
            </div>
            <div className="px-3 py-2.5 flex flex-col gap-1.5">
              {cardLines.map((cl,ci)=>{
                const [label,...rest] = cl.split(":");
                if (rest.length) return (
                  <div key={ci} className="flex gap-2 items-baseline pb-1.5 border-b border-[var(--bg-border)] last:border-0 last:pb-0 flex-wrap">
                    <span className="text-[11.5px] font-semibold text-[#a78bfa] min-w-[64px] shrink-0">{label.replace(/^[-•]\s*/,"")}</span>
                    <span className="text-[12.5px] text-[var(--text-primary)] break-all flex-1">{rest.join(":").trim()}</span>
                  </div>
                );
                return <div key={ci} className="text-[12.5px] text-[var(--text-primary)] pb-1.5 border-b border-[var(--bg-border)] last:border-0 last:pb-0">{cl.replace(/^[-•]\s*/,"")}</div>;
              })}
            </div>
          </div>
        );
      }
      default: return null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { i++; continue; }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const revisionKeywords = ["quick recall","important facts","exam traps","pyq linkages","30 second revision"];
      if (revisionKeywords.some(kw=>text.toLowerCase().includes(kw))) {
        const cardContent = [];
        i++;
        while (i < lines.length) {
          const nextTrim = lines[i].trim();
          if (!nextTrim || /^#{1,3}\s/.test(nextTrim)) break;
          cardContent.push(lines[i]);
          i++;
        }
        blocks.push({ type:"memory-card", title:text, content:cardContent, _key:`memory-${blocks.length}` });
        continue;
      }
      blocks.push({ type:"heading", level, text, _key:`h-${blocks.length}` });
      i++; continue;
    }

    const specialMatch = trimmed.match(/^(INTRODUCTION|BODY|CONCLUSION|WAY FORWARD)\s*:\s*$/i);
    if (specialMatch) {
      const label = specialMatch[1].toUpperCase();
      i++;
      const contentBlocks = [];
      while (i < lines.length) {
        const nextTrim = lines[i].trim();
        if (!nextTrim) { i++; continue; }
        if (/^(INTRODUCTION|BODY|CONCLUSION|WAY FORWARD)\s*:\s*$/i.test(nextTrim)||/^#{1,3}\s/.test(nextTrim)) break;
        contentBlocks.push({ type:"paragraph", text:lines[i], _key:`sp-${blocks.length}-${contentBlocks.length}` });
        i++;
      }
      blocks.push({ type:"special", label, content:contentBlocks, _key:`special-${blocks.length}` });
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|") && i+1<lines.length && /^\|[\s\-:]+\|$/.test(lines[i+1].trim())) {
      const headers = trimmed.slice(1,-1).split("|").map(s=>s.trim());
      i+=2;
      const rows = [];
      while (i<lines.length) {
        const rl = lines[i].trim();
        if (!rl.startsWith("|")||!rl.endsWith("|")) break;
        rows.push(rl.slice(1,-1).split("|").map(s=>s.trim()));
        i++;
      }
      blocks.push({ type:"table", headers, rows, _key:`table-${blocks.length}` });
      continue;
    }

    const listMatch = trimmed.match(/^(\d+\.\s|[-•*]\s)/);
    if (listMatch) {
      const isOrdered = !!listMatch[1].match(/^\d/);
      const items = [];
      while (i<lines.length) {
        const l=lines[i].trim();
        if (!l) break;
        const m=l.match(/^(\d+\.\s|[-•*]\s)(.*)/);
        if (!m) break;
        items.push(m[2].trim());
        i++;
      }
      blocks.push({ type:"list", ordered:isOrdered, items, _key:`list-${blocks.length}` });
      continue;
    }

    let paraLines = [];
    while (i<lines.length) {
      const l=lines[i]; const lt=l.trim();
      if (!lt) break;
      if (/^#{1,3}\s/.test(lt)||/^(\d+\.\s|[-•*]\s)/.test(lt)||/^\|.*\|$/.test(lt)||/^(INTRODUCTION|BODY|CONCLUSION|WAY FORWARD)\s*:\s*$/i.test(lt)) break;
      paraLines.push(l); i++;
    }
    if (paraLines.length) blocks.push({ type:"paragraph", text:paraLines.join("\n"), _key:`p-${blocks.length}` });
  }

  return (
    <div className="text-[clamp(13.5px,3.6vw,15px)] leading-[1.75] text-[var(--text-primary)]">
      {blocks.map((block,idx)=>renderBlock({...block,_key:block._key||idx}))}
    </div>
  );
}

// ─── Find Mistakes parser ─────────────────────────────────────────────────────

function parseMistakesReport(raw) {
  if (!raw) return null;
  const k = (raw.match(/SCORE_KNOWLEDGE:\s*(\d{1,2})/i)||[])[1];
  const c = (raw.match(/SCORE_CLARITY:\s*(\d{1,2})/i)||[])[1];
  const r = (raw.match(/SCORE_RETENTION:\s*(\d{1,2})/i)||[])[1];
  if (k===undefined||c===undefined||r===undefined) return null;
  const section = (label,stopLabels) => {
    const stop = stopLabels.length?`(?:${stopLabels.join("|")})`: "$";
    const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=${stop})`,"i");
    const m = raw.match(re);
    return m?m[1].trim():"";
  };
  const toList = (block) => block.split("\n").map(l=>l.replace(/^[-•*]\s*/,"").trim()).filter(Boolean);
  return {
    knowledge: clampScore(k), clarity: clampScore(c), retention: clampScore(r),
    missing:  toList(section("MISSING",["TRAPS:","REVISION:"])),
    traps:    toList(section("TRAPS",["REVISION:"])),
    revision: section("REVISION",[]).replace(/^[-•*]\s*/,""),
  };
}
function mistakesReportToText(report) {
  if (!report) return "";
  return [
    `Knowledge Accuracy: ${report.knowledge}/10`,
    `Conceptual Clarity: ${report.clarity}/10`,
    `Retention Potential: ${report.retention}/10`,
    "","Important Missing Points:",...report.missing.map(m=>`- ${m}`),
    "","Memory Traps:",...report.traps.map(t=>`- ${t}`),
    "","30 Second Revision:",report.revision,
  ].join("\n");
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

const TopicChip = memo(function TopicChip({ topic, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-all duration-150 whitespace-nowrap min-h-[30px] active:scale-95"
      style={active
        ? { borderColor:`${topic.color}66`, background:`${topic.color}1f`, color:topic.color }
        : { borderColor:"var(--bg-border)", background:"var(--bg-muted)", color:"var(--text-secondary)" }
      }>
      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background:topic.color }} />
      {topic.label}
    </button>
  );
});

const SaveIndicator = memo(function SaveIndicator({ status, lastSavedAt }) {
  if (status==="saving") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
      <Loader2 size={11} className="animate-spin" /> Saving…
    </span>
  );
  if (status==="saved"&&lastSavedAt) return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
      Saved {relativeTime(lastSavedAt)}
    </span>
  );
  return <span className="text-[11px] font-mono text-[var(--text-muted)]">Not saved yet</span>;
});

// ─── Version Tab Bar ──────────────────────────────────────────────────────────

const VersionTabBar = memo(function VersionTabBar({ activeTab, onTabChange, versions, onClearVersion }) {
  return (
    <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-none border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-3 shrink-0 min-h-[38px]"
      style={{ scrollbarWidth:"none" }}>
      {VERSION_TABS.map(tab => {
        const hasContent = tab.key==="original"||!!(versions?.[tab.key]);
        const isActive   = activeTab===tab.key;
        return (
          <button key={tab.key}
            className={`inline-flex items-center gap-1.5 shrink-0 px-3 py-[7px] text-[11.5px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors duration-150 font-inherit ${isActive?"border-current":"border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            style={{ color:isActive?(tab.key==="original"?"var(--text-primary)":tab.color):undefined }}
            onClick={()=>onTabChange(tab.key)}>
            {tab.key!=="original" && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:hasContent?tab.color:"var(--bg-border)" }} />
            )}
            {tab.label}
            {tab.key==="original" && (
              <span className="text-[9px] font-mono px-1.5 py-px rounded ml-1 border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.12)] text-[var(--accent-gold)] tracking-wider">
                editable
              </span>
            )}
            {tab.key!=="original"&&hasContent && (
              <button
                className="inline-flex items-center justify-center w-4 h-4 rounded text-[10px] border-0 bg-transparent text-[var(--text-muted)] opacity-50 hover:opacity-100 hover:bg-[rgba(248,113,113,0.15)] hover:text-[#f87171] transition-all ml-0.5 shrink-0"
                onClick={e=>{ e.stopPropagation(); onClearVersion(tab.key); }}
                aria-label={`Clear ${tab.label} version`}>✕</button>
            )}
          </button>
        );
      })}
    </div>
  );
});

// ─── Empty version slot ───────────────────────────────────────────────────────

const EmptyVersionSlot = memo(function EmptyVersionSlot({ tab, onRunAction }) {
  const action = AI_ACTIONS.find(a=>a.versionKey===tab.key);
  if (!action) return null;
  const Icon = action.icon;
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full py-10 px-6 text-center">
      <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
        style={{ background:`${action.accent}18`, border:`1px solid ${action.accent}30` }}>
        <Icon size={22} style={{ color:action.accent }} />
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--text-primary)] mb-1.5">No {tab.label} version yet</p>
        <p className="text-[12px] text-[var(--text-muted)] font-mono leading-relaxed max-w-[280px]">
          Run <strong style={{ color:action.accent }}>{action.label}</strong> from the toolbar below to generate it here. Your original note is never changed.
        </p>
      </div>
      <button onClick={onRunAction}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold border transition-all duration-150"
        style={{ background:`${action.accent}18`, borderColor:`${action.accent}44`, color:action.accent }}>
        <Icon size={13} /> {action.label}
      </button>
    </div>
  );
});

// ─── Score Bar ────────────────────────────────────────────────────────────────

const ScoreBar = memo(function ScoreBar({ label, value }) {
  const color = scoreColor(value);
  return (
    <div className="flex items-center gap-2 mb-2.5 flex-wrap row-gap-1">
      <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] min-w-[92px] shrink-0 leading-tight">{label}</span>
      <div className="flex-1 min-w-[80px] h-[7px] rounded-full bg-[var(--bg-muted)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width:`${value*10}%`, background:color, transition:"width 0.6s cubic-bezier(.22,1,.36,1)" }} />
      </div>
      <span className="w-[30px] shrink-0 text-right text-[11.5px] font-bold font-mono" style={{ color }}>{value}/10</span>
    </div>
  );
});

// ─── Empty states ─────────────────────────────────────────────────────────────

const EmptyNotesList = memo(function EmptyNotesList({ onCreate, filtered }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-8 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[rgba(245,158,11,0.2)]"
        style={{ background:"linear-gradient(135deg,var(--accent-gold-dim),rgba(167,139,250,.12))" }}>
        <NotebookPen size={26} style={{ color:"var(--accent-gold)" }} />
      </div>
      <div>
        <p className="text-[14px] font-bold text-[var(--text-primary)]">{filtered?"No notes match":"No notes yet"}</p>
        <p className="text-[12px] text-[var(--text-muted)] mt-1 max-w-[220px]">
          {filtered?"Try a different search or topic filter.":"Start your first set of UPSC notes — organised by topic, saved automatically."}
        </p>
      </div>
      {!filtered && (
        <button onClick={onCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold bg-[var(--accent-blue)] text-white border-0 min-h-[40px] transition-all active:scale-95">
          <Plus size={14} /> New note
        </button>
      )}
    </div>
  );
});

const EmptyEditor = memo(function EmptyEditor({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-8 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[rgba(245,158,11,0.2)]"
        style={{ background:"linear-gradient(135deg,var(--accent-gold-dim),rgba(167,139,250,.12))" }}>
        <BookOpen size={26} style={{ color:"var(--accent-gold)" }} />
      </div>
      <div>
        <p className="font-display text-[19px] font-bold text-[var(--text-primary)]">Your second brain for UPSC</p>
        <p className="text-[13px] text-[var(--text-muted)] mt-2 max-w-[320px] leading-relaxed">
          Capture concepts in your own words, tag them by subject, then let your AI mentor polish, audit and convert them — right when you need it.
        </p>
      </div>
      <button onClick={onCreate}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[var(--accent-blue)] text-white border-0 min-h-[42px] transition-all active:scale-95">
        <Plus size={15} /> Write your first note
      </button>
    </div>
  );
});

// ─── Note row ─────────────────────────────────────────────────────────────────

const NoteRow = memo(function NoteRow({ note, active, onSelect, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const meta = topicMeta(note.topic);
  const select    = useCallback(()=>onSelect(note.id), [onSelect,note.id]);
  const askConfirm= useCallback(e=>{ e.stopPropagation(); setConfirm(true); },[]);
  const cancel    = useCallback(e=>{ e.stopPropagation(); setConfirm(false); },[]);
  const confirmDel= useCallback(e=>{ e.stopPropagation(); onDelete(note.id); },[onDelete,note.id]);

  return (
    <div onClick={select}
      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer border transition-colors duration-150 min-h-[44px] ${active?"bg-[var(--accent-gold-dim)] border-[rgba(245,158,11,0.25)]":"border-transparent hover:bg-[var(--bg-muted)]"}`}>
      <div className="w-[3px] self-stretch rounded-full shrink-0 min-h-[36px]" style={{ background:meta?meta.color:"var(--bg-border)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{note.title||"Untitled note"}</p>
        <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 truncate">{snippet(note.content)}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {meta && <span className="text-[10px] font-mono font-semibold" style={{ color:meta.color }}>{meta.label}</span>}
          <span className="text-[10px] font-mono text-[var(--text-muted)]">· {relativeTime(note.updatedAt)}</span>
        </div>
      </div>
      {confirm ? (
        <div className="flex gap-1 shrink-0 items-center">
          <button onClick={confirmDel} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-[rgba(239,68,68,0.15)] text-[#f87171] font-semibold">Delete</button>
          <button onClick={cancel}    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-[var(--bg-muted)] text-[var(--text-muted)]">Cancel</button>
        </div>
      ) : (
        <button onClick={askConfirm}
          className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[11px] text-[var(--text-muted)] bg-transparent border-0 cursor-pointer shrink-0 hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Delete note">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = memo(function Sidebar({
  notes, activeId, onSelect, onDelete, onCreate, search, onSearchChange,
  topicFilter, onTopicFilter, paneVisible,
}) {
  const filtered = useMemo(()=>{
    let list = notes;
    if (topicFilter)   list = list.filter(n=>n.topic===topicFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(n=>(n.title||"").toLowerCase().includes(s)||(n.content||"").toLowerCase().includes(s));
    }
    return [...list].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
  },[notes,search,topicFilter]);

  return (
    <div className={`${paneVisible?"flex":"hidden"} lg:flex w-full lg:w-[min(320px,30vw)] xl:w-[340px] shrink-0 flex-col overflow-hidden border-r border-[var(--bg-border)] bg-[var(--bg-surface)]`}>
      <div className="p-3 border-b border-[var(--bg-border)] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-[15px] font-bold text-[var(--text-primary)]">Notes</h2>
          <button onClick={onCreate}
            className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-[11px] bg-[var(--accent-gold-dim)] text-[var(--accent-gold)] border-0 cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="New note">
            <Plus size={17} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-muted)]">
          <Search size={13} className="shrink-0 text-[var(--text-muted)]" />
          <input value={search} onChange={onSearchChange} placeholder="Search your notes…"
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] min-w-0" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-wrap" style={{ scrollbarWidth:"none" }}>
          <TopicChip topic={{ color:"var(--text-muted)", label:"All" }} active={!topicFilter} onClick={()=>onTopicFilter(null)} />
          {TOPICS.map(t=>(
            <TopicChip key={t.id} topic={t} active={topicFilter===t.id} onClick={()=>onTopicFilter(t.id)} />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
        style={{ scrollbarWidth:"thin", scrollbarColor:"var(--bg-border) transparent" }}>
        {filtered.length===0
          ? <EmptyNotesList onCreate={onCreate} filtered={!!search.trim()||!!topicFilter} />
          : filtered.map(n=>(
            <NoteRow key={n.id} note={n} active={n.id===activeId} onSelect={onSelect} onDelete={onDelete} />
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
      {report.missing.length>0 && (
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Important Missing Points</p>
          <div className="space-y-1.5">
            {report.missing.map((m,i)=>(
              <div key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-primary)]">
                <AlertTriangle size={13} className="shrink-0 mt-0.5 text-[#f59e0b]" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {report.traps.length>0 && (
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">Memory Traps</p>
          <div className="space-y-1.5">
            {report.traps.map((t,i)=>(
              <div key={i} className="flex items-start gap-2 text-[13px] font-mono text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg"
                style={{ background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.18)" }}>
                <Zap size={12} className="shrink-0 mt-0.5 text-[#f87171]" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {report.revision && (
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">30 Second Revision</p>
          <div className="rounded-2xl px-4 py-3.5" style={{ background:"linear-gradient(135deg,var(--accent-gold-dim),rgba(245,158,11,.04))", border:"1px solid rgba(245,158,11,.3)" }}>
            <p className="text-[13.5px] leading-relaxed text-[var(--text-primary)]">{report.revision}</p>
          </div>
        </div>
      )}
    </div>
  );
});

const AIResultBody = memo(function AIResultBody({ actionId, loading, error, result }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="flex gap-1.5">
        {[0,1,2].map(i=>(
          <div key={i} className="w-2 h-2 rounded-full bg-[var(--accent-blue)]"
            style={{ animation:`mn-pulse-dot 1.1s ${i*0.15}s infinite ease-in-out` }} />
        ))}
      </div>
      <p className="text-[12px] font-mono text-[var(--text-muted)]">Reading your notes…</p>
    </div>
  );
  if (error) return (
    <div className="text-[12px] font-mono px-3 py-3 rounded-xl text-[#fca5a5]"
      style={{ background:"rgba(248,113,113,.08)", border:"0.5px solid rgba(248,113,113,.25)" }}>
      {error}
    </div>
  );
  if (!result) return null;
  if (actionId==="mistakes") {
    const report = parseMistakesReport(result);
    if (report) return <MistakesScorecard report={report} />;
  }
  return <div>{renderAIContent(result,{actionId})}</div>;
});

// ─── AI Drawer ────────────────────────────────────────────────────────────────

function AIDrawer({ open, action, loading, error, result, onClose, onRegenerate, onSaveVersion, onAppendRecap }) {
  const [copied,setCopied] = useState(false);
  const bodyRef = useRef(null);
  useEffect(()=>{ setCopied(false); },[result,open]);
  useEffect(()=>{ if (bodyRef.current) bodyRef.current.scrollTop=0; },[open,action?.id,loading,result]);
  if (!open||!action) return null;
  const Icon = action.icon;

  const copyText = () => {
    const text = action.id==="mistakes"?(parseMistakesReport(result)?mistakesReportToText(parseMistakesReport(result)):result):result;
    if (!text) return;
    navigator.clipboard?.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1600); });
  };

  const canSave = !!action.versionKey&&!!result&&!loading&&!error;
  const canAppendRecap = action.id==="mistakes"&&!!result&&!loading&&!error&&!!parseMistakesReport(result);
  const tabLabel = action.versionKey?VERSION_TABS.find(t=>t.key===action.versionKey)?.label||action.versionKey:null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9990] bg-black/45 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      {/* Sheet */}
      <div className="fixed z-[9991] bg-[var(--bg-surface)] flex flex-col overflow-hidden border border-[var(--bg-border)]
        left-0 right-0 w-full rounded-[22px] shadow-lg-brand animate-slide-up
        md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[min(700px,calc(100vw-48px))]"
        style={{
          top:"calc(env(safe-area-inset-top,0px) + 12px)",
          bottom:"calc(var(--bottom-nav-h,60px) + 10px + env(safe-area-inset-bottom,0px))",
          // Desktop override via media query below
        }}
        role="dialog" aria-modal="true">
        <div className="flex justify-center shrink-0 pt-2.5 pb-0.5 md:hidden">
          <span className="w-[34px] h-1 rounded-full bg-[var(--bg-border)]" />
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 pt-2.5 pb-3.5 border-b border-[var(--bg-border)]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background:`${action.accent}1f`, color:action.accent }}>
            <Icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[var(--text-primary)] leading-tight truncate">{action.label}</p>
            <p className="text-[10.5px] font-mono text-[var(--text-muted)] mt-0.5">
              AI Mentor · saved to <span style={{ color:action.accent }}>{tabLabel??"note"}</span> tab
            </p>
          </div>
          <button onClick={onClose} className="inline-flex items-center justify-center w-9 h-9 rounded-[11px] text-[var(--text-muted)] bg-transparent border-0 cursor-pointer hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 min-h-0 break-words"
          style={{ scrollbarWidth:"thin", scrollbarColor:"var(--bg-border) transparent" }}>
          <AIResultBody actionId={action.id} loading={loading} error={error} result={result} />
        </div>
        {!loading&&result&&!error && (
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-[var(--bg-border)] bg-[var(--bg-surface)] flex-wrap"
            style={{ paddingBottom:"calc(12px + env(safe-area-inset-bottom,0px))" }}>
            {[
              { show:true, fn:copyText, children:<>{copied?<Check size={14} className="text-[#34d399]"/>:<Copy size={14}/>}{copied?"Copied":"Copy"}</> },
              { show:true, fn:onRegenerate, children:<><RotateCcw size={14}/> Regenerate</> },
              { show:canAppendRecap, fn:onAppendRecap, children:<><Plus size={14}/> Add recap to original</>, full:true },
              { show:canSave, fn:()=>onSaveVersion(action.versionKey), children:<><Check size={14}/> Save to {tabLabel} tab</>, primary:true },
            ].filter(b=>b.show).map((b,i)=>(
              <button key={i} onClick={b.fn}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[11px] text-[12.5px] font-semibold transition-all active:scale-95 min-h-[40px]
                  ${b.primary?"bg-[var(--accent-blue)] text-white border-0 hover:opacity-90":
                    "bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--bg-border)] hover:bg-[var(--bg-border)]"}
                  ${b.full?"flex-[1_1_100%] justify-center":"flex-1 justify-center"}`}>
                {b.children}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Desktop positon override */}
      <style>{`
        @media(min-width:768px){
          [role=dialog]{top:24px!important;bottom:24px!important;max-height:calc(100dvh - 48px);}
        }
        @keyframes mn-pulse-dot{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}
      `}</style>
    </>
  );
}

// ─── Sign-in gate ─────────────────────────────────────────────────────────────

const SignInGate = memo(function SignInGate({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[9990] bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed z-[9991] bg-[var(--bg-surface)] flex flex-col overflow-hidden border border-[var(--bg-border)] rounded-[22px] shadow-lg-brand
        left-0 right-0 w-full animate-slide-up
        md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[min(480px,calc(100vw-48px))]"
        style={{
          top:"calc(env(safe-area-inset-top,0px) + 12px)",
          bottom:"calc(var(--bottom-nav-h,60px) + 10px + env(safe-area-inset-bottom,0px))",
        }}
        role="dialog" aria-modal="true">
        <div className="flex justify-center shrink-0 pt-2.5 pb-0.5 md:hidden">
          <span className="w-[34px] h-1 rounded-full bg-[var(--bg-border)]" />
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 pt-2.5 pb-3.5 border-b border-[var(--bg-border)]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[var(--accent-blue-dim)] text-[var(--accent-blue)]">
            <Sparkles size={16} />
          </div>
          <p className="flex-1 text-[14px] font-bold text-[var(--text-primary)]">Sign in for AI tools</p>
          <button onClick={onClose} className="inline-flex items-center justify-center w-9 h-9 rounded-[11px] text-[var(--text-muted)] border-0 bg-transparent cursor-pointer hover:bg-[var(--bg-muted)] transition-colors" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="flex flex-col items-center text-center gap-3 py-8 px-4">
          <p className="text-[13px] text-[var(--text-secondary)] max-w-[300px]">
            Your notes stay saved on this device either way. Sign in to let your AI mentor improve, audit and reformat them.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono bg-[var(--accent-blue-dim)] text-[var(--accent-blue)]">
            <LogIn size={12} /> Tap your profile to sign in
          </div>
        </div>
      </div>
    </>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorNotes({ isLoggedIn = false, contextHint = "Notes section" }) {
  const [notes,     setNotes]     = useState(()=>loadNotesFromStorage());
  const [activeId,  setActiveId]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [topicFilter,setTopicFilter]=useState(null);
  const [mobilePane,setMobilePane]=useState("list");
  const [readingMode,setReadingMode]=useState(false);

  const [draft,     setDraft]     = useState({ title:"", topic:null, content:"" });
  const [activeTab, setActiveTab] = useState("original");
  const [saveStatus,setSaveStatus]=useState("idle");
  const [lastSavedAt,setLastSavedAt]=useState(null);

  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [activeAction,  setActiveAction]  = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiError,       setAiError]       = useState(null);
  const [aiResult,      setAiResult]      = useState(null);
  const [signInGateOpen,setSignInGateOpen]=useState(false);

  const saveTimer          = useRef(null);
  const textareaRef        = useRef(null);
  const titleRef           = useRef(null);
  const skipNextSave       = useRef(true);
  const contentHistory     = useRef({});
  const undoSnapshotTimer  = useRef(null);
  const [canUndo, setCanUndo] = useState(false);

  const activeNote = useMemo(()=>notes.find(n=>n.id===activeId)||null,[notes,activeId]);

  useEffect(()=>{
    skipNextSave.current = true;
    setActiveTab("original");
    if (activeNote) {
      setDraft({ title:activeNote.title||"", topic:activeNote.topic||null, content:activeNote.content||"" });
      setSaveStatus("saved"); setLastSavedAt(activeNote.updatedAt);
    } else {
      setDraft({ title:"", topic:null, content:"" });
      setSaveStatus("idle"); setLastSavedAt(null);
    }
  },[activeId]); // eslint-disable-line

  useEffect(()=>{
    const el = textareaRef.current;
    if (!el) return;
    el.style.height="auto"; el.style.height=`${el.scrollHeight}px`;
  },[draft.content,readingMode]);

  const persistDraft = useCallback((id,nextDraft)=>{
    setSaveStatus("saving");
    setNotes(prev=>{
      const now = new Date().toISOString();
      const updated = prev.map(n=>n.id===id?{...n,...nextDraft,updatedAt:now}:n);
      persistNotesToStorage(updated); setLastSavedAt(now); return updated;
    });
    setSaveStatus("saved");
  },[]);

  useEffect(()=>{
    if (!activeId) return;
    if (skipNextSave.current) { skipNextSave.current=false; return; }
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(()=>persistDraft(activeId,draft),AUTOSAVE_DEBOUNCE_MS);
    return ()=>clearTimeout(saveTimer.current);
  },[draft,activeId,persistDraft]);

  useEffect(()=>{
    const flush = ()=>{ if (activeId) { clearTimeout(saveTimer.current); persistDraft(activeId,draft); } };
    document.addEventListener("visibilitychange",flush);
    return ()=>{ document.removeEventListener("visibilitychange",flush); flush(); };
  },[activeId,draft,persistDraft]); // eslint-disable-line

  const handleCreate = useCallback(()=>{
    const now=new Date().toISOString();
    const note={ id:uid(), title:"", topic:topicFilter||null, content:"", versions:{}, createdAt:now, updatedAt:now };
    setNotes(prev=>{ const u=[note,...prev]; persistNotesToStorage(u); return u; });
    setActiveId(note.id); setMobilePane("editor"); setReadingMode(false);
    setTimeout(()=>titleRef.current?.focus(),80);
  },[topicFilter]);

  const handleSelect = useCallback((id)=>{ setActiveId(id); setMobilePane("editor"); setReadingMode(false); },[]);
  const handleDelete = useCallback((id)=>{
    setNotes(prev=>{ const u=prev.filter(n=>n.id!==id); persistNotesToStorage(u); return u; });
    setActiveId(prev=>prev===id?null:prev);
  },[]);
  const handleBackToList = useCallback(()=>setMobilePane("list"),[]);

  const setTitle = useCallback((title)=>setDraft(d=>({...d,title})),[]);
  const setTopic = useCallback((topic)=>setDraft(d=>({...d,topic})),[]);

  const pushUndoSnapshot = useCallback((id,content)=>{
    const hist = contentHistory.current[id]||[];
    const last = hist[hist.length-1];
    if (last===content) return;
    const next = [...hist,content].slice(-MAX_UNDO_DEPTH);
    contentHistory.current[id]=next; setCanUndo(next.length>1);
  },[]);

  const setContent = useCallback((content)=>{
    setDraft(d=>({...d,content}));
    clearTimeout(undoSnapshotTimer.current);
    undoSnapshotTimer.current=setTimeout(()=>{
      setActiveId(id=>{ if (id) pushUndoSnapshot(id,content); return id; });
    },UNDO_SNAPSHOT_DEBOUNCE_MS);
  },[pushUndoSnapshot]);

  useEffect(()=>{
    if (!activeId) { setCanUndo(false); return; }
    setCanUndo((contentHistory.current[activeId]||[]).length>1);
  },[activeId]);

  useEffect(()=>{
    if (!activeId||!activeNote) return;
    if (!contentHistory.current[activeId]) { contentHistory.current[activeId]=[activeNote.content||""]; setCanUndo(false); }
  },[activeId,activeNote]);

  const handleUndo = useCallback(()=>{
    if (!activeId) return;
    const hist=contentHistory.current[activeId]||[];
    if (hist.length<=1) return;
    const next=hist.slice(0,-1);
    contentHistory.current[activeId]=next;
    const prevContent=next[next.length-1];
    setDraft(d=>({...d,content:prevContent})); setCanUndo(next.length>1);
    clearTimeout(saveTimer.current); persistDraft(activeId,{content:prevContent});
  },[activeId,persistDraft]);

  useEffect(()=>{
    const onKeyDown=(e)=>{
      if ((e.ctrlKey||e.metaKey)&&e.key==="z"&&!e.shiftKey) {
        if (document.activeElement===textareaRef.current) {
          const hist=contentHistory.current[activeId]||[];
          if (hist.length>1) { e.preventDefault(); handleUndo(); }
        }
      }
    };
    window.addEventListener("keydown",onKeyDown);
    return ()=>window.removeEventListener("keydown",onKeyDown);
  },[activeId,handleUndo]);

  const runAction = useCallback(async(action)=>{
    if (!isLoggedIn) { setSignInGateOpen(true); return; }
    setActiveAction(action); setDrawerOpen(true); setAiLoading(true); setAiError(null); setAiResult(null);
    try {
      const res=await action.fn({ title:draft.title, topic:topicMeta(draft.topic)?.label, content:draft.content });
      setAiResult(res);
    } catch(e) { setAiError(sanitizeAIError(e.message)); }
    finally { setAiLoading(false); }
  },[isLoggedIn,draft]);

  const closeDrawer = useCallback(()=>setDrawerOpen(false),[]);

  const handleSaveVersion = useCallback((versionKey)=>{
    if (!aiResult||!activeId||!versionKey) return;
    const now=new Date().toISOString();
    setNotes(prev=>{
      const u=prev.map(n=>n.id!==activeId?n:{ ...n, versions:{...(n.versions||{}),[versionKey]:aiResult}, updatedAt:now });
      persistNotesToStorage(u); return u;
    });
    setLastSavedAt(now); setSaveStatus("saved"); setDrawerOpen(false); setActiveTab(versionKey);
  },[aiResult,activeId]);

  const handleClearVersion = useCallback((versionKey)=>{
    if (!activeId||!versionKey) return;
    const now=new Date().toISOString();
    setNotes(prev=>{
      const u=prev.map(n=>{
        if (n.id!==activeId) return n;
        const versions={...(n.versions||{})}; delete versions[versionKey];
        return {...n,versions,updatedAt:now};
      });
      persistNotesToStorage(u); return u;
    });
    setActiveTab("original");
  },[activeId]);

  const handleAppendRecap = useCallback(()=>{
    const report=parseMistakesReport(aiResult);
    if (!report||!activeId) return;
    const now=new Date().toISOString();
    const block=`\n\n---\n## AI Review — ${new Date().toLocaleDateString(undefined,{month:"short",day:"numeric"})}\n**Scores:** Knowledge ${report.knowledge}/10 · Clarity ${report.clarity}/10 · Retention ${report.retention}/10\n\n**Missing Points**\n${report.missing.map(m=>`- ${m}`).join("\n")}\n\n**Memory Traps**\n${report.traps.map(t=>`- ${t}`).join("\n")}\n\n**30 Second Revision**\n${report.revision}\n`;
    const newContent=`${draft.content}${block}`;
    setDraft(d=>({...d,content:newContent}));
    setNotes(prev=>{ const u=prev.map(n=>n.id===activeId?{...n,content:newContent,updatedAt:now}:n); persistNotesToStorage(u); return u; });
    setLastSavedAt(now); setSaveStatus("saved"); setDrawerOpen(false);
  },[aiResult,activeId,draft.content]);

  const aiDisabled = draft.content.trim().length<MIN_CONTENT_FOR_AI;
  const meta = topicMeta(draft.topic);

  return (
    <>
      {/*
        Root: takes exactly the full viewport height — min-h-screen + h-screen so there's
        zero extra space on both mobile and desktop. overflow-hidden prevents any double scroll.
      */}
      <div className="flex flex-col w-full h-screen min-h-screen overflow-hidden bg-[var(--bg-base)]" style={{ boxSizing:"border-box" }}>

        {/* ── Header ── */}
        <header className="flex shrink-0 items-center gap-2.5 border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-[clamp(14px,3vw,22px)]"
          style={{ paddingTop:"max(14px,env(safe-area-inset-top))", paddingBottom:14 }}>
          <div className="w-[34px] h-[34px] rounded-[11px] shrink-0 flex items-center justify-center border border-[rgba(245,158,11,0.25)]"
            style={{ background:"linear-gradient(135deg,var(--accent-gold-dim),rgba(245,158,11,.08))", color:"var(--accent-gold)" }}>
            <NotebookPen size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-[var(--text-primary)] leading-tight">Notes</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">Write once. Revise fast.</p>
          </div>
          {/* Mobile: undo + read toggle when viewing editor */}
          {mobilePane==="editor"&&activeNote && (
            <>
              {activeTab==="original"&&!readingMode && (
                <button onClick={handleUndo} disabled={!canUndo}
                  className={`lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-[11px] border-0 bg-transparent cursor-pointer text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors ${canUndo?"opacity-100":"opacity-35"}`}
                  aria-label="Undo" title="Undo">
                  <History size={17} />
                </button>
              )}
              {activeTab==="original" && (
                <button onClick={()=>setReadingMode(v=>!v)}
                  className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-[11px] border-0 bg-transparent cursor-pointer text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"
                  aria-label="Toggle reading mode">
                  {readingMode?<EyeOff size={17}/>:<Eye size={17}/>}
                </button>
              )}
            </>
          )}
        </header>

        {/* ── Body: sidebar + editor, fills remaining height ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Sidebar */}
          <Sidebar
            notes={notes} activeId={activeId} onSelect={handleSelect} onDelete={handleDelete}
            onCreate={handleCreate} search={search} onSearchChange={e=>setSearch(e.target.value)}
            topicFilter={topicFilter} onTopicFilter={setTopicFilter} paneVisible={mobilePane==="list"}
          />

          {/* Editor pane */}
          <div className={`${mobilePane==="editor"?"flex":"hidden"} lg:flex flex-1 flex-col min-w-0 overflow-hidden bg-[var(--bg-base)]`}>
            {!activeNote ? (
              <EmptyEditor onCreate={handleCreate} />
            ) : (
              <>
                {/* Toolbar */}
                <div className="shrink-0 bg-[var(--bg-surface)] border-b border-[var(--bg-border)]">
                  <div className="px-4 pt-3.5 pb-3 flex items-start gap-2">
                    <button onClick={handleBackToList}
                      className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-[11px] -ml-1.5 shrink-0 text-[var(--text-muted)] border-0 bg-transparent cursor-pointer hover:bg-[var(--bg-muted)] transition-colors"
                      aria-label="Back to notes">
                      <ChevronLeft size={19} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <input ref={titleRef} value={draft.title} onChange={e=>setTitle(e.target.value)}
                        placeholder="Untitled note"
                        className="w-full border-0 outline-none bg-transparent font-bold text-[var(--text-primary)] leading-tight placeholder-[var(--text-muted)]"
                        style={{ fontSize:"clamp(18px,2.4vw,22px)", opacity:activeTab!=="original"?0.7:1 }}
                        readOnly={activeTab!=="original"}
                        aria-label="Note title" />
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {activeTab==="original" ? (
                          <>
                            <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
                            <span className="text-[11px] font-mono text-[var(--text-muted)]">· {wordCount(draft.content)} words</span>
                          </>
                        ) : (()=>{
                          const tab=VERSION_TABS.find(t=>t.key===activeTab);
                          return <span className="text-[11px] font-mono" style={{ color:tab?.color }}>{tab?.label} version · read-only</span>;
                        })()}
                      </div>
                    </div>
                    {/* Desktop: read toggle + undo */}
                    {activeTab==="original" && (
                      <button onClick={()=>setReadingMode(v=>!v)}
                        className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-[11px] text-[var(--text-muted)] border-0 bg-transparent cursor-pointer hover:bg-[var(--bg-muted)] transition-colors"
                        aria-label="Toggle reading mode" title="Reading mode">
                        {readingMode?<PenLine size={17}/>:<Eye size={17}/>}
                      </button>
                    )}
                    {activeTab==="original"&&!readingMode && (
                      <button onClick={handleUndo} disabled={!canUndo}
                        className={`hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-[11px] text-[var(--text-muted)] border-0 bg-transparent cursor-pointer hover:bg-[var(--bg-muted)] transition-colors ${canUndo?"opacity-100":"opacity-35"}`}
                        aria-label="Undo" title="Undo (Ctrl+Z)">
                        <History size={16} />
                      </button>
                    )}
                  </div>

                  {/* Topic chips */}
                  {activeTab==="original"&&!readingMode && (
                    <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none flex-wrap" style={{ scrollbarWidth:"none" }}>
                      <TopicChip topic={{ color:"var(--text-muted)", label:"No topic" }} active={!draft.topic} onClick={()=>setTopic(null)} />
                      {TOPICS.map(t=>(
                        <TopicChip key={t.id} topic={t} active={draft.topic===t.id} onClick={()=>setTopic(t.id)} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Version tabs */}
                <VersionTabBar
                  activeTab={activeTab}
                  onTabChange={tab=>{ setActiveTab(tab); setReadingMode(false); }}
                  versions={activeNote.versions}
                  onClearVersion={handleClearVersion}
                />

                {/* Content area — scrollable, fills remaining space */}
                <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-5"
                  style={{
                    scrollbarWidth:"thin", scrollbarColor:"var(--bg-border) transparent",
                    // on mobile, leave space for the sticky AI rail
                    paddingBottom: activeTab==="original"&&!readingMode ? "calc(80px + env(safe-area-inset-bottom,0px))" : undefined,
                  }}>
                  <div className="max-w-[800px] mx-auto w-full h-full">

                    {/* Original tab */}
                    {activeTab==="original" && (
                      readingMode ? (
                        <div className="max-w-[680px] mx-auto animate-rise">
                          {meta && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold mb-3" style={{ color:meta.color }}>
                              <span className="w-[7px] h-[7px] rounded-full" style={{ background:meta.color }} /> {meta.label}
                            </span>
                          )}
                          <h1 className="font-display text-[26px] font-bold text-[var(--text-primary)] leading-tight mb-4">{draft.title||"Untitled note"}</h1>
                          {draft.content.trim() ? renderRich(draft.content) : (
                            <p className="text-[13px] text-[var(--text-muted)] font-mono">This note is empty. Switch back to writing mode to add content.</p>
                          )}
                        </div>
                      ) : (
                        <textarea ref={textareaRef} value={draft.content} onChange={e=>setContent(e.target.value)}
                          placeholder="Start writing — concepts, dates, articles, your own words…"
                          className="w-full border-0 outline-none resize-none bg-transparent text-[var(--text-primary)] leading-[1.85] font-inherit placeholder-[var(--text-muted)]"
                          style={{ fontSize:"clamp(14.5px,1.6vw,15.5px)", minHeight:"40vh" }}
                          aria-label="Note content" />
                      )
                    )}

                    {/* AI version tabs */}
                    {activeTab!=="original" && (()=>{
                      const tab = VERSION_TABS.find(t=>t.key===activeTab);
                      const versionContent = activeNote.versions?.[activeTab];
                      const matchingAction = AI_ACTIONS.find(a=>a.versionKey===activeTab);
                      if (!versionContent) return (
                        <EmptyVersionSlot tab={tab} onRunAction={()=>{ if (matchingAction) runAction(matchingAction); }} />
                      );
                      return (
                        <div className="animate-rise" style={{ paddingBottom:40 }}>
                          <div className="flex items-center gap-2 mb-5 flex-wrap">
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold tracking-widest border"
                              style={{ background:`${tab.color}18`, color:tab.color, borderColor:`${tab.color}44` }}>
                              {tab.label.toUpperCase()} VERSION
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              {wordCount(versionContent)} words · read-only
                            </span>
                            <button onClick={()=>navigator.clipboard?.writeText(versionContent)}
                              className="inline-flex items-center gap-1 ml-auto px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-[var(--bg-border)] bg-[var(--bg-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-border)] transition-colors"
                              title="Copy to clipboard">
                              <Copy size={11} /> Copy
                            </button>
                            {matchingAction && (
                              <button onClick={()=>runAction(matchingAction)} disabled={aiDisabled}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-colors disabled:opacity-40"
                                style={{ borderColor:`${tab.color}44`, color:tab.color, background:`${tab.color}10` }}
                                title="Regenerate this version">
                                <RotateCcw size={11} /> Regenerate
                              </button>
                            )}
                          </div>
                          {renderAIContent(versionContent,{actionId:matchingAction?.id})}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* AI action rail — sticky on mobile, static on desktop */}
                {activeTab==="original"&&!readingMode && (
                  <div className="shrink-0 border-t border-[var(--bg-border)] bg-[var(--bg-surface)]
                    lg:static lg:border-t-0 lg:px-4 lg:pb-4 lg:pt-0
                    sticky bottom-0 z-20 px-3.5 py-2.5"
                    style={{ paddingBottom:"calc(10px + env(safe-area-inset-bottom,0px))" }}>
                    <div className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-wrap lg:pt-3" style={{ scrollbarWidth:"none" }}>
                      {AI_ACTIONS.map(action=>{
                        const Icon=action.icon;
                        const hasVersion=!!(action.versionKey&&activeNote.versions?.[action.versionKey]);
                        return (
                          <button key={action.id} onClick={()=>runAction(action)} disabled={aiDisabled}
                            className="inline-flex items-center gap-1.5 shrink-0 px-3.5 py-2.5 rounded-[13px] text-[12.5px] font-semibold border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer transition-all duration-150 min-h-[40px] hover:border-current disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 relative"
                            style={{ "--ai-accent":action.accent }}
                            onMouseEnter={e=>{ if (!aiDisabled) { e.currentTarget.style.borderColor=action.accent; e.currentTarget.style.color=action.accent; }}}
                            onMouseLeave={e=>{ e.currentTarget.style.borderColor=""; e.currentTarget.style.color=""; }}
                            title={aiDisabled?"Write a few more sentences first":action.label}>
                            <Icon size={14} style={{ color:action.accent }} />
                            <span className="hidden sm:inline">{action.label}</span>
                            <span className="sm:hidden">{action.short}</span>
                            {hasVersion && (
                              <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full opacity-85"
                                style={{ background:action.accent }} />
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

      {/* Drawers */}
      {drawerOpen && (
        <AIDrawer
          open={drawerOpen} action={activeAction} loading={aiLoading}
          error={aiError} result={aiResult} onClose={closeDrawer}
          onRegenerate={()=>runAction(activeAction)}
          onSaveVersion={handleSaveVersion}
          onAppendRecap={handleAppendRecap}
        />
      )}
      {signInGateOpen && <SignInGate onClose={()=>setSignInGateOpen(false)} />}
    </>
  );
}