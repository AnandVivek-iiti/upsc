
const nodemailer = require("nodemailer");
const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("../models/User");

// ─── Nodemailer transporter ────────────────────────────────────────────────────
// Uses Gmail with an App Password (generate at myaccount.google.com/apppasswords)
// Set GMAIL_APP_PASSWORD in your .env file
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL || "me240003006@iiti.ac.in",
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password from Google
    },
  });
}

// ─── Logo as inline base64 CID attachment ─────────────────────────────────────
// The logo file should be placed at server/assets/upsc-logo.png
// We embed it inline so it renders in all email clients
const fs = require("fs");
const path = require("path");

function getLogoAttachment() {
  const logoPath = path.join(__dirname, "../assets/upsc-logo.png");
  if (fs.existsSync(logoPath)) {
    return {
      filename: "upsc-logo.png",
      path: logoPath,
      cid: "upsclogo@mentor", // referenced in HTML as cid:upsclogo@mentor
    };
  }
  return null;
}

// ─── Segment-specific copy ─────────────────────────────────────────────────────
// Mirrors the segments defined in the admin Email Composer (new / power / idle / feature).
// Each segment has its own subject line, accent color, and body content built from
// the founder's own drafted copy — kept in one place so HTML + text stay in sync.
const SEGMENT_COPY = {
  new: {
    subject: "Welcome to UPSC Mentor — here's where to start 🎯",
    accent: "#3B6D11",
    accentBg: "#EAF3DE",
    eyebrow: "Welcome aboard",
    greetingLine: "Welcome to UPSC Mentor! I'm Anand, one of the builders behind the platform.",
    intro: "You've joined at a great time. Here's the simplest path to get value from day one:",
    steps: [
      { title: "Set your exam date", body: "Go to your Profile page and lock in your Prelims target. The countdown starts ticking — which is surprisingly motivating." },
      { title: "Mark your syllabus", body: "Open the Syllabus Tracker and set 3–5 modules to \"In Progress\". It takes 2 minutes and gives you a clear view of what you're walking into." },
      { title: "Start the timer", body: "Hit the study timer on your dashboard before your next session. It syncs across devices — so your phone and laptop both track the same day." },
    ],
    closing: "That's it. No pressure to do everything at once.",
    closing2: "If you have questions, just reply to this email — I read every one.",
    signOff: "Good luck,",
  },
  power: {
    subject: "You're one of our most dedicated users — a quick note",
    accent: "#854F0B",
    accentBg: "#FAEEDA",
    eyebrow: "A note from the founder",
    greetingLine: "I wanted to reach out personally.",
    intro: "You're one of the most consistent users on UPSC Mentor right now — studying multiple days in a row puts you in the top tier of our early community.",
    steps: [
      { title: "AI Diagnostic Reports", body: "After your next mock test, the AI generates a 7-day recovery study plan targeting your exact weak topics. If you haven't tried it yet, it's worth one test attempt." },
      { title: "The AI Mentor Workspace", body: "Unlike the chat bubble, the full workspace lets you run separate threads — one for GS4 case studies, one for Economy, for example. Your mentor remembers context across sessions." },
      { title: "Handwritten answer evaluation", body: "If you're doing Mains practice, you can photograph a handwritten answer and the AI evaluates it the same way — useful for replicating actual exam conditions." },
    ],
    closing: "I'd genuinely love to hear what's working for you and what's not. Any feedback shapes what we build next.",
    closing2: "",
    signOff: "Keep going,",
  },
  idle: {
    subject: "Still preparing? UPSC Mentor has a shortcut for you",
    accent: "#993C1D",
    accentBg: "#FAECE7",
    eyebrow: "Quick check-in",
    greetingLine: "You signed up for UPSC Mentor a little while back — I just wanted to check in.",
    intro: "If the platform felt overwhelming at first, that's fair. Here's the simplest possible entry point: one subject, one timer, 30 minutes.",
    steps: [
      { title: "Open the dashboard", body: "Pick one subject from the study timer (Polity is a popular start) and run a 30-minute focused session. That single action unlocks the analytics that make everything else useful." },
      { title: "Your syllabus is ready", body: "All 48 modules are already loaded, mapped to the official UPSC notification. You don't have to build anything." },
    ],
    closing: "If you hit a wall or the platform isn't clicking, just reply here and tell me what you're trying to do. I'll help you figure out the fastest path.",
    closing2: "",
    signOff: "Still rooting for you,",
  },
  feature: {
    subject: "You've found the depth — here's what's coming next",
    accent: "#3C3489",
    accentBg: "#EEEDFE",
    eyebrow: "For our power explorers",
    greetingLine: "You're one of a small group of users who's actually explored multiple areas of UPSC Mentor — the syllabus tracker, mock tests, AI mentor, and more.",
    intro: "That kind of usage tells us you're using the platform as it was designed: as an integrated preparation workspace, not just a single tool. A few things you might not have discovered yet:",
    steps: [
      { title: "Spaced repetition queue", body: "When you mark a question as difficult in Prelims Grind, it gets added to a revision queue with SM-2 style scheduling. Over time this becomes a highly personalised review bank." },
      { title: "Cross-module memory", body: "Your AI Mentor carries memory of your weak topics across sessions. If mock tests surface gaps, the Mentor already knows about them in your next chat." },
      { title: "Re-analysis of past tests", body: "Any test attempt can be re-analysed on demand — useful if you've done focused study on a weak topic and want to check if your diagnostic would look different now." },
    ],
    closing: "I'd really value 5 minutes of your feedback — what's working, what's confusing, what you wish existed. You're exactly the user I want to talk to. Happy to jump on a quick call if that's easier.",
    closing2: "",
    signOff: "Thank you for exploring,",
  },
};

const VALID_SEGMENTS = Object.keys(SEGMENT_COPY); // ["new","power","idle","feature"]
function resolveSegment(segment) {
  return VALID_SEGMENTS.includes(segment) ? segment : "power"; // safe default = original template
}

// ─── HTML email template (light theme) ─────────────────────────────────────────
// Brand palette matches the UPSC Mentor architecture report: navy / gold on a light base.
function buildEmailHTML(userName, segment = "power") {
  const firstName = (userName || "").split(" ")[0] || "there";
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const c = SEGMENT_COPY[resolveSegment(segment)];

  const stepsHTML = c.steps.map((s) => `
                <p style="margin:0 0 4px;font-size:14px;color:#0f2044;font-weight:600;">${s.title}</p>
                <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.7;">${s.body}</p>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;border:1px solid #dde3ed;overflow:hidden;">

          <!-- Header with logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#f0d98a 0%,#fdf6e3 100%);padding:28px 32px;text-align:center;border-bottom:1px solid #dde3ed;">
              <img src="cid:upsclogo@mentor" alt="UPSC Mentor" width="56" height="56"
                style="border-radius:12px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />
              <p style="margin:0;font-size:20px;font-weight:700;color:#0f2044;letter-spacing:0.5px;">UPSC Mentor</p>
              <p style="margin:4px 0 0;font-size:11px;color:#9a8546;letter-spacing:1px;text-transform:uppercase;">
                Rebuilding UPSC prep · One IITian at a time
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">

              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:${c.accent};text-transform:uppercase;letter-spacing:1px;">
                ${c.eyebrow}
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#0f2044;line-height:1.7;">
                Hi <strong style="color:${c.accent};">${name}</strong>,
              </p>

              <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.8;">
                ${c.greetingLine}
              </p>

              <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">
                ${c.intro}
              </p>

              <!-- Highlights card -->
              <div style="background:${c.accentBg};border:1px solid ${c.accent}22;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                ${stepsHTML}
              </div>

              <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.8;">
                ${c.closing}
              </p>

              ${c.closing2 ? `<p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">${c.closing2}</p>` : ""}

              <!-- CTA -->
              <div style="text-align:center;margin:8px 0 8px;">
                <a href="https://www.upscbyiitians.in" target="_blank"
                  style="display:inline-block;background:linear-gradient(135deg,#c9a227,#e8c96d);color:#0f2044;
                         font-size:13px;font-weight:700;padding:11px 28px;border-radius:8px;
                         text-decoration:none;letter-spacing:0.4px;">
                  Visit UPSC Mentor →
                </a>
              </div>

            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #dde3ed;">
              <p style="margin:0 0 6px;font-size:13px;color:#374151;">${c.signOff}</p>
              <p style="margin:0 0 2px;font-size:14px;color:#0f2044;font-weight:700;">Anand Vivek</p>
              <p style="margin:0 0 2px;font-size:12px;color:#6b7280;">Roll No.: 240003006</p>
              <p style="margin:0 0 2px;font-size:12px;color:#6b7280;">Third Year | Mechanical Engineering</p>
              <p style="margin:0 0 2px;font-size:12px;color:#6b7280;">Indian Institute of Technology Indore</p>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">📞 9675109428</p>
              <a href="https://www.upscbyiitians.in" style="font-size:12px;color:#c9a227;text-decoration:none;">
                🔗 upscbyiitians.in
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:12px 32px;text-align:center;border-top:1px solid #dde3ed;">
              <p style="margin:0;font-size:10px;color:#9aa3b2;">
                You're receiving this because you're a UPSC Mentor user.
                This is a personal note from the founder — feel free to reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Plain-text fallback ───────────────────────────────────────────────────────
function buildEmailText(userName, segment = "power") {
  const firstName = (userName || "").split(" ")[0] || "there";
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const c = SEGMENT_COPY[resolveSegment(segment)];

  const stepsText = c.steps.map((s) => `→ ${s.title}\n   ${s.body}`).join("\n\n");

  return `Hi ${name},

${c.greetingLine}

${c.intro}

${stepsText}

${c.closing}
${c.closing2 ? `\n${c.closing2}\n` : ""}
${c.signOff}
Anand Vivek
Roll No.: 240003006
Third Year | Mechanical Engineering
Indian Institute of Technology Indore
📞 9675109428
🔗 https://www.upscbyiitians.in`;
}

// ─── Helper: fetch power users from DB ────────────────────────────────────────
// Power users = active 3+ distinct days in last 7 days, excluding test accounts
const EXCL_NAMES = ["admin", "anand vivek"];
const EXCL_SQL   = EXCL_NAMES.map((n) => `'${n}'`).join(", ");

async function fetchPowerUsers() {
  const rows = await sequelize.query(
    `SELECT u.id, u.name, u.email
     FROM "users" u
     WHERE u.role = 'user'
       AND LOWER(u.name) NOT IN (${EXCL_SQL})
       AND u.id IN (
         SELECT user_id
         FROM "UserEvents"
         WHERE user_id NOT IN (
           SELECT id FROM "users" WHERE LOWER(name) IN (${EXCL_SQL})
         )
         GROUP BY user_id
         HAVING COUNT(DISTINCT DATE(created_at)) >= 3
           AND MAX(created_at) >= NOW() - INTERVAL '7 days'
       )
     ORDER BY u.name`,
    { type: QueryTypes.SELECT }
  );
  return rows;
}

// ─── GET /api/admin/email/power-users — preview who will be emailed ────────────
const getEmailTargets = async (req, res, next) => {
  try {
    const users = await fetchPowerUsers();
    res.json({ success: true, users, count: users.length });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/email/power-users — send emails ─────────────────────────
const sendPowerUserEmails = async (req, res, next) => {
  try {
    // Optional: caller can pass a specific user_ids array to override the full list
    const { user_ids } = req.body; // e.g. [3, 7, 12]

    let targets;
    if (Array.isArray(user_ids) && user_ids.length > 0) {
      // Send only to selected users (still exclude test accounts)
      const rows = await sequelize.query(
        `SELECT u.id, u.name, u.email
         FROM "users" u
         WHERE u.id IN (:ids)
           AND u.role = 'user'
           AND LOWER(u.name) NOT IN (${EXCL_SQL})
         ORDER BY u.name`,
        { type: QueryTypes.SELECT, replacements: { ids: user_ids } }
      );
      targets = rows;
    } else {
      targets = await fetchPowerUsers();
    }

    if (targets.length === 0) {
      return res.json({ success: true, sent: 0, failed: 0, results: [], message: "No eligible power users found." });
    }

    const transporter = createTransporter();
    const logoAttachment = getLogoAttachment();

    const results = [];

    for (const user of targets) {
      try {
        const mailOptions = {
          from: `"Anand Vivek | UPSC Mentor" <${process.env.SENDER_EMAIL || "me240003006@iiti.ac.in"}>`,
          to: user.email,
          subject: "Thank You for Exploring UPSC Mentor 🎯",
          text: buildEmailText(user.name),
          html: buildEmailHTML(user.name),
          ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
        };

        await transporter.sendMail(mailOptions);
        results.push({ id: user.id, name: user.name, email: user.email, status: "sent" });
        console.log(`[Email] Sent to ${user.name} <${user.email}>`);

        // Small delay between sends to avoid Gmail rate limits
        await new Promise((r) => setTimeout(r, 800));
      } catch (mailErr) {
        console.error(`[Email] Failed for ${user.email}:`, mailErr.message);
        results.push({ id: user.id, name: user.name, email: user.email, status: "failed", error: mailErr.message });
      }
    }

    const sent   = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;

    res.json({ success: true, sent, failed, results });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/email/send-single — send email to a single user ──────────
const sendSingleUserEmail = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required." });
    }

    // Fetch the specific user (must be a regular user, not admin/test)
    const rows = await sequelize.query(
      `SELECT u.id, u.name, u.email
       FROM "users" u
       WHERE u.id = :uid
         AND u.role = 'user'
         AND LOWER(u.name) NOT IN (${EXCL_SQL})`,
      { type: QueryTypes.SELECT, replacements: { uid: userId } }
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, error: "User not found or not eligible." });
    }

    const user = rows[0];
    const transporter = createTransporter();
    const logoAttachment = getLogoAttachment();

    const mailOptions = {
      from: `"Anand Vivek | UPSC Mentor" <${process.env.SENDER_EMAIL || "me240003006@iiti.ac.in"}>`,
      to: user.email,
      subject: "Thank You for Exploring UPSC Mentor 🎯",
      text: buildEmailText(user.name),
      html: buildEmailHTML(user.name),
      ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent single outreach to ${user.name} <${user.email}>`);

    res.json({
      success: true,
      message: `Email sent to ${user.name} (${user.email}).`,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[Email] sendSingleUserEmail error:", err.message);
    next(err);
  }
};

module.exports = { getEmailTargets, sendPowerUserEmails, sendSingleUserEmail };