"use client";

import { useEffect, useState } from "react";
import { partners } from "@/content/site";
import { PARTNER_FOCUS, PARTNER_MEDIA } from "@/content/media";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { CornerBrackets } from "./corner-brackets";
import { Picture } from "./picture";

/**
 * Partners — seven partner types as a marquee + a big-type list that drives a
 * photographic stage (desktop) / an inline photo (mobile).
 *
 *  - ONE `active` index feeds both list and stage (hover, focus or tap).
 *  - Only the active photo loads at first; the rest mount once the stage is
 *    near the viewport AND the browser is idle (or on first interaction), so the
 *    section never pulls all images at once.
 *  - Motion is opacity/transform only; the slow zoom pauses off-screen.
 */
export function Partners() {
  const [active, setActive] = useState(0);
  const { ref: marqueeRef, inView: marqueeInView } = useInView<HTMLDivElement>("100px 0px");

  return (
    <SectionShell id="partners" className="overflow-hidden border-t border-white/[0.06] bg-[#050505]">
      <SectionHeading index={partners.index} eyebrow={partners.eyebrow} title={partners.title} intro={partners.intro} />

      {/* Marquee (pauses off-screen) */}
      <Reveal delay={0.1} className="mt-16 lg:mt-24">
        <div ref={marqueeRef} data-inview={marqueeInView} className="relative">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#050505] to-transparent" />
          <div className="se-loop flex w-max animate-marquee gap-4" aria-hidden="true">
            {[...partners.groups, ...partners.groups].map((g, i) => (
              <div key={i} className="flex items-center gap-3 border border-white/[0.08] bg-white/[0.015] px-6 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brass/80" />
                <span className="whitespace-nowrap font-mono-display text-[0.6875rem] tracking-[0.2em] text-foreground/80 sm:text-sm">{g.title}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
        {/* Photo stage (desktop). On mobile each active row shows its own photo inline. */}
        <Reveal className="hidden lg:col-span-5 lg:block">
          <PartnerStage active={active} />
        </Reveal>

        <div className="lg:col-span-7">
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {partners.groups.map((g, i) => (
              <PartnerRow key={g.title} index={i} title={g.title} desc={g.desc} active={active} onActivate={setActive} />
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

function PartnerStage({ active }: { active: number }) {
  const { ref, inView } = useInView<HTMLDivElement>("250px 0px");
  const [ready, setReady] = useState(false);

  // Mount the other photos only after the stage is near the viewport and the browser is idle.
  useEffect(() => {
    if (!inView || ready) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let id = 0;
    let timer = 0;
    if (w.requestIdleCallback) id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
    else timer = window.setTimeout(() => setReady(true), 1200);
    return () => {
      if (id && w.cancelIdleCallback) w.cancelIdleCallback(id);
      if (timer) window.clearTimeout(timer);
    };
  }, [inView, ready]);

  const title = partners.groups[active]?.title ?? "";

  return (
    <div ref={ref} data-inview={inView} className="se-frame aspect-[4/5] w-full overflow-hidden lg:sticky lg:top-24">
      {PARTNER_MEDIA.map((asset, i) => {
        const isActive = i === active;
        if (!(ready || isActive)) return null;
        return (
          <div
            key={i}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)]",
              isActive ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
            )}
            style={{ transitionDuration: isActive ? "700ms, 1400ms" : "500ms, 500ms" }}
          >
            <div className={cn("absolute inset-0", isActive && "se-loop se-kb")}>
              {asset ? (
                <Picture
                  asset={asset}
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  style={{ objectPosition: PARTNER_FOCUS[i] }}
                />
              ) : (
                <Fallback index={i} />
              )}
            </div>
          </div>
        );
      })}

      {/* contrast scrim + caption */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.4) 0%, transparent 26%, transparent 50%, rgba(5,5,5,0.9) 100%)" }}
      />
      <CornerBrackets />
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7">
        <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-brass">Confidential · Relationship-Led</span>
        <div key={active} className="se-fade-up mt-2 flex items-baseline gap-3">
          <span className="font-mono-display text-sm text-amber-500">0{active + 1}</span>
          <span className="font-sans text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">{title}</span>
        </div>
        <p className="mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-foreground/75">
          Built for firms and principals who treat deal flow as a relationship, not a marketplace.
        </p>
      </div>
    </div>
  );
}

/** Brand fallback for a partner type whose photo has not been added yet. */
function Fallback({ index }: { index: number }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,122,26,0.16), transparent 60%), #0b0b0c" }}
    >
      <span className="font-mono-display text-[34vw] leading-none text-amber-500/20 lg:text-[11rem]">0{index + 1}</span>
    </div>
  );
}

function PartnerRow({
  index,
  title,
  desc,
  active,
  onActivate,
}: {
  index: number;
  title: string;
  desc: string;
  active: number;
  onActivate: (i: number) => void;
}) {
  const on = active === index;
  const asset = PARTNER_MEDIA[index];
  return (
    <Reveal delay={index * 0.04} as="li">
      <div onMouseEnter={() => onActivate(index)} className="relative grid grid-cols-[auto_1fr] gap-5 px-1 py-6 sm:grid-cols-[auto_1.2fr_1.5fr] sm:gap-8 sm:py-7">
        <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">0{index + 1}</span>

        <h3 className="font-sans text-lg font-medium tracking-[-0.01em] sm:text-xl lg:text-2xl">
          <button
            type="button"
            aria-pressed={on}
            data-cursor="Select"
            onFocus={() => onActivate(index)}
            onClick={() => onActivate(index)}
            className={cn(
              "text-left transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              on ? "translate-x-3 text-amber-300" : "text-foreground opacity-75 hover:opacity-100"
            )}
          >
            {title}
          </button>
        </h3>

        <p
          className={cn(
            "col-span-2 max-w-md text-[0.875rem] leading-relaxed text-muted-foreground transition-[opacity,transform] duration-500 sm:col-span-1",
            on ? "opacity-100" : "opacity-0 lg:-translate-x-2 max-lg:opacity-100"
          )}
        >
          {desc}
        </p>

        {/* mobile: the active row shows its own photo inline (desktop uses the stage) */}
        {on && (
          <div className="se-fade-up relative col-span-2 aspect-[16/10] overflow-hidden border border-white/10 lg:hidden" aria-hidden="true">
            {asset ? (
              <Picture
                asset={asset}
                sizes="92vw"
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
                style={{ objectPosition: PARTNER_FOCUS[index] }}
              />
            ) : (
              <Fallback index={index} />
            )}
          </div>
        )}

        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-0 h-px w-full origin-left bg-brass/70 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            on ? "scale-x-100" : "scale-x-0"
          )}
        />
      </div>
    </Reveal>
  );
}
