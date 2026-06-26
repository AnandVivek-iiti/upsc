const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// ─── Resend client (primary) ───────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Nodemailer transporter (fallback) ────────────────────────────────────────
// SENDER_EMAIL must be the real Gmail address used for SMTP auth.
// Never set it to a custom domain — Gmail SMTP will reject it.
// pool=true reuses SMTP connections for bulk sends instead of opening a new
// TCP handshake for every message — dramatically faster for large recipient lists.
function createTransporter({ pool = false } = {}) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    pool,                              // reuse connections across multiple sendMail calls
    maxConnections: pool ? 5 : 1,      // 5 parallel SMTP streams when pooling
    maxMessages:    pool ? 100 : Infinity,
    auth: {
      user: process.env.SENDER_EMAIL || "me240003006@iiti.ac.in",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

// ─── Logo helpers ──────────────────────────────────────────────────────────────
// Resend doesn't support CID attachments — embed logo as base64 data URI instead.
function getLogoBase64DataURI() {
  const logoPath = path.join(__dirname, "../assets/upsc-logo.png");
  if (fs.existsSync(logoPath)) {
    const data = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${data}`;
  }
  return null;
}

// Nodemailer keeps the classic CID approach.
function getLogoAttachment() {
  const logoPath = path.join(__dirname, "../assets/upsc-logo.png");
  if (fs.existsSync(logoPath)) {
    return { filename: "upsc-logo.png", path: logoPath, cid: "upsclogo@mentor" };
  }
  return null;
}

// ─── PDF report attachment ─────────────────────────────────────────────────────
// The report PDF lives at: backend/assets/UPSC_Mentor_Report.pdf
// To REMOVE the PDF attachment from all emails:
//   1. Delete or comment out the getPDFAttachment() function below.
//   2. Remove the `pdfAttachment` variable and both spread lines
//      that reference it inside sendEmail() (search "PDF_ATTACH").
function getPDFAttachment() {
  const pdfPath = path.join(__dirname, "../assets/UPSC_Mentor_Report.pdf");
  if (fs.existsSync(pdfPath)) {
    return {
      filename: "UPSC_Mentor_Report.pdf",
      path: pdfPath,
      contentType: "application/pdf",
    };
  }
  // If file not found, warn once and skip silently — never block the send.
  console.warn("[Email] PDF not found at assets/UPSC_Mentor_Report.pdf — skipping attachment.");
  return null;
}

// ─── Segment copy ──────────────────────────────────────────────────────────────
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
      { title: "Set your exam date", body: "Open your Profile and lock in your Prelims target year. The countdown is surprisingly motivating." },
      { title: "Mark your syllabus", body: "Go to the Syllabus Tracker and mark the topics you're currently studying. All 48 modules are already loaded — you don't have to build anything." },
      { title: "Start the Study Timer", body: "Hit the timer from your dashboard before your next session. It tracks daily hours automatically and syncs across devices." },
    ],
    closing: "That's all you need to begin. No pressure to explore every feature on day one.",
    closing2: "If you have questions or suggestions, just reply to this email — I personally read every message.",
    signOff: "Happy studying,",
  },

  power: {
    subject: "Thank you for being one of our most consistent users",
    accent: "#854F0B",
    accentBg: "#FAEEDA",
    eyebrow: "A personal note",
    greetingLine:
      "I wanted to reach out personally. Seeing users like you study consistently is what keeps me building.",
    intro: "You're in the top tier of our early community. A few features you might not have tried yet:",
    steps: [
      { title: "AI Mentor Workspace", body: "Run separate threads for different subjects — GS4, Economy, Polity. Your mentor carries context across sessions, so it already knows your weak areas going in." },
      { title: "AI Answer Evaluation", body: "Upload typed or handwritten Mains answers and get detailed feedback in seconds — useful for replicating actual exam conditions." },
      { title: "Personalised Study Plan", body: "After every mock test, the AI generates a targeted recovery plan for your exact weak topics. Worth trying after your next attempt." },
    ],
    closing: "Your feedback matters a lot — you're actually using the platform regularly, which means you see what's working and what's not.",
    closing2: "If you find something confusing or have a suggestion, just reply. I'll personally read it.",
    signOff: "Thank you,",
  },

  idle: {
    subject: "Still preparing? Here's the simplest way to restart",
    accent: "#993C1D",
    accentBg: "#FAECE7",
    eyebrow: "Quick check-in",
    greetingLine: "You signed up for UPSC Mentor a while back — I just wanted to check in.",
    intro: "If the platform felt overwhelming at first, that's fair. Here's the simplest possible entry point: one subject, one timer, 30 minutes.",
    steps: [
      { title: "Start a 30-minute session", body: "Open the dashboard, pick one subject from the Study Timer (Polity is a popular start), and run one focused session. That single action unlocks the analytics that make everything else useful." },
      { title: "Your syllabus is already there", body: "All 48 modules are loaded and mapped to the official UPSC notification. You don't have to build anything — just start marking what you're studying." },
    ],
    closing: "If something on the platform confused you or stopped you from using it, please do write back.",
    closing2: "Your feedback helps me improve UPSC Mentor for everyone.",
    signOff: "Still rooting for you,",
  },

  feature: {
    subject: "Your feedback on UPSC Mentor would be valuable",
    accent: "#3C3489",
    accentBg: "#EEEDFE",
    eyebrow: "Thank you",
    greetingLine: "I noticed you've explored several areas of UPSC Mentor — the syllabus tracker, mock tests, AI mentor, and more.",
    intro: "That kind of usage tells me you're using the platform as it was designed. Users like you help shape what gets built next. A few things it would be great to hear from you on:",
    steps: [
      { title: "What's been most useful?", body: "Which feature has made the biggest difference in your preparation? Even a one-line reply helps me understand where to invest next." },
      { title: "What's confusing or missing?", body: "Was anything unclear, frustrating, or not quite what you expected? Honest feedback from active users is the most useful kind." },
      { title: "What would you add?", body: "If there's a feature you've always wanted for UPSC prep, please do share. Many improvements on the platform started with a single user suggestion." },
    ],
    closing: "Even a short reply makes a real difference.",
    closing2: "Thank you for being part of this.",
    signOff: "Regards,",
  },
};

const VALID_SEGMENTS = Object.keys(SEGMENT_COPY);

function resolveSegment(segment) {
  return VALID_SEGMENTS.includes(segment) ? segment : "power";
}

// ─── HTML builder ──────────────────────────────────────────────────────────────
// logoSrc: base64 data URI (Resend) | "cid:upsclogo@mentor" (Nodemailer) | null
function buildEmailHTML(userName, segment = "power", logoSrc = null) {
  const firstName = (userName || "").split(" ")[0] || "there";
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const c = SEGMENT_COPY[resolveSegment(segment)];

  const logoImg = logoSrc
    ? `<img src="${logoSrc}" alt="UPSC Mentor" width="56" height="56"
         style="border-radius:12px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />`
    : "";

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
              ${logoImg}
              <p style="margin:0;font-size:20px;font-weight:700;color:#0f2044;letter-spacing:0.5px;">UPSC Mentor</p>
              <p style="margin:4px 0 0;font-size:11px;color:#9a8546;letter-spacing:1px;text-transform:uppercase;">
                Rebuilding UPSC prep · For IITians BY IITian
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

// ─── Console logger ────────────────────────────────────────────────────────────
function logSend({ provider, status, segment, name, email, error }) {
  const ts = new Date().toISOString();
  const providerTag = provider === "resend" ? "Resend  " : "Nodemailer";
  const statusTag   = status  === "sent"   ? "✓ SENT  " : "✗ FAILED";
  if (status === "sent") {
    console.log(
      `[Email] ${ts}  ${statusTag}  via ${providerTag}  [${segment.padEnd(7)}]  ${name} <${email}>`
    );
  } else {
    console.error(
      `[Email] ${ts}  ${statusTag}  via ${providerTag}  [${segment.padEnd(7)}]  ${name} <${email}>  ERR: ${error}`
    );
  }
}

// ─── Core send: Resend primary, Nodemailer fallback ───────────────────────────
// Two separate "from" addresses:
//   RESEND_FROM   → custom domain address shown to recipients (e.g. anand@send.upscbyiitians.in)
//                   Only works after Resend verifies your domain in their dashboard.
//   SENDER_EMAIL  → real Gmail used for SMTP auth in Nodemailer (e.g. me240003006@iiti.ac.in)
//                   Must stay a Gmail address — never set to a custom domain.
async function sendEmail({ toEmail, toName, subject, segment }) {
  const resolvedSeg = resolveSegment(segment);
  const text        = buildEmailText(toName, resolvedSeg);

  // Resend uses the verified custom domain address.
  const resendFrom    = process.env.RESEND_FROM   || "anand@send.upscbyiitians.in";
  const resendLabel   = `"Anand Vivek | UPSC Mentor" <${resendFrom}>`;

  // Nodemailer must use the real Gmail address for SMTP auth.
  const gmailAddress  = process.env.SENDER_EMAIL  || "me240003006@iiti.ac.in";
  const gmailLabel    = `"Anand Vivek | UPSC Mentor" <${gmailAddress}>`;

  // PDF_ATTACH: load the report PDF for attachment (all segments).
  // To remove the PDF from all emails, delete this line and all lines marked PDF_ATTACH below.
  const pdfAttachment = getPDFAttachment();

  // ── Attempt 1: Resend ──────────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const logoDataURI = getLogoBase64DataURI();
      const html = buildEmailHTML(toName, resolvedSeg, logoDataURI);

      // PDF_ATTACH: build Resend attachments array — remove the block below to drop the PDF.
      const attachments = pdfAttachment
        ? [{ filename: pdfAttachment.filename, content: fs.readFileSync(pdfAttachment.path) }]
        : [];

      const { error } = await resend.emails.send({
        from: resendLabel,   // ← custom domain (anand@send.upscbyiitians.in)
        to: toEmail,
        subject,
        html,
        text,
        ...(attachments.length ? { attachments } : {}), // PDF_ATTACH
      });

      if (!error) {
        logSend({ provider: "resend", status: "sent", segment: resolvedSeg, name: toName, email: toEmail });
        return { provider: "resend" };
      }

      // Resend returned an API-level error — fall through to Nodemailer.
      console.warn(`[Email] Resend API error for ${toEmail}:`, error.message ?? error);
    } catch (resendErr) {
      console.warn(`[Email] Resend exception for ${toEmail}:`, resendErr.message);
    }
  } else {
    console.warn("[Email] RESEND_API_KEY not set — skipping Resend, trying Nodemailer.");
  }

  // ── Attempt 2: Nodemailer (Gmail SMTP fallback) ────────────────────────────
  const logoAttachment = getLogoAttachment();
  const html = buildEmailHTML(toName, resolvedSeg, logoAttachment ? "cid:upsclogo@mentor" : null);

  // PDF_ATTACH: build Nodemailer attachments array — remove the pdfAttachment spread below to drop the PDF.
  const nmAttachments = [
    ...(logoAttachment ? [logoAttachment] : []),
    ...(pdfAttachment  ? [pdfAttachment]  : []), // PDF_ATTACH
  ];

  const transporter = createTransporter();
  await transporter.sendMail({
    from: gmailLabel,        // ← real Gmail (me240003006@iiti.ac.in)
    to: toEmail,
    subject,
    text,
    html,
    ...(nmAttachments.length ? { attachments: nmAttachments } : {}),
  });

  logSend({ provider: "nodemailer", status: "sent", segment: resolvedSeg, name: toName, email: toEmail });
  return { provider: "nodemailer" };
}

// ─── Concurrency helper ────────────────────────────────────────────────────────
// Processes items in chunks of `limit`, running fn concurrently within each chunk
// via Promise.allSettled — a slow/failed item never blocks the rest.
// Returns a flat PromiseSettledResult[] in the same order as items.
async function runConcurrent(items, limit, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk   = items.slice(i, i + limit);
    const settled = await Promise.allSettled(chunk.map(fn));
    results.push(...settled);
  }
  return results;
}

// ─── Bulk send: Resend batch primary, concurrent Nodemailer fallback ───────────
// Replaces the old sequential for-loop + 800 ms delay in sendPowerUserEmails.
//
// Path A — resend.batch.send(): up to 100 recipients per API call (one round-trip).
//           Falls back per-chunk when Resend returns an error (e.g. domain not verified).
// Path B — Nodemailer pool: CONCURRENCY sends in parallel over reused SMTP connections.
async function sendBulkEmails(targets, resolvedSeg, subject) {
  const allResults = [];
  let   nmTargets  = [];

  // ── Path A: Resend batch.send() ─────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const logoDataURI   = getLogoBase64DataURI();
    const pdfAttachment = getPDFAttachment();
    const resendFrom    = process.env.RESEND_FROM || "anand@send.upscbyiitians.in";
    const resendLabel   = `"Anand Vivek | UPSC Mentor" <${resendFrom}>`;

    const buildPayload = (user) => {
      const html        = buildEmailHTML(user.name, resolvedSeg, logoDataURI);
      const text        = buildEmailText(user.name, resolvedSeg);
      const attachments = pdfAttachment
        ? [{ filename: pdfAttachment.filename, content: fs.readFileSync(pdfAttachment.path) }]
        : [];
      return {
        from: resendLabel,
        to:   user.email,
        subject,
        html,
        text,
        ...(attachments.length ? { attachments } : {}),
      };
    };

    const RESEND_CHUNK = 100;
    for (let i = 0; i < targets.length; i += RESEND_CHUNK) {
      const chunk      = targets.slice(i, i + RESEND_CHUNK);
      const chunkLabel = `chunk ${Math.floor(i / RESEND_CHUNK) + 1}`;
      try {
        const { data, error } = await resend.batch.send(chunk.map(buildPayload));
        if (error) {
          console.warn(`[Email] Resend batch error (${chunkLabel}):`, error.message ?? error);
          nmTargets.push(...chunk);
        } else {
          for (const user of chunk) {
            logSend({ provider: "resend", status: "sent", segment: resolvedSeg, name: user.name, email: user.email });
            allResults.push({ id: user.id, name: user.name, email: user.email, status: "sent", provider: "resend" });
          }
        }
      } catch (err) {
        console.warn(`[Email] Resend batch exception (${chunkLabel}):`, err.message);
        nmTargets.push(...chunk);
      }
    }

    if (nmTargets.length > 0) {
      console.warn(`[Email] ${nmTargets.length} recipient(s) falling back Resend → Nodemailer`);
    }
  } else {
    console.warn("[Email] RESEND_API_KEY not set — routing all to Nodemailer.");
    nmTargets = targets;
  }

  if (nmTargets.length === 0) return allResults;

  // ── Path B: Nodemailer — concurrent sends via pooled transporter ─────────────
  const transporter    = createTransporter({ pool: true });
  const logoAttachment = getLogoAttachment();
  const pdfAttachment  = getPDFAttachment();
  const nmAttachments  = [
    ...(logoAttachment ? [logoAttachment] : []),
    ...(pdfAttachment  ? [pdfAttachment]  : []),
  ];
  const gmailAddress = process.env.SENDER_EMAIL || "me240003006@iiti.ac.in";
  const gmailLabel   = `"Anand Vivek | UPSC Mentor" <${gmailAddress}>`;

  const CONCURRENCY = 5; // safe ceiling for Gmail SMTP
  const settled = await runConcurrent(nmTargets, CONCURRENCY, async (user) => {
    const html = buildEmailHTML(user.name, resolvedSeg, logoAttachment ? "cid:upsclogo@mentor" : null);
    const text = buildEmailText(user.name, resolvedSeg);
    try {
      await transporter.sendMail({
        from: gmailLabel,
        to:   user.email,
        subject,
        text,
        html,
        ...(nmAttachments.length ? { attachments: nmAttachments } : {}),
      });
      logSend({ provider: "nodemailer", status: "sent", segment: resolvedSeg, name: user.name, email: user.email });
      return { id: user.id, name: user.name, email: user.email, status: "sent", provider: "nodemailer" };
    } catch (mailErr) {
      logSend({ provider: "both_failed", status: "failed", segment: resolvedSeg, name: user.name, email: user.email, error: mailErr.message });
      return { id: user.id, name: user.name, email: user.email, status: "failed", error: mailErr.message };
    }
  });

  transporter.close(); // release pooled SMTP connections back to the OS

  for (const r of settled) {
    allResults.push(r.status === "fulfilled" ? r.value : { status: "failed", error: r.reason?.message });
  }

  return allResults;
}

// ─── Test-account exclusion ────────────────────────────────────────────────────
const EXCL_NAMES = ["admin", "anand vivek"];
const EXCL_SQL   = EXCL_NAMES.map((n) => `'${n}'`).join(", ");

// ─── Helper: fetch power users from DB ────────────────────────────────────────
async function fetchPowerUsers() {
  return sequelize.query(
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
const sendPowerUserEmails = async (req, res, next) => {
  try {
    const { user_ids, segment } = req.body;
    const resolvedSeg = resolveSegment(segment);
    const subject     = SEGMENT_COPY[resolvedSeg].subject;

    let targets;
    if (Array.isArray(user_ids) && user_ids.length > 0) {
      targets = await sequelize.query(
        `SELECT u.id, u.name, u.email
         FROM "users" u
         WHERE u.id IN (:ids)
           AND u.role = 'user'
           AND LOWER(u.name) NOT IN (${EXCL_SQL})
         ORDER BY u.name`,
        { type: QueryTypes.SELECT, replacements: { ids: user_ids } },
      );
    } else {
      targets = await fetchPowerUsers();
    }

    if (targets.length === 0) {
      return res.json({ success: true, sent: 0, failed: 0, results: [], message: "No eligible users found." });
    }

    console.log(`[Email] Starting bulk send — segment: ${resolvedSeg}, recipients: ${targets.length}`);

    // sendBulkEmails: Resend batch.send() → concurrent Nodemailer fallback (no serial loop)
    const results   = await sendBulkEmails(targets, resolvedSeg, subject);
    const sent      = results.filter((r) => r.status === "sent").length;
    const failed    = results.filter((r) => r.status === "failed").length;
    const providers = [...new Set(results.filter((r) => r.provider).map((r) => r.provider))];
    console.log(`[Email] Bulk done — sent: ${sent}, failed: ${failed}, provider(s): ${providers.join(", ")}`);

    res.json({ success: true, sent, failed, results, providers });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/email/send-single ────────────────────────────────────────
const sendSingleUserEmail = async (req, res, next) => {
  try {
    const { userId, segment } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required." });
    }

    const resolvedSeg = resolveSegment(segment);
    const subject     = SEGMENT_COPY[resolvedSeg].subject;

    const rows = await sequelize.query(
      `SELECT u.id, u.name, u.email
       FROM "users" u
       WHERE u.id = :uid
         AND u.role = 'user'
         AND LOWER(u.name) NOT IN (${EXCL_SQL})`,
      { type: QueryTypes.SELECT, replacements: { uid: userId } },
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, error: "User not found or not eligible." });
    }

    const user = rows[0];
    const { provider } = await sendEmail({ toEmail: user.email, toName: user.name, subject, segment: resolvedSeg });

    res.json({
      success: true,
      message: `Email sent to ${user.name} (${user.email}) via ${provider}.`,
      user: { id: user.id, name: user.name, email: user.email },
      provider,
    });
  } catch (err) {
    logSend({ provider: "both_failed", status: "failed", segment: "?", name: "?", email: "?", error: err.message });
    next(err);
  }
};

module.exports = { getEmailTargets, sendPowerUserEmails, sendSingleUserEmail };