import { cn } from "@/lib/utils";
import { forwardRef } from "react";

/**
 * SectionShell — consistent section padding + max-width container.
 * 120-180px vertical padding desktop, scaled down on mobile.
 */
export const SectionShell = forwardRef<
  HTMLElement,
  {
    children: React.ReactNode;
    className?: string;
    id?: string;
    bleed?: boolean;
  }
>(function SectionShell({ children, className, id, bleed = false }, ref) {
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "relative w-full px-5 py-20 sm:px-8 sm:py-28 md:py-32 lg:px-12 lg:py-40 xl:py-48",
        className
      )}
    >
      {/* sections that start with a hairline get a brass diamond ornament on it */}
      {className?.includes("border-t") && <span aria-hidden="true" className="se-ornament" />}
      {bleed ? children : <div className="mx-auto w-full max-w-[1440px]">{children}</div>}
    </section>
  );
});
