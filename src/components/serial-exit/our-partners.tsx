"use client";

import Image from "next/image";
import { Linkedin } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { ourPartners } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * OurPartners — balanced two-partner showcase placed before the footer.
 * Consistent monochrome portrait treatment with dark tone harmonization,
 * left-aligned section header, verified LinkedIn links, and optional credentials support.
 */
export function OurPartners() {
  const { t } = useI18n();

  return (
    <SectionShell
      id="our-partners"
      className="border-t border-white/[0.06] bg-[#0B0B0C]"
    >
      {/* Left-aligned header matching other major sections */}
      <SectionHeading
        index={t.ourPartners.index}
        eyebrow={t.ourPartners.eyebrow}
        title={t.ourPartners.title}
        intro={t.ourPartners.intro}
      />

      {/* Balanced 2-column side-by-side grid */}
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:gap-8">
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
        "group glass-dark glass-dark-hover flex h-full flex-col items-center gap-5 px-6 py-8 text-center sm:px-8 sm:py-9"
      )}
    >
      {/* Circular portrait container with unified monochrome tone */}
      <div className="relative shrink-0">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-full border border-brass/45 opacity-35 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
        />
        <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/[0.12] bg-[#0B0B0C] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] sm:h-32 sm:w-32">
          {person.photo ? (
            <Image
              src={person.photo}
              alt={`${person.name} — ${person.designation}`}
              fill
              unoptimized
              className="object-cover object-center grayscale contrast-[1.08] brightness-[0.96] transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100"
              sizes="(min-width: 640px) 256px, 224px"
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
        <h3 className="font-sans text-[1.125rem] font-medium tracking-[-0.01em] text-foreground sm:text-xl">
          {person.name}
        </h3>
        <p className="font-mono-display text-[0.6875rem] tracking-[0.24em] text-amber-400">
          {person.designation}
        </p>
        {person.firm && (
          <p className="font-mono-display text-[0.625rem] tracking-[0.2em] text-foreground/50">
            {person.firm}
          </p>
        )}
        {/* Optional credentials if provided */}
        {"credentials" in person && person.credentials ? (
          <p className="font-mono-display text-[0.625rem] tracking-[0.2em] text-brass/80">
            {person.credentials}
          </p>
        ) : null}

        <p className="mt-2 max-w-sm text-[0.875rem] leading-relaxed text-muted-foreground">
          {person.bio}
        </p>

        {/* LinkedIn icon link */}
        {"linkedin" in person && person.linkedin ? (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${person.name} on LinkedIn`}
            className="mt-4 inline-flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-3.5 py-1.5 font-mono-display text-[0.6875rem] tracking-[0.2em] text-foreground/75 transition-colors duration-300 hover:border-amber-500/50 hover:text-amber-300"
          >
            <Linkedin className="h-3.5 w-3.5 text-amber-400" />
            <span>LinkedIn</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
