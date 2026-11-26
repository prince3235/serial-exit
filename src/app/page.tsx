"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/serial-exit/navbar";
import { Hero } from "@/components/serial-exit/hero";
import { ProofStrip } from "@/components/serial-exit/proof-strip";
import { Contact } from "@/components/serial-exit/contact";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ChapterRail } from "@/components/serial-exit/chapter-rail";
import { BackToTop } from "@/components/serial-exit/back-to-top";

/* Below-the-fold sections beyond the initial fold are dynamically imported
   so they are code-split out of the initial JS chunk. */
const CoreIdea    = dynamic(() => import("@/components/serial-exit/core-idea").then(m => m.CoreIdea));
const Opportunities = dynamic(() => import("@/components/serial-exit/opportunities").then(m => m.Opportunities));
const WhySerialExit = dynamic(() => import("@/components/serial-exit/why-serial-exit").then(m => m.WhySerialExit));
const Process     = dynamic(() => import("@/components/serial-exit/process").then(m => m.Process));
const Showcase    = dynamic(() => import("@/components/serial-exit/showcase").then(m => m.Showcase));
const Faq         = dynamic(() => import("@/components/serial-exit/faq").then(m => m.Faq));
const OurPartners = dynamic(() => import("@/components/serial-exit/our-partners").then(m => m.OurPartners));
const CtaBand     = dynamic(() => import("@/components/serial-exit/cta-band").then(m => m.CtaBand));
const Footer      = dynamic(() => import("@/components/serial-exit/footer").then(m => m.Footer));

/**
 * Serial Exit — single-page marketing site.
 * Navbar → Hero → ProofStrip → CoreIdea → Opportunities → WhySerialExit →
 * Process → Showcase → Faq → OurPartners → CtaBand → Contact → Footer.
 */
export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
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
          <Faq />
          <OurPartners />
          <CtaBand />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
