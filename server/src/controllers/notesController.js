const { runNotesAction, extractNoteFromImage, ExtractionFailedError } = require("../config/ai-client");
const trackEvent = require("../utils/trackEvent");
const { UserData } = require("../models/UserData");
const Note = require("../models/Note");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB per page
const MAX_IMAGES = 5; // pages per upload
const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DATA_URI_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;
function parseImageDataUri(dataUri) {
  const match = typeof dataUri === "string" ? dataUri.match(DATA_URI_PATTERN) : null;
  if (!match) return null;
  return { mimeType: match[1].toLowerCase(), base64Data: match[2] };
}

function parseAndValidateImages(body) {
  const raw = Array.isArray(body.images)
    ? body.images
    : body.image
    ? [body.image]
    : [];

  if (raw.length === 0) return { images: [] };

  if (raw.length > MAX_IMAGES) {
    return { error: `Too many pages. Maximum allowed is ${MAX_IMAGES} per upload.` };
  }

  const images = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    const parsed = parseImageDataUri(entry?.data);
    if (!parsed) {
      return { error: `Invalid image data on page ${i + 1}. Please re-upload the photo.` };
    }
    if (!ALLOWED_IMAGE_MIME.includes(parsed.mimeType)) {
      return {
        error: `Unsupported image format on page ${i + 1}. Please upload a JPG, PNG, or WEBP file.`,
      };
    }
    const byteSize = Buffer.byteLength(parsed.base64Data, "base64");
    if (byteSize > MAX_IMAGE_BYTES) {
      return { error: `Page ${i + 1} is too large. Maximum allowed size is 10MB per page.` };
    }
    images.push({ mimeType: parsed.mimeType, base64Data: parsed.base64Data, byteSize });
  }

  return { images };
}
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB
const PDF_DATA_URI_PATTERN = /^data:application\/pdf;base64,([\s\S]+)$/i;

function parsePdfDataUri(dataUri) {
  const match = typeof dataUri === "string" ? dataUri.match(PDF_DATA_URI_PATTERN) : null;
  if (!match) return null;
  return { mimeType: "application/pdf", base64Data: match[1] };
}


function parseAndValidatePdf(body) {
  const parsed = parsePdfDataUri(body?.pdf?.data);
  if (!parsed) {
    return { error: "Invalid PDF data. Please re-upload the file." };
  }
  const byteSize = Buffer.byteLength(parsed.base64Data, "base64");
  if (byteSize > MAX_PDF_BYTES) {
    return { error: "PDF is too large. Maximum allowed size is 10MB." };
  }
  return { file: { mimeType: parsed.mimeType, base64Data: parsed.base64Data, byteSize } };
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
// Body accepts `images: [{ data }, ...]` (up to MAX_IMAGES pages), the
// legacy single `image: { data }` shape, or a single `pdf: { data }` (up to
// 10MB) - not both image(s) and pdf in the same request.
exports.extractFromImage = async (req, res, next) => {
  try {
    const { image, images: imagesInput, pdf } = req.body;
    const hasImagePayload = (Array.isArray(imagesInput) && imagesInput.length > 0) || !!image?.data;
    const hasPdfPayload = !!pdf?.data;

    if (hasImagePayload && hasPdfPayload) {
      return res.status(400).json({
        success: false,
        error: "Please upload either photo pages or a single PDF, not both.",
      });
    }
    if (!hasImagePayload && !hasPdfPayload) {
      return res.status(400).json({ success: false, error: "No image provided." });
    }

    let images, inputMode;
    if (hasPdfPayload) {
      const { file, error } = parseAndValidatePdf(req.body);
      if (error) {
        return res.status(400).json({ success: false, error });
      }
      images = [file];
      inputMode = "pdf";
    } else {
      const { images: parsedImages, error } = parseAndValidateImages(req.body);
      if (error) {
        return res.status(400).json({ success: false, error });
      }
      images = parsedImages;
      inputMode = "image";
    }

    const totalBytes = images.reduce((sum, img) => sum + img.byteSize, 0);
    console.log(
      `[Notes:${inputMode === "pdf" ? "PDF" : "Image"}] Processing for user: ${req.user.id} (${images.length} attachment(s), ${(totalBytes / (1024 * 1024)).toFixed(2)}MB total)`,
    );

    let result, provider;
    try {
      ({ result, provider } = await extractNoteFromImage({ images }));
    } catch (err) {
      if (err instanceof ExtractionFailedError || err.code === "EXTRACTION_FAILED") {
        return res.status(422).json({ success: false, error: err.message, extraction_failed: true });
      }
      throw err;
    }

    trackEvent(req.user.id, "notes_photo_upload", "Notes Photo Upload", {
      input_mode: inputMode,
    }).catch(() => {});

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