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

/**
 * Wraps fetch + JSON parsing so a non-JSON error response (502 from a proxy,
 * a crashed server returning an HTML error page, a plain-text 500) doesn't
 * blow up with a cryptic "Unexpected token < in JSON" and hide the actual
 * HTTP status from the user. Always throws a readable Error on failure;
 * always returns the parsed JSON body on success.
 */
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
      // Server returned something that isn't JSON (HTML error page, plain
      // text, empty proxy response). Fall through with json = null so the
      // status-based message below kicks in instead of throwing here.
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
    // 2xx response with a non-JSON or empty body — shouldn't normally
    // happen for this API, but don't silently return null and let callers
    // crash on `.success` / `.threads` etc.
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

// ─── POST /api/evaluate/chat ──────────────────────────────────────────────────
// Pass an existing thread_id to continue that thread, or omit to start a new one.
// Returns { success, response, thread_id, title }
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

// ─── GET /api/evaluate/chat-threads ──────────────────────────────────────────
// Returns { success, threads: [{ id, title, updatedAt, message_count }] }
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
