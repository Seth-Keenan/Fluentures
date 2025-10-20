// app/components/Reveal.tsx
"use client";

import { motion, useAnimation, useInView, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";

/** Default fade-up with slight blur */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

/**
 * Reveal: plays animation when in view, resets to hidden when out of view,
 * so it can play again next time it enters.
 */
export function Reveal({
  children,
  variants = fadeInUp,
  className,
  amount = 0.25, // 0..1 portion of element that must be visible
}: {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount }); // ⬅️ removed `margin` to avoid TS error
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("show");
    else controls.start("hidden"); // reset to allow replay
  }, [inView, controls]);

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

/** Container that staggers its children; also resets when leaving view. */
export function RevealSection({
  children,
  delay = 0.08,
  className,
  amount = 0.25,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount }); // ⬅️ removed `margin` here as well
  const controls = useAnimation();

  useEffect(() => {
    controls.start(inView ? "show" : "hidden");
  }, [inView, controls]);

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: delay, when: "beforeChildren" } },
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.section>
  );
}
