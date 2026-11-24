"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { showcase } from "@/content/site";
import { OPPORTUNITY_MEDIA as M } from "@/content/media";
import { useInView } from "@/hooks/use-in-view";
import { safeRange } from "@/lib/scroll-range";
import { cn } from "@/lib/utils";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { GlassCard } from "./glass-card";
import { VerifiedSeal } from "./verified-seal";
import { CornerBrackets } from "./corner-brackets";
import { Picture } from "./picture";
import { BrassSeal } from "./brass-seal";

/**
 * Layer layout (percentages of the frame / card). Hand-tune freely: every layer
 * below reads its position from here.
 */
const LAYERS = {
  lamp: { left: "-4%", top: "-6%", width: "52%" },
  rays: { left: "-8%", top: "-6%", width: "125%" },
  card: { top: "29%", width: "clamp(0px, 78%, 360px)", rot: -3 },
  seal: { right: "-10%", top: "-7%", width: "34%" },
} as const;

/**
 * Showcase (Opportunities) — a layered, photographic scene:
 *   desk photo → dark scrim → light rays → lamp glow → dossier card (real DOM text) → brass seal.
 * The right-hand deal list drives the card; the seal "stamps" on every change.
 * All motion is transform/opacity; loops pause off-screen; reduced-motion gets the static scene.
 */
export function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref: frameRef, inView, seen } = useInView<HTMLDivElement>("120px 0px");

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const deskY = useTransform(scrollYProgress, safeRange([0, 1]), ["-3%", "3%"]);
  const deskScale = useTransform(scrollYProgress, safeRange([0, 1]), [1.08, 1]);

  // Auto-advance the active deal (pauses on hover/focus and while off-screen)
  useEffect(() => {
    if (paused || !inView) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % showcase.cards.length), 4500);
    return () => window.clearInterval(id);
  }, [paused, inView]);

  // Pointer parallax: writes two CSS variables per frame; layers read them in transforms.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (!window.matchMedia("(any-pointer: fine) and (hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let rect: DOMRect | null = null;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.setProperty("--tx", cx.toFixed(3));
      el.style.setProperty("--ty", cy.toFixed(3));
      raf = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      rect ??= el.getBoundingClientRect(); // measured once, not on every move
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      kick();
    };
    const onLeave = () => { tx = 0; ty = 0; rect = null; kick(); };
    const onScroll = () => { rect = null; };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [frameRef]);

  const delay = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

  return (
    <SectionShell id="showcase" ref={sectionRef} className="border-t border-white/[0.06] bg-[#0B0B0C]">
      <SectionHeading index={showcase.index} eyebrow={showcase.eyebrow} title={showcase.title} intro={showcase.intro} />

      <div className="mt-14 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-12">
        {/* ── Left: layered photographic scene ───────────────────────────── */}
        <Reveal className="relative">
          <div
            ref={frameRef}
            data-inview={inView}
            data-seen={seen}
            className="se-frame aspect-[4/5] w-full overflow-hidden"
          >
            {/* L0 desk photo — slow scroll parallax + pointer drift */}
            <motion.div className="absolute inset-0" style={{ y: deskY, scale: deskScale }}>
              <div
                className="absolute inset-0"
                style={{ transform: "translate3d(calc(var(--tx, 0) * -7px), calc(var(--ty, 0) * -5px), 0) scale(1.04)" }}
              >
                <Picture
                  asset={M.desk}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  style={{ objectPosition: "50% 45%" }}
                />
              </div>
            </motion.div>

            {/* quiet the photo's own folios so the dossier card reads clearly */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.5) 45%, rgba(5,5,5,0.82) 100%)" }}
            />

            {/* L1 light rays (real alpha — no blend mode) */}
            <div
              aria-hidden="true"
              className="se-ent pointer-events-none absolute"
              style={{ ...LAYERS.rays, ...delay(0.2), transform: "translate3d(calc(var(--tx, 0) * 9px), calc(var(--ty, 0) * 6px), 0)" }}
            >
              <div className="se-loop se-rays">
                <Picture asset={M.rays} sizes="60vw" className="w-full" imgClassName="h-auto w-full" />
              </div>
            </div>

            {/* L2 lamp glow */}
            <div
              aria-hidden="true"
              className="se-ent se-loop se-flicker pointer-events-none absolute aspect-square rounded-full"
              style={{
                ...LAYERS.lamp,
                ...delay(0.3),
                background: "radial-gradient(circle, rgba(255,160,70,0.42) 0%, rgba(255,122,26,0.12) 42%, transparent 70%)",
              }}
            />

            {/* L3 dossier card — position wrapper → tilt/rotate → cut-out + real text */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: LAYERS.card.top, width: LAYERS.card.width, perspective: "900px" }}
            >
              <div className="se-ent-card" style={delay(0.45)}>
                <div
                  className="relative [container-type:inline-size]"
                  style={{
                    transform: `rotate(${LAYERS.card.rot}deg) rotateX(calc(var(--ty, 0) * -4deg)) rotateY(calc(var(--tx, 0) * 4deg))`,
                  }}
                >
                  {/* static soft contact shadow (no CSS filter on a moving layer) */}
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-[8%] -bottom-[3%] h-[12%] rounded-[50%]"
                    style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, transparent 70%)" }}
                  />
                  <Picture asset={M.folio} sizes="(min-width: 1024px) 28vw, 80vw" className="w-full" imgClassName="h-auto w-full" />

                  {/* card text is a visual duplicate of the deal list → hidden from assistive tech */}
                  {showcase.cards.map((c, i) => (
                    <div
                      key={c.sector}
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 transition-[opacity,transform] duration-300 ease-out",
                        active === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                      )}
                    >
                      <div
                        className="absolute flex flex-col items-center justify-center text-center"
                        style={{ left: "16%", top: "16.5%", width: "70%", height: "17%" }}
                      >
                        <span className="font-mono-display tracking-[0.3em] text-brass" style={{ fontSize: "clamp(8px, 2.4cqw, 11px)" }}>
                          Deal 0{i + 1}
                        </span>
                        <span className="mt-[1cqw] font-medium leading-tight text-[#f4e3c3]" style={{ fontSize: "clamp(12px, 5.2cqw, 23px)" }}>
                          {c.sector}
                        </span>
                      </div>
                      <dl className="absolute flex flex-col justify-between" style={{ left: "16%", top: "41%", width: "68%", height: "36%" }}>
                        {(
                          [
                            ["Deal size", c.size],
                            ["Location", c.location],
                            ["Transaction", c.transaction],
                            ["Status", c.status],
                          ] as const
                        ).map(([k, v]) => (
                          <div key={k} className="flex items-baseline justify-between gap-[3cqw] border-b border-brass/30 pb-[1.6cqw]">
                            <dt className="font-mono-display tracking-[0.2em] text-brass" style={{ fontSize: "clamp(7px, 2.2cqw, 10px)" }}>{k}</dt>
                            <dd className="text-right text-[#f4e3c3]" style={{ fontSize: "clamp(11px, 4cqw, 17px)" }}>{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>

                {/* L4 brass seal — remounts (key) so it STAMPS on every deal change */}
                <div className="pointer-events-none absolute" style={{ right: LAYERS.seal.right, top: LAYERS.seal.top, width: LAYERS.seal.width }}>
                  <div key={active} className={cn("relative", seen ? "se-stamp" : "opacity-0")}>
                    <BrassSeal />
                  </div>
                </div>
              </div>
            </div>

            <CornerBrackets />

            <div
              className="absolute inset-x-0 bottom-0 z-[6] p-6 sm:p-7"
              style={{ background: "linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.7) 100%)" }}
            >
              <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-brass">Verified Off-Market</span>
              <p className="mt-1 max-w-sm text-[0.8125rem] text-foreground/75">
                Each opportunity carries verification status, intent confirmation and qualified fit before introduction.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Right: interactive deal list (controls the card) ─────────────── */}
        <div className="flex flex-col gap-4">
          <Reveal>
            <p className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">Illustrative Deal Sheet</p>
          </Reveal>

          <div
            className="flex flex-col gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {showcase.cards.map((card, i) => (
              <Reveal key={card.sector} delay={i * 0.08}>
                <button
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="block w-full text-left"
                  data-cursor="View"
                  aria-pressed={active === i}
                  aria-label={`View illustrative deal ${i + 1}: ${card.sector}, ${card.transaction}`}
                >
                  <GlassCard hover={false} className={cn("relative p-5 sm:p-6", active !== i && "opacity-70 hover:opacity-100")}>
                    {/* active outline fades in via opacity (no border/shadow transitions) */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute -inset-px border border-amber-500/60 transition-opacity duration-500",
                        active === i ? "opacity-100" : "opacity-0"
                      )}
                      style={{ boxShadow: "0 0 60px -20px rgba(255,122,26,0.5)" }}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">0{i + 1}</span>
                          <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">Verified</span>
                        </div>
                        <h3 className="mt-2 font-sans text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">{card.sector}</h3>
                      </div>
                      <VerifiedSeal size={36} label="Verified" />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
                      <DataRow label="Deal Size" value={card.size} />
                      <DataRow label="Location" value={card.location} />
                      <DataRow label="Transaction" value={card.transaction} />
                    </dl>
                    <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                      <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-400">Status · {card.status}</span>
                    </div>
                  </GlassCard>
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-2 flex items-start gap-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass/70" aria-hidden="true" />
              {showcase.disclaimer}
            </p>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-foreground/65">{label}</dt>
      <dd className="mt-1 text-[0.875rem] text-foreground/90">{value}</dd>
    </div>
  );
}
