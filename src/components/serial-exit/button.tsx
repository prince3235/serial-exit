"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Button — three variants:
 *  - solid: amber fill, dark text (primary CTA)
 *  - ghost: 1px hairline border, transparent, amber edge on hover/focus
 *  - link:  text + arrow, amber underline grows in
 *
 * Renders as <a> (next/link) when `href` is provided, <button> otherwise.
 *
 * Perf: every hover/focus effect is an overlay that fades in with `opacity`
 * (or grows with `transform`). No box-shadow / background-color transitions,
 * so interactions never trigger repaints of the surrounding layout.
 * `group` lives on the real interactive element so keyboard focus gets the
 * same treatment as hover.
 */
type Variant = "solid" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const interactive =
  "group relative inline-flex items-center justify-center align-middle whitespace-nowrap disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "text-[0.8125rem] min-h-[44px] px-4 py-2.5 tracking-wide",
  md: "text-sm min-h-[44px] px-6 py-3.5 tracking-wide",
  lg: "text-[0.95rem] min-h-[44px] px-8 py-4 tracking-wide",
};

const surface: Record<Variant, string> = {
  solid: "bg-amber-500 text-black",
  ghost: "border border-white/15 bg-white/[0.02] text-foreground",
  link: "text-foreground",
};

const GLOW_SOLID = "0 0 50px -12px rgba(255,122,26,0.7)";
const GLOW_GHOST = "0 0 40px -18px rgba(255,122,26,0.55)";

export function Button({
  children,
  href,
  variant = "solid",
  size = "md",
  className,
  onClick,
  type = "button",
  magnetic: _magnetic = false,
  withArrow = false,
  ariaLabel,
  disabled,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  magnetic?: boolean;
  withArrow?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const cls = cn(
    interactive,
    "gap-2 font-medium",
    variant === "link" ? "px-0 py-0" : sizes[size],
    surface[variant],
    className
  );

  const inner = (
    <>
      {variant === "solid" && (
        <>
          <span aria-hidden="true" className="se-cta-shine" />
          {/* lighter amber fades in over the base fill */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-amber-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          {/* soft glow, faded in via opacity */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{ boxShadow: GLOW_SOLID }}
          />
        </>
      )}
      {variant === "ghost" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px border border-amber-500/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ boxShadow: GLOW_GHOST }}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {withArrow && (
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
      </span>
      {variant === "link" && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-amber-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      )}
    </>
  );

  const isHash = href?.startsWith("#");
  const node = href ? (
    isHash ? (
      <a
        href={href}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cls}
        data-cursor={variant === "link" ? undefined : "Open"}
      >
        {inner}
      </a>
    ) : (
      <Link
        href={href}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cls}
        data-cursor={variant === "link" ? undefined : "Open"}
      >
        {inner}
      </Link>
    )
  ) : (
    <button type={type} aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );

  void _magnetic;
  return node;
}
