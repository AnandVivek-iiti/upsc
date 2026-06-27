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
    // fetch() itself rejected - offline, DNS failure, CORS, timeout, etc.
    throw new Error("Network error - check your connection and try again.");
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
    const err = new Error(message);
    // Attach any extra flags from the JSON body so callers can branch on them.
    // e.g. extraction_failed: true  →  AIEvaluatorPanel shows "try a clearer photo"
    if (json && typeof json === "object") {
      Object.keys(json).forEach((k) => {
        if (k !== "error" && k !== "success") err[k] = json[k];
      });
    }
    throw err;
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

// ─── POST /api/evaluate/answer (handwritten image) ───────────────────────────
// Same endpoint - the controller branches on the presence of `image.data`.
// `image` must be the full data URI from FileReader.readAsDataURL(), e.g.
// "data:image/jpeg;base64,/9j/4AAQ…"  (JPG · JPEG · PNG · WEBP, max 10 MB).
//
// On unreadable handwriting the backend returns HTTP 422 with
// { success: false, extraction_failed: true }.  The request() helper above
// attaches all extra JSON fields onto the thrown Error, so callers can do:
//   catch (e) { if (e.extraction_failed) showClearerPhotoPrompt(); }
export async function evaluateAnswerImage({ question, paper, image }) {
  return request(`${BASE}/evaluate/answer`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      question,
      paper,
      image: { data: image }, // full data URI - parseImageDataUri() on the server splits mimeType + base64
    }),
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

// ─── POST /api/evaluate/prelim-explain ───────────────────────────────────────
// Returns { success, provider_used, explanation: string }
export async function explainPrelimQuestion({ questionText, options, correctOption, explanation }) {
  return request(`${BASE}/evaluate/prelim-explain`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ questionText, options, correctOption, explanation }),
  });
}

// ─── Legacy aliases (still used by embedded widgets like AIMentorChat compact) ─
export async function getChatHistory() {
  // Redirect to thread list for backwards compat
  return listChatThreads();
}
export async function clearChatHistory() {
  // No-op in threads model - individual threads are deleted via deleteChatThread
  return { success: true };
}

// ─── Notes AI actions ──────────────────────────────────────────────────────
// Served by notesRoutes.js → POST /api/notes/:action (mounted directly in
// server.js, separate from the evaluate/* chat & answer-grading routes).
export async function improveNotes(payload) {
  const res = await request(`${BASE}/notes/improve`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return res.result;
}

export async function findMistakesInNotes(payload) {
  const res = await request(`${BASE}/notes/mistakes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return res.result;
}

export async function generateRevisionNotes(payload) {
  const res = await request(`${BASE}/notes/revision`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return res.result;
}
export async function convertToMainsFormat(payload) {
  const res = await request(`${BASE}/notes/mains`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return res.result;
}

export async function submitTestResult(payload) {
  return request(`${BASE}/tests/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// ─── GET /api/tests ───────────────────────────────────────────────────────────
// Lightweight history list (no full ai_analysis blob) - most recent first.
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