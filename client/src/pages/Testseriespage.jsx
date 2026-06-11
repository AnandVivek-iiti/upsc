// ─── Test Series Page ─────────────────────────────────────────────────────────
// Full quiz interface: timer, score calculator, correct/wrong/accuracy display
// Theme-aware using CSS custom properties from index.css
// Enhanced with question attempt tracking for unified analytics

import { useState, useEffect, useRef, useCallback } from "react";
import { TEST_T29 } from "../data/Test/Testseries_t29_data";
// Import other test data with fallbacks in case they don't exist
let TEST_T1 = [];
let TEST_T18 = [];

try {
  const t1Module = require("../data/Test/Testseries_t1_data");
  TEST_T1 = t1Module.TEST_T1 || t1Module.default || [];
} catch (e) {
  console.warn("Testseries_t1_data not found, skipping T1 tests");
}

try {
  const t18Module = require("../data/Test/Testseries_t18_data");
  TEST_T18 = t18Module.TEST_T18 || t18Module.default || [];
} catch (e) {
  console.warn("Testseries_t18_data not found, skipping T18 tests");
}

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

// Combine all test data safely
const ALL_TESTS = [
  ...(Array.isArray(TEST_T29) ? TEST_T29 : []),
  ...(Array.isArray(TEST_T1) ? TEST_T1 : []),
  ...(Array.isArray(TEST_T18) ? TEST_T18 : []),
];

// If no tests are available, show a message
if (ALL_TESTS.length === 0) {
  console.warn("No test data available. Please check your test data imports.");
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
  const score = Math.max(0, raw);
  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0.0";
  return { correct, wrong, skipped, score, accuracy, attempted };
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: `${color}12`, border: `0.5px solid ${color}30`,
      borderRadius: 10, padding: "8px 14px", minWidth: 100,
    }}>
      <Icon size={15} color={color} />
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
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

// ─── Question Card (ENHANCED - No answers shown during test) ────────────────
function QuestionCard({ question, selectedAnswer, onAnswer, showResult, qIndex, total, testMeta, recordAttempt }) {
  const lines = question.text.split("\n").filter(Boolean);

  const getOptionStyle = (optId) => {
    const isSelected = selectedAnswer === optId;

    if (!showResult) {
      // DURING TEST: Only show selection highlight, NEVER reveal correctness
      return {
        border: isSelected ? "1.5px solid var(--accent-blue)" : "0.5px solid var(--bg-border)",
        background: isSelected ? "var(--accent-blue-dim)" : "var(--bg-surface)",
        color: isSelected ? "var(--accent-blue)" : "var(--text-primary)",
        cursor: isSelected ? "default" : "pointer",
      };
    }

    // REVIEW/RESULTS: Show correct/wrong
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

  // Handle answer selection with attempt recording
  const handleOptionClick = useCallback((optId) => {
    if (showResult || selectedAnswer) return; // Don't allow re-answering

    // Record the attempt
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
      background: "var(--bg-surface)", borderRadius: 16,
      border: "0.5px solid var(--bg-border)", boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
    }}>
      {/* Q header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "0.5px solid var(--bg-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-muted)",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "var(--accent-gold)",
          fontFamily: "'DM Mono', monospace",
          background: "var(--accent-gold-dim)", borderRadius: 6,
          padding: "3px 10px", border: "0.5px solid var(--accent-gold)",
        }}>
          Q {question.qNo} / {total}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          {question.topic}
        </span>
      </div>

      {/* Question body */}
      <div style={{ padding: "20px 20px 0" }}>
        {lines.map((line, i) => {
          const isNumbered = /^[1-9IVX]+[.)]\s/.test(line.trim());
          return (
            <p key={i} style={{
              fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7,
              marginBottom: 4,
              paddingLeft: isNumbered ? 12 : 0,
              fontStyle: line.startsWith("Statement") ? "normal" : "normal",
              fontWeight: line.startsWith("Statement") ? 500 : 400,
            }}>
              {line}
            </p>
          );
        })}
        {question.suffix && (
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginTop: 10, marginBottom: 0 }}>
            {question.suffix}
          </p>
        )}
      </div>

      {/* Options */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
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
                padding: "12px 16px", borderRadius: 10, transition: "all .15s",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14,
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
              <span style={{ flex: 1 }}>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation — ONLY shown after test completion */}
      {showResult && selectedAnswer && (
        <div style={{
          margin: "0 20px 20px",
          borderRadius: 10, padding: "14px 16px",
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
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Skipped hint - ONLY shown after test completion */}
      {showResult && !selectedAnswer && (
        <div style={{
          margin: "0 20px 20px", borderRadius: 10, padding: "12px 16px",
          background: "var(--bg-muted)", border: "0.5px solid var(--bg-border)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
            SKIPPED · Correct: {question.correct}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Results Screen (ENHANCED with attempt recording) ───────────────────────
function ResultsScreen({ test, answers, onRetry, onReview, recordAttempt }) {
  const stats = calcScore(answers, test.questions, test.markPerQuestion, test.negativeFraction);
  const maxScore = test.totalQuestions * test.markPerQuestion;
  const scorePct = ((stats.score / maxScore) * 100).toFixed(1);

  // Record all attempts when results are shown
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
  }, []); // Run once when results component mounts

  const grade =
    scorePct >= 80 ? { label: "Excellent", color: "var(--accent-green)" } :
    scorePct >= 60 ? { label: "Good",      color: "var(--accent-blue)"  } :
    scorePct >= 40 ? { label: "Average",   color: "var(--accent-gold)"  } :
                    { label: "Needs Work", color: "var(--accent-red)"   };

  // per-topic breakdown
  const topicMap = {};
  test.questions.forEach((q) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, wrong: 0, skipped: 0 };
    const ans = answers[q.id];
    if (!ans) topicMap[q.topic].skipped++;
    else if (ans === q.correct) topicMap[q.topic].correct++;
    else topicMap[q.topic].wrong++;
  });

  return (
    <div style={{ padding: "24px 20px", maxWidth: 760, margin: "0 auto" }}>
      {/* Header card */}
      <div style={{
        background: "var(--bg-surface)", borderRadius: 20, padding: 28,
        border: "0.5px solid var(--bg-border)", boxShadow: "var(--shadow-md)",
        textAlign: "center", marginBottom: 20,
      }}>
        <div style={{
          fontSize: 11, fontFamily: "'DM Mono', monospace",
          color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8,
        }}>
          Test Complete
        </div>
        <div style={{
          fontSize: 54, fontWeight: 800, color: grade.color,
          fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1,
        }}>
          {stats.score.toFixed(2)}
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
          {grade.label} · {scorePct}%
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        <StatPill icon={CheckCircle2} label="Correct"  value={stats.correct}   color="var(--accent-green)"  />
        <StatPill icon={XCircle}      label="Wrong"    value={stats.wrong}     color="var(--accent-red)"    />
        <StatPill icon={CircleDot}    label="Skipped"  value={stats.skipped}   color="var(--text-muted)"    />
        <StatPill icon={Target}       label="Accuracy" value={`${stats.accuracy}%`} color="var(--accent-blue)"  />
        <StatPill icon={TrendingUp}   label="Score"    value={`${stats.score.toFixed(1)}`} color="var(--accent-gold)" />
        <StatPill icon={ListChecks}   label="Attempted" value={`${stats.attempted}/${test.totalQuestions}`} color="var(--accent-purple)" />
      </div>

      {/* Marking scheme note */}
      <div style={{
        background: "var(--bg-muted)", borderRadius: 10, padding: "10px 16px",
        border: "0.5px solid var(--bg-border)", marginBottom: 20,
        fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <AlertCircle size={13} />
        Marking: +{test.markPerQuestion} correct · −{(test.markPerQuestion * test.negativeFraction).toFixed(2)} wrong · 0 skipped
      </div>

      {/* Topic breakdown */}
      <div style={{
        background: "var(--bg-surface)", borderRadius: 14, border: "0.5px solid var(--bg-border)",
        overflow: "hidden", marginBottom: 24,
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
                padding: "8px 18px", borderBottom: "0.5px solid var(--bg-border)",
              }}>
                <div style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>{topic}</div>
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
            fontFamily: "'DM Sans', sans-serif",
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
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <RotateCcw size={14} /> Retry
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Interface (ENHANCED - No marks shown during test) ──────────────────
function QuizInterface({ test, onFinish, recordAttempt }) {
  const totalSeconds = test.timeMinutes * 60;
  const [answers,     setAnswers]     = useState({});
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running,     setRunning]     = useState(true);
  const timerRef = useRef(null);

  // Timer
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

  // Prepare test metadata for attempt recording
  const testMeta = {
    id: test.id,
    title: test.title,
    subject: test.subject,
    paper: test.paper || test.subject,
  };

  const handleAnswer = useCallback((optId) => {
    if (answers[q.id]) return; // already answered
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  }, [q, answers]);

  const goTo = (idx) => {
    setCurrentIdx(idx);
  };

  const prev = () => currentIdx > 0 && goTo(currentIdx - 1);
  const next = () => currentIdx < test.questions.length - 1 && goTo(currentIdx + 1);

  const answered   = test.questions.filter((x) => answers[x.id]).length;
  const unanswered = test.totalQuestions - answered;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 4px" }}>
      {/* Top bar - NO SCORE shown during test, only timer and progress */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch",
        marginBottom: 16,
      }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <TimerBlock totalSeconds={totalSeconds} secondsLeft={secondsLeft} running={running} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Only show answered count during test, no correctness info */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg-muted)", border: "0.5px solid var(--bg-border)",
            borderRadius: 10, padding: "8px 14px",
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
            }}
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Progress dots - NO color coding for correct/wrong during test */}
      <div style={{
        display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 16,
        padding: "10px 14px", background: "var(--bg-surface)",
        borderRadius: 12, border: "0.5px solid var(--bg-border)",
      }}>
        {test.questions.map((qu, i) => {
          const ans = answers[qu.id];
          const isCurrent = i === currentIdx;
          // During test: only show answered/unanswered, NOT correct/wrong
          const bg = isCurrent ? "var(--accent-blue)" :
                     ans ? "var(--text-secondary)" :
                     "var(--bg-muted)";
          return (
            <button
              key={qu.id}
              onClick={() => goTo(i)}
              title={`Q${qu.qNo}${ans ? ' - Answered' : ''}`}
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: isCurrent ? "1.5px solid var(--accent-blue)" : "0.5px solid var(--bg-border)",
                background: bg, cursor: "pointer", fontSize: 10, fontWeight: 700,
                color: ans || isCurrent ? "var(--text-inverse)" : "var(--text-muted)",
                fontFamily: "'DM Mono', monospace", transition: "all .12s",
              }}
            >
              {qu.qNo}
            </button>
          );
        })}
      </div>

      {/* Question card - showResult is ALWAYS false during test */}
      <QuestionCard
        key={q.id}
        question={q}
        selectedAnswer={answers[q.id]}
        onAnswer={handleAnswer}
        showResult={false}  // NEVER show results during test
        qIndex={currentIdx}
        total={test.totalQuestions}
        testMeta={testMeta}
        recordAttempt={recordAttempt}
      />

      {/* Navigation - NO marks/stats shown */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        <button
          onClick={prev} disabled={currentIdx === 0}
          style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "transparent", color: currentIdx === 0 ? "var(--text-muted)" : "var(--text-primary)",
            border: "0.5px solid var(--bg-border)", cursor: currentIdx === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <ChevronLeft size={15} /> Prev
        </button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          {answered} answered · {unanswered} remaining
        </div>
        {currentIdx < test.questions.length - 1 ? (
          <button
            onClick={next}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "var(--text-primary)", color: "var(--bg-base)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={() => onFinish(answers)}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "var(--accent-green)", color: "#fff",
              border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Finish Test ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Review Mode (ENHANCED - Shows results but doesn't re-record) ──────────
function ReviewMode({ test, answers, onBack }) {
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

  // Count for filter badges
  const counts = {
    all: test.questions.length,
    correct: test.questions.filter((q) => answers[q.id] === q.correct).length,
    wrong: test.questions.filter((q) => answers[q.id] && answers[q.id] !== q.correct).length,
    skipped: test.questions.filter((q) => !answers[q.id]).length,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 4px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
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
          Review Mode
        </span>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {["all", "correct", "wrong", "skipped"].map((f) => (
            <button key={f} onClick={() => { setFilter(f); setCurrentIdx(0); }} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: filter === f ? "var(--text-primary)" : "transparent",
              color: filter === f ? "var(--bg-base)" : "var(--text-muted)",
              border: filter === f ? "none" : "0.5px solid var(--bg-border)", cursor: "pointer",
              textTransform: "capitalize", fontFamily: "'DM Mono', monospace",
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
            showResult={true}  // Show results in review mode
            qIndex={currentIdx}
            total={filtered.length}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}
              style={{
                padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "transparent", color: currentIdx === 0 ? "var(--text-muted)" : "var(--text-primary)",
                border: "0.5px solid var(--bg-border)", cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif",
              }}>
              <ChevronLeft size={15} /> Prev
            </button>
            <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", paddingTop: 12 }}>
              {currentIdx + 1} / {filtered.length}
            </div>
            <button onClick={() => currentIdx < filtered.length - 1 && setCurrentIdx(currentIdx + 1)} disabled={currentIdx === filtered.length - 1}
              style={{
                padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: currentIdx === filtered.length - 1 ? "var(--bg-muted)" : "var(--text-primary)",
                color: currentIdx === filtered.length - 1 ? "var(--text-muted)" : "var(--bg-base)",
                border: "none", cursor: currentIdx === filtered.length - 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif",
              }}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Test Card (selector) ─────────────────────────────────────────────────────
function TestCard({ test, onStart }) {
  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: 16,
      border: "0.5px solid var(--bg-border)", overflow: "hidden",
      boxShadow: "var(--shadow-sm)", cursor: "pointer",
      transition: "box-shadow .2s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}
    >
      <div style={{ height: 4, background: test.color }} />
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace", fontWeight: 600,
            background: `${test.color}18`, color: test.color, border: `0.5px solid ${test.color}44`,
          }}>
            {test.subject}
          </span>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace",
            background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)",
          }}>
            {test.totalQuestions} Questions
          </span>
          <span style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace",
            background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)",
          }}>
            {test.timeMinutes} min
          </span>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {test.title}
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{test.topic}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-muted)", marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
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
          }}
        >
          <Zap size={14} /> Start Test
        </button>
      </div>
    </div>
  );
}

// ─── Main Page (ENHANCED with attempt tracking and robust data handling) ────
export default function TestSeriesPage() {
  const [mode,         setMode]         = useState("list");
  const [activeTest,   setActiveTest]   = useState(null);
  const [finalAnswers, setFinalAnswers] = useState({});

  // Initialize attempt tracking
  const { recordAttempt } = useQuestionAttempts();

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

  // Show message if no tests available
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
      <div className="mx-auto max-w-7xl" style={{ padding: "24px 20px" }}>

        {/* ── Page Header ── */}
        {mode === "list" && (
          <header style={{
            background: "var(--bg-surface)", borderRadius: 20,
            border: "0.5px solid var(--bg-border)", padding: "22px 28px",
            marginBottom: 24, boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent-gold)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
                  Mock Tests
                </p>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 4 }}>
                  Test Series
                </h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Timed mock tests with score calculator · Negative marking · Detailed explanations
                </p>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { icon: ListChecks, label: "Tests",    val: ALL_TESTS.length,                   c: "var(--accent-blue)"   },
                  { icon: BookOpen,   label: "Questions", val: ALL_TESTS.reduce((a, t) => a + t.totalQuestions, 0), c: "var(--accent-green)" },
                  { icon: BarChart2,  label: "Subjects",  val: [...new Set(ALL_TESTS.map((t) => t.subject))].length, c: "var(--accent-gold)"  },
                ].map(({ icon: Icon, label, val, c }) => (
                  <div key={label} style={{
                    textAlign: "center", padding: "12px 20px",
                    background: "var(--bg-muted)", borderRadius: 12,
                    border: "0.5px solid var(--bg-border)",
                  }}>
                    <Icon size={18} color={c} style={{ margin: "0 auto 4px" }} />
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', serif" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </header>
        )}

        {/* ── Quiz header bar ── */}
        {(mode === "quiz" || mode === "results" || mode === "review") && activeTest && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 18, flexWrap: "wrap",
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                {activeTest.subject} · {activeTest.totalQuestions}Q · {activeTest.timeMinutes}min
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                {activeTest.title}
              </div>
            </div>
          </div>
        )}

        {/* ── Views ── */}
        {mode === "list" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {ALL_TESTS.map((test) => (
              <TestCard key={test.id} test={test} onStart={handleStart} />
            ))}
          </div>
        )}

        {mode === "quiz" && activeTest && (
          <QuizInterface
            test={activeTest}
            onFinish={handleFinish}
            recordAttempt={recordAttempt}
          />
        )}

        {mode === "results" && activeTest && (
          <ResultsScreen
            test={activeTest}
            answers={finalAnswers}
            onRetry={handleRetry}
            onReview={handleReview}
            recordAttempt={recordAttempt}
          />
        )}

        {mode === "review" && activeTest && (
          <ReviewMode
            test={activeTest}
            answers={finalAnswers}
            onBack={() => setMode("results")}
          />
        )}

      </div>
    </div>
  );
}