import { cn } from "@/lib/utils";

/**
 * Eyebrow — monospace, uppercase, wide-tracked label.
 * Optionally prefixed with a section index like "01 / VERIFIED".
 */
export function Eyebrow({
  children,
  index,
  className,
  withLine = true,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
  withLine?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-amber-500",
        className
      )}
    >
      {index && (
        <span className="font-mono-display text-[0.6875rem] tracking-[0.28em] text-amber-500">
          {index}
        </span>
      )}
      {index && withLine && (
        <span className="h-px w-6 bg-amber-500/40" aria-hidden="true" />
      )}
      <span className="font-mono-display text-[0.6875rem] tracking-[0.28em] uppercase text-amber-500">
        {children}
      </span>
    </div>
  );
}
