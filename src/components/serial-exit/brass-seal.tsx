import { useId } from "react";
import { OPPORTUNITY_MEDIA as M } from "@/content/media";
import { Picture } from "./picture";

/**
 * Brass medallion cut-out with engraved ring text, a check mark and a one-shot shine sweep.
 * Purely decorative (aria-hidden): the meaning is always carried by real text beside it.
 * Wrap it in an element with the `se-stamp` class (and a changing `key`) to make it stamp in.
 */
export function BrassSeal({
  ringText = "VERIFIED · OFF-MARKET · VERIFIED · OFF-MARKET ·",
}: {
  /** ~46 characters read best; it is stretched to fit the ring exactly */
  ringText?: string;
}) {
  const pid = `seal-ring-${useId().replace(/:/g, "")}`;
  return (
    <div aria-hidden="true" className="relative aspect-square w-full">
      <span
        className="absolute inset-x-[6%] -bottom-[4%] h-[14%] rounded-[50%]"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 70%)" }}
      />
      <Picture asset={M.seal} sizes="(min-width: 1024px) 12vw, 28vw" className="h-full w-full" imgClassName="h-full w-full" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <path id={pid} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text fill="rgba(48,26,6,0.85)" fontSize="6.4" fontWeight="500" letterSpacing="1.2" style={{ fontFamily: "var(--font-mono-display), monospace" }}>
          <textPath href={`#${pid}`} textLength="231" lengthAdjust="spacing">
            {ringText}
          </textPath>
        </text>
        <path d="M37 51 l9 9 l17 -19" stroke="rgba(48,26,6,0.85)" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="se-seal-shine" />
      </span>
    </div>
  );
}
