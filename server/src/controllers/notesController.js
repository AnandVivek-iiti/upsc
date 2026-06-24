const { runNotesAction } = require("../config/ai-client");
const trackEvent = require("../utils/trackEvent");
const { UserData } = require("../models/UserData");
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