"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * BackToTop — a small amber-bordered button that appears after scrolling past
 * the first viewport, and smoothly scrolls back to top on click.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const [inContact, setInContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.1);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // IntersectionObserver to detect when the contact section or footer is in view on mobile
    const contactEl = document.getElementById("contact");
    const footerEl = document.querySelector("footer");
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        setInContact(hit);
      },
      { rootMargin: "0px 0px 50px 0px", threshold: 0.05 }
    );
    if (contactEl) io.observe(contactEl);
    if (footerEl) io.observe(footerEl);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("serial-exit:scroll-top"))}
          className={`group fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center border border-white/15 bg-[#050505]/80 text-amber-300 backdrop-blur-md transition-all duration-400 hover:border-amber-500/70 hover:bg-amber-500/10 hover:shadow-[0_0_40px_-12px_rgba(255,122,26,0.6)] sm:bottom-8 sm:right-8 ${
            inContact ? "max-sm:pointer-events-none max-sm:opacity-0" : ""
          }`}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.4, ease: EASE }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp className="h-4 w-4 transition-transform duration-400 group-hover:-translate-y-0.5" strokeWidth={1.6} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
