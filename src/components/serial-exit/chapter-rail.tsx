"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Page chapters in scroll order (ids must exist in the DOM). */
const CHAPTERS = [
  { id: "top", label: "Intro" },
  { id: "core-idea", label: "Core idea" },
  { id: "opportunities", label: "What we originate" },
  { id: "process", label: "How it works" },
  { id: "showcase", label: "Verified deals" },
  { id: "comparison", label: "Why Serial Exit" },
  { id: "contact", label: "Contact" },
  { id: "our-partners", label: "Our Partners" },
] as const;

/**
 * ChapterRail — an editorial index on the right edge (xl screens and up).
 * The active chapter is a long amber tick; hovering or focusing any tick reveals its
 * number and name (labels never sit permanently over page content). Real links (keyboard + screen-reader friendly); smooth scrolling is handled by
 * the global anchor handler. Only transform/opacity transitions.
 */
export function ChapterRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Page chapters" className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 xl:block 2xl:right-5">
      <ol className="flex flex-col items-end">
        {CHAPTERS.map((c, i) => {
          const on = active === c.id;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                data-cursor="Go"
                aria-label={`Chapter ${i + 1}: ${c.label}`}
                aria-current={on ? "location" : undefined}
                className="group relative flex items-center justify-end gap-3 py-[7px] pl-6 outline-offset-2"
              >
                <span
                  className={cn(
                    "pointer-events-none flex translate-x-2 items-baseline gap-2 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  )}
                >
                  <span className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-brass">0{i + 1}</span>
                  <span className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-foreground/80">{c.label}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-px origin-right transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    on ? "w-7 scale-x-100 bg-amber-500" : "w-7 scale-x-[0.42] bg-white/45 group-hover:scale-x-75 group-hover:bg-brass group-focus-visible:scale-x-75 group-focus-visible:bg-brass"
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
