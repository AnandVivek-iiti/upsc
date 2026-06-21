const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

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

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (networkErr) {
    // fetch() itself rejected — offline, DNS failure, CORS, timeout, etc.
    throw new Error("Network error — check your connection and try again.");
  }

  let json = null;
  const rawText = await res.text();
  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
     }
  }

  if (!res.ok) {
    const message =
      json?.error ||
      (rawText && rawText.length < 200 ? rawText : null) ||
      `Request failed (${res.status} ${res.statusText || ""})`.trim();
    throw new Error(message);
  }

  if (json === null) {
     throw new Error("Server returned an unexpected response.");
  }

  return json;
}

// ─── POST /api/evaluate/answer ────────────────────────────────────────────────
export async function evaluateAnswer({ question, answer, paper }) {
  return request(`${BASE}/evaluate/answer`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question, answer, paper }),
  });
}
export async function chatWithMentor({ message, contextHint = "", threadId = null }) {
  return request(`${BASE}/evaluate/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      message,
      context_hint: contextHint,
      ...(threadId ? { thread_id: threadId } : {}),
    }),
  });
}
export async function listChatThreads() {
  return request(`${BASE}/evaluate/chat-threads`, {
    headers: authHeaders(),
  });
}

// ─── GET /api/evaluate/chat-threads/:id ──────────────────────────────────────
// Returns { success, thread: { id, title, messages: [{role, content}], ... } }
export async function getChatThread(id) {
  return request(`${BASE}/evaluate/chat-threads/${id}`, {
    headers: authHeaders(),
  });
}

// ─── DELETE /api/evaluate/chat-threads/:id ───────────────────────────────────
export async function deleteChatThread(id) {
  return request(`${BASE}/evaluate/chat-threads/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
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

// ─── Notes AI actions (reuse /api/evaluate/chat — no dedicated backend route) ─
// Each call opens a fresh, isolated thread (no threadId passed) so these
// scratch interactions never pollute the user's saved AI Mentor chat history.

const NOTES_INSTRUCTION_HEADER =
  "You are acting as a notes-assistant tool, not a conversational mentor. " +
  "Respond ONLY with the requested output in the exact format specified below. " +
  "Do not add greetings, praise, meta-commentary, or any text outside the requested format.";

function buildNotesPrompt(task, { title, topic, content }) {
  const meta = `Note title: ${title || "Untitled"}\nTopic: ${topic || "General"}`;
  return `${NOTES_INSTRUCTION_HEADER}\n\nTASK: ${task}\n\n${meta}\n\n--- NOTE CONTENT START ---\n${content}\n--- NOTE CONTENT END ---`;
}

// Rewrites the note for clarity, structure, and exam-readiness while preserving
// the student's own facts/voice. Returns improved note body as markdown text.
export async function improveNotes({ title, topic, content }) {
  const task =
    "Improve these UPSC study notes. Tighten the language, fix structure and " +
    "flow, organize into clear sections with ## headings where helpful, and " +
    "make it more exam-ready — but preserve every fact already present and do " +
    "not invent new facts. Return ONLY the improved note content as markdown, " +
    "with no preamble or sign-off.";
  const res = await chatWithMentor({
    message: buildNotesPrompt(task, { title, topic, content }),
    contextHint: "Notes — Improve Notes",
  });
  return res?.response ?? "";
}

// Strict structured-output contract — MUST match the labels parsed by
// parseMistakesReport() in MentorNotes.jsx (SCORE_KNOWLEDGE:, SCORE_CLARITY:,
// SCORE_RETENTION:, MISSING:, TRAPS:, REVISION:).
export async function findMistakesInNotes({ title, topic, content }) {
  const task =
    "Audit these UPSC study notes for accuracy and exam-readiness. " +
    "Respond in EXACTLY this plain-text format, with these exact labels at the " +
    "start of each line, nothing else, no markdown formatting, no extra commentary:\n\n" +
    "SCORE_KNOWLEDGE: <integer 1-10>\n" +
    "SCORE_CLARITY: <integer 1-10>\n" +
    "SCORE_RETENTION: <integer 1-10>\n" +
    "MISSING: <important missing points, semicolon-separated on one line>\n" +
    "TRAPS: <common memory/confusion traps relevant to this topic, semicolon-separated on one line, formatted as 'X ≠ Y' pairs where applicable>\n" +
    "REVISION: <a single tight paragraph a student could read aloud in under 30 seconds to revise this note>";
  const res = await chatWithMentor({
    message: buildNotesPrompt(task, { title, topic, content }),
    contextHint: "Notes — Find Mistakes",
  });
  return res?.response ?? "";
}

// Condenses the note into a short, high-recall revision sheet (markdown).
export async function generateRevisionNotes({ title, topic, content }) {
  const task =
    "Convert these UPSC study notes into a condensed revision sheet optimized " +
    "for quick recall the night before an exam. Use short bullet points, bold " +
    "key terms with **double asterisks**, and group related points under ## " +
    "headings. Keep it dramatically shorter than the original. Return ONLY the " +
    "revision sheet as markdown, with no preamble or sign-off.";
  const res = await chatWithMentor({
    message: buildNotesPrompt(task, { title, topic, content }),
    contextHint: "Notes — Generate Revision Notes",
  });
  return res?.response ?? "";
}

// Reframes note content into UPSC Mains-style answer-writing format.
export async function convertToMainsFormat({ title, topic, content }) {
  const task =
    "Convert these notes into UPSC Civil Services Mains answer-writing format: " +
    "a brief intro framing the issue, a structured body with ## headings " +
    "(use multiple short headed sections — e.g. constitutional/political/" +
    "economic/social dimensions, as relevant — rather than one long block), " +
    "bullet points within sections where useful, and a brief conclusion with a " +
    "forward-looking or balanced note. Preserve the underlying facts. Return " +
    "ONLY the converted answer as markdown, with no preamble or sign-off.";
  const res = await chatWithMentor({
    message: buildNotesPrompt(task, { title, topic, content }),
    contextHint: "Notes — Convert to Mains Format",
  });
  return res?.response ?? "";
}

export async function submitTestResult(payload) {
  return request(`${BASE}/tests/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// ─── GET /api/tests ───────────────────────────────────────────────────────────
// Lightweight history list (no full ai_analysis blob) — most recent first.
export async function getTestHistory(limit = 20) {
  return request(`${BASE}/tests?limit=${limit}`, {
    headers: authHeaders(),
  });
}

// ─── GET /api/tests/:id ───────────────────────────────────────────────────────
// Single attempt with full ai_analysis.
export async function getTestAttempt(id) {
  return request(`${BASE}/tests/${id}`, {
    headers: authHeaders(),
  });
}

// ─── POST /api/tests/:id/reanalyze ───────────────────────────────────────────
// Re-runs AI analysis on an existing attempt (e.g. retry after a failure).
export async function reanalyzeTest(id) {
  return request(`${BASE}/tests/${id}/reanalyze`, {
    method: "POST",
    headers: authHeaders(),
  });
}

// ─── GET /api/dashboard/spaced-repetition ────────────────────────────────────
export async function getSpacedRepetition() {
  return request(`${BASE}/dashboard/spaced-repetition`, {
    headers: authHeaders(),
  });
}

// ─── POST /api/dashboard/spaced-repetition ───────────────────────────────────
export async function addToRevisionQueue({ topic, paper, difficulty }) {
  return request(`${BASE}/dashboard/spaced-repetition`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ topic, paper, difficulty }),
  });
}

// ─── POST /api/dashboard/question-attempts ───────────────────────────────────
export async function syncAttempts(attempts) {
  return request(`${BASE}/dashboard/question-attempts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ attempts }),
  });
}
