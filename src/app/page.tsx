"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Navbar } from "@/components/serial-exit/navbar";
import { Hero } from "@/components/serial-exit/hero";
import { CoreIdea } from "@/components/serial-exit/core-idea";
import { Opportunities } from "@/components/serial-exit/opportunities";
import { Process } from "@/components/serial-exit/process";
import { Showcase } from "@/components/serial-exit/showcase";
import { Partners } from "@/components/serial-exit/partners";
import { Comparison } from "@/components/serial-exit/comparison";
import { Mission } from "@/components/serial-exit/mission";
import { Contact } from "@/components/serial-exit/contact";
import { Footer } from "@/components/serial-exit/footer";
import { BackToTop } from "@/components/serial-exit/back-to-top";
import { ChapterRail } from "@/components/serial-exit/chapter-rail";
import { ScrollProgress } from "@/components/ui/scroll-progress";

/* The portal is only needed after a click — keep it out of the initial bundle. */
const PartnerPortal = dynamic(() => import("@/components/serial-exit/partner-portal").then((m) => m.PartnerPortal), {
  ssr: false,
});

/**
 * Serial Exit — single-page marketing site.
 * Navbar → Hero → CoreIdea → Opportunities → Process → Showcase → Partners →
 * Comparison → Mission → Contact → Footer, plus a server-gated Partner Portal overlay.
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
          <CoreIdea />
          <Opportunities />
          <Process />
          <Showcase />
          <Partners />
          <Comparison />
          <Mission />
          <Contact />
        </main>
        <Footer onOpenPortal={openPortal} />
      </div>
      {portalOpen && <PartnerPortal open={portalOpen} onClose={closePortal} />}
    </>
  );
}
