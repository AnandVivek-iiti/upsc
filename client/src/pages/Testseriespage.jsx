// ─── Test Series Page ─────────────────────────────────────────────────────────
// Full quiz interface: timer, score calculator, correct/wrong/accuracy display
// Theme-aware using CSS custom properties from index.css
// Enhanced with question attempt tracking for unified analytics
// Dynamically loads ALL Testseries_t*_data.js files — just add a new file
// (export either an array TEST_TXX = [...] or a single object TEST_TXX = {...})
// and it will appear automatically. Fully responsive for mobile/app use.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuestionAttempts } from "../hooks/useQuestionAttempts";

import {
  Clock,
  CheckCircle2,
  XCircle,
  CircleDot,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart2,
  ListChecks,
  Target,
  Zap,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

// ─── Dynamic Test Loader ──────────────────────────────────────────────────────
// Picks up every ../data/Test/Testseries_t*_data.js file automatically.
// Each file can export its test data either as:
//   export const TEST_TXX = [ {...}, {...} ]   (array of tests)
//   export const TEST_TXX = { ... }            (single test object)
// Both shapes are normalized into one flat array. No manual import edits needed.
const TEST_MODULES = import.meta.glob("../data/Test/Testseries_t*_data.js", { eager: true });

function loadAllTests() {
  const all = [];
  for (const path in TEST_MODULES) {
    const mod = TEST_MODULES[path];
    for (const key in mod) {
      const val = mod[key];
      if (Array.isArray(val)) {
        all.push(...val);
      } else if (val && typeof val === "object" && Array.isArray(val.questions)) {
        // Single test object (has a `questions` array) — wrap it
        all.push(val);
      }
    }
  }
  // De-duplicate by id if present; otherwise fall back to file path + index
  const seen = new Set();
  return all.filter((t, i) => {
    const key = t && t.id ? t.id : `__noid_${i}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ALL_TESTS = loadAllTests();

if (ALL_TESTS.length === 0) {
  console.warn("No test data available. Please check your test data imports.");
}

// ─── Responsive helper ────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcScore(answers, questions, markPerQ, negFrac) {
  let correct = 0, wrong = 0, skipped = 0;
  questions.forEach((q) => {
    const ans = answers[q.id];
    if (!ans) { skipped++; return; }
    if (ans === q.correct) correct++;
    else wrong++;
  });
  const raw = correct * markPerQ - wrong * markPerQ * negFrac;
  const score = raw; // allow negative scores (real UPSC marking)
  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0.0";
  return { correct, wrong, skipped, score, accuracy, attempted };
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color, compact }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: compact ? 6 : 8,
      background: `${color}12`, border: `0.5px solid ${color}30`,
      borderRadius: 10, padding: compact ? "6px 10px" : "8px 14px",
      minWidth: compact ? 0 : 100, flex: compact ? "1 1 auto" : undefined,
    }}>
      <Icon size={compact ? 13 : 15} color={color} />
      <div>
        <div style={{ fontSize: compact ? 14 : 16, fontWeight: 700, color, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: compact ? 9 : 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function TimerBlock({ totalSeconds, secondsLeft, running }) {
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 100;
  const color = secondsLeft < 300 ? "var(--accent-red)" : secondsLeft < 600 ? "var(--accent-gold)" : "var(--accent-green)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
      borderRadius: 12, padding: "10px 16px", boxShadow: "var(--shadow-sm)",
    }}>
      <Clock size={16} color={color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
          {formatTime(secondsLeft)}
        </div>
        <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: "var(--bg-muted)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 1s linear, background .5s" }} />
        </div>
      </div>
      {!running && (
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>PAUSED</span>
      )}
    </div>
  );
}

// ─── Question Card (No answers shown during test) ───────────────────────────
function QuestionCard({ question, selectedAnswer, onAnswer, showResult, qIndex, total, testMeta, recordAttempt, isMobile }) {
  const lines = question.text.split("\n").filter(Boolean);

  const getOptionStyle = (optId) => {
    const isSelected = selectedAnswer === optId;

    if (!showResult) {
      return {
        border: isSelected ? "1.5px solid var(--accent-blue)" : "0.5px solid var(--bg-border)",
        background: isSelected ? "var(--accent-blue-dim)" : "var(--bg-surface)",
        color: isSelected ? "var(--accent-blue)" : "var(--text-primary)",
        cursor: isSelected ? "default" : "pointer",
      };
    }

    const isCorrect = optId === question.correct;
    if (isCorrect) return {
      border: "1.5px solid var(--accent-green)",
      background: "var(--accent-green-dim)",
      color: "var(--accent-green)",
      cursor: "default",
    };
    if (isSelected && !isCorrect) return {
      border: "1.5px solid var(--accent-red)",
      background: "var(--accent-red-dim)",
      color: "var(--accent-red)",
      cursor: "default",
    };
    return {
      border: "0.5px solid var(--bg-border)",
      background: "var(--bg-surface)",
      color: "var(--text-muted)",
      cursor: "default",
    };
  };

  const handleOptionClick = useCallback((optId) => {
    if (showResult || selectedAnswer) return;

    if (recordAttempt && testMeta) {
      const result = optId === question.correct ? "correct" : "wrong";
      recordAttempt(
        {
          id: question.id,
          questionText: question.text,
          topic: question.topic,
          difficulty: question.difficulty || "Medium",
          year: question.year || new Date().getFullYear(),
          testTitle: testMeta.title,
          testId: testMeta.id,
          subject: testMeta.subject,
        },
        result,
        {
          source: "Test",
          paper: testMeta.paper || testMeta.subject,
        }
      );
    }

    onAnswer(optId);
  }, [showResult, selectedAnswer, question, recordAttempt, testMeta, onAnswer]);

  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: isMobile ? 12 : 16,
      border: "0.5px solid var(--bg-border)", boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
    }}>
      {/* Q header */}
      <div style={{
        padding: isMobile ? "10px 14px" : "12px 20px",
        borderBottom: "0.5px solid var(--bg-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-muted)", gap: 8, flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "var(--accent-gold)",
          fontFamily: "'DM Mono', monospace",
          background: "var(--accent-gold-dim)", borderRadius: 6,
          padding: "3px 10px", border: "0.5px solid var(--accent-gold)",
          whiteSpace: "nowrap",
        }}>
          Q {question.qNo} / {total}
        </span>
        <span style={{
          fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? "60%" : "none",
        }}>
          {question.topic}
        </span>
      </div>

      {/* Question body */}
      <div style={{ padding: isMobile ? "16px 14px 0" : "20px 20px 0" }}>
        {lines.map((line, i) => {
          const isNumbered = /^[1-9IVX]+[.)]\s/.test(line.trim());
          return (
            <p key={i} style={{
              fontSize: isMobile ? 13.5 : 14, color: "var(--text-primary)", lineHeight: 1.7,
              marginBottom: 4,
              paddingLeft: isNumbered ? 12 : 0,
              fontWeight: line.startsWith("Statement") ? 500 : 400,
              wordBreak: "break-word",
            }}>
              {line}
            </p>
          );
        })}
        {question.suffix && (
          <p style={{ fontSize: isMobile ? 13.5 : 14, fontWeight: 600, color: "var(--text-primary)", marginTop: 10, marginBottom: 0, wordBreak: "break-word" }}>
            {question.suffix}
          </p>
        )}
      </div>

      {/* Options */}
      <div style={{ padding: isMobile ? 14 : 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options.map((opt) => {
          const style = getOptionStyle(opt.id);
          const isCorrect = showResult && opt.id === question.correct;
          const isWrong = showResult && selectedAnswer === opt.id && opt.id !== question.correct;
          return (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left",
                padding: isMobile ? "12px 14px" : "12px 16px", borderRadius: 10, transition: "all .15s",
                fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13.5 : 14,
                width: "100%", WebkitTapHighlightColor: "transparent",
                ...style,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                border: "1.5px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
              }}>
                {isCorrect ? "✓" : isWrong ? "✗" : opt.id}
              </span>
              <span style={{ flex: 1, wordBreak: "break-word" }}>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation — ONLY shown after test completion */}
      {showResult && selectedAnswer && (
        <div style={{
          margin: isMobile ? "0 14px 14px" : "0 20px 20px",
          borderRadius: 10, padding: isMobile ? "12px 14px" : "14px 16px",
          background: selectedAnswer === question.correct ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
          border: `0.5px solid ${selectedAnswer === question.correct ? "var(--accent-green)" : "var(--accent-red)"}`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            color: selectedAnswer === question.correct ? "var(--accent-green)" : "var(--accent-red)",
            marginBottom: 6, fontFamily: "'DM Mono', monospace",
          }}>
            {selectedAnswer === question.correct ? "✓ CORRECT" : `✗ WRONG · Correct: ${question.correct}`}
          </div>
          <p style={{ fontSize: isMobile ? 12.5 : 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, wordBreak: "break-word" }}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Skipped hint - ONLY shown after test completion */}
      {showResult && !selectedAnswer && (
        <div style={{
          margin: isMobile ? "0 14px 14px" : "0 20px 20px", borderRadius: 10, padding: isMobile ? "10px 14px" : "12px 16px",
          background: "var(--bg-muted)", border: "0.5px solid var(--bg-border)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
            SKIPPED · Correct: {question.correct}
          </div>
          <p style={{ fontSize: isMobile ? 12.5 : 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, wordBreak: "break-word" }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ test, answers, onRetry, onReview, recordAttempt, isMobile }) {
  const stats = calcScore(answers, test.questions, test.markPerQuestion, test.negativeFraction);
  const maxScore = test.totalQuestions * test.markPerQuestion;
  const scorePct = maxScore > 0 ? Math.max(0, (stats.score / maxScore) * 100).toFixed(1) : "0.0";

  useEffect(() => {
    if (recordAttempt && test) {
      test.questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer) {
          const result = userAnswer === q.correct ? "correct" : "wrong";
          recordAttempt(
            {
              id: q.id,
              questionText: q.text,
              topic: q.topic,
              difficulty: q.difficulty || "Medium",
              year: q.year || new Date().getFullYear(),
              testTitle: test.title,
              testId: test.id,
              subject: test.subject,
            },
            result,
            {
              source: "Test",
              paper: test.paper || test.subject,
              score: stats.score,
              accuracy: stats.accuracy,
            }
          );
        }
      });
    }
  }, []);

  const grade =
    stats.score < 0 ? { label: "Negative Score", color: "var(--accent-red)"   } :
    scorePct >= 80   ? { label: "Excellent",      color: "var(--accent-green)" } :
    scorePct >= 60   ? { label: "Good",           color: "var(--accent-blue)"  } :
    scorePct >= 40   ? { label: "Average",        color: "var(--accent-gold)"  } :
                       { label: "Needs Work",     color: "var(--accent-red)"   };

  const topicMap = {};
  test.questions.forEach((q) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, wrong: 0, skipped: 0 };
    const ans = answers[q.id];
    if (!ans) topicMap[q.topic].skipped++;
    else if (ans === q.correct) topicMap[q.topic].correct++;
    else topicMap[q.topic].wrong++;
  });

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "24px 20px", maxWidth: 760, margin: "0 auto" }}>
      {/* Header card */}
      <div style={{
        background: "var(--bg-surface)", borderRadius: isMobile ? 16 : 20, padding: isMobile ? 20 : 28,
        border: "0.5px solid var(--bg-border)", boxShadow: "var(--shadow-md)",
        textAlign: "center", marginBottom: isMobile ? 14 : 20,
      }}>
        <div style={{
          fontSize: 11, fontFamily: "'DM Mono', monospace",
          color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8,
        }}>
          Test Complete
        </div>
        <div style={{
          fontSize: isMobile ? 42 : 54, fontWeight: 800, color: grade.color,
          fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1,
        }}>
          {stats.score < 0 ? "−" : ""}{Math.abs(stats.score).toFixed(2)}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          out of {maxScore} marks
        </div>
        <div style={{
          display: "inline-block", marginTop: 12,
          padding: "4px 18px", borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: `${grade.color}18`, color: grade.color,
          border: `0.5px solid ${grade.color}44`,
          fontFamily: "'DM Mono', monospace",
        }}>
          {grade.label}{stats.score >= 0 ? ` · ${scorePct}%` : ` · ${stats.score.toFixed(2)} marks`}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(auto-fit, minmax(130px, 1fr))",
        gap: isMobile ? 8 : 10, marginBottom: isMobile ? 14 : 20,
      }}>
        <StatPill icon={CheckCircle2} label="Correct"  value={stats.correct}   color="var(--accent-green)" compact={isMobile} />
        <StatPill icon={XCircle}      label="Wrong"    value={stats.wrong}     color="var(--accent-red)" compact={isMobile} />
        <StatPill icon={CircleDot}    label="Skipped"  value={stats.skipped}   color="var(--text-muted)" compact={isMobile} />
        <StatPill icon={Target}       label="Accuracy" value={`${stats.accuracy}%`} color="var(--accent-blue)" compact={isMobile} />
        <StatPill icon={TrendingUp}   label="Score"    value={`${stats.score < 0 ? "−" : ""}${Math.abs(stats.score).toFixed(1)}`} color={stats.score < 0 ? "var(--accent-red)" : "var(--accent-gold)"} compact={isMobile} />
        <StatPill icon={ListChecks}   label="Attempted" value={`${stats.attempted}/${test.totalQuestions}`} color="var(--accent-purple)" compact={isMobile} />
      </div>

      {/* Marking scheme note */}
      <div style={{
        background: "var(--bg-muted)", borderRadius: 10, padding: "10px 16px",
        border: "0.5px solid var(--bg-border)", marginBottom: isMobile ? 14 : 20,
        fontSize: isMobile ? 11 : 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace",
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <AlertCircle size={13} />
        Marking: +{test.markPerQuestion} correct · −{(test.markPerQuestion * test.negativeFraction).toFixed(2)} wrong · 0 skipped
      </div>

      {/* Topic breakdown */}
      <div style={{
        background: "var(--bg-surface)", borderRadius: 14, border: "0.5px solid var(--bg-border)",
        overflow: "hidden", marginBottom: isMobile ? 18 : 24,
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--bg-border)", background: "var(--bg-muted)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>
            TOPIC-WISE BREAKDOWN
          </span>
        </div>
        <div style={{ padding: "6px 0" }}>
          {Object.entries(topicMap).map(([topic, t]) => {
            const total = t.correct + t.wrong + t.skipped;
            const acc = total > 0 ? ((t.correct / (t.correct + t.wrong || 1)) * 100).toFixed(0) : "—";
            return (
              <div key={topic} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: isMobile ? "8px 14px" : "8px 18px", borderBottom: "0.5px solid var(--bg-border)",
              }}>
                <div style={{ flex: 1, fontSize: isMobile ? 11.5 : 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic}</div>
                <span style={{ fontSize: 11, color: "var(--accent-green)", fontFamily: "'DM Mono', monospace", minWidth: 28 }}>{t.correct}✓</span>
                <span style={{ fontSize: 11, color: "var(--accent-red)", fontFamily: "'DM Mono', monospace", minWidth: 28 }}>{t.wrong}✗</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 6,
                  background: "var(--bg-muted)", color: "var(--text-muted)",
                  fontFamily: "'DM Mono', monospace",
                }}>{acc}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={onReview}
          style={{
            flex: 1, padding: "13px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: "var(--text-primary)", color: "var(--bg-base)", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", minWidth: isMobile ? "100%" : "auto",
          }}
        >
          Review Answers
        </button>
        <button
          onClick={onRetry}
          style={{
            padding: "13px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: "transparent", color: "var(--text-primary)",
            border: "0.5px solid var(--bg-border)", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            flex: isMobile ? "1 1 100%" : "0 0 auto",
          }}
        >
          <RotateCcw size={14} /> Retry
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Interface ───────────────────────────────────────────────────────────
function QuizInterface({ test, onFinish, recordAttempt, isMobile }) {
  const totalSeconds = test.timeMinutes * 60;
  const [answers,     setAnswers]     = useState({});
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running,     setRunning]     = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current); onFinish(answers); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const q = test.questions[currentIdx];

  const testMeta = {
    id: test.id,
    title: test.title,
    subject: test.subject,
    paper: test.paper || test.subject,
  };

  const handleAnswer = useCallback((optId) => {
    if (answers[q.id]) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  }, [q, answers]);

  const goTo = (idx) => setCurrentIdx(idx);
  const prev = () => currentIdx > 0 && goTo(currentIdx - 1);
  const next = () => currentIdx < test.questions.length - 1 && goTo(currentIdx + 1);

  const answered   = test.questions.filter((x) => answers[x.id]).length;
  const unanswered = test.totalQuestions - answered;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2px" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch",
        marginBottom: isMobile ? 12 : 16,
      }}>
        <div style={{ flex: 1, minWidth: isMobile ? "100%" : 180 }}>
          <TimerBlock totalSeconds={totalSeconds} secondsLeft={secondsLeft} running={running} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg-muted)", border: "0.5px solid var(--bg-border)",
            borderRadius: 10, padding: "8px 14px", flex: isMobile ? "1 1 auto" : "none",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              Answered
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>
              {answered}/{test.totalQuestions}
            </span>
          </div>

          <button
            onClick={() => setRunning((v) => !v)}
            style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: running ? "var(--accent-gold-dim)" : "var(--accent-green-dim)",
              color: running ? "var(--accent-gold)" : "var(--accent-green)",
              border: `0.5px solid ${running ? "var(--accent-gold)" : "var(--accent-green)"}44`,
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
              flex: isMobile ? "1 1 auto" : "none",
            }}
          >
            {running ? "⏸ Pause" : "▶ Resume"}
          </button>

          <button
            onClick={() => onFinish(answers)}
            style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: "var(--text-primary)", color: "var(--bg-base)",
              border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace",
              flex: isMobile ? "1 1 auto" : "none",
            }}
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        display: "flex", gap: 3, flexWrap: "wrap", marginBottom: isMobile ? 12 : 16,
        padding: isMobile ? "8px 10px" : "10px 14px", background: "var(--bg-surface)",
        borderRadius: 12, border: "0.5px solid var(--bg-border)",
        maxHeight: isMobile ? 100 : "none", overflowY: isMobile ? "auto" : "visible",
      }}>
        {test.questions.map((qu, i) => {
          const ans = answers[qu.id];
          const isCurrent = i === currentIdx;
          const bg = isCurrent ? "var(--accent-blue)" :
                     ans ? "var(--text-secondary)" :
                     "var(--bg-muted)";
          return (
            <button
              key={qu.id}
              onClick={() => goTo(i)}
              title={`Q${qu.qNo}${ans ? ' - Answered' : ''}`}
              style={{
                width: isMobile ? 24 : 26, height: isMobile ? 24 : 26, borderRadius: 6,
                border: isCurrent ? "1.5px solid var(--accent-blue)" : "0.5px solid var(--bg-border)",
                background: bg, cursor: "pointer", fontSize: 10, fontWeight: 700,
                color: ans || isCurrent ? "var(--text-inverse)" : "var(--text-muted)",
                fontFamily: "'DM Mono', monospace", transition: "all .12s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {qu.qNo}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <QuestionCard
        key={q.id}
        question={q}
        selectedAnswer={answers[q.id]}
        onAnswer={handleAnswer}
        showResult={false}
        qIndex={currentIdx}
        total={test.totalQuestions}
        testMeta={testMeta}
        recordAttempt={recordAttempt}
        isMobile={isMobile}
      />

      {/* Navigation */}
      <div style={{
        display: "flex", gap: 10, marginTop: isMobile ? 12 : 14, alignItems: "center",
        position: isMobile ? "sticky" : "static",
        bottom: isMobile ? 8 : "auto",
        background: isMobile ? "var(--bg-base)" : "transparent",
        paddingTop: isMobile ? 6 : 0,
      }}>
        <button
          onClick={prev} disabled={currentIdx === 0}
          style={{
            padding: isMobile ? "12px 16px" : "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "transparent", color: currentIdx === 0 ? "var(--text-muted)" : "var(--text-primary)",
            border: "0.5px solid var(--bg-border)", cursor: currentIdx === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <ChevronLeft size={15} /> {!isMobile && "Prev"}
        </button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          {answered} answered · {unanswered} left
        </div>
        {currentIdx < test.questions.length - 1 ? (
          <button
            onClick={next}
            style={{
              padding: isMobile ? "12px 16px" : "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "var(--text-primary)", color: "var(--bg-base)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {!isMobile && "Next"} <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={() => onFinish(answers)}
            style={{
              padding: isMobile ? "12px 16px" : "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "var(--accent-green)", color: "#fff",
              border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Finish ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Review Mode ───────────────────────────────────────────────────────────────
function ReviewMode({ test, answers, onBack, isMobile }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [filter, setFilter] = useState("all");

  const filtered = test.questions.filter((q) => {
    const ans = answers[q.id];
    if (filter === "correct") return ans === q.correct;
    if (filter === "wrong")   return ans && ans !== q.correct;
    if (filter === "skipped") return !ans;
    return true;
  });

  const q = filtered[currentIdx];

  const counts = {
    all: test.questions.length,
    correct: test.questions.filter((q) => answers[q.id] === q.correct).length,
    wrong: test.questions.filter((q) => answers[q.id] && answers[q.id] !== q.correct).length,
    skipped: test.questions.filter((q) => !answers[q.id]).length,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: isMobile ? 12 : 16, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
          borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: "transparent", color: "var(--text-secondary)",
          border: "0.5px solid var(--bg-border)", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <ChevronLeft size={14} /> Results
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>
          Review
        </span>
        <div style={{ display: "flex", gap: 4, marginLeft: isMobile ? 0 : "auto", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          {["all", "correct", "wrong", "skipped"].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setCurrentIdx(0); }} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: filter === f ? "var(--text-primary)" : "transparent",
              color: filter === f ? "var(--bg-base)" : "var(--text-muted)",
              border: filter === f ? "none" : "0.5px solid var(--bg-border)", cursor: "pointer",
              textTransform: "capitalize", fontFamily: "'DM Mono', monospace",
              flex: isMobile ? "1 1 auto" : "none",
            }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {!q ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          No questions in this filter.
        </div>
      ) : (
        <>
          <QuestionCard
            key={q.id}
            question={q}
            selectedAnswer={answers[q.id]}
            onAnswer={() => {}}
            showResult={true}
            qIndex={currentIdx}
            total={filtered.length}
            isMobile={isMobile}
          />
          <div style={{ display: "flex", gap: 10, marginTop: isMobile ? 12 : 14 }}>
            <button onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}
              style={{
                padding: isMobile ? "12px 16px" : "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "transparent", color: currentIdx === 0 ? "var(--text-muted)" : "var(--text-primary)",
                border: "0.5px solid var(--bg-border)", cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif",
              }}>
              <ChevronLeft size={15} /> {!isMobile && "Prev"}
            </button>
            <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", paddingTop: 12 }}>
              {currentIdx + 1} / {filtered.length}
            </div>
            <button onClick={() => currentIdx < filtered.length - 1 && setCurrentIdx(currentIdx + 1)} disabled={currentIdx === filtered.length - 1}
              style={{
                padding: isMobile ? "12px 16px" : "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: currentIdx === filtered.length - 1 ? "var(--bg-muted)" : "var(--text-primary)",
                color: currentIdx === filtered.length - 1 ? "var(--text-muted)" : "var(--bg-base)",
                border: "none", cursor: currentIdx === filtered.length - 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif",
              }}>
              {!isMobile && "Next"} <ChevronRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Test Card (selector) ─────────────────────────────────────────────────────
function TestCard({ test, onStart, isMobile }) {
  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: isMobile ? 14 : 16,
      border: "0.5px solid var(--bg-border)", overflow: "hidden",
      boxShadow: "var(--shadow-sm)", cursor: "pointer",
      transition: "box-shadow .2s",
      display: "flex", flexDirection: "column", height: "100%",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
    >
      <div style={{ height: 4, background: test.color, flexShrink: 0 }} />
      <div style={{ padding: isMobile ? "16px 16px" : "20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Fixed-height badge row: accommodates up to 2 lines so all cards align */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10,
          minHeight: isMobile ? 24 : 26,
          alignContent: "flex-start",
        }}>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace", fontWeight: 600,
            background: `${test.color}18`, color: test.color, border: `0.5px solid ${test.color}44`,
            whiteSpace: "nowrap",
          }}>
            {test.subject}
          </span>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace",
            background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)",
            whiteSpace: "nowrap",
          }}>
            {test.totalQuestions} Questions
          </span>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace",
            background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)",
            whiteSpace: "nowrap",
          }}>
            {test.timeMinutes} min
          </span>
        </div>
        <h3 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {test.title}
        </h3>
        <p style={{
          fontSize: 12, color: "var(--text-muted)", marginBottom: 16,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", minHeight: "2.6em", lineHeight: 1.3,
        }}>{test.topic}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-muted)", marginBottom: 16, fontFamily: "'DM Mono', monospace", flexWrap: "wrap" }}>
          <span>Max: {test.maxMarks} marks</span>
          <span>·</span>
          <span>+{test.markPerQuestion} / −{(test.markPerQuestion * test.negativeFraction).toFixed(2)}</span>
        </div>
        <button
          onClick={() => onStart(test)}
          style={{
            width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: "var(--text-primary)", color: "var(--bg-base)", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            WebkitTapHighlightColor: "transparent",
            marginTop: "auto",
          }}
        >
          <Zap size={14} /> Start Test
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TestSeriesPage({ user = null, onSyllabusUpdate = null, onBulkSyllabusUpdate = null, serverAttempts = [] }) {
  const [mode,         setMode]         = useState("list");
  const [activeTest,   setActiveTest]   = useState(null);
  const [finalAnswers, setFinalAnswers] = useState({});
  const [subjectFilter, setSubjectFilter] = useState("All");

  const isMobile = useIsMobile();

  const { recordAttempt } = useQuestionAttempts({ onSyllabusUpdate: onBulkSyllabusUpdate || onSyllabusUpdate, serverAttempts });

  const subjects = useMemo(() => {
    const set = new Set(ALL_TESTS.map((t) => t.subject));
    return ["All", ...Array.from(set)];
  }, []);

  const visibleTests = useMemo(() => {
    if (subjectFilter === "All") return ALL_TESTS;
    return ALL_TESTS.filter((t) => t.subject === subjectFilter);
  }, [subjectFilter]);

  const handleStart = (test) => {
    setActiveTest(test);
    setFinalAnswers({});
    setMode("quiz");
  };

  const handleFinish = (answers) => {
    setFinalAnswers(answers);
    setMode("results");
  };

  const handleRetry = () => {
    setFinalAnswers({});
    setMode("quiz");
  };

  const handleReview = () => setMode("review");
  const handleBackToList = () => { setMode("list"); setActiveTest(null); };

  if (ALL_TESTS.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "80px 20px",
        color: "var(--text-muted)",
        fontFamily: "'DM Mono', monospace"
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Tests Available</div>
        <div style={{ fontSize: 14 }}>Test data files not found. Please check your data imports.</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto animate-fade-in" style={{ background: "var(--bg-base)" }}>
      <div className="mx-auto max-w-7xl" style={{ padding: isMobile ? "14px 12px" : "24px 20px" }}>

        {/* ── Page Header ── */}
        {mode === "list" && (
          <header style={{
            background: "var(--bg-surface)", borderRadius: isMobile ? 16 : 20,
            border: "0.5px solid var(--bg-border)", padding: isMobile ? "18px 18px" : "22px 28px",
            marginBottom: isMobile ? 16 : 24, boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent-gold)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
                  Mock Tests
                </p>
                <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 4 }}>
                  Test Series
                </h1>
                <p style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-muted)" }}>
                  Timed mock tests with score calculator · Negative marking · Detailed explanations
                </p>
              </div>
              <div style={{ display: "flex", gap: isMobile ? 8 : 16, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
                {[
                  { icon: ListChecks, label: "Tests",    val: ALL_TESTS.length,                   c: "var(--accent-blue)"   },
                  { icon: BookOpen,   label: "Questions", val: ALL_TESTS.reduce((a, t) => a + t.totalQuestions, 0), c: "var(--accent-green)" },
                  { icon: BarChart2,  label: "Subjects",  val: [...new Set(ALL_TESTS.map((t) => t.subject))].length, c: "var(--accent-gold)"  },
                ].map(({ icon: Icon, label, val, c }) => (
                  <div key={label} style={{
                    textAlign: "center", padding: isMobile ? "10px 14px" : "12px 20px",
                    background: "var(--bg-muted)", borderRadius: 12,
                    border: "0.5px solid var(--bg-border)",
                    flex: isMobile ? 1 : "none",
                  }}>
                    <Icon size={18} color={c} style={{ margin: "0 auto 4px" }} />
                    <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', serif" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject filter chips */}
            <div style={{
              display: "flex", gap: 6, flexWrap: "wrap", marginTop: isMobile ? 14 : 18,
              overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 2 : 0,
            }}>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                    fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
                    background: subjectFilter === s ? "var(--text-primary)" : "var(--bg-muted)",
                    color: subjectFilter === s ? "var(--bg-base)" : "var(--text-muted)",
                    border: subjectFilter === s ? "none" : "0.5px solid var(--bg-border)",
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </header>
        )}

        {/* ── Quiz header bar ── */}
        {(mode === "quiz" || mode === "results" || mode === "review") && activeTest && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: isMobile ? 12 : 18, flexWrap: "wrap",
          }}>
            {mode !== "quiz" && (
              <button onClick={handleBackToList} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: "transparent", color: "var(--text-secondary)",
                border: "0.5px solid var(--bg-border)", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <ChevronLeft size={14} /> All Tests
              </button>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                {activeTest.subject} · {activeTest.totalQuestions}Q · {activeTest.timeMinutes}min
              </div>
              <div style={{
                fontSize: isMobile ? 13.5 : 15, fontWeight: 700, color: "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {activeTest.title}
              </div>
            </div>
          </div>
        )}

        {/* ── Views ── */}
        {mode === "list" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
            gap: isMobile ? 12 : 16,
          }}>
            {visibleTests.map((test) => (
              <TestCard key={test.id} test={test} onStart={handleStart} isMobile={isMobile} />
            ))}
          </div>
        )}

        {mode === "quiz" && activeTest && (
          <QuizInterface
            test={activeTest}
            onFinish={handleFinish}
            recordAttempt={recordAttempt}
            isMobile={isMobile}
          />
        )}

        {mode === "results" && activeTest && (
          <ResultsScreen
            test={activeTest}
            answers={finalAnswers}
            onRetry={handleRetry}
            onReview={handleReview}
            recordAttempt={recordAttempt}
            isMobile={isMobile}
          />
        )}

        {mode === "review" && activeTest && (
          <ReviewMode
            test={activeTest}
            answers={finalAnswers}
            onBack={() => setMode("results")}
            isMobile={isMobile}
          />
        )}

      </div>
    </div>
  );
}