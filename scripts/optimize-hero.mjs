/* eslint-disable no-console */
/**
 * Pre-generates responsive AVIF + WebP variants of the hero poster so the
 * LCP image never depends on a cold runtime encode (Next's image optimizer
 * can take >1s per size on a fresh Cloud Run instance).
 *
 * Usage: node scripts/optimize-hero.mjs   (outputs are committed)
 * Source: public/images/hero-monolith.webp  →  public/images/hero/hero-<w>.{avif,webp}
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "public/images/hero-monolith.webp";
const OUT = "public/images/hero";
const WIDTHS = [640, 1024, 1536, 1672]; // 1672 = native source width (never upscale)

mkdirSync(OUT, { recursive: true });
const meta = await sharp(SRC).metadata();
console.log(`source ${meta.width}x${meta.height}`);

for (const w of WIDTHS) {
  const width = Math.min(w, meta.width);
  const base = sharp(SRC).resize({ width, withoutEnlargement: true });
  const avif = await base.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/hero-${w}.avif`);
  const webp = await base.clone().webp({ quality: 74, effort: 6 }).toFile(`${OUT}/hero-${w}.webp`);
  console.log(`${w}w  avif ${(avif.size / 1024).toFixed(0)}KB  webp ${(webp.size / 1024).toFixed(0)}KB`);
}
