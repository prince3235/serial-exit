/**
 * Makes a list of scroll-progress breakpoints safe for Framer Motion's
 * useTransform: every value is clamped to [0, 1] and the list is strictly
 * increasing. Out-of-range or repeated offsets make Chrome's native
 * scroll-timeline path throw ("Offsets must be monotonically non-decreasing")
 * which unmounts the whole page — so ALWAYS run scroll ranges through this.
 */
export function safeRange(points: number[]): number[] {
  const out: number[] = [];
  for (const p of points) {
    let v = Math.min(1, Math.max(0, p));
    const prev = out[out.length - 1];
    if (prev !== undefined && v <= prev) v = Math.min(1, prev + 1e-4);
    out.push(v);
  }
  return out;
}
