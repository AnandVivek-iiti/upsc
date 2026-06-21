console.log("✅ notesController loaded");
const { runNotesAction } = require("../config/ai-client");

// Single factory shared by all 4 notes actions — validates input, calls the
// matching AI prompt via runNotesAction, and normalizes the response shape
// to { success, provider_used, result }, consistent with the rest of the API.
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
console.log("✅ notesRoutes loaded");
exports.improveNotes = makeNotesHandler("improve");
exports.findMistakes = makeNotesHandler("mistakes");
exports.revisionNotes = makeNotesHandler("revision");
exports.mainsFormat = makeNotesHandler("mains");