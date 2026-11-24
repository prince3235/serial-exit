import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Analytics } from "@/components/providers/analytics";
import { ServiceWorkerRegistrar } from "@/components/providers/service-worker-registrar";
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Grain } from "@/components/ui/grain";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, THEME_COLOR } from "@/lib/site";

/* Fonts are self-hosted (no third-party request, no render-blocking CSS).
   Only the faces the UI actually uses are shipped: 5 files, down from 9.
   Mono is a small accent, so it doesn't compete for preload. */
const interTight = localFont({
  src: [
    { path: "../../public/fonts/inter-tight-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/inter-tight-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-sans-tight",
  display: "swap",
  fallback: ["system-ui", "Arial"],
});

const jetbrainsMono = localFont({
  src: [
    { path: "../../public/fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono-display",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});

const instrumentSerif = localFont({
  src: [
    { path: "../../public/fonts/instrument-serif-400i.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif-italic",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "off-market deals",
    "deal origination",
    "M&A India",
    "business acquisition India",
    "private equity India",
    "growth capital",
    "strategic acquisitions",
    "investment banks India",
    "family office",
    "search fund",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Serial Exit — Verified Off-Market Deal Origination",
    description:
      "Connect with confidential, verified business opportunities before they reach the public market. Trusted by M&A advisors, investment firms and strategic acquirers across India.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Serial Exit — Verified Off-Market Deal Origination",
    description: "Connect with confidential, verified business opportunities before they reach the public market.",
  },
  category: "financial services",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, email: false, address: false },
  // Paste your Search Console token into NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to verify the domain.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Structured data. Contact details are intentionally omitted until real values are in content/site.ts. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      alternateName: "Serial Exit Deal Origination",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      description:
        "Verified off-market deal origination platform connecting M&A advisors, investment firms and strategic acquirers with confidential, verified business opportunities in India.",
      areaServed: { "@type": "Country", name: "India" },
      slogan: "Verified Off-Market Opportunities. Trusted Partners. Better Transactions.",
      knowsAbout: [
        "M&A deal origination",
        "Off-market opportunities",
        "Business sales",
        "Acquisitions",
        "Growth capital",
        "Debt financing",
        "Strategic partnerships",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${interTight.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}>
        {/* First focusable element on the page (WCAG 2.4.1 Bypass Blocks) */}
        <a href="#main" className="se-skip">
          Skip to content
        </a>
        <AppProviders>
          <Grain />
          <CursorSpotlight />
          <CustomCursor />
          <Analytics />
          <ServiceWorkerRegistrar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
