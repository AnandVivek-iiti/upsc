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
      cid: "upsclogo@mentor",
    };
  }
  return null;
}

// ─── HTML email template ───────────────────────────────────────────────────────
function buildEmailHTML(userName) {
  const firstName = (userName || "").split(" ")[0] || "there";
  // Capitalise first letter
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You for Using UPSC Mentor</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#18181f;border-radius:16px;border:1px solid #2a2a3a;overflow:hidden;">

          <!-- Header with logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:28px 32px;text-align:center;border-bottom:1px solid #2a2a3a;">
              <img src="cid:upsclogo@mentor" alt="UPSC Mentor" width="56" height="56"
                style="border-radius:12px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />
              <p style="margin:0;font-size:20px;font-weight:700;color:#c9a84c;letter-spacing:0.5px;">UPSC Mentor</p>
              <p style="margin:4px 0 0;font-size:11px;color:#6b6b8a;letter-spacing:1px;text-transform:uppercase;">
                Rebuilding UPSC prep · One IITian at a time
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">

              <p style="margin:0 0 16px;font-size:15px;color:#e0e0f0;line-height:1.7;">
                Hi <strong style="color:#c9a84c;">${name}</strong>,
              </p>

              <p style="margin:0 0 14px;font-size:14px;color:#b0b0c8;line-height:1.8;">
                I hope your preparation is going well.
              </p>

              <p style="margin:0 0 14px;font-size:14px;color:#b0b0c8;line-height:1.8;">
                I'm <strong style="color:#e0e0f0;">Anand Vivek</strong>, a third-year Mechanical Engineering student at
                IIT Indore and the builder of UPSC Mentor.
              </p>

              <p style="margin:0 0 20px;font-size:14px;color:#b0b0c8;line-height:1.8;">
                I noticed you've been actively using the platform recently, and I wanted to personally thank you
                for trying it out. Since UPSC Mentor is still in its early stages, feedback from active users
                is <strong style="color:#e0e0f0;">extremely valuable</strong>.
              </p>

              <!-- Feedback questions card -->
              <div style="background:#0f0f18;border:1px solid #2a2a3a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#c9a84c;text-transform:uppercase;letter-spacing:0.8px;">
                  I'd love to know ✍️
                </p>

                <p style="margin:0 0 8px;font-size:14px;color:#e0e0f0;font-weight:600;">
                  1. Which feature did you find most useful?
                </p>
                <ul style="margin:0 0 16px 20px;padding:0;color:#b0b0c8;font-size:13px;line-height:2;">
                  <li>AI Mentor</li>
                  <li>Notes Auditor</li>
                  <li>Syllabus Tracker</li>
                  <li>Dashboard &amp; Timer</li>
                  <li>Topic Practice / PYQ Vault</li>
                  <li>Mock Tests</li>
                  <li>Something else</li>
                </ul>

                <p style="margin:0 0 6px;font-size:14px;color:#e0e0f0;font-weight:600;">
                  2. What was confusing or difficult to use?
                </p>
                <p style="margin:0 0 16px;font-size:13px;color:#7a7a9a;font-style:italic;">
                  (Any friction — login, UI, slow load, missing feature — counts)
                </p>

                <p style="margin:0 0 6px;font-size:14px;color:#e0e0f0;font-weight:600;">
                  3. What one feature would make you use UPSC Mentor more regularly?
                </p>
                <p style="margin:0 0 16px;font-size:13px;color:#7a7a9a;font-style:italic;">
                  (This goes straight into the backlog!)
                </p>

                <p style="margin:0;font-size:14px;color:#e0e0f0;font-weight:600;">
                  4. If you could change one thing about the platform, what would it be?
                </p>
              </div>

              <p style="margin:0 0 20px;font-size:14px;color:#b0b0c8;line-height:1.8;">
                Feel free to reply with just a few lines. Honest feedback — positive or negative — will
                help me improve the platform much faster.
              </p>

              <p style="margin:0 0 24px;font-size:14px;color:#b0b0c8;line-height:1.8;">
                Thank you again, and all the best for your UPSC preparation! 🙏
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:8px;">
                <a href="https://www.upscbyiitians.in" target="_blank"
                  style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c96d);color:#0f0f13;
                         font-size:13px;font-weight:700;padding:11px 28px;border-radius:8px;
                         text-decoration:none;letter-spacing:0.4px;">
                  Visit UPSC Mentor →
                </a>
              </div>

            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #2a2a3a;">
              <p style="margin:0 0 2px;font-size:14px;color:#e0e0f0;font-weight:700;">Anand Vivek</p>
              <p style="margin:0 0 2px;font-size:12px;color:#7a7a9a;">Roll No.: 240003006</p>
              <p style="margin:0 0 2px;font-size:12px;color:#7a7a9a;">Third Year | Mechanical Engineering</p>
              <p style="margin:0 0 2px;font-size:12px;color:#7a7a9a;">Indian Institute of Technology Indore</p>
              <p style="margin:0 0 8px;font-size:12px;color:#7a7a9a;">📞 9675109428</p>
              <a href="https://www.upscbyiitians.in" style="font-size:12px;color:#c9a84c;text-decoration:none;">
                🔗 upscbyiitians.in
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f0f13;padding:12px 32px;text-align:center;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:10px;color:#3a3a5a;">
                You're receiving this because you're an active UPSC Mentor user.
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
function buildEmailText(userName) {
  const firstName = (userName || "").split(" ")[0] || "there";
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return `Hi ${name},

I hope your preparation is going well.

I'm Anand Vivek, a third-year Mechanical Engineering student at IIT Indore and the builder of UPSC Mentor.

I noticed you've been actively using the platform recently, and I wanted to personally thank you for trying it out. Since UPSC Mentor is still in its early stages, feedback from active users is extremely valuable.

I'd love to know:

1. Which feature did you find most useful?
   - AI Mentor
   - Notes Auditor
   - Syllabus Tracker
   - Dashboard & Timer
   - Topic Practice / PYQ Vault
   - Mock Tests
   - Something else

2. What was confusing or difficult to use?

3. What one feature would make you use UPSC Mentor more regularly?

4. If you could change one thing about the platform, what would it be?

Feel free to reply with just a few lines. Honest feedback — positive or negative — will help me improve the platform much faster.

Thank you again, and all the best for your UPSC preparation!

Regards,
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