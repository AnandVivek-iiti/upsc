// utils/trackEvent.js
// Fire-and-forget analytics event recorder.
// Always safe to await - errors are swallowed so they never break the real request.
// Import this in any controller that needs to record a user action.

const UserEvents = require("../models/UserEvents");

/**
 * @param {string} userId        UUID of the acting user
 * @param {string} eventType     One of the UserEvents event_type enum values:
 *                               'dashboard_visit' | 'timer_start' | 'mentor_open' |
 *                               'answer_evaluated' | 'notes_audited' | 'test_attempted' |
 *                               'pyq_used' | 'syllabus_tracked' | 'day_return'
 * @param {string|null} featureName  Human-readable feature name (e.g. "AI Evaluator")
 * @param {object|null} metadata     Any extra JSON context (e.g. { subject: "GS2", score: 72 })
 */
async function trackEvent(userId, eventType, featureName = null, metadata = null) {
  try {
    await UserEvents.create({
      user_id: userId,
      event_type: eventType,
      feature_name: featureName,
      metadata,
    });
  } catch (err) {
    // Never let analytics failures surface to the user
    console.error("[trackEvent] failed silently:", err.message);
  }
}

module.exports = trackEvent;