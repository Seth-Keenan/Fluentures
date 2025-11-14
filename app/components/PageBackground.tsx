// app/components/PageBackground.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Info } from "lucide-react";

type BackgroundProps = {
  src: string;
  alt: string;
  wikiUrl?: string; // optional
  children?: React.ReactNode;
};

export default function PageBackground({ src, alt, wikiUrl, children }: Readonly<BackgroundProps>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <motion.img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Overlay (optional, maybe take out??) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50 pointer-events-none" />

      {/* Info button */}
      {wikiUrl && (
        <Link
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-20 flex items-center justify-center rounded-full bg-black/20 p-2 text-gray-300 backdrop-blur-md hover:bg-black/60 transition"
          aria-label={`More information about ${alt}`}
        >
          <Info className="h-5 w-5" />
        </Link>
      )}

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
