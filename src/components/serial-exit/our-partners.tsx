"use client";

import Image from "next/image";
import { ourPartners } from "@/content/site";
import { SectionShell } from "./section-shell";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * OurPartners — compact, balanced two-partner showcase placed immediately
 * before the footer. Circular portrait/logo, name, designation, and short
 * description. Uses compositor-only hover animations (transform + opacity).
 */
export function OurPartners() {
  return (
    <SectionShell
      id="our-partners"
      className="border-t border-white/[0.06] bg-[#0B0B0C] py-14 sm:py-16 md:py-16 lg:py-20 xl:py-20"
    >
      {/* Compact centered header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Reveal>
          <Eyebrow index={ourPartners.index}>{ourPartners.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mx-auto max-w-xl font-sans text-[1.625rem] font-medium leading-[1.12] tracking-[-0.02em] text-foreground sm:text-[2rem] lg:text-[2.25rem]">
            {ourPartners.title}
          </h2>
        </Reveal>
        {ourPartners.intro && (
          <Reveal delay={0.12}>
            <p className="max-w-md text-[0.875rem] leading-relaxed text-muted-foreground">
              {ourPartners.intro}
            </p>
          </Reveal>
        )}
      </div>

      {/* Balanced 2-column side-by-side grid */}
      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-12">
        {ourPartners.people.map((person, i) => (
          <Reveal key={person.id} delay={0.08 + i * 0.08}>
            <PartnerCard person={person} />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

type Partner = (typeof ourPartners.people)[number];

function PartnerCard({ person }: { person: Partner }) {
  return (
    <article
      className={cn(
        "group glass-dark glass-dark-hover flex h-full flex-col items-center gap-4 px-6 py-7 text-center sm:px-7 sm:py-8"
      )}
    >
      {/* Circular portrait / logo container */}
      <div className="relative shrink-0">
        {/* Subtle brass outer ring that illuminates via opacity on hover (compositor-only) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-full border border-brass/45 opacity-35 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
        />
        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/[0.12] bg-[#0B0B0C] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] sm:h-28 sm:w-28">
          {person.photo ? (
            <Image
              src={person.photo}
              alt={`${person.name} — ${person.designation}`}
              fill
              className="object-cover object-top"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(255,122,26,0.12),transparent_70%)]">
              <span
                aria-hidden="true"
                className="font-mono-display text-sm tracking-[0.25em] text-brass/80 select-none"
              >
                {person.initials}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Partner identity & short description */}
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-sans text-[1.0625rem] font-medium tracking-[-0.01em] text-foreground sm:text-lg">
          {person.name}
        </h3>
        <p className="font-mono-display text-[0.625rem] tracking-[0.24em] text-amber-400/90">
          {person.designation}
        </p>
        {person.firm && (
          <p className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-foreground/50">
            {person.firm}
          </p>
        )}
        <p className="mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-muted-foreground sm:text-[0.875rem]">
          {person.bio}
        </p>
      </div>
    </article>
  );
}
