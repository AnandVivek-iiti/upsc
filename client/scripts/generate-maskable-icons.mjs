#!/usr/bin/env node
/**
 * generate-maskable-icons.mjs
 * ───────────────────────────
 * Run once from your project root to create the maskable variants:
 *
 *   node scripts/generate-maskable-icons.mjs
 *
 * Requires: sharp  →  npm install -D sharp
 *
 * What it does:
 *   • Takes /public/logo-upsc.png as the source image
 *   • Adds ~15% safe-zone padding (per maskable icon spec) on a dark background
 *   • Outputs /public/logo-maskable-192.png and /public/logo-maskable-512.png
 *
 * Why this fixes the "fully rounded" issue:
 *   Android applies a circular (or squircle) mask to the `maskable` icon.
 *   Without padding the logo gets clipped right to the edge.
 *   With the 15% safe-zone the logo sits inside the circle, giving the
 *   appearance of a rounded-rectangle (rounded-10) rather than a full circle.
 */

import sharp from "sharp";
import path  from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const SOURCE = path.join(publicDir, "logo-upsc.png");
const BG     = { r: 9, g: 17, b: 15, alpha: 1 }; // matches --bg-base: #09110F

async function makeMaskable(size) {
  const safeZonePct = 0.15;                        // 15 % each side
  const innerSize   = Math.round(size * (1 - safeZonePct * 2));
  const offset      = Math.round((size - innerSize) / 2);

  const logoResized = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: "contain", background: { ...BG } })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logoResized, top: offset, left: offset }])
    .png()
    .toFile(path.join(publicDir, `logo-maskable-${size}.png`));

  console.log(`✓ Created logo-maskable-${size}.png`);
}

await makeMaskable(192);
await makeMaskable(512);
console.log("Done. Add these to /public and they are referenced in manifest.webmanifest.");
