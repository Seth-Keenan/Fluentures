// app/map/AnimatedBackground.tsx
"use client";

import { motion } from "framer-motion";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

type Props = {
  children?: React.ReactNode;
  name?: string; // optional override (defaults to Namib)
};

export default function AnimatedBackground({ children, name = "Namib Desert" }: Props) {
  const desert = deserts.find(d => d.name === name) ?? deserts[0];

  return (
    <PageBackground src={desert.src} alt={desert.name} wikiUrl={desert.wikiUrl}>
      {/* extra gradient layer */}
      {/* glow blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))" }}
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))" }}
        animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* page content */}
      <div className="relative z-10">{children}</div>
    </PageBackground>
  );
}
