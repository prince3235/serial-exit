import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * SectionHeading — eyebrow + title + optional intro, with consistent rhythm.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  align = "left",
  className,
  titleClassName,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered && "items-center text-center",
        className
      )}
    >
      <Reveal>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "font-sans text-balance text-[1.875rem] leading-[1.08] tracking-[-0.02em] font-medium text-foreground sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]",
            centered && "mx-auto max-w-3xl",
            titleClassName
          )}
        >
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              "max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base",
              centered && "mx-auto"
            )}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
