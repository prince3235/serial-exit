import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * SectionHeading — eyebrow + title + optional intro, with consistent rhythm.
 * Standardized to LEFT alignment across all institutional sections for rhythmic predictability.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  className,
  titleClassName,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 text-left items-start", className)}>
      <Reveal>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "font-sans text-balance text-[1.875rem] leading-[1.08] tracking-[-0.02em] font-medium text-foreground sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]",
            titleClassName
          )}
        >
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.16}>
          <p className="max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
