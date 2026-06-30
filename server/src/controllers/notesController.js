const { runNotesAction } = require("../config/ai-client");
const trackEvent = require("../utils/trackEvent");
const { UserData } = require("../models/UserData");
const Note = require("../models/Note");

// ─── AI actions on note content (unchanged) ──────────────────────────────────

function makeNotesHandler(actionId) {
  return async (req, res, next) => {
    try {
      const { title, topic, content } = req.body;

      if (!content || content.trim().length < 20) {
        return res.status(400).json({
          success: false,
          error: "Note content is too short for AI to work with (min 20 characters).",
        });
      }

      const { result, provider } = await runNotesAction(actionId, {
        title,
        topic,
        content,
      });

      trackEvent(req.user.id, "notes_audited", "Notes Auditor", {
        action: actionId,
      }).catch(() => {});

      // Fire-and-forget: append a note_audits entry so the
      // "Audit your first set of notes" onboarding milestone marks done.
      UserData.findOne({ where: { user_id: req.user.id } }).then((ud) => {
        if (!ud) return;
        ud.note_audits = [
          ...(ud.note_audits || []),
          { id: `na_${Date.now()}`, action: actionId, at: new Date().toISOString() },
        ];
        ud.changed("note_audits", true);
        return ud.save();
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        provider_used: provider,
        result,
      });
    } catch (err) {
      console.error(`Notes action "${actionId}" crashed:`, err);
      next(err);
    }
  };
}
exports.improveNotes = makeNotesHandler("improve");
exports.findMistakes = makeNotesHandler("mistakes");
exports.revisionNotes = makeNotesHandler("revision");
exports.mainsFormat = makeNotesHandler("mains");

// ─── Note CRUD ────────────────────────────────────────────────────────────
// Every query below is scoped to `user_id: req.user.id` (req.user is set by
// the `protect` middleware from the verified JWT). This is what guarantees a
// note is only ever readable/writable by the account that created it — a
// note belonging to another user simply will not match the WHERE clause, so
// it 404s exactly like it doesn't exist, rather than leaking a 403.

const ALLOWED_TOPICS = new Set([
  "polity", "history", "economy", "geography",
  "sociology", "ethics", "environment", "scitech",
]);
const ALLOWED_VERSION_KEYS = new Set(["enhanced", "revision", "mains"]);

function sanitizeTitle(title) {
  if (typeof title !== "string") return "";
  return title.slice(0, 200);
}
function sanitizeTopic(topic) {
  if (typeof topic !== "string" || !ALLOWED_TOPICS.has(topic)) return null;
  return topic;
}
// Returns undefined (meaning "don't touch this field") if the body didn't
// send a usable content string, so a malformed PATCH never blanks a note.
function sanitizeContent(content) {
  if (typeof content !== "string") return undefined;
  return content;
}
function sanitizeVersions(versions) {
  if (!versions || typeof versions !== "object" || Array.isArray(versions)) return undefined;
  const clean = {};
  for (const key of Object.keys(versions)) {
    if (ALLOWED_VERSION_KEYS.has(key) && typeof versions[key] === "string") {
      clean[key] = versions[key];
    }
  }
  return clean;
}

// ─── GET /api/notes - every note belonging to the signed-in user ────────────
exports.listNotes = async (req, res, next) => {
  try {
    const notes = await Note.findAll({
      where: { user_id: req.user.id },
      order: [["updated_at", "DESC"]],
    });
    return res.status(200).json({ success: true, notes });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/notes - create a new note (blank, or pre-filled) ─────────────
exports.createNote = async (req, res, next) => {
  try {
    const body = req.body || {};
    const note = await Note.create({
      user_id: req.user.id,
      title: sanitizeTitle(body.title),
      topic: body.topic != null ? sanitizeTopic(body.topic) : null,
      content: sanitizeContent(body.content) ?? "",
      versions: {},
    });
    return res.status(201).json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notes/:id - partial update ───────────────────────────────────
// Accepts any subset of { title, topic, content, versions }. `versions`, when
// sent, fully replaces the stored versions object (the client always sends
// the complete merged object — see handleSaveVersion/handleClearVersion in
// MentorNotes.jsx), it is not deep-merged server-side.
exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found." });
    }

    const body = req.body || {};
    const updates = {};
    if ("title" in body) updates.title = sanitizeTitle(body.title);
    if ("topic" in body) updates.topic = body.topic != null ? sanitizeTopic(body.topic) : null;
    if ("content" in body) {
      const c = sanitizeContent(body.content);
      if (c !== undefined) updates.content = c;
    }
    if ("versions" in body) {
      const v = sanitizeVersions(body.versions);
      if (v !== undefined) updates.versions = v;
    }

    note.set(updates);
    await note.save();

    return res.status(200).json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/notes/:id ────────────────────────────────────────────────
exports.deleteNote = async (req, res, next) => {
  try {
    const deleted = await Note.destroy({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Note not found." });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
