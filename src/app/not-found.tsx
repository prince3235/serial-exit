import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#050505] px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="max-w-xl text-3xl font-medium tracking-tight text-[#f4f1ec] sm:text-5xl">
        This page isn&apos;t on the market.
      </h1>
      <p className="max-w-md text-[#a8a29a]">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="bg-[#ff7a1a] px-6 py-3 text-sm font-medium text-black hover:bg-[#ff9a4d]">
        Back to home
      </Link>
    </main>
  );
}
