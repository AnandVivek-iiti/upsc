const nodemailer = require("nodemailer");
const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("../models/User");

// ─── Nodemailer transporter ────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL || "me240003006@iiti.ac.in",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ─── Logo CID attachment ───────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");

function getLogoAttachment() {
  const logoPath = path.join(__dirname, "./assets/upsc-logo.png");
  if (fs.existsSync(logoPath)) {
    return {
      filename: "upsc-logo.png",
      path: logoPath,
      cid: "upsclogo@mentor",
    };
  }
  return null;
}

const SEGMENT_COPY = {
  new: {
    subject: "Welcome to UPSC Mentor — here's where to start",
    accent: "#3B6D11",
    accentBg: "#EAF3DE",
    eyebrow: "Welcome",
    greetingLine:
      "Welcome to UPSC Mentor. I'm Anand Vivek, a third-year Mechanical Engineering student at IIT Indore — and the person building this platform.",
    intro:
      "Really happy to have you here. Here are three things that'll get you the most value from day one:",
    steps: [
      {
        title: "Set your exam date",
        body: "Open your Profile and lock in your Prelims target year. The countdown is surprisingly motivating.",
      },
      {
        title: "Mark your syllabus",
        body: "Go to the Syllabus Tracker and mark the topics you're currently studying. All 48 modules are already loaded — you don't have to build anything.",
      },
      {
        title: "Start the Study Timer",
        body: "Hit the timer from your dashboard before your next session. It tracks daily hours automatically and syncs across devices.",
      },
    ],
    closing:
      "That's all you need to begin. No pressure to explore every feature on day one.",
    closing2:
      "If you have questions or suggestions, just reply to this email — I personally read every message.",
    signOff: "Happy studying,",
  },

  power: {
    subject: "Thank you for being one of our most consistent users",
    accent: "#854F0B",
    accentBg: "#FAEEDA",
    eyebrow: "A personal note",
    greetingLine:
      "I wanted to reach out personally. Seeing users like you study consistently is what keeps me building.",
    intro:
      "You're in the top tier of our early community. A few features you might not have tried yet:",
    steps: [
      {
        title: "AI Mentor Workspace",
        body: "Run separate threads for different subjects — GS4, Economy, Polity. Your mentor carries context across sessions, so it already knows your weak areas going in.",
      },
      {
        title: "AI Answer Evaluation",
        body: "Upload typed or handwritten Mains answers and get detailed feedback in seconds — useful for replicating actual exam conditions.",
      },
      {
        title: "Personalised Study Plan",
        body: "After every mock test, the AI generates a targeted recovery plan for your exact weak topics. Worth trying after your next attempt.",
      },
    ],
    closing:
      "Your feedback matters a lot — you're actually using the platform regularly, which means you see what's working and what's not.",
    closing2:
      "If you find something confusing or have a suggestion, just reply. I'll personally read it.",
    signOff: "Thank you,",
  },

  idle: {
    subject: "Still preparing? Here's the simplest way to restart",
    accent: "#993C1D",
    accentBg: "#FAECE7",
    eyebrow: "Quick check-in",
    greetingLine:
      "You signed up for UPSC Mentor a while back — I just wanted to check in.",
    intro:
      "If the platform felt overwhelming at first, that's fair. Here's the simplest possible entry point: one subject, one timer, 30 minutes.",
    steps: [
      {
        title: "Start a 30-minute session",
        body: "Open the dashboard, pick one subject from the Study Timer (Polity is a popular start), and run one focused session. That single action unlocks the analytics that make everything else useful.",
      },
      {
        title: "Your syllabus is already there",
        body: "All 48 modules are loaded and mapped to the official UPSC notification. You don't have to build anything — just start marking what you're studying.",
      },
    ],
    closing:
      "If something on the platform confused you or stopped you from using it, please do write back.",
    closing2:
      "Your feedback helps me improve UPSC Mentor for everyone.",
    signOff: "Still rooting for you,",
  },

  feature: {
    subject: "Your feedback on UPSC Mentor would be valuable",
    accent: "#3C3489",
    accentBg: "#EEEDFE",
    eyebrow: "Thank you",
    greetingLine:
      "I noticed you've explored several areas of UPSC Mentor — the syllabus tracker, mock tests, AI mentor, and more.",
    intro:
      "That kind of usage tells me you're using the platform as it was designed. Users like you help shape what gets built next. A few things it would be great to hear from you on:",
    steps: [
      {
        title: "What's been most useful?",
        body: "Which feature has made the biggest difference in your preparation? Even a one-line reply helps me understand where to invest next.",
      },
      {
        title: "What's confusing or missing?",
        body: "Was anything unclear, frustrating, or not quite what you expected? Honest feedback from active users is the most useful kind.",
      },
      {
        title: "What would you add?",
        body: "If there's a feature you've always wanted for UPSC prep, please do share. Many improvements on the platform started with a single user suggestion.",
      },
    ],
    closing:
      "Even a short reply makes a real difference.",
    closing2: "Thank you for being part of this.",
    signOff: "Regards,",
  },
};

const VALID_SEGMENTS = Object.keys(SEGMENT_COPY); // ["new","power","idle","feature"]

function resolveSegment(segment) {
  return VALID_SEGMENTS.includes(segment) ? segment : "power";
}

// ─── HTML email builder ────────────────────────────────────────────────────────
function buildEmailHTML(userName, segment = "power") {
  const firstName = (userName || "").split(" ")[0] || "there";
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const c = SEGMENT_COPY[resolveSegment(segment)];

  const stepsHTML = c.steps
    .map(
      (s) => `
                <p style="margin:0 0 4px;font-size:14px;color:#0f2044;font-weight:600;">${s.title}</p>
                <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.7;">${s.body}</p>`,
    )
    .join("");

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

          <!-- Header -->
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
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:${c.accent};text-transform:uppercase;letter-spacing:1px;">${c.eyebrow}</p>
              <p style="margin:0 0 16px;font-size:15px;color:#0f2044;line-height:1.7;">
                Hi <strong style="color:${c.accent};">${name}</strong>,
              </p>
              <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.8;">${c.greetingLine}</p>
              <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.8;">${c.intro}</p>

              <div style="background:${c.accentBg};border:1px solid ${c.accent}22;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                ${stepsHTML}
              </div>

              <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.8;">${c.closing}</p>
              ${c.closing2 ? `<p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.8;">${c.closing2}</p>` : ""}

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
              <a href="https://www.upscbyiitians.in" style="font-size:12px;color:#c9a227;text-decoration:none;">🔗 upscbyiitians.in</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:12px 32px;text-align:center;border-top:1px solid #dde3ed;">
              <p style="margin:0;font-size:10px;color:#9aa3b2;">
                You're receiving this because you're a UPSC Mentor user.
                This is a personal note from the founder - feel free to reply directly.
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

  const stepsText = c.steps
    .map((s) => `→ ${s.title}\n   ${s.body}`)
    .join("\n\n");

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

// ─── Test-account exclusion constants ─────────────────────────────────────────
const EXCL_NAMES = ["admin", "anand vivek"];
const EXCL_SQL = EXCL_NAMES.map((n) => `'${n}'`).join(", ");

// ─── Helper: fetch power users from DB ────────────────────────────────────────
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
    { type: QueryTypes.SELECT },
  );
  return rows;
}

// ─── GET /api/admin/email/power-users ─────────────────────────────────────────
const getEmailTargets = async (req, res, next) => {
  try {
    const users = await fetchPowerUsers();
    res.json({ success: true, users, count: users.length });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/email/power-users ────────────────────────────────────────
// BUG FIXES:
//   1. Now reads `segment` from req.body (was being silently ignored)
//   2. Subject now comes from SEGMENT_COPY[segment].subject (was hardcoded)
//   3. buildEmailHTML / buildEmailText now receive segment (were called without it)
const sendPowerUserEmails = async (req, res, next) => {
  try {
    const { user_ids, segment } = req.body; // ← fix 1: extract segment
    const resolvedSeg = resolveSegment(segment);
    const c = SEGMENT_COPY[resolvedSeg];

    let targets;
    if (Array.isArray(user_ids) && user_ids.length > 0) {
      const rows = await sequelize.query(
        `SELECT u.id, u.name, u.email
         FROM "users" u
         WHERE u.id IN (:ids)
           AND u.role = 'user'
           AND LOWER(u.name) NOT IN (${EXCL_SQL})
         ORDER BY u.name`,
        { type: QueryTypes.SELECT, replacements: { ids: user_ids } },
      );
      targets = rows;
    } else {
      targets = await fetchPowerUsers();
    }

    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        failed: 0,
        results: [],
        message: "No eligible users found.",
      });
    }

    const transporter = createTransporter();
    const logoAttachment = getLogoAttachment();
    const results = [];

    for (const user of targets) {
      try {
        const mailOptions = {
          from: `"Anand Vivek | UPSC Mentor" <${process.env.SENDER_EMAIL || "me240003006@iiti.ac.in"}>`,
          to: user.email,
          subject: c.subject, // ← fix 2: segment subject
          text: buildEmailText(user.name, resolvedSeg), // ← fix 3: pass segment
          html: buildEmailHTML(user.name, resolvedSeg), // ← fix 3: pass segment
          ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
        };

        await transporter.sendMail(mailOptions);
        results.push({
          id: user.id,
          name: user.name,
          email: user.email,
          status: "sent",
        });
        console.log(
          `[Email][${resolvedSeg}] Sent to ${user.name} <${user.email}>`,
        );

        await new Promise((r) => setTimeout(r, 800)); // Gmail rate-limit guard
      } catch (mailErr) {
        console.error(`[Email] Failed for ${user.email}:`, mailErr.message);
        results.push({
          id: user.id,
          name: user.name,
          email: user.email,
          status: "failed",
          error: mailErr.message,
        });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;

    res.json({ success: true, sent, failed, results });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/email/send-single ────────────────────────────────────────
// BUG FIX: also reads segment so single-user sends respect the chosen template
const sendSingleUserEmail = async (req, res, next) => {
  try {
    const { userId, segment } = req.body; // ← fix: read segment here too

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required." });
    }

    const resolvedSeg = resolveSegment(segment);
    const c = SEGMENT_COPY[resolvedSeg];

    const rows = await sequelize.query(
      `SELECT u.id, u.name, u.email
       FROM "users" u
       WHERE u.id = :uid
         AND u.role = 'user'
         AND LOWER(u.name) NOT IN (${EXCL_SQL})`,
      { type: QueryTypes.SELECT, replacements: { uid: userId } },
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, error: "User not found or not eligible." });
    }

    const user = rows[0];
    const transporter = createTransporter();
    const logoAttachment = getLogoAttachment();

    const mailOptions = {
      from: `"Anand Vivek | UPSC Mentor" <${process.env.SENDER_EMAIL || "me240003006@iiti.ac.in"}>`,
      to: user.email,
      subject: c.subject, // ← fix: segment subject
      text: buildEmailText(user.name, resolvedSeg), // ← fix: pass segment
      html: buildEmailHTML(user.name, resolvedSeg), // ← fix: pass segment
      ...(logoAttachment ? { attachments: [logoAttachment] } : {}),
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `[Email][${resolvedSeg}] Single send to ${user.name} <${user.email}>`,
    );

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
