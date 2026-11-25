"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useId, useRef, useState } from "react";
import { process } from "@/content/site";
import { safeRange } from "@/lib/scroll-range";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

/**
 * Process — pinned, CONTINUOUSLY scrubbed sequence on desktop; vertical stepper below lg.
 *
 * How it stays smooth:
 *  - Scroll progress is smoothed once with a spring and every visual is a pure
 *    function of it: neighbouring steps hand over across a short zone around
 *    each boundary, so nothing "snaps" and nothing is skipped on fast scrolls.
 *  - Only opacity / transform are driven (no layout, no paint), and there is no
 *    React state update per scroll tick (state changes only at step boundaries,
 *    for aria-current).
 *  - Every range goes through safeRange(): out-of-range / non-increasing
 *    offsets would crash Chrome's native scroll-timeline path.
 */
const STEPS = process.steps;
const N = STEPS.length;
const ROW = 56; // px height of one rail row (marker maths relies on this being fixed)
const FADE = 0.05; // half-width of a cross-fade zone, as a fraction of total scroll
const BOUNDS = Array.from({ length: N - 1 }, (_, k) => (k + 1) / N); // step boundaries in [0,1]

export function Process() {
  return (
    <SectionShell id="process" className="border-t border-white/[0.06] bg-[#050505]">
      <SectionHeading index={process.index} eyebrow={process.eyebrow} title={process.title} intro={process.intro} />
      <div className="mt-8 hidden lg:mt-10 lg:block">
        <PinnedSequence />
      </div>
      <div className="mt-14 lg:hidden">
        <VerticalStepper />
      </div>
    </SectionShell>
  );
}

/**
 * opacity / y keyframes for step i. Cross-fades are SEQUENTIAL, not overlapping: the outgoing
 * step fades up and away in the first half of a boundary zone, a short gap follows, then the
 * incoming step rises in. (Stacked steps share one position, so overlapping fades would print
 * two texts on top of each other.)
 */
const GAP = FADE * 0.15;
function presence(i: number, shown = 1, hidden = 0, enterFrom = 28, exitTo = -28) {
  const input: number[] = [];
  const op: number[] = [];
  const y: number[] = [];
  if (i > 0) {
    const b = BOUNDS[i - 1];
    input.push(b + GAP, b + FADE);
    op.push(hidden, shown);
    y.push(enterFrom, 0);
  }
  if (i < N - 1) {
    const b = BOUNDS[i];
    input.push(b - FADE, b - GAP);
    op.push(shown, hidden);
    y.push(0, exitTo);
  }
  return { input: safeRange(input), op, y };
}

function PinnedSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const spring = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });
  const progress = reduce ? scrollYProgress : spring;

  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    setActive((prev) => (prev === next ? prev : next)); // re-renders only at step boundaries
  });

  // Marker + filled line travel one row per boundary, in lock-step with the cross-fades.
  const railIn = safeRange(BOUNDS.flatMap((b) => [b - FADE, b + FADE]));
  const railY = BOUNDS.flatMap((_, k) => [k * ROW, (k + 1) * ROW]);
  const markerY = useTransform(progress, railIn, railY);
  const fill = useTransform(progress, railIn, railY.map((v) => v / ((N - 1) * ROW)));

  return (
    <div ref={ref} style={{ height: `${N * 92}vh` }} className="relative">
      <div className="sticky top-0 flex h-[100svh] items-center justify-between overflow-hidden">
        {/* Left rail */}
        <div className="relative w-[38%] pr-10">
          <div className="relative" style={{ height: N * ROW }}>
            {/* track, filled line and gliding marker — all share x = 0 with the row dots */}
            <span aria-hidden="true" className="absolute left-0 w-px bg-white/10" style={{ top: ROW / 2, height: (N - 1) * ROW }} />
            <motion.span
              aria-hidden="true"
              className="absolute left-0 w-px origin-top bg-amber-500"
              style={{ top: ROW / 2, height: (N - 1) * ROW, scaleY: fill, boxShadow: "0 0 14px rgba(255,122,26,0.7)" }}
            />
            <motion.span
              aria-hidden="true"
              className="absolute left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500"
              style={{ top: ROW / 2, y: markerY, boxShadow: "0 0 16px 2px rgba(255,122,26,0.8)" }}
            />
            <ol>
              {STEPS.map((step, i) => (
                <StepLabel key={step.key} i={i} n={step.n} title={step.title} progress={progress} current={i === active} />
              ))}
            </ol>
          </div>
        </div>

        {/* Right: step detail (all stacked, cross-fading) + the evolving shard (focal moment) */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-8 pl-4">
          <div className="relative h-[48vh] min-w-0 flex-1">
            {STEPS.map((step, i) => (
              <StepDetail key={step.key} i={i} n={step.n} title={step.title} desc={step.desc} progress={progress} />
            ))}
          </div>
          <JourneyShard progress={progress} />
        </div>

        {/* Background numeral cross-fades with the step — visible ghost outline */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          {STEPS.map((step, i) => (
            <Numeral key={step.key} i={i} n={step.n} progress={progress} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepLabel({ i, n, title, progress, current }: { i: number; n: string; title: string; progress: MotionValue<number>; current: boolean }) {
  const p = presence(i, 1, 0.55);
  const opacity = useTransform(progress, p.input, p.op);
  return (
    <li aria-current={current ? "step" : undefined} className="relative flex items-center pl-8" style={{ height: ROW }}>
      <span aria-hidden="true" className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/70 bg-[#050505]" />
      <div className="flex items-baseline gap-4">
        {/* numeral stays at full amber (contrast); only the title dims */}
        <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">{n}</span>
        <motion.span style={{ opacity }} className="font-sans text-2xl font-medium tracking-[-0.01em] text-foreground">
          {title}
        </motion.span>
      </div>
    </li>
  );
}

function StepDetail({ i, n, title, desc, progress }: { i: number; n: string; title: string; desc: string; progress: MotionValue<number> }) {
  const p = presence(i);
  const opacity = useTransform(progress, p.input, p.op);
  const y = useTransform(progress, p.input, p.y);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span className="font-mono-display text-[0.6875rem] tracking-[0.3em] text-amber-500">
        Step {n} / 0{N}
      </span>
      <h3 className="mt-4 font-sans text-5xl font-medium tracking-[-0.03em] text-foreground xl:text-6xl">{title}</h3>
      <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-foreground/75">{desc}</p>
    </motion.div>
  );
}

/** cumulative(i): fades in at boundary i-1 and STAYS (things that accumulate across steps). */
function cumulative(i: number) {
  const b = BOUNDS[i - 1];
  return { input: safeRange([b + GAP, b + FADE]), op: [0, 1] };
}

function Layer({ progress, input, op, children }: { progress: MotionValue<number>; input: number[]; op: number[]; children: React.ReactNode }) {
  const opacity = useTransform(progress, input, op);
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

/* Deterministic scatter (rounded so SSR Node and client V8 match identically) */
const frac = (n: number) => n - Math.floor(n);
const SCATTER = Array.from({ length: 34 }, (_, i) => ({
  x: Number((24 + frac(Math.sin(i * 12.9898) * 43758.5453) * 352).toFixed(2)),
  y: Number((24 + frac(Math.sin(i * 78.233) * 43758.5453) * 352).toFixed(2)),
  r: Number((1 + frac(Math.sin(i * 37.719) * 43758.5453) * 1.7).toFixed(2)),
}));
const A = "158,52 232,98 250,184 200,282 118,262 84,168 110,92"; // the opportunity (shard A)
const A_CENTER: [number, number] = [160, 170];
const B = "300,238 344,262 340,314 296,340 256,316 262,266"; // the counterparty (shard B)
const LINK = "M160 170 Q 232 252 300 290";

/**
 * One obsidian shard evolving across the five steps (decorative SVG, vector-sharp):
 * Source (scattered points) → Verify (outline + ring) → Qualify (facets + amber edge-light)
 * → Match (a second shard + dashed link) → Introduce (solid link, joined, glowing).
 * Every layer is an opacity function of scroll progress; no filters, no animated paint.
 */
function JourneyShard({ progress }: { progress: MotionValue<number> }) {
  const uid = useId().replace(/:/g, "");
  const gFacet = `shard-facet-${uid}`;
  const gGlow = `shard-glow-${uid}`;
  const p0 = presence(0);
  const p1 = presence(1);
  const p3 = presence(3);
  const c1 = cumulative(1);
  const c2 = cumulative(2);
  const c3 = cumulative(3);
  const c4 = cumulative(4);
  return (
    <div aria-hidden="true" className="pointer-events-none hidden aspect-square w-[clamp(260px,28vw,420px)] shrink-0 lg:block">
      <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id={gFacet} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb37a" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ff7a1a" stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id={gGlow}>
            <stop offset="0" stopColor="#ff9a4d" stopOpacity="0.65" />
            <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 01 Source: scattered points, one brighter */}
        <Layer progress={progress} input={p0.input} op={p0.op}>
          {SCATTER.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#d9a65a" opacity="0.55" />
          ))}
          <circle cx={A_CENTER[0]} cy={A_CENTER[1]} r="22" fill={`url(#${gGlow})`} />
          <circle cx={A_CENTER[0]} cy={A_CENTER[1]} r="4.5" fill="#ff9a4d" />
        </Layer>

        {/* 02 Verify: outline stays from here on; a dashed ring + tick appears for this step only */}
        <Layer progress={progress} input={c1.input} op={c1.op}>
          <polygon points={A} stroke="#d9a65a" strokeOpacity="0.85" strokeWidth="1.3" strokeLinejoin="round" />
        </Layer>
        <Layer progress={progress} input={p1.input} op={p1.op}>
          <circle cx={A_CENTER[0]} cy={A_CENTER[1]} r="128" stroke="#ff7a1a" strokeOpacity="0.55" strokeDasharray="3 7" />
          <path d="M138 176 l16 16 l30 -34" stroke="#ff9a4d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </Layer>

        {/* 03 Qualify: facets and amber edge-light stay from here on */}
        <Layer progress={progress} input={c2.input} op={c2.op}>
          <polygon points={A} fill={`url(#${gFacet})`} />
          {A.split(" ").map((pt, i) => (
            <line key={i} x1={A_CENTER[0]} y1={A_CENTER[1]} x2={pt.split(",")[0]} y2={pt.split(",")[1]} stroke="#ff9a4d" strokeOpacity="0.45" strokeWidth="0.9" />
          ))}
          <polygon points={A} stroke="#ff7a1a" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={A} stroke="#ff7a1a" strokeOpacity="0.14" strokeWidth="9" strokeLinejoin="round" />
        </Layer>

        {/* 04 Match: the counterparty shard joins; a dashed link is drawn for this step */}
        <Layer progress={progress} input={c3.input} op={c3.op}>
          <polygon points={B} fill={`url(#${gFacet})`} stroke="#d9a65a" strokeOpacity="0.85" strokeWidth="1.3" strokeLinejoin="round" />
        </Layer>
        <Layer progress={progress} input={p3.input} op={p3.op}>
          <path d={LINK} stroke="#ff9a4d" strokeOpacity="0.8" strokeWidth="1.4" strokeDasharray="4 7" strokeLinecap="round" />
        </Layer>

        {/* 05 Introduce: solid link, joined edge-light, soft glow at the meeting point */}
        <Layer progress={progress} input={c4.input} op={c4.op}>
          <circle cx="232" cy="236" r="70" fill={`url(#${gGlow})`} />
          <path d={LINK} stroke="#ff7a1a" strokeWidth="2" strokeLinecap="round" />
          <polygon points={B} stroke="#ff7a1a" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={B} stroke="#ff7a1a" strokeOpacity="0.14" strokeWidth="9" strokeLinejoin="round" />
        </Layer>
      </svg>
    </div>
  );
}

function Numeral({ i, n, progress }: { i: number; n: string; progress: MotionValue<number> }) {
  const p = presence(i, 0.12, 0);
  const opacity = useTransform(progress, p.input, p.op);
  return (
    <motion.span
      style={{ opacity }}
      className="absolute select-none font-mono-display text-[35vw] font-semibold leading-none text-amber-500/[0.10] [-webkit-text-stroke:1.5px_rgba(255,122,26,0.3)]"
    >
      {n}
    </motion.span>
  );
}

function VerticalStepper() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-amber-500 via-amber-500/40 to-white/10" />
      <ol className="flex flex-col gap-10">
        {STEPS.map((step, i) => (
          <Reveal key={step.key} delay={i * 0.05} as="li" className="relative pl-10">
            <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border border-amber-500/70 bg-[#050505]" />
            <div className="flex items-baseline gap-3">
              <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">{step.n}</span>
              <h3 className="font-sans text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">{step.title}</h3>
            </div>
            <p className="mt-2 max-w-md text-[0.875rem] leading-relaxed text-muted-foreground">{step.desc}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
