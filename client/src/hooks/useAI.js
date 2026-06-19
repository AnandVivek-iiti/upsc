/**
 * useAI.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin wrapper around the backend AI endpoints.
 *
 * Endpoints:
 *   POST   /api/evaluate/answer              — AI evaluation (Gemini→GPT4→Claude→Groq)
 *   POST   /api/evaluate/chat                — UPSC mentor chat (thread-aware)
 *   GET    /api/evaluate/chat-threads        — list all threads (sidebar)
 *   GET    /api/evaluate/chat-threads/:id    — full messages for one thread
 *   DELETE /api/evaluate/chat-threads/:id    — delete one thread
 *   GET    /api/dashboard/spaced-repetition  — due items
 *   POST   /api/dashboard/spaced-repetition  — add item
 *   POST   /api/dashboard/question-attempts  — sync attempts
 *
 * JWT is sent automatically via Authorization header.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
    try { return localStorage.getItem("upsc_token") || ""; } catch { return ""; }
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ─── POST /api/evaluate/answer ────────────────────────────────────────────────
export async function evaluateAnswer({ question, answer, paper }) {
    const res = await fetch(`${BASE}/evaluate/answer`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question, answer, paper }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Evaluation failed");
    return json;
}

// ─── POST /api/evaluate/chat ──────────────────────────────────────────────────
// Pass an existing thread_id to continue that thread, or omit to start a new one.
// Returns { success, response, thread_id, title }
export async function chatWithMentor({ message, contextHint = "", threadId = null }) {
    const res = await fetch(`${BASE}/evaluate/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            message,
            context_hint: contextHint,
            ...(threadId ? { thread_id: threadId } : {}),
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Chat unavailable");
    return json;
}

// ─── GET /api/evaluate/chat-threads ──────────────────────────────────────────
// Returns { success, threads: [{ id, title, updatedAt, message_count }] }
export async function listChatThreads() {
    const res = await fetch(`${BASE}/evaluate/chat-threads`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not load threads");
    return json;
}

// ─── GET /api/evaluate/chat-threads/:id ──────────────────────────────────────
// Returns { success, thread: { id, title, messages: [{role, content}], ... } }
export async function getChatThread(id) {
    const res = await fetch(`${BASE}/evaluate/chat-threads/${id}`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Thread not found");
    return json;
}

// ─── DELETE /api/evaluate/chat-threads/:id ───────────────────────────────────
export async function deleteChatThread(id) {
    const res = await fetch(`${BASE}/evaluate/chat-threads/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not delete thread");
    return json;
}

// ─── Legacy aliases (still used by embedded widgets like AIMentorChat compact) ─
export async function getChatHistory() {
    // Redirect to thread list for backwards compat
    return listChatThreads();
}
export async function clearChatHistory() {
    // No-op in threads model — individual threads are deleted via deleteChatThread
    return { success: true };
}

// ─── POST /api/tests/submit ───────────────────────────────────────────────────
// Submits a completed MCQ Test Series result for server-side scoring + AI
// diagnostic analysis (strengths, weak topics, study plan, auto-revision push).
// Field names must match testController.js exactly:
//   test_series, test_title, subject, total_questions, duration_minutes,
//   marks_correct, marks_wrong, marks_skipped, max_marks,
//   correct_count, wrong_count, skipped_count, topic_breakdown
// Returns { success, attempt_id, score, max_marks, percentage, accuracy,
//           performance_band, ai_analysis, ai_analysis_status, provider_used }
export async function submitTestResult(payload) {
    const res = await fetch(`${BASE}/tests/submit`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not submit test result");
    return json;
}

// ─── GET /api/tests ───────────────────────────────────────────────────────────
// Lightweight history list (no full ai_analysis blob) — most recent first.
export async function getTestHistory(limit = 20) {
    const res = await fetch(`${BASE}/tests?limit=${limit}`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not load test history");
    return json;
}

// ─── GET /api/tests/:id ───────────────────────────────────────────────────────
// Single attempt with full ai_analysis.
export async function getTestAttempt(id) {
    const res = await fetch(`${BASE}/tests/${id}`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Test attempt not found");
    return json;
}

// ─── POST /api/tests/:id/reanalyze ───────────────────────────────────────────
// Re-runs AI analysis on an existing attempt (e.g. retry after a failure).
export async function reanalyzeTest(id) {
    const res = await fetch(`${BASE}/tests/${id}/reanalyze`, {
        method: "POST",
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not re-analyze test");
    return json;
}

// ─── GET /api/dashboard/spaced-repetition ────────────────────────────────────
export async function getSpacedRepetition() {
    const res = await fetch(`${BASE}/dashboard/spaced-repetition`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not fetch revision queue");
    return json;
}

// ─── POST /api/dashboard/spaced-repetition ───────────────────────────────────
export async function addToRevisionQueue({ topic, paper, difficulty }) {
    const res = await fetch(`${BASE}/dashboard/spaced-repetition`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ topic, paper, difficulty }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not add to queue");
    return json;
}

// ─── POST /api/dashboard/question-attempts ───────────────────────────────────
export async function syncAttempts(attempts) {
    const res = await fetch(`${BASE}/dashboard/question-attempts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ attempts }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Sync failed");
    return json;
}