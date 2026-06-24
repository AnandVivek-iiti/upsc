// import {
//   Clock,
//   TrendingUp,
//   CheckCircle,
//   Plus,
//   BookMarked,
//   Brain,
//   ListChecks,
//   BarChart2,
//   X,
//   Flame,
//   Target,
//   ChevronDown,
//   ChevronUp,
//   ChevronLeft,
//   ChevronRight,
//   ArrowRight,
//   FileSearch,
//   BookOpenCheck,
//   FlaskConical,
//   Rocket,
//   MessageSquarePlus,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { SYLLABUS, PAPER_ORDER, getPct } from "../../data/PYQs/syllabusData";
// import AuthGate from "../../components/ui/AuthGate";
// import timerStore from "../../hooks/timerStore";
// import QuestionStatsPanel from "../../components/QuestionStats";
// import { AvatarCircle } from "../User/ProfilePage";
// import AIRevisionPanel from "../AI/AIRevisionPanel";
// import SubjectStudyTimer from "./SubjectStudyTimer";
// import SubjectAnalyticsDashboard from "./SubjectAnalyticsDashboard"; // ← ADDED
// import { getISTDateString, getISTDay } from "../../utils/dateUtils";

// // ─── Tiny helpers ──────────────────────────────────────────────────────────────
// function todayKey() {
//   return getISTDateString();
// }
// function fmtTime(secs) {
//   const h = Math.floor(secs / 3600);
//   const m = Math.floor((secs % 3600) / 60);
//   const s = secs % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
// }
// function fmtHM(secs) {
//   const h = Math.floor(secs / 3600);
//   const m = Math.floor((secs % 3600) / 60);
//   if (h === 0) return `${m}m`;
//   return m === 0 ? `${h}h` : `${h}h ${m}m`;
// }
// function pad2(n) {
//   return String(n).padStart(2, "0");
// }

// // ─── Modern chart palette ────────────────────────────────────────────────────
// const CHART_COLORS = {
//   goalMet:    { solid: "#10b981", grad: "linear-gradient(180deg, #34d399 0%, #059669 100%)", glow: "rgba(16,185,129,0.4)" },
//   inProgress: { solid: "#6366f1", grad: "linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)", glow: "rgba(99,102,241,0.4)" },
//   today:      { solid: "#f59e0b", grad: "linear-gradient(180deg, #fcd34d 0%, #d97706 100%)", glow: "rgba(245,158,11,0.45)" },
//   best:       { solid: "#ec4899", grad: "linear-gradient(180deg, #f472b6 0%, #db2777 100%)", glow: "rgba(236,72,153,0.4)" },
// };

// // ─── Collapsible Section Wrapper ───────────────────────────────────────────────
// function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, tight = false }) {
//   const [isOpen, setIsOpen] = useState(defaultOpen);

//   return (
//     <div className={`glass-panel ${isOpen ? "overflow-visible" : "overflow-hidden"}`}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-bg-muted/50 transition-colors"
//       >
//         <div className="flex items-center gap-2">
//           {Icon && <Icon size={14} className="text-accent-gold" />}
//           <h3 className="text-sm font-display font-semibold text-text-primary text-left">
//             {title}
//           </h3>
//         </div>
//         {isOpen ? (
//           <ChevronUp size={16} className="text-text-muted shrink-0" />
//         ) : (
//           <ChevronDown size={16} className="text-text-muted shrink-0" />
//         )}
//       </button>
//       <div
//         className={`transition-all duration-300 ease-in-out ${
//           isOpen ? "max-h-[6000px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
//         }`}
//       >
//         <div className={`${tight ? "px-1.5 sm:px-2.5" : "px-3 sm:px-4"} pb-3 sm:pb-4`} style={{ overflow: "visible" }}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── ActionHub ────────────────────────────────────────────────────────────────
// function ActionHub({ onNavigate }) {
//   const [grown, setGrown] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setGrown(true), 80);
//     return () => clearTimeout(t);
//   }, []);

//   const actions = [
//     {
//       icon: Rocket,
//       iconColor: "#f59e0b",
//       gradFrom: "rgba(245,158,11,0.12)",
//       gradTo:   "rgba(245,158,11,0.04)",
//       border:   "rgba(245,158,11,0.25)",
//       glow:     "rgba(245,158,11,0.15)",
//       title: "Answer Evaluation",
//       desc: "Evaluate your GS/Mains answer in seconds. Get score, strengths, weaknesses, keyword coverage, structural feedback and a topper-style rewritten answer.",
//       cta: "Evaluate Answer",
//       view: "mains",
//     },
//     {
//       icon: FileSearch,
//       iconColor: "#818cf8",
//       gradFrom: "rgba(99,102,241,0.12)",
//       gradTo:   "rgba(99,102,241,0.04)",
//       border:   "rgba(99,102,241,0.25)",
//       glow:     "rgba(99,102,241,0.15)",
//       title: "Audit Notes",
//       desc: "Check gaps in your notes instantly. Get missing points, memory traps, 30-second revision cards and improved notes.",
//       cta: "Audit Notes",
//       view: "notes",
//     },
//     {
//       icon: BookOpenCheck,
//       iconColor: "#34d399",
//       gradFrom: "rgba(16,185,129,0.12)",
//       gradTo:   "rgba(16,185,129,0.04)",
//       border:   "rgba(16,185,129,0.25)",
//       glow:     "rgba(16,185,129,0.15)",
//       title: "Topic-wise Practice",
//       desc: "Practice PYQs topic-wise and automatically update syllabus progress when questions are completed.",
//       cta: "Practice Questions",
//       view: "pre",
//     },
//     {
//       icon: FlaskConical,
//       iconColor: "#f472b6",
//       gradFrom: "rgba(236,72,153,0.12)",
//       gradTo:   "rgba(236,72,153,0.04)",
//       border:   "rgba(236,72,153,0.25)",
//       glow:     "rgba(236,72,153,0.15)",
//       title: "Mock Test Series",
//       desc: "Attempt a timed UPSC test. After completion: analyze performance, identify weak areas, and push weak topics into the AI Revision Queue automatically.",
//       cta: "Start Test",
//       view: "test-series",
//     },
//   ];

//   return (
//     <div className="glass-panel p-3 sm:p-5 space-y-3 sm:space-y-4">
//       <div className="flex items-center gap-2">
//         <Rocket size={14} className="text-accent-gold shrink-0" />
//         <div>
//           <h3 className="text-sm sm:text-base font-display font-bold text-text-primary leading-tight">
//             Start Studying
//           </h3>
//           <p className="text-[10px] sm:text-xs font-mono text-text-muted mt-0.5">
//             Choose what you want to work on right now.
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
//         {actions.map(({ icon: Icon, iconColor, gradFrom, gradTo, border, glow, title, desc, cta, view }, i) => (
//           <div
//             key={title}
//             className="relative rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 cursor-pointer group
//                        transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
//             style={{
//               background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
//               border: `1px solid ${border}`,
//               boxShadow: `0 2px 16px ${glow}`,
//               opacity: grown ? 1 : 0,
//               transform: grown ? "translateY(0)" : "translateY(14px)",
//               transition: `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms, box-shadow 0.2s ease, translate 0.2s ease`,
//             }}
//             onClick={() => onNavigate?.(view)}
//           >
//             <div
//               className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
//               style={{ background: `radial-gradient(ellipse at 30% 30%, ${gradFrom} 0%, transparent 70%)` }}
//             />
//             <div className="flex items-center gap-2.5 relative z-10">
//               <div
//                 className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
//                 style={{ background: `${iconColor}20`, border: `1px solid ${iconColor}30` }}
//               >
//                 <Icon size={16} style={{ color: iconColor }} />
//               </div>
//               <h4 className="text-sm sm:text-[15px] font-display font-bold text-text-primary leading-tight">
//                 {title}
//               </h4>
//             </div>
//             <p className="text-[11px] sm:text-xs font-mono text-text-secondary leading-relaxed relative z-10">
//               {desc}
//             </p>
//             <button
//               className="relative z-10 flex items-center justify-center gap-1.5 w-full py-2 sm:py-2.5 rounded-lg
//                          text-[11px] sm:text-xs font-semibold font-mono transition-all duration-200 group-hover:gap-2.5"
//               style={{
//                 background: `${iconColor}18`,
//                 border: `1px solid ${iconColor}35`,
//                 color: iconColor,
//               }}
//               onClick={(e) => { e.stopPropagation(); onNavigate?.(view); }}
//             >
//               {cta}
//               <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── StudyChart ────────────────────────────────────────────────────────────────
// function StudyChart({ logs = [], targetHours = 8 }) {
//   const [view, setView] = useState("weekly");
//   const [isMobile, setIsMobile] = useState(false);
//   const [monthOffset, setMonthOffset] = useState(0);
//   const [yearOffset, setYearOffset] = useState(0);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 640);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   useEffect(() => {
//     if (view !== "monthly") setMonthOffset(0);
//     if (view !== "yearly") setYearOffset(0);
//   }, [view]);

//   const [grown, setGrown] = useState(false);
//   useEffect(() => {
//     setGrown(false);
//     const t = setTimeout(() => setGrown(true), 60);
//     return () => clearTimeout(t);
//   }, [view, monthOffset, yearOffset]);

//   const getHoursForDate = (dateStr) => {
//     const serverHours = logs.find((l) => l.date === dateStr)?.hours || 0;
//     if (dateStr === todayKey()) {
//       const liveHours = parseFloat((timerStore.elapsed / 3600).toFixed(2));
//       return Math.max(serverHours, liveHours);
//     }
//     return serverHours;
//   };

//   const weeklyData = (() => {
//     const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const today = new Date();
//     return Array.from({ length: isMobile ? 5 : 7 }, (_, i) => {
//       const d = new Date(today);
//       d.setDate(today.getDate() - ((isMobile ? 4 : 6) - i));
//       const dateStr = getISTDateString(d);
//       return {
//         label:   DAY_NAMES[getISTDay(d)].substring(0, isMobile ? 2 : 3),
//         hours:   getHoursForDate(dateStr),
//         isToday: i === (isMobile ? 4 : 6),
//       };
//     });
//   })();

//   const todayStr = todayKey();
//   const [todayY, todayM] = todayStr.split("-").map(Number);

//   const viewedMonth  = new Date(todayY, todayM - 1 + monthOffset, 1);
//   const viewYear     = viewedMonth.getFullYear();
//   const viewMonth    = viewedMonth.getMonth();
//   const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
//   const firstWeekday = viewedMonth.getDay();

//   const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
//     const dayNum   = i + 1;
//     const dateStr  = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(dayNum)}`;
//     const isFuture = dateStr > todayStr;
//     const hours    = isFuture ? 0 : getHoursForDate(dateStr);
//     return {
//       day: dayNum, dateStr, hours,
//       isToday: dateStr === todayStr,
//       isFuture,
//       met:     !isFuture && hours >= targetHours,
//       studied: !isFuture && hours > 0,
//     };
//   });

//   const monthLabel     = viewedMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
//   const isCurrentMonth = monthOffset === 0;
//   const viewedYear     = todayY + yearOffset;
//   const isCurrentYear  = yearOffset === 0;

//   const elapsedDays  = monthDays.filter((d) => !d.isFuture);
//   const studiedCount = elapsedDays.filter((d) => d.studied).length;
//   const metCount     = elapsedDays.filter((d) => d.met).length;
//   const monthTotal   = parseFloat(elapsedDays.reduce((s, d) => s + d.hours, 0).toFixed(1));
//   const monthAvg     = studiedCount ? parseFloat((monthTotal / studiedCount).toFixed(1)) : 0;

//   const dataMax  = Math.max(...weeklyData.map((d) => d.hours), 0);
//   const scaleMax = Math.max(targetHours, Math.ceil(dataMax) || 1);
//   const TICKS    = 5;
//   const ticks    = Array.from({ length: TICKS }, (_, i) =>
//     parseFloat((scaleMax * (1 - i / (TICKS - 1))).toFixed(1))
//   );
//   const AXIS_W = "w-7 sm:w-8";

//   const weekStudiedCount = weeklyData.filter((d) => d.hours > 0).length;
//   const weekMetCount     = weeklyData.filter((d) => d.hours >= targetHours).length;
//   const weekTotal        = parseFloat(weeklyData.reduce((s, d) => s + d.hours, 0).toFixed(1));
//   const weekAvg          = weekStudiedCount ? parseFloat((weekTotal / weekStudiedCount).toFixed(1)) : 0;

//   const weekStats = [
//     { label: "Total",    val: `${weekTotal}h`,                        icon: Clock,       color: "#C9A84C" },
//     { label: "Days Hit", val: `${weekMetCount}/${weeklyData.length}`, icon: CheckCircle, color: "#22c55e" },
//     { label: "Avg/Day",  val: `${weekAvg}h`,                          icon: TrendingUp,  color: "#3b82f6" },
//   ];

//   const monthStats = [
//     { label: "Total",    val: `${monthTotal}h`,                    icon: Clock,       color: "#C9A84C" },
//     { label: "Days Hit", val: `${metCount}/${elapsedDays.length}`, icon: CheckCircle, color: "#22c55e" },
//     { label: "Avg/Day",  val: `${monthAvg}h`,                      icon: TrendingUp,  color: "#3b82f6" },
//   ];

//   const yearlyData = (() => {
//     const MONTH_FULL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
//     const serverTodayHours    = logs.find((l) => l.date === todayStr)?.hours || 0;
//     const liveTodayHours      = parseFloat((timerStore.elapsed / 3600).toFixed(2));
//     const effectiveTodayHours = Math.max(serverTodayHours, liveTodayHours);
//     return Array.from({ length: 12 }, (_, m) => {
//       const monthPrefix = `${viewedYear}-${pad2(m + 1)}`;
//       let total = logs
//         .filter((l) => l.date && l.date.startsWith(monthPrefix))
//         .reduce((s, l) => s + (l.hours || 0), 0);
//       const isCurrentMonthCell = viewedYear === todayY && m === todayM - 1;
//       if (isCurrentMonthCell) total = total - serverTodayHours + effectiveTodayHours;
//       const isFuture = viewedYear > todayY || (viewedYear === todayY && m > todayM - 1);
//       return {
//         label: MONTH_FULL[m],
//         short: isMobile ? MONTH_FULL[m].slice(0, 1) : MONTH_FULL[m].slice(0, 3),
//         hours: isFuture ? 0 : parseFloat(Math.max(total, 0).toFixed(1)),
//         isCurrent: isCurrentMonthCell,
//         isFuture,
//       };
//     });
//   })();

//   const elapsedMonths      = yearlyData.filter((d) => !d.isFuture);
//   const studiedMonthsCount = elapsedMonths.filter((d) => d.hours > 0).length;
//   const yearTotal          = parseFloat(elapsedMonths.reduce((s, d) => s + d.hours, 0).toFixed(1));
//   const bestMonth          = elapsedMonths.reduce((best, d) => (d.hours > best.hours ? d : best), { hours: 0, label: "—" });
//   const yearAvg            = studiedMonthsCount ? parseFloat((yearTotal / studiedMonthsCount).toFixed(1)) : 0;

//   const yearStats = [
//     { label: "Total",      val: `${yearTotal}h`,                                                         icon: Clock,      color: "#C9A84C" },
//     { label: "Best Month", val: bestMonth.hours > 0 ? `${bestMonth.label} · ${bestMonth.hours}h` : "—", icon: Flame,      color: "#ec4899" },
//     { label: "Avg/Month",  val: `${yearAvg}h`,                                                           icon: TrendingUp, color: "#3b82f6" },
//   ];

//   const yearDataMax  = Math.max(...yearlyData.map((d) => d.hours), 0);
//   const yearScaleMax = Math.max(Math.ceil(yearDataMax / 5) * 5, 5);
//   const yearTicks    = Array.from({ length: TICKS }, (_, i) =>
//     parseFloat((yearScaleMax * (1 - i / (TICKS - 1))).toFixed(1))
//   );

//   return (
//     <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
//       <div className="flex items-center justify-between gap-2">
//         <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
//           <TrendingUp size={14} className="text-accent-green shrink-0" />
//           <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary truncate">
//             {view === "weekly" ? (isMobile ? "5-Day Hours" : "Weekly Hours") : view === "monthly" ? monthLabel : `${viewedYear} Overview`}
//           </h3>
//         </div>
//         <div className="flex items-center bg-bg-muted rounded-lg p-0.5 gap-0.5 shrink-0">
//           {[["weekly", isMobile ? "5D" : "7D"], ["monthly", "Month"], ["yearly", "Year"]].map(([v, lbl]) => (
//             <button
//               key={v}
//               onClick={() => setView(v)}
//               className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-all ${
//                 view === v ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30" : "text-text-muted hover:text-text-secondary"
//               }`}
//             >
//               {lbl}
//             </button>
//           ))}
//         </div>
//       </div>

//       {view === "weekly" ? (
//         <div className="space-y-1.5">
//           <div className="flex">
//             <div className={`${AXIS_W} shrink-0 flex flex-col justify-between h-36 sm:h-44 pr-1 sm:pr-1.5 text-right`}>
//               {ticks.map((t) => (
//                 <span key={t} className="text-[9px] sm:text-[10px] font-mono text-text-muted leading-none">{t}h</span>
//               ))}
//             </div>
//             <div className="relative flex-1 h-36 sm:h-44 border-l border-b border-bg-border">
//               {ticks.slice(0, -1).map((t) => (
//                 <div key={t} className="absolute left-0 right-0 border-t border-bg-border/50"
//                   style={{ top: `${((scaleMax - t) / scaleMax) * 100}%` }} />
//               ))}
//               <div className="absolute inset-0 flex items-end px-1 sm:px-2">
//                 {weeklyData.map(({ label, hours, isToday }, i) => {
//                   const met     = hours >= targetHours;
//                   const pct     = Math.min((hours / scaleMax) * 100, 100);
//                   const palette = isToday ? CHART_COLORS.today : met ? CHART_COLORS.goalMet : CHART_COLORS.inProgress;
//                   return (
//                     <div key={label} className="flex-1 h-full flex items-end justify-center">
//                       {hours > 0 && (
//                         <div
//                           title={`${hours}h`}
//                           className="w-full max-w-[28px] sm:max-w-[34px] rounded-t-md transition-all duration-700 ease-out"
//                           style={{
//                             height: `${grown ? Math.max(pct, 4) : 0}%`,
//                             background: palette.grad,
//                             boxShadow: `0 2px 10px ${palette.glow}`,
//                             transitionDelay: `${i * 60}ms`,
//                           }}
//                         />
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//           <div className="flex">
//             <div className={`${AXIS_W} shrink-0`} />
//             <div className="flex-1 flex px-1 sm:px-2">
//               {weeklyData.map(({ label, isToday }) => (
//                 <span key={label} className={`flex-1 text-center text-[9px] sm:text-[11px] font-mono ${isToday ? "text-accent-gold font-bold" : "text-text-muted"}`}>
//                   {label}
//                 </span>
//               ))}
//             </div>
//           </div>
//           <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted pt-1">
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.goalMet.grad }} /> Goal met</span>
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> In progress</span>
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Today</span>
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-bg-muted border border-bg-border" /> Target left</span>
//           </div>
//           <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
//             {weekStats.map(({ label, val, icon: Icon, color }, i) => (
//               <div key={label} className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
//                 style={{ background: `${color}14`, border: `1px solid ${color}30`, opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}>
//                 <div className="flex items-center gap-1">
//                   <Icon size={11} style={{ color }} />
//                   <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
//                 </div>
//                 <p className="text-lg sm:text-2xl font-display font-bold text-text-primary leading-none">{val}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : view === "monthly" ? (
//         <div className="space-y-2.5 sm:space-y-3">
//           <div className="flex items-center justify-between bg-bg-muted rounded-lg p-1 sm:p-1.5">
//             <button onClick={() => setMonthOffset((o) => o - 1)} className="p-1.5 sm:p-2 rounded-md border border-transparent hover:border-accent-gold/30 hover:bg-bg-surface transition-colors"><ChevronLeft size={15} /></button>
//             <span className="text-xs sm:text-sm font-display font-semibold text-text-primary">{isCurrentMonth ? "This month" : monthLabel}</span>
//             <button onClick={() => setMonthOffset((o) => Math.min(0, o + 1))} disabled={isCurrentMonth}
//               className={`p-1.5 sm:p-2 rounded-md border border-transparent transition-colors ${isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30 hover:bg-bg-surface"}`}>
//               <ChevronRight size={15} />
//             </button>
//           </div>
//           <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
//             {monthStats.map(({ label, val, icon: Icon, color }, i) => (
//               <div key={label} className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
//                 style={{ background: `${color}14`, border: `1px solid ${color}30`, opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}>
//                 <div className="flex items-center gap-1">
//                   <Icon size={11} style={{ color }} />
//                   <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
//                 </div>
//                 <p className="text-lg sm:text-2xl font-display font-bold text-text-primary leading-none">{val}</p>
//               </div>
//             ))}
//           </div>
//           <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
//             {["S","M","T","W","T","F","S"].map((d, i) => (
//               <span key={i} className="text-[9px] sm:text-[11px] font-mono text-text-muted">{d}</span>
//             ))}
//           </div>
//           <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
//             {Array.from({ length: firstWeekday }, (_, i) => <div key={`pad-${i}`} />)}
//             {monthDays.map((d) => {
//               const palette = d.isToday ? CHART_COLORS.today : d.met ? CHART_COLORS.goalMet : d.studied ? CHART_COLORS.inProgress : null;
//               return (
//                 <div key={d.dateStr} title={d.isFuture ? "" : `${d.dateStr} — ${d.hours}h studied`}
//                   className={`aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all duration-500 ease-out ${
//                     d.isFuture ? "border-transparent bg-transparent" : palette ? "border-transparent" : "border-gray-600/30 bg-gray-700/20"
//                   }`}
//                   style={{ background: palette ? palette.grad : undefined, boxShadow: palette ? `0 2px 8px ${palette.glow}` : undefined }}>
//                   <span className={`text-[9px] sm:text-[11px] font-mono font-bold leading-none ${palette ? "text-white" : d.isFuture ? "text-transparent" : "text-text-muted"}`}>
//                     {d.day}
//                   </span>
//                   {!d.isFuture && d.hours > 0 && (
//                     <span className="text-[7px] sm:text-[8px] font-mono leading-none text-white/70">{d.hours}h</span>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-2.5 sm:space-y-3">
//           <div className="flex items-center justify-between bg-bg-muted rounded-lg p-1 sm:p-1.5">
//             <button onClick={() => setYearOffset((o) => o - 1)} className="p-1.5 sm:p-2 rounded-md border border-transparent hover:border-accent-gold/30 hover:bg-bg-surface transition-colors"><ChevronLeft size={15} /></button>
//             <span className="text-xs sm:text-sm font-display font-semibold text-text-primary">{isCurrentYear ? "This year" : viewedYear}</span>
//             <button onClick={() => setYearOffset((o) => Math.min(0, o + 1))} disabled={isCurrentYear}
//               className={`p-1.5 sm:p-2 rounded-md border border-transparent transition-colors ${isCurrentYear ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30 hover:bg-bg-surface"}`}>
//               <ChevronRight size={15} />
//             </button>
//           </div>
//           <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
//             {yearStats.map(({ label, val, icon: Icon, color }, i) => (
//               <div key={label} className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
//                 style={{ background: `${color}14`, border: `1px solid ${color}30`, opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}>
//                 <div className="flex items-center gap-1">
//                   <Icon size={11} style={{ color }} />
//                   <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
//                 </div>
//                 <p className="text-base sm:text-2xl font-display font-bold text-text-primary leading-none truncate max-w-full">{val}</p>
//               </div>
//             ))}
//           </div>
//           <div className="flex">
//             <div className={`${AXIS_W} shrink-0 flex flex-col justify-between h-36 sm:h-44 pr-1 sm:pr-1.5 text-right`}>
//               {yearTicks.map((t) => (
//                 <span key={t} className="text-[9px] sm:text-[10px] font-mono text-text-muted leading-none">{t}h</span>
//               ))}
//             </div>
//             <div className="relative flex-1 h-36 sm:h-44 border-l border-b border-bg-border">
//               {yearTicks.slice(0, -1).map((t) => (
//                 <div key={t} className="absolute left-0 right-0 border-t border-bg-border/50"
//                   style={{ top: `${((yearScaleMax - t) / yearScaleMax) * 100}%` }} />
//               ))}
//               <div className="absolute inset-0 flex items-end px-1 sm:px-2">
//                 {yearlyData.map((d, i) => {
//                   const pct     = Math.min((d.hours / yearScaleMax) * 100, 100);
//                   const isBest  = bestMonth.hours > 0 && d.label === bestMonth.label && !d.isCurrent;
//                   const palette = d.isCurrent ? CHART_COLORS.today : isBest ? CHART_COLORS.best : CHART_COLORS.inProgress;
//                   return (
//                     <div key={i} className="flex-1 h-full flex items-end justify-center">
//                       {!d.isFuture && d.hours > 0 && (
//                         <div title={`${d.label}: ${d.hours}h`}
//                           className="w-full max-w-[16px] sm:max-w-[22px] rounded-t-md transition-all duration-700 ease-out"
//                           style={{ height: `${grown ? Math.max(pct, 4) : 0}%`, background: palette.grad, boxShadow: `0 2px 10px ${palette.glow}`, transitionDelay: `${i * 50}ms` }}
//                         />
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//           <div className="flex">
//             <div className={`${AXIS_W} shrink-0`} />
//             <div className="flex-1 flex px-1 sm:px-2">
//               {yearlyData.map((d, i) => (
//                 <span key={i} className={`flex-1 text-center text-[9px] sm:text-[11px] font-mono ${d.isCurrent ? "text-accent-gold font-bold" : "text-text-muted"}`}>
//                   {d.short}
//                 </span>
//               ))}
//             </div>
//           </div>
//           <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted pt-1">
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> Monthly hours</span>
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.best.grad }} /> Best month</span>
//             <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Current month</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── StatCard ──────────────────────────────────────────────────────────────────
// function StatCard({ icon: Icon, label, value, sub, accent = false, iconColor, delay = 0 }) {
//   const [grown, setGrown] = useState(false);
//   useEffect(() => {
//     const t = setTimeout(() => setGrown(true), 120 + delay);
//     return () => clearTimeout(t);
//   }, [delay]);

//   return (
//     <div
//       className={`glass-panel p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1.5 transition-all duration-500 ease-out active:scale-95 sm:hover:-translate-y-0.5 sm:hover:border-accent-gold/30 cursor-default ${
//         accent ? "border-accent-gold/30 bg-accent-gold/5" : ""
//       }`}
//       style={{ opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)" }}
//     >
//       <div className="flex items-center gap-1 sm:gap-2">
//         <Icon size={12} style={{ color: iconColor }}
//           className={`shrink-0 ${!iconColor ? (accent ? "text-accent-gold" : "text-text-secondary") : ""}`}
//         />
//         <span className="text-[9px] sm:text-xs font-mono text-text-muted uppercase tracking-wider leading-tight truncate">{label}</span>
//       </div>
//       <p className={`text-lg sm:text-2xl font-display font-bold leading-tight ${accent ? "text-accent-gold" : "text-text-primary"}`}>
//         {value}
//       </p>
//       {sub && <p className="text-[9px] sm:text-xs text-text-secondary truncate">{sub}</p>}
//     </div>
//   );
// }

// // ─── TodayPlanner ──────────────────────────────────────────────────────────────
// function TodayPlanner() {
//   const SK = `upsc-tasks-${todayKey()}`;
//   const [tasks, setTasks] = useState(() => {
//     try { return JSON.parse(localStorage.getItem(SK) || "[]"); } catch { return []; }
//   });
//   const [input, setInput] = useState("");
//   const save = (next) => { setTasks(next); localStorage.setItem(SK, JSON.stringify(next)); };
//   const add  = () => { if (!input.trim()) return; save([...tasks, { text: input.trim(), done: false }]); setInput(""); };
//   const done = tasks.filter((t) => t.done).length;

//   return (
//     <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <ListChecks size={14} className="text-accent-gold shrink-0" />
//           <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Today's Tasks</h3>
//         </div>
//         {tasks.length > 0 && (
//           <span className="text-[10px] sm:text-[11px] font-mono text-text-muted">{done}/{tasks.length}</span>
//         )}
//       </div>
//       <div className="flex gap-2">
//         <input
//           type="text" value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => { if (e.key === "Enter") add(); }}
//           placeholder="Add a task..."
//           className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-2.5 sm:px-3 py-2 text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
//         />
//         <button onClick={add} className="btn-primary flex items-center gap-1 px-3 py-2"><Plus size={14} /></button>
//       </div>
//       {tasks.length === 0 ? (
//         <p className="text-[11px] sm:text-xs text-text-muted font-mono">No tasks yet. Add your study goals for today.</p>
//       ) : (
//         <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
//           {tasks.map((t, i) => (
//             <div key={i} className="flex items-center gap-2 group py-1">
//               <button
//                 onClick={() => save(tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
//                 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
//                   t.done ? "bg-accent-green border-accent-green/60" : "border-bg-border hover:border-accent-gold/40"
//                 }`}
//               >
//                 {t.done && <CheckCircle size={10} className="text-white" />}
//               </button>
//               <span className={`text-[11px] sm:text-xs flex-1 min-w-0 leading-tight ${t.done ? "line-through text-text-muted" : "text-text-secondary"}`}>
//                 {t.text}
//               </span>
//               <button onClick={() => save(tasks.filter((_, j) => j !== i))}
//                 className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0 p-0.5">
//                 <X size={11} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── PaperProgress ────────────────────────────────────────────────────────────
// function PaperProgress({ syllabusData }) {
//   const rows = [];
//   for (const stage of ["prelims", "mains"]) {
//     const stagePapers = syllabusData?.[stage];
//     if (!stagePapers) continue;
//     for (const paperKey of PAPER_ORDER[stage]) {
//       const meta      = SYLLABUS[stage][paperKey];
//       const userPaper = stagePapers[paperKey];
//       if (!meta || !userPaper) continue;
//       rows.push({ label: meta.label.split("—")[1]?.trim() || meta.label, color: meta.color, pct: getPct(userPaper.modules) });
//     }
//   }
//   const [grown, setGrown] = useState(false);
//   useEffect(() => { const t = setTimeout(() => setGrown(true), 120); return () => clearTimeout(t); }, []);

//   return (
//     <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
//       <div className="flex items-center gap-2">
//         <BarChart2 size={14} className="text-accent-gold shrink-0" />
//         <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Paper Coverage</h3>
//       </div>
//       {rows.length === 0 ? (
//         <p className="text-[11px] sm:text-xs text-text-muted font-mono py-2">Mark progress in Syllabus Tracker to see coverage.</p>
//       ) : (
//         <div className="space-y-2.5">
//           {rows.map(({ label, color, pct }, i) => (
//             <div key={label} className="space-y-1">
//               <div className="flex justify-between items-center gap-2">
//                 <span className="text-[11px] sm:text-xs text-text-secondary truncate max-w-[65%] sm:max-w-[70%]">{label}</span>
//                 <span className="text-[10px] sm:text-[11px] font-mono text-text-muted shrink-0">{pct}%</span>
//               </div>
//               <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
//                 <div className="h-full rounded-full transition-all ease-out"
//                   style={{ width: grown ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: pct > 0 ? `0 0 8px ${color}66` : "none", transitionDuration: "900ms", transitionDelay: `${i * 110}ms` }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main Dashboard ────────────────────────────────────────────────────────────
// export default function Dashboard({
//   userData,
//   todayHours: serverTodayHours,
//   weekAvgHours,
//   overallProgress,
//   onLogHours,
//   user,
//   isLoggedIn = false,
//   onNavigateAuth,
//   onNavigateProfile,
//   onNavigate,
// }) {
//   const userId = user?.id || user?._id || null;
//   if (!user) return <AuthGate feature="Dashboard" onNavigateAuth={onNavigateAuth} />;

//   const [timerHours, setTimerHours] = useState(0);
//   const [isMobile, setIsMobile]     = useState(false);
//   const [progressGrown, setProgressGrown] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => setProgressGrown(true), 200);
//     return () => clearTimeout(t);
//   }, []);

//   const serverHoursNum = parseFloat(serverTodayHours) || 0;
//   const todayHours     = Math.max(serverHoursNum, timerHours);
//   const targetHours    = userData?.profile?.daily_target_hours || 8;
//   const streak         = userData?.profile?.streak || 0;
//   const longestStreak  = userData?.profile?.longest_streak || 0;
//   const totalAnswers   = userData?.answers?.length || 0;
//   const syllabusData   = userData?.syllabus || null;
//   const dailyLogs      = userData?.daily_logs || [];
//   const userName       = userData?.profile?.name || user?.name || "";

//   return (
//     <div className="overflow-y-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4 md:space-y-5 animate-fade-in">

//       {/* ── Header ── */}
//       <div className="flex items-center justify-between px-1 sticky top-0 bg-bg-base/95 backdrop-blur-sm z-10 py-2 sm:py-0">
//         <div className="min-w-0">
//           <h2 className="font-display font-bold text-base sm:text-lg md:text-xl text-text-primary truncate">
//             Command Center
//           </h2>
//           <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 hidden sm:block">
//             Progress, revision, and daily momentum.
//           </p>
//         </div>
//         {userName && (
//           <button
//             onClick={onNavigateProfile}
//             className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-bg-border bg-bg-surface hover:border-accent-gold/30 hover:bg-bg-muted transition-all duration-150 group shrink-0 ml-2"
//             title="View profile"
//           >
//             <AvatarCircle name={userName} size="sm" as="span" />
//             <div className="hidden sm:block text-left">
//               <p className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[100px] md:max-w-[120px]">
//                 {userName}
//               </p>
//               <p className="text-[10px] font-mono text-text-muted group-hover:text-accent-gold transition-colors">
//                 View profile
//               </p>
//             </div>
//           </button>
//         )}
//       </div>

//       {/* ── Stat cards ── */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
//         <StatCard icon={Clock}     label="Today"    value={fmtHM(Math.round(todayHours * 3600))} sub={`Target: ${targetHours}h`} accent={todayHours >= targetHours} delay={0} />
//         <StatCard icon={TrendingUp} label="7-Day Avg" value={`${weekAvgHours}h`} sub="Per day" delay={60} />
//         <StatCard icon={Flame}     label="Streak"   value={`${streak}d`} sub={`Best: ${longestStreak}d`} iconColor="#fb923c" delay={120} />
//         <StatCard icon={BookMarked} label="Answers"  value={totalAnswers} sub="Written" delay={180} />
//         <StatCard icon={BarChart2} label="Coverage" value={`${Math.round(overallProgress)}%`} sub="Syllabus" iconColor="#C9A84C" delay={240} />
//         <StatCard icon={Target}    label="GS1 Done" value={`${getPct(syllabusData?.mains?.GS1?.modules || {})}%`} sub="GS1 modules" iconColor="#4ade80" delay={300} />
//       </div>

//       {/* ── Overall progress bar ── */}
//       <div className="glass-panel p-3 sm:p-4 space-y-1.5 sm:space-y-2">
//         <div className="flex items-center justify-between">
//           <span className="text-[10px] sm:text-xs font-mono text-text-secondary uppercase tracking-wider">Overall Coverage</span>
//           <span className="text-sm sm:text-base font-display font-bold text-text-primary">{Math.round(overallProgress)}%</span>
//         </div>
//         <div className="h-2.5 bg-bg-muted rounded-full overflow-hidden">
//           <div className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full transition-all ease-out"
//             style={{ width: progressGrown ? `${overallProgress}%` : "0%", boxShadow: "0 0 10px rgba(201,168,76,0.5)", transitionDuration: "1100ms" }}
//           />
//         </div>
//         <p className="text-[10px] sm:text-xs text-text-muted font-mono">
//           {overallProgress < 10 ? "Day one. The journey begins."
//            : overallProgress < 40 ? "Foundation phase. Keep the momentum."
//            : overallProgress < 70 ? "Solid coverage. Depth work begins now."
//            : "Advanced stage. Revision and PYQ analysis."}
//         </p>
//       </div>

//       {/* ── ACTION HUB ── */}
//       {isMobile ? (
//         <CollapsibleSection title="Start Studying" icon={Rocket} defaultOpen={true}>
//           <ActionHub onNavigate={onNavigate} />
//         </CollapsibleSection>
//       ) : (
//         <ActionHub onNavigate={onNavigate} />
//       )}

//       {/* ── Study Timer (subject-tagged) ── */}
//       {/* SubjectStudyTimer does NOT render SubjectAnalyticsDashboard inside it. */}
//       {/* The analytics card lives below as its own separate section.            */}
//       <SubjectStudyTimer
//         onLogHours={onLogHours}
//         onSynced={setTimerHours}
//         targetHours={targetHours}
//         serverHours={serverHoursNum}
//         dataReady={!!userData}
//         userId={userId}
//       />
//     {/* ── Subject Study Analytics ── */}
//       {/* Standalone card. Rendered ONCE here. Never inside SubjectStudyTimer. */}
//       {isMobile ? (
//         <CollapsibleSection title="Subject Study Hours" icon={BarChart2} defaultOpen={false}>
//           <SubjectAnalyticsDashboard isLoggedIn={isLoggedIn} />
//         </CollapsibleSection>
//       ) : (
//         <SubjectAnalyticsDashboard isLoggedIn={isLoggedIn} />
//       )}
//       {/* ── Today's Tasks ── */}
//       {isMobile ? (
//         <CollapsibleSection title="Today's Tasks" icon={ListChecks} defaultOpen={true}>
//           <TodayPlanner />
//         </CollapsibleSection>
//       ) : (
//         <TodayPlanner />
//       )}

//       {/* ── Study Chart + Paper Coverage ── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
//         {isMobile ? (
//           <>
//             <CollapsibleSection title="Study Chart" icon={TrendingUp} defaultOpen={false}>
//               <StudyChart logs={dailyLogs} targetHours={targetHours} />
//             </CollapsibleSection>
//             <CollapsibleSection title="Paper Coverage" icon={BarChart2} defaultOpen={false}>
//               <PaperProgress syllabusData={syllabusData} />
//             </CollapsibleSection>
//           </>
//         ) : (
//           <>
//             <StudyChart logs={dailyLogs} targetHours={targetHours} />
//             <PaperProgress syllabusData={syllabusData} />
//           </>
//         )}
//       </div>



//       {/* ── AI Spaced Repetition ── */}
//       {isMobile ? (
//         <CollapsibleSection title="AI Revision Queue" icon={Brain} defaultOpen={false}>
//           <AIRevisionPanel onNavigate={onNavigate} isLoggedIn={isLoggedIn} compact={true} />
//         </CollapsibleSection>
//       ) : (
//         <AIRevisionPanel onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
//       )}

//       {/* ── Question Statistics ── */}
//       {isMobile ? (
//         <CollapsibleSection title="Question Statistics" defaultOpen={false} tight>
//           <QuestionStatsPanel />
//         </CollapsibleSection>
//       ) : (
//         <QuestionStatsPanel />
//       )}

//       {/* ── Feedback card ── */}
//       <div className="glass-panel p-4 sm:p-5 flex items-center justify-between gap-4">
//         <div>
//           <p className="text-sm font-display font-semibold text-text-primary">How's your experience?</p>
//           <p className="text-xs font-mono text-text-muted mt-0.5">Help us improve UPSC Mentor — takes 30 seconds.</p>
//         </div>
//         <button
//           onClick={() => window.openFeedbackModal?.()}
//           className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent-gold/40 bg-accent-gold/10 text-accent-gold text-sm font-semibold hover:bg-accent-gold/20 transition-all shrink-0"
//         >
//           <MessageSquarePlus size={15} />
//           Feedback
//         </button>
//       </div>

//     </div>
//   );
// }
import {
  Clock,
  TrendingUp,
  CheckCircle,
  Plus,
  BookMarked,
  Brain,
  ListChecks,
  BarChart2,
  X,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileSearch,
  BookOpenCheck,
  FlaskConical,
  Rocket,
  MessageSquarePlus,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SYLLABUS, PAPER_ORDER, getPct } from "../../data/PYQs/syllabusData";
import AuthGate from "../../components/ui/AuthGate";
import timerStore from "../../hooks/timerStore";
import QuestionStatsPanel from "../../components/QuestionStats";
import { AvatarCircle } from "../User/ProfilePage";
import AIRevisionPanel from "../AI/AIRevisionPanel";
import SubjectStudyTimer from "./SubjectStudyTimer";
import SubjectAnalyticsDashboard from "./SubjectAnalyticsDashboard";
import { getISTDateString, getISTDay } from "../../utils/dateUtils";
import DashboardOnboardingCards from "./DashboardOnboardingCards";

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function todayKey() {
  return getISTDateString();
}
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function fmtHM(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}

// ─── Modern chart palette ────────────────────────────────────────────────────
const CHART_COLORS = {
  goalMet:    { solid: "#10b981", grad: "linear-gradient(180deg, #34d399 0%, #059669 100%)", glow: "rgba(16,185,129,0.4)" },
  inProgress: { solid: "#6366f1", grad: "linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)", glow: "rgba(99,102,241,0.4)" },
  today:      { solid: "#f59e0b", grad: "linear-gradient(180deg, #fcd34d 0%, #d97706 100%)", glow: "rgba(245,158,11,0.45)" },
  best:       { solid: "#ec4899", grad: "linear-gradient(180deg, #f472b6 0%, #db2777 100%)", glow: "rgba(236,72,153,0.4)" },
};

// ─── Collapsible Section Wrapper ───────────────────────────────────────────────
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, tight = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`glass-panel ${isOpen ? "overflow-visible" : "overflow-hidden"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-accent-gold" />}
          <h3 className="text-sm font-display font-semibold text-text-primary text-left">
            {title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-text-muted shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-text-muted shrink-0" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[6000px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className={`${tight ? "px-1.5 sm:px-2.5" : "px-3 sm:px-4"} pb-3 sm:pb-4`} style={{ overflow: "visible" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── TodaysMission ─────────────────────────────────────────────────────────────
// Derives today's mission items from live data — no new API calls.
function TodaysMission({ userData, todayHours = 0, overallProgress = 0, onNavigate }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 100);
    return () => clearTimeout(t);
  }, []);

  const targetHours    = userData?.profile?.daily_target_hours || 4;
  const studyDone      = todayHours >= targetHours;

  // `userData.spaced_repetition` is shaped `{ queue: [...] }` (see useUserData.js),
  // not a bare array — unwrap it defensively so this never breaks if the shape
  // of either field changes again.
  const rawRevisionSource = userData?.revision_queue ?? userData?.spaced_repetition ?? [];
  const revisionQueue = Array.isArray(rawRevisionSource)
    ? rawRevisionSource
    : (rawRevisionSource.queue || []);
  const dueRevisions   = revisionQueue.filter((item) => !item.reviewed && item.status !== "done");

  const today = new Date().toISOString().split("T")[0];
  const attemptsToday  = (userData?.question_attempts || []).filter(
    (a) => (a.date || a.created_at || "").startsWith(today)
  );
  const pyqTarget = 10;
  const pyqDone   = attemptsToday.length >= pyqTarget;

  const items = [
    {
      id: "study",
      icon: Clock,
      color: "gold",
      label: "Study",
      text: studyDone
        ? `${fmtHM(Math.round(todayHours * 3600))} studied — target hit`
        : `Study ${targetHours}h today`,
      sub: studyDone ? null : `${fmtHM(Math.round(todayHours * 3600))} / ${targetHours}h done`,
      done: studyDone,
      pct: Math.min(100, Math.round((todayHours / targetHours) * 100)),
      view: "dashboard",
    },
    {
      id: "pyq",
      icon: BookOpenCheck,
      color: "purple",
      label: "Practice",
      text: pyqDone
        ? `${attemptsToday.length} PYQs completed today`
        : `Attempt ${pyqTarget} PYQs today`,
      sub: pyqDone ? null : `${attemptsToday.length} / ${pyqTarget} done`,
      done: pyqDone,
      pct: Math.min(100, Math.round((attemptsToday.length / pyqTarget) * 100)),
      view: "pre",
    },
    {
      id: "revision",
      icon: Brain,
      color: "green",
      label: "Revision",
      text: dueRevisions.length === 0
        ? "Revision queue is clear"
        : `Review ${Math.min(dueRevisions.length, 5)} revision topics`,
      sub: dueRevisions.length > 0 ? `${dueRevisions.length} topics due` : null,
      done: dueRevisions.length === 0,
      pct: dueRevisions.length === 0 ? 100 : 0,
      view: "dashboard",
    },
    {
      id: "coverage",
      icon: Target,
      color: "blue",
      label: "Coverage",
      text: overallProgress >= 5
        ? `Syllabus at ${Math.round(overallProgress)}% coverage`
        : "Complete a syllabus module today",
      sub: overallProgress < 5 ? "Open Syllabus Tracker" : null,
      done: overallProgress >= 5,
      pct: Math.min(100, Math.round(overallProgress)),
      view: "syllabus",
    },
  ];

  const doneCount  = items.filter((i) => i.done).length;
  const allDone    = doneCount === items.length;
  const overallPct = Math.round((doneCount / items.length) * 100);

  if (allDone) {
    return (
      <div
        className="glass-panel p-4 sm:p-5 flex items-center gap-4"
        style={{ borderColor: "var(--accent-gold)", background: "var(--accent-gold-dim)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-gold)", color: "#fff" }}
        >
          <Award size={18} />
        </div>
        <div>
          <p className="font-semibold text-text-primary text-sm sm:text-base">
            Today's mission complete.
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            All daily targets hit — rest, or go deeper on your weak topics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-accent-gold" />
          <h3 className="text-sm font-display font-bold text-text-primary">Today's Mission</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: grown ? `${overallPct}%` : "0%",
                background: "var(--accent-gold)",
                boxShadow: "0 0 8px rgba(201,168,76,0.35)",
              }}
            />
          </div>
          <span className="text-xs font-mono text-accent-gold">{doneCount}/{items.length}</span>
        </div>
      </div>

      {/* Mission items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              role={item.done ? "presentation" : "button"}
              tabIndex={item.done ? -1 : 0}
              onClick={() => !item.done && onNavigate?.(item.view)}
              onKeyDown={(e) => {
                if (!item.done && (e.key === "Enter" || e.key === " ")) onNavigate?.(item.view);
              }}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 ${
                item.done ? "" : "cursor-pointer active:scale-[0.98]"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold`}
              style={{
                background: item.done ? `var(--accent-${item.color}-dim)` : "var(--bg-surface)",
                borderColor: item.done
                  ? `color-mix(in srgb, var(--accent-${item.color}) 40%, transparent)`
                  : "var(--bg-border)",
                opacity: grown ? 1 : 0,
                transform: grown ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `var(--accent-${item.color}-dim)` }}
                  >
                    {item.done ? (
                      <CheckCircle size={13} style={{ color: `var(--accent-${item.color})` }} />
                    ) : (
                      <Icon size={13} style={{ color: `var(--accent-${item.color})` }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-mono uppercase tracking-wider mb-0.5"
                      style={{ color: `var(--accent-${item.color})` }}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        item.done ? "text-text-secondary line-through opacity-70" : "text-text-primary"
                      }`}
                    >
                      {item.text}
                    </p>
                    {item.sub && (
                      <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
                    )}
                  </div>
                </div>
                {!item.done && (
                  <ChevronRight size={14} className="text-text-muted shrink-0 mt-1" />
                )}
              </div>

              {/* Progress bar */}
              {!item.done && item.pct > 0 && (
                <div className="mt-2.5 h-1 rounded-full bg-bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: grown ? `${item.pct}%` : "0%",
                      background: `var(--accent-${item.color})`,
                      transitionDelay: `${i * 60 + 300}ms`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ActionHub ────────────────────────────────────────────────────────────────
// Order: 1 Topic-wise Practice, 2 Mock Tests, 3 Answer Evaluation, 4 Notes Auditor
// (natural preparation sequence per product spec)
function ActionHub({ onNavigate }) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 80);
    return () => clearTimeout(t);
  }, []);

  const actions = [
    {
      icon: BookOpenCheck,
      iconColor: "#34d399",
      gradFrom: "rgba(16,185,129,0.12)",
      gradTo:   "rgba(16,185,129,0.04)",
      border:   "rgba(16,185,129,0.25)",
      glow:     "rgba(16,185,129,0.15)",
      title: "Topic-wise Practice",
      desc: "Practice PYQs topic-wise and automatically update syllabus progress when questions are completed.",
      cta: "Practice Questions",
      view: "pre",
    },
    {
      icon: FlaskConical,
      iconColor: "#f472b6",
      gradFrom: "rgba(236,72,153,0.12)",
      gradTo:   "rgba(236,72,153,0.04)",
      border:   "rgba(236,72,153,0.25)",
      glow:     "rgba(236,72,153,0.15)",
      title: "Mock Test Series",
      desc: "Attempt a timed UPSC test. After completion: analyze performance, identify weak areas, and push weak topics into the AI Revision Queue automatically.",
      cta: "Start Test",
      view: "test-series",
    },
    {
      icon: Rocket,
      iconColor: "#f59e0b",
      gradFrom: "rgba(245,158,11,0.12)",
      gradTo:   "rgba(245,158,11,0.04)",
      border:   "rgba(245,158,11,0.25)",
      glow:     "rgba(245,158,11,0.15)",
      title: "Answer Evaluation",
      desc: "Evaluate your GS/Mains answer in seconds. Get score, strengths, weaknesses, keyword coverage, structural feedback and a topper-style rewritten answer.",
      cta: "Evaluate Answer",
      view: "mains",
    },
    {
      icon: FileSearch,
      iconColor: "#818cf8",
      gradFrom: "rgba(99,102,241,0.12)",
      gradTo:   "rgba(99,102,241,0.04)",
      border:   "rgba(99,102,241,0.25)",
      glow:     "rgba(99,102,241,0.15)",
      title: "Audit Notes",
      desc: "Check gaps in your notes instantly. Get missing points, memory traps, 30-second revision cards and improved notes.",
      cta: "Audit Notes",
      view: "notes",
    },
  ];

  return (
    <div className="glass-panel p-3 sm:p-5 space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2">
        <Rocket size={14} className="text-accent-gold shrink-0" />
        <div>
          <h3 className="text-sm sm:text-base font-display font-bold text-text-primary leading-tight">
            Start Studying
          </h3>
          <p className="text-[10px] sm:text-xs font-mono text-text-muted mt-0.5">
            Choose what you want to work on right now.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {actions.map(({ icon: Icon, iconColor, gradFrom, gradTo, border, glow, title, desc, cta, view }, i) => (
          <div
            key={title}
            className="relative rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 cursor-pointer group
                       transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
              border: `1px solid ${border}`,
              boxShadow: `0 2px 16px ${glow}`,
              opacity: grown ? 1 : 0,
              transform: grown ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms, box-shadow 0.2s ease, translate 0.2s ease`,
            }}
            onClick={() => onNavigate?.(view)}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 30% 30%, ${gradFrom} 0%, transparent 70%)` }}
            />
            <div className="flex items-center gap-2.5 relative z-10">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${iconColor}20`, border: `1px solid ${iconColor}30` }}
              >
                <Icon size={16} style={{ color: iconColor }} />
              </div>
              <h4 className="text-sm sm:text-[15px] font-display font-bold text-text-primary leading-tight">
                {title}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs font-mono text-text-secondary leading-relaxed relative z-10">
              {desc}
            </p>
            <button
              className="relative z-10 flex items-center justify-center gap-1.5 w-full py-2 sm:py-2.5 rounded-lg
                         text-[11px] sm:text-xs font-semibold font-mono transition-all duration-200 group-hover:gap-2.5"
              style={{
                background: `${iconColor}18`,
                border: `1px solid ${iconColor}35`,
                color: iconColor,
              }}
              onClick={(e) => { e.stopPropagation(); onNavigate?.(view); }}
            >
              {cta}
              <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── StudyChart ────────────────────────────────────────────────────────────────
function StudyChart({ logs = [], targetHours = 8 }) {
  const [view, setView] = useState("weekly");
  const [isMobile, setIsMobile] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (view !== "monthly") setMonthOffset(0);
    if (view !== "yearly") setYearOffset(0);
  }, [view]);

  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, [view, monthOffset, yearOffset]);

  const getHoursForDate = (dateStr) => {
    const serverHours = logs.find((l) => l.date === dateStr)?.hours || 0;
    if (dateStr === todayKey()) {
      const liveHours = parseFloat((timerStore.elapsed / 3600).toFixed(2));
      return Math.max(serverHours, liveHours);
    }
    return serverHours;
  };

  const weeklyData = (() => {
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    return Array.from({ length: isMobile ? 5 : 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - ((isMobile ? 4 : 6) - i));
      const dateStr = getISTDateString(d);
      return {
        label:   DAY_NAMES[getISTDay(d)].substring(0, isMobile ? 2 : 3),
        hours:   getHoursForDate(dateStr),
        isToday: i === (isMobile ? 4 : 6),
      };
    });
  })();

  const todayStr = todayKey();
  const [todayY, todayM] = todayStr.split("-").map(Number);

  const viewedMonth  = new Date(todayY, todayM - 1 + monthOffset, 1);
  const viewYear     = viewedMonth.getFullYear();
  const viewMonth    = viewedMonth.getMonth();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = viewedMonth.getDay();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum   = i + 1;
    const dateStr  = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(dayNum)}`;
    const isFuture = dateStr > todayStr;
    const hours    = isFuture ? 0 : getHoursForDate(dateStr);
    return {
      day: dayNum, dateStr, hours,
      isToday: dateStr === todayStr,
      isFuture,
      met:     !isFuture && hours >= targetHours,
      studied: !isFuture && hours > 0,
    };
  });

  const monthLabel     = viewedMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = monthOffset === 0;
  const viewedYear     = todayY + yearOffset;
  const isCurrentYear  = yearOffset === 0;

  const elapsedDays  = monthDays.filter((d) => !d.isFuture);
  const studiedCount = elapsedDays.filter((d) => d.studied).length;
  const metCount     = elapsedDays.filter((d) => d.met).length;
  const monthTotal   = parseFloat(elapsedDays.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const monthAvg     = studiedCount ? parseFloat((monthTotal / studiedCount).toFixed(1)) : 0;

  const dataMax  = Math.max(...weeklyData.map((d) => d.hours), 0);
  const scaleMax = Math.max(targetHours, Math.ceil(dataMax) || 1);
  const TICKS    = 5;
  const ticks    = Array.from({ length: TICKS }, (_, i) =>
    parseFloat((scaleMax * (1 - i / (TICKS - 1))).toFixed(1))
  );
  const AXIS_W = "w-7 sm:w-8";

  const weekStudiedCount = weeklyData.filter((d) => d.hours > 0).length;
  const weekMetCount     = weeklyData.filter((d) => d.hours >= targetHours).length;
  const weekTotal        = parseFloat(weeklyData.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const weekAvg          = weekStudiedCount ? parseFloat((weekTotal / weekStudiedCount).toFixed(1)) : 0;

  const weekStats = [
    { label: "Total",    val: `${weekTotal}h`,                        icon: Clock,       color: "#C9A84C" },
    { label: "Days Hit", val: `${weekMetCount}/${weeklyData.length}`, icon: CheckCircle, color: "#22c55e" },
    { label: "Avg/Day",  val: `${weekAvg}h`,                          icon: TrendingUp,  color: "#3b82f6" },
  ];

  const monthStats = [
    { label: "Total",    val: `${monthTotal}h`,                    icon: Clock,       color: "#C9A84C" },
    { label: "Days Hit", val: `${metCount}/${elapsedDays.length}`, icon: CheckCircle, color: "#22c55e" },
    { label: "Avg/Day",  val: `${monthAvg}h`,                      icon: TrendingUp,  color: "#3b82f6" },
  ];

  const yearlyData = (() => {
    const MONTH_FULL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const serverTodayHours    = logs.find((l) => l.date === todayStr)?.hours || 0;
    const liveTodayHours      = parseFloat((timerStore.elapsed / 3600).toFixed(2));
    const effectiveTodayHours = Math.max(serverTodayHours, liveTodayHours);
    return Array.from({ length: 12 }, (_, m) => {
      const monthPrefix = `${viewedYear}-${pad2(m + 1)}`;
      let total = logs
        .filter((l) => l.date && l.date.startsWith(monthPrefix))
        .reduce((s, l) => s + (l.hours || 0), 0);
      const isCurrentMonthCell = viewedYear === todayY && m === todayM - 1;
      if (isCurrentMonthCell) total = total - serverTodayHours + effectiveTodayHours;
      const isFuture = viewedYear > todayY || (viewedYear === todayY && m > todayM - 1);
      return {
        label: MONTH_FULL[m],
        short: isMobile ? MONTH_FULL[m].slice(0, 1) : MONTH_FULL[m].slice(0, 3),
        hours: isFuture ? 0 : parseFloat(Math.max(total, 0).toFixed(1)),
        isCurrent: isCurrentMonthCell,
        isFuture,
      };
    });
  })();

  const elapsedMonths      = yearlyData.filter((d) => !d.isFuture);
  const studiedMonthsCount = elapsedMonths.filter((d) => d.hours > 0).length;
  const yearTotal          = parseFloat(elapsedMonths.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const bestMonth          = elapsedMonths.reduce((best, d) => (d.hours > best.hours ? d : best), { hours: 0, label: "—" });
  const yearAvg            = studiedMonthsCount ? parseFloat((yearTotal / studiedMonthsCount).toFixed(1)) : 0;

  const yearStats = [
    { label: "Total",      val: `${yearTotal}h`,                                                         icon: Clock,      color: "#C9A84C" },
    { label: "Best Month", val: bestMonth.hours > 0 ? `${bestMonth.label} · ${bestMonth.hours}h` : "—", icon: Flame,      color: "#ec4899" },
    { label: "Avg/Month",  val: `${yearAvg}h`,                                                           icon: TrendingUp, color: "#3b82f6" },
  ];

  const yearDataMax  = Math.max(...yearlyData.map((d) => d.hours), 0);
  const yearScaleMax = Math.max(Math.ceil(yearDataMax / 5) * 5, 5);
  const yearTicks    = Array.from({ length: TICKS }, (_, i) =>
    parseFloat((yearScaleMax * (1 - i / (TICKS - 1))).toFixed(1))
  );

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <TrendingUp size={14} className="text-accent-green shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary truncate">
            {view === "weekly" ? (isMobile ? "5-Day Hours" : "Weekly Hours") : view === "monthly" ? monthLabel : `${viewedYear} Overview`}
          </h3>
        </div>
        <div className="flex items-center bg-bg-muted rounded-lg p-0.5 gap-0.5 shrink-0">
          {[["weekly", isMobile ? "5D" : "7D"], ["monthly", "Month"], ["yearly", "Year"]].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-all ${
                view === v ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {view === "weekly" ? (
        <div className="space-y-1.5">
          <div className="flex">
            <div className={`${AXIS_W} shrink-0 flex flex-col justify-between h-36 sm:h-44 pr-1 sm:pr-1.5 text-right`}>
              {ticks.map((t) => (
                <span key={t} className="text-[9px] sm:text-[10px] font-mono text-text-muted leading-none">{t}h</span>
              ))}
            </div>
            <div className="relative flex-1 h-36 sm:h-44 border-l border-b border-bg-border">
              {ticks.slice(0, -1).map((t) => (
                <div key={t} className="absolute left-0 right-0 border-t border-bg-border/50"
                  style={{ top: `${((scaleMax - t) / scaleMax) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end px-1 sm:px-2">
                {weeklyData.map(({ label, hours, isToday }, i) => {
                  const met     = hours >= targetHours;
                  const pct     = Math.min((hours / scaleMax) * 100, 100);
                  const palette = isToday ? CHART_COLORS.today : met ? CHART_COLORS.goalMet : CHART_COLORS.inProgress;
                  return (
                    <div key={label} className="flex-1 h-full flex items-end justify-center">
                      {hours > 0 && (
                        <div
                          title={`${hours}h`}
                          className="w-full max-w-[28px] sm:max-w-[34px] rounded-t-md transition-all duration-700 ease-out"
                          style={{
                            height: `${grown ? Math.max(pct, 4) : 0}%`,
                            background: palette.grad,
                            boxShadow: `0 2px 10px ${palette.glow}`,
                            transitionDelay: `${i * 60}ms`,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex">
            <div className={`${AXIS_W} shrink-0`} />
            <div className="flex-1 flex px-1 sm:px-2">
              {weeklyData.map(({ label, isToday }) => (
                <span key={label} className={`flex-1 text-center text-[9px] sm:text-[11px] font-mono ${isToday ? "text-accent-gold font-bold" : "text-text-muted"}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted pt-1">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.goalMet.grad }} /> Goal met</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> In progress</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Today</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-bg-muted border border-bg-border" /> Target left</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
            {weekStats.map(({ label, val, icon: Icon, color }, i) => (
              <div key={label} className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
                style={{ background: `${color}14`, border: `1px solid ${color}30`, opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}>
                <div className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-text-primary leading-none">{val}</p>
              </div>
            ))}
          </div>
        </div>
      ) : view === "monthly" ? (
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between bg-bg-muted rounded-lg p-1 sm:p-1.5">
            <button onClick={() => setMonthOffset((o) => o - 1)} className="p-1.5 sm:p-2 rounded-md border border-transparent hover:border-accent-gold/30 hover:bg-bg-surface transition-colors"><ChevronLeft size={15} /></button>
            <span className="text-xs sm:text-sm font-display font-semibold text-text-primary">{isCurrentMonth ? "This month" : monthLabel}</span>
            <button onClick={() => setMonthOffset((o) => Math.min(0, o + 1))} disabled={isCurrentMonth}
              className={`p-1.5 sm:p-2 rounded-md border border-transparent transition-colors ${isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30 hover:bg-bg-surface"}`}>
              <ChevronRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {monthStats.map(({ label, val, icon: Icon, color }, i) => (
              <div key={label} className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
                style={{ background: `${color}14`, border: `1px solid ${color}30`, opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}>
                <div className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-text-primary leading-none">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <span key={i} className="text-[9px] sm:text-[11px] font-mono text-text-muted">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: firstWeekday }, (_, i) => <div key={`pad-${i}`} />)}
            {monthDays.map((d) => {
              const palette = d.isToday ? CHART_COLORS.today : d.met ? CHART_COLORS.goalMet : d.studied ? CHART_COLORS.inProgress : null;
              return (
                <div key={d.dateStr} title={d.isFuture ? "" : `${d.dateStr} — ${d.hours}h studied`}
                  className={`aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all duration-500 ease-out ${
                    d.isFuture ? "border-transparent bg-transparent" : palette ? "border-transparent" : "border-gray-600/30 bg-gray-700/20"
                  }`}
                  style={{ background: palette ? palette.grad : undefined, boxShadow: palette ? `0 2px 8px ${palette.glow}` : undefined }}>
                  <span className={`text-[9px] sm:text-[11px] font-mono font-bold leading-none ${palette ? "text-white" : d.isFuture ? "text-transparent" : "text-text-muted"}`}>
                    {d.day}
                  </span>
                  {!d.isFuture && d.hours > 0 && (
                    <span className="text-[7px] sm:text-[8px] font-mono leading-none text-white/70">{d.hours}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between bg-bg-muted rounded-lg p-1 sm:p-1.5">
            <button onClick={() => setYearOffset((o) => o - 1)} className="p-1.5 sm:p-2 rounded-md border border-transparent hover:border-accent-gold/30 hover:bg-bg-surface transition-colors"><ChevronLeft size={15} /></button>
            <span className="text-xs sm:text-sm font-display font-semibold text-text-primary">{isCurrentYear ? "This year" : viewedYear}</span>
            <button onClick={() => setYearOffset((o) => Math.min(0, o + 1))} disabled={isCurrentYear}
              className={`p-1.5 sm:p-2 rounded-md border border-transparent transition-colors ${isCurrentYear ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30 hover:bg-bg-surface"}`}>
              <ChevronRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {yearStats.map(({ label, val, icon: Icon, color }, i) => (
              <div key={label} className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
                style={{ background: `${color}14`, border: `1px solid ${color}30`, opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}>
                <div className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
                </div>
                <p className="text-base sm:text-2xl font-display font-bold text-text-primary leading-none truncate max-w-full">{val}</p>
              </div>
            ))}
          </div>
          <div className="flex">
            <div className={`${AXIS_W} shrink-0 flex flex-col justify-between h-36 sm:h-44 pr-1 sm:pr-1.5 text-right`}>
              {yearTicks.map((t) => (
                <span key={t} className="text-[9px] sm:text-[10px] font-mono text-text-muted leading-none">{t}h</span>
              ))}
            </div>
            <div className="relative flex-1 h-36 sm:h-44 border-l border-b border-bg-border">
              {yearTicks.slice(0, -1).map((t) => (
                <div key={t} className="absolute left-0 right-0 border-t border-bg-border/50"
                  style={{ top: `${((yearScaleMax - t) / yearScaleMax) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end px-1 sm:px-2">
                {yearlyData.map((d, i) => {
                  const pct     = Math.min((d.hours / yearScaleMax) * 100, 100);
                  const isBest  = bestMonth.hours > 0 && d.label === bestMonth.label && !d.isCurrent;
                  const palette = d.isCurrent ? CHART_COLORS.today : isBest ? CHART_COLORS.best : CHART_COLORS.inProgress;
                  return (
                    <div key={i} className="flex-1 h-full flex items-end justify-center">
                      {!d.isFuture && d.hours > 0 && (
                        <div title={`${d.label}: ${d.hours}h`}
                          className="w-full max-w-[16px] sm:max-w-[22px] rounded-t-md transition-all duration-700 ease-out"
                          style={{ height: `${grown ? Math.max(pct, 4) : 0}%`, background: palette.grad, boxShadow: `0 2px 10px ${palette.glow}`, transitionDelay: `${i * 50}ms` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex">
            <div className={`${AXIS_W} shrink-0`} />
            <div className="flex-1 flex px-1 sm:px-2">
              {yearlyData.map((d, i) => (
                <span key={i} className={`flex-1 text-center text-[9px] sm:text-[11px] font-mono ${d.isCurrent ? "text-accent-gold font-bold" : "text-text-muted"}`}>
                  {d.short}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted pt-1">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> Monthly hours</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.best.grad }} /> Best month</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Current month</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false, iconColor, delay = 0 }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 120 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`glass-panel p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1.5 transition-all duration-500 ease-out active:scale-95 sm:hover:-translate-y-0.5 sm:hover:border-accent-gold/30 cursor-default ${
        accent ? "border-accent-gold/30 bg-accent-gold/5" : ""
      }`}
      style={{ opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)" }}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <Icon size={12} style={{ color: iconColor }}
          className={`shrink-0 ${!iconColor ? (accent ? "text-accent-gold" : "text-text-secondary") : ""}`}
        />
        <span className="text-[9px] sm:text-xs font-mono text-text-muted uppercase tracking-wider leading-tight truncate">{label}</span>
      </div>
      <p className={`text-lg sm:text-2xl font-display font-bold leading-tight ${accent ? "text-accent-gold" : "text-text-primary"}`}>
        {value}
      </p>
      {sub && <p className="text-[9px] sm:text-xs text-text-secondary truncate">{sub}</p>}
    </div>
  );
}

// ─── TodayPlanner ──────────────────────────────────────────────────────────────
function TodayPlanner() {
  const SK = `upsc-tasks-${todayKey()}`;
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SK) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const save = (next) => { setTasks(next); localStorage.setItem(SK, JSON.stringify(next)); };
  const add  = () => { if (!input.trim()) return; save([...tasks, { text: input.trim(), done: false }]); setInput(""); };
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-accent-gold shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Today's Tasks</h3>
        </div>
        {tasks.length > 0 && (
          <span className="text-[10px] sm:text-[11px] font-mono text-text-muted">{done}/{tasks.length}</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="Add a task..."
          className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-2.5 sm:px-3 py-2 text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
        <button onClick={add} className="btn-primary flex items-center gap-1 px-3 py-2"><Plus size={14} /></button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-text-muted font-mono">No tasks yet. Add your study goals for today.</p>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 group py-1">
              <button
                onClick={() => save(tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                  t.done ? "bg-accent-green border-accent-green/60" : "border-bg-border hover:border-accent-gold/40"
                }`}
              >
                {t.done && <CheckCircle size={10} className="text-white" />}
              </button>
              <span className={`text-[11px] sm:text-xs flex-1 min-w-0 leading-tight ${t.done ? "line-through text-text-muted" : "text-text-secondary"}`}>
                {t.text}
              </span>
              <button onClick={() => save(tasks.filter((_, j) => j !== i))}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0 p-0.5">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PaperProgress ────────────────────────────────────────────────────────────
function PaperProgress({ syllabusData }) {
  const rows = [];
  for (const stage of ["prelims", "mains"]) {
    const stagePapers = syllabusData?.[stage];
    if (!stagePapers) continue;
    for (const paperKey of PAPER_ORDER[stage]) {
      const meta      = SYLLABUS[stage][paperKey];
      const userPaper = stagePapers[paperKey];
      if (!meta || !userPaper) continue;
      rows.push({ label: meta.label.split("—")[1]?.trim() || meta.label, color: meta.color, pct: getPct(userPaper.modules) });
    }
  }
  const [grown, setGrown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrown(true), 120); return () => clearTimeout(t); }, []);

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 size={14} className="text-accent-gold shrink-0" />
        <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Paper Coverage</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-text-muted font-mono py-2">Mark progress in Syllabus Tracker to see coverage.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map(({ label, color, pct }, i) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[11px] sm:text-xs text-text-secondary truncate max-w-[65%] sm:max-w-[70%]">{label}</span>
                <span className="text-[10px] sm:text-[11px] font-mono text-text-muted shrink-0">{pct}%</span>
              </div>
              <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all ease-out"
                  style={{ width: grown ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: pct > 0 ? `0 0 8px ${color}66` : "none", transitionDuration: "900ms", transitionDelay: `${i * 110}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({
  userData,
  todayHours: serverTodayHours,
  weekAvgHours,
  overallProgress,
  onLogHours,
  user,
  isLoggedIn = false,
  onNavigateAuth,
  onNavigateProfile,
  onNavigate,
}) {
  const userId = user?.id || user?._id || null;
  if (!user) return <AuthGate feature="Dashboard" onNavigateAuth={onNavigateAuth} />;

  const [timerHours, setTimerHours] = useState(0);
  const [isMobile, setIsMobile]     = useState(false);
  const [progressGrown, setProgressGrown] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setProgressGrown(true), 200);
    return () => clearTimeout(t);
  }, []);

  const serverHoursNum = parseFloat(serverTodayHours) || 0;
  const todayHours     = Math.max(serverHoursNum, timerHours);
  const targetHours    = userData?.profile?.daily_target_hours || 8;
  const streak         = userData?.profile?.streak || 0;
  const longestStreak  = userData?.profile?.longest_streak || 0;
  const totalAnswers   = userData?.answers?.length || 0;
  const syllabusData   = userData?.syllabus || null;
  const dailyLogs      = userData?.daily_logs || [];
  const userName       = userData?.profile?.name || user?.name || "";

  return (
    <div className="overflow-y-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4 md:space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1 sticky top-0 bg-bg-base/95 backdrop-blur-sm z-10 py-2 sm:py-0">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-base sm:text-lg md:text-xl text-text-primary truncate">
            Command Center
          </h2>
          <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 hidden sm:block">
            Progress, revision, and daily momentum.
          </p>
        </div>
        {userName && (
          <button
            onClick={onNavigateProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-bg-border bg-bg-surface hover:border-accent-gold/30 hover:bg-bg-muted transition-all duration-150 group shrink-0 ml-2"
            title="View profile"
          >
            <AvatarCircle name={userName} size="sm" as="span" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[100px] md:max-w-[120px]">
                {userName}
              </p>
              <p className="text-[10px] font-mono text-text-muted group-hover:text-accent-gold transition-colors">
                View profile
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
        <StatCard icon={Clock}      label="Today"    value={fmtHM(Math.round(todayHours * 3600))} sub={`Target: ${targetHours}h`} accent={todayHours >= targetHours} delay={0} />
        <StatCard icon={TrendingUp} label="7-Day Avg" value={`${weekAvgHours}h`} sub="Per day" delay={60} />
        <StatCard icon={Flame}      label="Streak"   value={`${streak}d`} sub={`Best: ${longestStreak}d`} iconColor="#fb923c" delay={120} />
        <StatCard icon={BookMarked} label="Answers"  value={totalAnswers} sub="Written" delay={180} />
        <StatCard icon={BarChart2}  label="Coverage" value={`${Math.round(overallProgress)}%`} sub="Syllabus" iconColor="#C9A84C" delay={240} />
        <StatCard icon={Target}     label="GS1 Done" value={`${getPct(syllabusData?.mains?.GS1?.modules || {})}%`} sub="GS1 modules" iconColor="#4ade80" delay={300} />
      </div>

      {/* ── Overall progress bar ── */}
      <div className="glass-panel p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-mono text-text-secondary uppercase tracking-wider">Overall Coverage</span>
          <span className="text-sm sm:text-base font-display font-bold text-text-primary">{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-2.5 bg-bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full transition-all ease-out"
            style={{ width: progressGrown ? `${overallProgress}%` : "0%", boxShadow: "0 0 10px rgba(201,168,76,0.5)", transitionDuration: "1100ms" }}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-text-muted font-mono">
          {overallProgress < 10 ? "Day one. The journey begins."
           : overallProgress < 40 ? "Foundation phase. Keep the momentum."
           : overallProgress < 70 ? "Solid coverage. Depth work begins now."
           : "Advanced stage. Revision and PYQ analysis."}
        </p>
      </div>

      {/* ── Today's Mission ── */}
      <TodaysMission
        userData={userData}
        todayHours={todayHours}
        overallProgress={overallProgress}
        onNavigate={onNavigate}
      />

      {/* ── Preparation Journey (onboarding milestones) ── */}
      <DashboardOnboardingCards
        userData={userData}
        todayHours={todayHours}
        overallProgress={overallProgress}
        onNavigate={onNavigate}
      />

      {/* ── START STUDYING (Action Hub) ── */}
      {/* Order: Topic-wise Practice → Mock Tests → Answer Evaluation → Notes Auditor */}
      {isMobile ? (
        <CollapsibleSection title="Start Studying" icon={Rocket} defaultOpen={true}>
          <ActionHub onNavigate={onNavigate} />
        </CollapsibleSection>
      ) : (
        <ActionHub onNavigate={onNavigate} />
      )}

      {/* ── Study Timer (subject-tagged) ── */}
      {/* SubjectStudyTimer does NOT render SubjectAnalyticsDashboard inside it. */}
      {/* The analytics card lives below as its own separate section.            */}
      <SubjectStudyTimer
        onLogHours={onLogHours}
        onSynced={setTimerHours}
        targetHours={targetHours}
        serverHours={serverHoursNum}
        dataReady={!!userData}
        userId={userId}
      />

      {/* ── Subject Study Analytics ── */}
      {/* Standalone card. Rendered ONCE here. Never inside SubjectStudyTimer. */}
      {isMobile ? (
        <CollapsibleSection title="Subject Study Hours" icon={BarChart2} defaultOpen={false}>
          <SubjectAnalyticsDashboard isLoggedIn={isLoggedIn} />
        </CollapsibleSection>
      ) : (
        <SubjectAnalyticsDashboard isLoggedIn={isLoggedIn} />
      )}

      {/* ── Today's Tasks ── */}
      {isMobile ? (
        <CollapsibleSection title="Today's Tasks" icon={ListChecks} defaultOpen={true}>
          <TodayPlanner />
        </CollapsibleSection>
      ) : (
        <TodayPlanner />
      )}

      {/* ── Study Chart + Paper Coverage ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {isMobile ? (
          <>
            <CollapsibleSection title="Study Chart" icon={TrendingUp} defaultOpen={false}>
              <StudyChart logs={dailyLogs} targetHours={targetHours} />
            </CollapsibleSection>
            <CollapsibleSection title="Paper Coverage" icon={BarChart2} defaultOpen={false}>
              <PaperProgress syllabusData={syllabusData} />
            </CollapsibleSection>
          </>
        ) : (
          <>
            <StudyChart logs={dailyLogs} targetHours={targetHours} />
            <PaperProgress syllabusData={syllabusData} />
          </>
        )}
      </div>

      {/* ── AI Spaced Repetition ── */}
      {isMobile ? (
        <CollapsibleSection title="AI Revision Queue" icon={Brain} defaultOpen={false}>
          <AIRevisionPanel onNavigate={onNavigate} isLoggedIn={isLoggedIn} compact={true} />
        </CollapsibleSection>
      ) : (
        <AIRevisionPanel onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      )}

      {/* ── Question Statistics ── */}
      {isMobile ? (
        <CollapsibleSection title="Question Statistics" defaultOpen={false} tight>
          <QuestionStatsPanel />
        </CollapsibleSection>
      ) : (
        <QuestionStatsPanel />
      )}

      {/* ── Feedback card ── */}
      <div className="glass-panel p-4 sm:p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-display font-semibold text-text-primary">How's your experience?</p>
          <p className="text-xs font-mono text-text-muted mt-0.5">Help us improve UPSC Mentor — takes 30 seconds.</p>
        </div>
        <button
          onClick={() => window.openFeedbackModal?.()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent-gold/40 bg-accent-gold/10 text-accent-gold text-sm font-semibold hover:bg-accent-gold/20 transition-all shrink-0"
        >
          <MessageSquarePlus size={15} />
          Feedback
        </button>
      </div>

    </div>
  );
}