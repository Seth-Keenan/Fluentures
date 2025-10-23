"use client";

import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackToTop({
  threshold = 300,
  className = "",
}: {
  threshold?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > threshold);
  });

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <motion.button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={handleClick}
      className={[
        "fixed bottom-6 right-6 z-[60]",
        "rounded-full px-4 py-3",
        "backdrop-blur-xl bg-white/15 text-white",
        "ring-1 ring-white/30 shadow-xl shadow-black/20",
        "hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/80",
        "transition-colors",
        "cursor-pointer",
        className,
      ].join(" ")}
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      {/* Up arrow */}
      <svg width="18" height="18" viewBox="0 0 24 24" className="inline-block mr-2" aria-hidden="true">
        <path fill="currentColor" d="M12 5l7 7-1.4 1.4L13 9.8V20h-2V9.8L6.4 13.4 5 12z" />
      </svg>
      <span className="text-sm font-medium">Top</span>
    </motion.button>
  );
}
