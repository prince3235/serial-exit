/* eslint-disable no-console */
/**
 * Pre-generates responsive AVIF + WebP variants of the 4K hero monolith and
 * core-idea cube backgrounds so desktop/4K screens get razor-sharp detail
 * without cold runtime image optimization, while mobile stays lightweight.
 *
 * Usage: node scripts/optimize-hero.mjs   (outputs are committed)
 * Sources:
 *   public/images/hero-monolith.webp -> public/images/hero/hero-<w>.{avif,webp}
 *   public/images/glowing-cube.webp  -> public/images/core-idea/cube-<w>.{avif,webp}
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const WIDTHS = [640, 1024, 1536, 1920, 2560, 3840];

const TARGETS = [
  { src: "public/images/hero-monolith.webp", outDir: "public/images/hero", prefix: "hero" },
  { src: "public/images/glowing-cube.webp", outDir: "public/images/core-idea", prefix: "cube" },
];

for (const { src, outDir, prefix } of TARGETS) {
  mkdirSync(outDir, { recursive: true });
  const meta = await sharp(src).metadata();
  console.log(`\n[${prefix}] source ${meta.width}x${meta.height}`);

  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width);
    const isLarge = w >= 1536;
    const base = sharp(src).resize({ width, kernel: sharp.kernel.lanczos3, withoutEnlargement: true });
    const avif = await base
      .clone()
      .avif({ quality: isLarge ? 68 : 60, effort: 4, chromaSubsampling: "4:4:4" })
      .toFile(`${outDir}/${prefix}-${w}.avif`);
    const webp = await base
      .clone()
      .webp({ quality: isLarge ? 84 : 78, effort: 5 })
      .toFile(`${outDir}/${prefix}-${w}.webp`);
    console.log(
      `  ${w}w  avif ${(avif.size / 1024).toFixed(0)}KB  webp ${(webp.size / 1024).toFixed(0)}KB`
    );
  }
}
