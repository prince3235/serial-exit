"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Route-level error boundary: a failure in one section never white-screens the whole site. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#050505] px-6 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="max-w-xl text-3xl font-medium tracking-tight text-[#f4f1ec] sm:text-4xl">
        We hit an unexpected error loading this page.
      </h1>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-[#ff7a1a] px-6 py-3 text-sm font-medium text-black hover:bg-[#ff9a4d]"
        >
          Try again
        </button>
        <Link href="/" className="border border-white/20 px-6 py-3 text-sm text-[#f4f1ec] hover:border-[#ff7a1a]">
          Back to home
        </Link>
      </div>
    </main>
  );
}
