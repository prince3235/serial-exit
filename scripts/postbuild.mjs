/**
 * Post-build step for Next.js `output: "standalone"`.
 *
 * The standalone bundle does not include `.next/static` or `public/`, so we
 * copy them in. Written in Node (not `cp -r`) so `npm run build` works on
 * Windows, macOS and Linux alike. The Dockerfile does the same thing with
 * COPY, so this only matters for running `npm start` locally.
 */
/* eslint-disable no-console */
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error("postbuild: .next/standalone not found — did `next build` succeed?");
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), { recursive: true });
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
}
console.log("postbuild: copied .next/static and public/ into the standalone bundle");
