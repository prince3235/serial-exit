"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Navbar } from "@/components/serial-exit/navbar";
import { Hero } from "@/components/serial-exit/hero";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ChapterRail } from "@/components/serial-exit/chapter-rail";
import { BackToTop } from "@/components/serial-exit/back-to-top";

/* All below-the-fold sections are dynamically imported so they are code-split
   out of the initial JS chunk. The Hero is above-the-fold so it is static. */
const ProofStrip  = dynamic(() => import("@/components/serial-exit/proof-strip").then(m => m.ProofStrip));
const CoreIdea    = dynamic(() => import("@/components/serial-exit/core-idea").then(m => m.CoreIdea));
const Opportunities = dynamic(() => import("@/components/serial-exit/opportunities").then(m => m.Opportunities));
const WhySerialExit = dynamic(() => import("@/components/serial-exit/why-serial-exit").then(m => m.WhySerialExit));
const Process     = dynamic(() => import("@/components/serial-exit/process").then(m => m.Process));
const Showcase    = dynamic(() => import("@/components/serial-exit/showcase").then(m => m.Showcase));
const OurPartners = dynamic(() => import("@/components/serial-exit/our-partners").then(m => m.OurPartners));
const Contact     = dynamic(() => import("@/components/serial-exit/contact").then(m => m.Contact));
const Footer      = dynamic(() => import("@/components/serial-exit/footer").then(m => m.Footer));

/* The portal is only needed after a click — keep it out of the initial bundle. */
const PartnerPortal = dynamic(() => import("@/components/serial-exit/partner-portal").then((m) => m.PartnerPortal), {
  ssr: false,
});

/**
 * Serial Exit — single-page marketing site.
 * Navbar → Hero → CoreIdea → Opportunities → Process → Showcase →
 * Contact → OurPartners → Footer, plus a server-gated Partner Portal overlay.
 */
export default function Home() {
  const [portalOpen, setPortalOpen] = useState(false);
  const openPortal = useCallback(() => setPortalOpen(true), []);
  const closePortal = useCallback(() => setPortalOpen(false), []);

  return (
    <>
      <ScrollProgress />
      <Navbar onOpenPortal={openPortal} />
      <BackToTop />
      <ChapterRail />
      <div className="flex min-h-screen flex-col">
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <Hero />
          <ProofStrip />
          <CoreIdea />
          <Opportunities />
          <WhySerialExit />
          <Process />
          <Showcase />
          <Contact />
          <OurPartners />
        </main>
        <Footer onOpenPortal={openPortal} />
      </div>
      {portalOpen && <PartnerPortal open={portalOpen} onClose={closePortal} />}
    </>
  );
}
