import { cn } from "@/lib/utils";

/**
 * GlassCard — dark glass surface with hairline border, faint inner glow.
 * Picks up an amber edge-light on hover via the .glass-dark-hover utility.
 */
export function GlassCard({
  children,
  className,
  hover = true,
  ...rest
}: {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-dark relative rounded-[4px] border border-border-subtle",
        hover && "glass-dark-hover hover-lift",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
