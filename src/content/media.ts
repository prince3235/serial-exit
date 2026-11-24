/**
 * Photo assets for the Opportunities section.
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

/** Opportunities section layers (bottom -> top): desk, rays, folio, seal. */
export const OPPORTUNITY_MEDIA = {
  desk: { id: "desk", base: "/images/opportunities/desk", width: 1024, height: 1536, widths: [640, 1024], alpha: false } as MediaAsset,   // 2:3 photo, lamp top-left, folios low-centre
  rays: { id: "rays", base: "/images/opportunities/rays", width: 768, height: 512, widths: [512, 768], alpha: true } as MediaAsset,   // transparent light shafts (top-left origin)
  folio: { id: "folio", base: "/images/opportunities/folio", width: 720, height: 893, widths: [480, 720], alpha: true } as MediaAsset, // transparent dossier cover with a blank nameplate
  seal: { id: "seal", base: "/images/opportunities/seal", width: 640, height: 640, widths: [320, 640], alpha: true } as MediaAsset,   // transparent blank brass medallion
};
