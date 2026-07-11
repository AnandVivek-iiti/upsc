const { runNotesAction, extractNoteFromImage, ExtractionFailedError } = require("../config/ai-client");
const trackEvent = require("../utils/trackEvent");
const { UserData } = require("../models/UserData");
const Note = require("../models/Note");

// ─── Photo upload limits 
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DATA_URI_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;
function parseImageDataUri(dataUri) {
  const match = typeof dataUri === "string" ? dataUri.match(DATA_URI_PATTERN) : null;
  if (!match) return null;
  return { mimeType: match[1].toLowerCase(), base64Data: match[2] };
}


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

// ─── POST /api/notes/extract-image
exports.extractFromImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image || !image.data) {
      return res.status(400).json({ success: false, error: "No image provided." });
    }

    const parsedImage = parseImageDataUri(image.data);
    if (!parsedImage) {
      return res.status(400).json({ success: false, error: "Invalid image data. Please re-upload the photo." });
    }
    const { mimeType, base64Data } = parsedImage;

    if (!ALLOWED_IMAGE_MIME.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        error: "Unsupported image format. Please upload a JPG, PNG, or WEBP file.",
      });
    }
    const byteSize = Buffer.byteLength(base64Data, "base64");
    if (byteSize > MAX_IMAGE_BYTES) {
      return res.status(400).json({ success: false, error: "Image is too large. Maximum allowed size is 10MB." });
    }

    console.log(
      `[Notes:Image] Processing for user: ${req.user.id} (${(byteSize / (1024 * 1024)).toFixed(2)}MB, ${mimeType})`,
    );

    let result, provider;
    try {
      ({ result, provider } = await extractNoteFromImage({ imageBase64: base64Data, mimeType }));
    } catch (err) {
      if (err instanceof ExtractionFailedError || err.code === "EXTRACTION_FAILED") {
        return res.status(422).json({ success: false, error: err.message, extraction_failed: true });
      }
      throw err;
    }

    trackEvent(req.user.id, "notes_photo_upload", "Notes Photo Upload").catch(() => {});

    return res.status(200).json({
      success: true,
      provider_used: provider,
      extracted_text: result.extracted_text,
      suggestions: result.suggestions,
    });
  } catch (err) {
    console.error("Notes image extraction crashed:", err);
    next(err);
  }
};

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

// ─── POST /api/notes
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

// ─── DELETE /api/notes
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