const TestAttempt = require("../models/TestAttempt");
const { UserData } = require("../models/UserData");
const { analyzeTestPerformance } = require("../config/ai-client");
const trackEvent = require("../utils/trackEvent");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round1(n) {
  return Math.round(n * 10) / 10;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Server-side scoring — never trust client-sent score/accuracy/percentage.
 * The client may send raw counts + marking scheme; we compute everything else.
 */
function computeScoring({ correct_count, wrong_count, skipped_count, total_questions, marks_correct, marks_wrong, marks_skipped, max_marks }) {
  const attempted_count = correct_count + wrong_count;

  const score = round2(
    correct_count * marks_correct +
    wrong_count   * marks_wrong +
    skipped_count * marks_skipped
  );

  const accuracy = attempted_count > 0
    ? round1((correct_count / attempted_count) * 100)
    : 0;

  const percentage = max_marks > 0
    ? round1((score / max_marks) * 100)
    : 0;

  const performance_band = TestAttempt.computeBand(percentage);

  return { attempted_count, score, accuracy, percentage, performance_band };
}

function validateTopicBreakdown(topic_breakdown, total_questions) {
  if (!Array.isArray(topic_breakdown)) return "topic_breakdown must be an array.";
  if (topic_breakdown.length === 0) return "topic_breakdown must contain at least one topic.";

  for (const t of topic_breakdown) {
    if (!t.topic || typeof t.topic !== "string") {
      return "Each topic_breakdown entry needs a 'topic' name.";
    }
    const c = Number(t.correct) || 0;
    const w = Number(t.wrong) || 0;
    const s = Number(t.skipped) || 0;
    if (c < 0 || w < 0 || s < 0) {
      return `Topic "${t.topic}" has negative counts.`;
    }
  }
  return null;
}

// ─── POST /api/tests/submit ────────────────────────────────────────────────
// Submits a completed MCQ test, computes scoring server-side, persists the
// attempt, and kicks off AI analysis synchronously (the analysis itself has
// an offline deterministic fallback, so this endpoint never hangs/fails due
// to AI provider outages — see ai-client.js runProviders()).
const submitTest = async (req, res, next) => {
  try {
    const {
      test_series, test_title, subject,
      total_questions, duration_minutes,
      marks_correct, marks_wrong, marks_skipped, max_marks,
      correct_count, wrong_count, skipped_count,
      topic_breakdown,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!test_title || typeof test_title !== "string") {
      return res.status(400).json({ success: false, error: "test_title is required." });
    }
    if (!Number.isInteger(total_questions) || total_questions < 1) {
      return res.status(400).json({ success: false, error: "total_questions must be a positive integer." });
    }
    for (const [key, val] of [["correct_count", correct_count], ["wrong_count", wrong_count], ["skipped_count", skipped_count]]) {
      if (!Number.isInteger(val) || val < 0) {
        return res.status(400).json({ success: false, error: `${key} must be a non-negative integer.` });
      }
    }
    if (correct_count + wrong_count + skipped_count > total_questions) {
      return res.status(400).json({ success: false, error: "correct_count + wrong_count + skipped_count cannot exceed total_questions." });
    }

    const topicError = validateTopicBreakdown(topic_breakdown, total_questions);
    if (topicError) {
      return res.status(400).json({ success: false, error: topicError });
    }

    const scoringInput = {
      correct_count, wrong_count, skipped_count, total_questions,
      marks_correct: marks_correct ?? 2,
      // -2/3 (not the rounded -0.67) — see TestAttempt.js comment on marks_wrong.
      marks_wrong:   marks_wrong   ?? -2 / 3,
      marks_skipped: marks_skipped ?? 0,
      max_marks:     max_marks     ?? 100,
    };

    const { attempted_count, score, accuracy, percentage, performance_band } = computeScoring(scoringInput);

    // ── Persist the attempt ──────────────────────────────────────────────
    const attempt = await TestAttempt.create({
      user_id: req.user.id,
      test_series:  test_series || "General",
      test_title,
      subject:      subject || "General Studies",
      total_questions,
      duration_minutes: duration_minutes ?? 60,
      marks_correct: scoringInput.marks_correct,
      marks_wrong:   scoringInput.marks_wrong,
      marks_skipped: scoringInput.marks_skipped,
      max_marks:     scoringInput.max_marks,
      correct_count, wrong_count, skipped_count, attempted_count,
      score, accuracy, percentage, performance_band,
      topic_breakdown,
      ai_analysis_status: "processing",
    });

    trackEvent(req.user.id, "test_attempted", "Mock Tests", { test_id: attempt.id }).catch(() => {});

    // ── Run AI analysis (has built-in offline fallback, so this is safe) ───
    let analysis = null;
    let providerUsed = null;
    try {
      const { result, provider } = await analyzeTestPerformance({
        test_series: attempt.test_series,
        test_title: attempt.test_title,
        subject: attempt.subject,
        total_questions,
        duration_minutes: attempt.duration_minutes,
        correct_count, wrong_count, skipped_count, attempted_count,
        score, max_marks: scoringInput.max_marks, accuracy, percentage, performance_band,
        topic_breakdown,
      });
      analysis = result;
      providerUsed = provider;
    } catch (aiErr) {
      console.error("[Test Analysis] AI pipeline crashed unexpectedly:", aiErr);
    }

    let pushedToRevision = false;
    if (analysis) {
      // ── Push weak/high-priority topics into the spaced-repetition queue ──
      pushedToRevision = await pushWeakTopicsToRevision(req.user.id, analysis.revision_recommendations || []);
      analysis.pushed_to_revision = pushedToRevision;

      attempt.ai_analysis = analysis;
      attempt.ai_analysis_status = "ready";
      attempt.ai_provider_used = providerUsed;
    } else {
      attempt.ai_analysis_status = "failed";
    }
    await attempt.save();

    return res.status(201).json({
      success: true,
      attempt_id: attempt.id,
      score, max_marks: scoringInput.max_marks, percentage, accuracy, performance_band,
      correct_count, wrong_count, skipped_count, attempted_count, total_questions,
      ai_analysis: attempt.ai_analysis,
      ai_analysis_status: attempt.ai_analysis_status,
      provider_used: providerUsed,
    });
  } catch (err) {
    console.error("Test submission crashed:", err);
    next(err);
  }
};

/**
 * Pushes weak-topic recommendations into the user's spaced_repetition queue
 * (UserData.spaced_repetition.queue), reusing the exact same shape the
 * existing addSpacedRepetition controller produces, so the revision section
 * the user already has renders these automatically.
 *
 * De-duplicates by topic: if a topic is already in the queue, its interval/
 * difficulty is refreshed rather than creating a duplicate entry.
 */
async function pushWeakTopicsToRevision(userId, recommendations) {
  if (!Array.isArray(recommendations) || recommendations.length === 0) return false;

  const userData = await UserData.findOne({ where: { user_id: userId } });
  if (!userData) return false;

  const intervalMap = { easy: 7, medium: 3, hard: 1 };
  const today = new Date();

  const sr = userData.spaced_repetition ? { ...userData.spaced_repetition } : { queue: [] };
  const queue = Array.isArray(sr.queue) ? [...sr.queue] : [];

  let changed = false;

  for (const rec of recommendations) {
    if (!rec.topic) continue;
    const difficulty = ["easy", "medium", "hard"].includes(rec.difficulty) ? rec.difficulty : "medium";
    const interval = intervalMap[difficulty];
    const nextReview = new Date(today);
    nextReview.setDate(today.getDate() + interval);

    const existingIndex = queue.findIndex(
      (item) => item.topic?.toLowerCase().trim() === rec.topic.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      // Refresh existing item — bump difficulty if the new gap is worse, reset review date
      const existing = queue[existingIndex];
      const severityOrder = { easy: 0, medium: 1, hard: 2 };
      const worseDifficulty = severityOrder[difficulty] > severityOrder[existing.difficulty || "easy"]
        ? difficulty
        : existing.difficulty;

      queue[existingIndex] = {
        ...existing,
        difficulty: worseDifficulty,
        next_review: nextReview.toISOString().split("T")[0],
        interval_days: intervalMap[worseDifficulty],
        source_note: rec.reason || existing.source_note,
      };
    } else {
      queue.push({
        id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        topic: rec.topic.trim(),
        paper: "Test Series",
        difficulty,
        added: today.toISOString().split("T")[0],
        next_review: nextReview.toISOString().split("T")[0],
        review_count: 0,
        interval_days: interval,
        source: "ai_test_analysis",
        source_note: rec.reason || "",
      });
    }
    changed = true;
  }

  if (changed) {
    sr.queue = queue;
    userData.spaced_repetition = sr;
    userData.changed("spaced_repetition", true);
    await userData.save();
  }

  return changed;
}

// ─── GET /api/tests/:id ─────────────────────────────────────────────────────
const getTestAttempt = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!attempt) {
      return res.status(404).json({ success: false, error: "Test attempt not found." });
    }
    return res.json({ success: true, attempt });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tests ─────────────────────────────────────────────────────────
// History list, most recent first. Lightweight projection (no full ai_analysis
// blob) to keep the list view fast — fetch /api/tests/:id for full detail.
const listTestAttempts = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const attempts = await TestAttempt.findAll({
      where: { user_id: req.user.id },
      order: [["completed_at", "DESC"]],
      limit,
      attributes: [
        "id", "test_series", "test_title", "subject",
        "score", "max_marks", "percentage", "accuracy", "performance_band",
        "correct_count", "wrong_count", "skipped_count", "attempted_count", "total_questions",
        "ai_analysis_status", "completed_at",
      ],
    });

    return res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tests/:id/reanalyze ──────────────────────────────────────────
// Re-runs AI analysis on an existing attempt (e.g. if it failed the first time,
// or the user wants a fresh take). Also re-pushes weak topics to revision.
const reanalyzeTest = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!attempt) {
      return res.status(404).json({ success: false, error: "Test attempt not found." });
    }

    attempt.ai_analysis_status = "processing";
    await attempt.save();

    const { result, provider } = await analyzeTestPerformance({
      test_series: attempt.test_series,
      test_title: attempt.test_title,
      subject: attempt.subject,
      total_questions: attempt.total_questions,
      duration_minutes: attempt.duration_minutes,
      correct_count: attempt.correct_count,
      wrong_count: attempt.wrong_count,
      skipped_count: attempt.skipped_count,
      attempted_count: attempt.attempted_count,
      score: attempt.score,
      max_marks: attempt.max_marks,
      accuracy: attempt.accuracy,
      percentage: attempt.percentage,
      performance_band: attempt.performance_band,
      topic_breakdown: attempt.topic_breakdown,
    });

    const pushed = await pushWeakTopicsToRevision(req.user.id, result.revision_recommendations || []);
    result.pushed_to_revision = pushed;

    attempt.ai_analysis = result;
    attempt.ai_analysis_status = "ready";
    attempt.ai_provider_used = provider;
    await attempt.save();

    return res.json({ success: true, attempt_id: attempt.id, ai_analysis: result, provider_used: provider });
  } catch (err) {
    console.error("Re-analysis crashed:", err);
    next(err);
  }
};

module.exports = { submitTest, getTestAttempt, listTestAttempts, reanalyzeTest };