/* eslint-disable no-console */
/**
 * Fails if any asset path referenced in the code does not exist with EXACT letter-case.
 * Windows/macOS file systems ignore case; Linux servers (Cloud Run, Docker, CI) do not,
 * so "Hero.webp" vs "hero.webp" works locally and 404s in production. Run: npm run check:assets
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pub = join(root, "public");
const missing = new Set();

function existsExact(urlPath) {
  const parts = urlPath.split("/").filter(Boolean);
  let dir = pub;
  for (const part of parts) {
    let names;
    try { names = readdirSync(dir); } catch { return false; }
    if (!names.includes(part)) return false; // includes() is case-sensitive on every OS
    dir = join(dir, part);
  }
  return true;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(p);
  }
  return out;
}

const REF = /["'`(](\/(?:images|fonts|icons)\/[A-Za-z0-9_\-./]+\.(?:png|jpe?g|webp|avif|svg|woff2?|ico))/g;
for (const file of walk(join(root, "src"))) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(REF)) if (!existsExact(m[1])) missing.add(`${m[1]}   (in ${file.replace(root, "")})`);
}

// media.ts: every base × width × format must exist
const media = readFileSync(join(root, "src/content/media.ts"), "utf8");
for (const m of media.matchAll(/base: "([^"]+)".*?widths: \[([\d, ]+)\]/g)) {
  for (const w of m[2].split(",").map((x) => x.trim())) {
    for (const ext of ["avif", "webp"]) {
      const p = `${m[1]}-${w}.${ext}`;
      if (!existsExact(p)) missing.add(`${p}   (from media.ts)`);
    }
  }
}
// hero variants built by scripts/optimize-hero.mjs
for (const w of [640, 1024, 1536, 1672]) for (const ext of ["avif", "webp"]) {
  const p = `/images/hero/hero-${w}.${ext}`;
  if (!existsExact(p)) missing.add(`${p}   (hero)`);
}

if (missing.size) {
  console.error("✖ Missing or wrongly-cased assets:\n  " + [...missing].join("\n  "));
  process.exit(1);
}
console.log("✔ all referenced assets exist with exact letter-case");
