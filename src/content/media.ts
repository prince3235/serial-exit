/**
 * Photo assets for the Seal badge.
 * Files live in /public/images/opportunities; every asset has AVIF + WebP at each width.
 * Use <picture> with srcSet(asset,"avif") / srcSet(asset,"webp") and fallbackSrc(asset).
 * Always render width/height (or aspect-ratio) so there is no layout shift.
 */
export type MediaAsset = {
  id: string;
  /** path without "-<width>.<ext>" */
  base: string;
  /** intrinsic size of the LARGEST variant */
  width: number;
  height: number;
  widths: number[];
  /** true = transparent cut-out (no blend mode needed) */
  alpha: boolean;
};

export const srcSet = (a: MediaAsset, fmt: "avif" | "webp") =>
  a.widths.map((w) => `${a.base}-${w}.${fmt} ${w}w`).join(", ");

export const fallbackSrc = (a: MediaAsset) => `${a.base}-${a.widths[a.widths.length - 1]}.webp`;

/** Brass medallion cut-out used by BrassSeal. */
export const OPPORTUNITY_MEDIA = {
  seal: { id: "seal", base: "/images/opportunities/seal", width: 640, height: 640, widths: [320, 640], alpha: true } as MediaAsset,
};
