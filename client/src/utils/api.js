const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Module-level token (set after login, used for all ongoing requests) ─────
let _token = null;
export function setAuthToken(token) { _token = token; }
export function clearAuthToken()    { _token = null; }
async function apiFetch(path, options = {}, explicitToken = null) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);
  try {
    const tok = explicitToken || _token;
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (tok) headers["Authorization"] = `Bearer ${tok}`;

    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function registerUser(name, email, password, target_year, daily_target_hours) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, target_year, daily_target_hours }),
  });
}

export async function loginUser(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return apiFetch("/auth/me");
}

// ─── User Data ────────────────────────────────────────────────────────────────
// Route: GET /api/dashboard
// explicitToken: pass the token directly on first post-login fetch to avoid race
export async function getUserData(explicitToken = null) {
  return apiFetch("/dashboard", {}, explicitToken);
}

// ─── Syllabus ─────────────────────────────────────────────────────────────────
export async function updateSyllabusProgress(stage, paper, moduleName, progress, state) {
  return apiFetch(
    `/dashboard/syllabus/${encodeURIComponent(stage)}/${encodeURIComponent(paper)}/${encodeURIComponent(moduleName)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ progress, ...(state ? { state } : {}) }),
    }
  );
}

// ─── Daily Log ────────────────────────────────────────────────────────────────
export async function logDailyHours(hours, notes = "") {
  return apiFetch("/dashboard/daily-log", {
    method: "POST",
    body: JSON.stringify({ hours, notes }),
  });
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export async function sendChat(message, history = []) {
  return apiFetch("/evaluate/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// ─── Mains Answer Evaluation ──────────────────────────────────────────────────
// Backend returns plain JSON { success, data, word_count, provider_used }
// onChunk is called with the full JSON string, onDone is called with the parsed response
export async function evaluateAnswer({ question, answer, paper }, onChunk, onDone) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const response = await fetch(`${BASE}/evaluate/answer`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question, answer, paper }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Evaluation failed");
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Evaluation failed");

  // Call onChunk with stringified data so UI can display raw stream if needed
  const jsonStr = JSON.stringify(data.data);
  if (onChunk) onChunk(jsonStr);
  if (onDone) onDone(data);
}

// ─── Bulk Syllabus Update ────────────────────────────────────────────────────
// Single call to update multiple modules — avoids race conditions from parallel PATCHes
export async function bulkUpdateSyllabus(updates) {
  return apiFetch("/dashboard/syllabus/bulk", {
    method: "POST",
    body: JSON.stringify({ updates }),
  });
}

// ─── Question Attempts Sync ───────────────────────────────────────────────────
// Pushes locally tracked attempts to the server for cross-device sync + profile stats
export async function syncQuestionAttempts(attempts) {
  return apiFetch("/dashboard/question-attempts", {
    method: "POST",
    body: JSON.stringify({ attempts }),
  });
}

// ─── Spaced Repetition ────────────────────────────────────────────────────────
export async function addToSpacedRepetition(topic, paper, difficulty) {
  return apiFetch("/dashboard/spaced-repetition", {
    method: "POST",
    body: JSON.stringify({ topic, paper, difficulty }),
  });
}

export async function getSpacedRepetitionDue() {
  return apiFetch("/dashboard/spaced-repetition");
}

// ─── Static helpers (no server call) ─────────────────────────────────────────
export function getNCERTBooks(books, filters = {}) {
  let result = [...books];
  if (filters.subject !== undefined) result = result.filter((b) => b.subject === filters.subject);
  if (filters.done    !== undefined) result = result.filter((b) => b.done    === filters.done);
  return result;
}

export function openNCERTBook(book) {
  const target = book.url;
  if (!target) return null;
  window.open(target, "_blank", "noopener,noreferrer");
  return target;
}

export function getNotes(notes, filters = {}) {
  let result = [...notes];
  if (filters.paper)  result = result.filter((n) => n.paper  === filters.paper);
  if (filters.module) result = result.filter((n) => n.module === filters.module);
  if (filters.tag)    result = result.filter((n) => (n.tags || []).includes(filters.tag));
  return result;
}

export function openNote(note) {
  const target = note.url;
  if (!target) return null;
  window.open(target, "_blank", "noopener,noreferrer");
  return target;
}