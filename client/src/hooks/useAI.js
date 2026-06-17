/**
 * useAI.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin wrapper around YOUR backend AI endpoints.
 *
 * Endpoints used (all already exist in your server):
 *   POST /api/evaluate/answer   — multi-provider AI evaluation (Gemini→GPT4→Claude→Groq)
 *   POST /api/evaluate/chat     — UPSC mentor conversational chat (Gemini)
 *   GET  /api/dashboard/spaced-repetition   — due items
 *   POST /api/dashboard/spaced-repetition   — add item
 *   POST /api/dashboard/question-attempts   — sync attempts
 *
 * All calls send the JWT token from localStorage automatically.
 * Falls back gracefully when not logged in or rate-limited.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
    try {
        return localStorage.getItem("upsc_token") || "";
    } catch {
        return "";
    }
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ─── POST /api/evaluate/answer ────────────────────────────────────────────────
// Returns { success, data, provider_used, word_count } or throws with .message
export async function evaluateAnswer({ question, answer, paper }) {
    const res = await fetch(`${BASE}/evaluate/answer`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question, answer, paper }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Evaluation failed");
    return json; // { success, data, provider_used, word_count }
}

// ─── POST /api/evaluate/chat ──────────────────────────────────────────────────
// History is now tracked server-side (UserData.mentor_chat), so we only send
// the new message plus an optional contextHint describing which part of the
// app the student is in. Use getChatHistory()/clearChatHistory() below to
// read or wipe the persisted conversation.
export async function chatWithMentor({ message, contextHint = "" }) {
    const res = await fetch(`${BASE}/evaluate/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message, context_hint: contextHint }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Chat unavailable");
    return json; // { success, response, history }
}

// ─── GET /api/evaluate/chat-history ──────────────────────────────────────────
export async function getChatHistory() {
    const res = await fetch(`${BASE}/evaluate/chat-history`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not load chat history");
    return json; // { success, history }
}

// ─── DELETE /api/evaluate/chat-history ───────────────────────────────────────
export async function clearChatHistory() {
    const res = await fetch(`${BASE}/evaluate/chat-history`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not clear chat history");
    return json; // { success }
}

// ─── GET /api/dashboard/spaced-repetition ────────────────────────────────────
export async function getSpacedRepetition() {
    const res = await fetch(`${BASE}/dashboard/spaced-repetition`, {
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Could not fetch revision queue");
    return json; // { success, due_count, items }
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
    return json; // { success, item }
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