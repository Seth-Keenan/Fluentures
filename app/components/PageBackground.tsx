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
      {/* Nah bestie keeping this in and getting rid of the individual page gradiants */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/30 pointer-events-none" />

      {/* Noise overlay in progress */}
      <div
        className="
        pointer-events-none
        absolute inset-0
      
        bg-repeat
        mix-blend-overlay
        opacity-[.45]          
        blur-[1.5px]            /* slight blur */
        scale-[1.3]             /* amplifies grain size */
        "
      />


      {/* Info button */}
      {wikiUrl && (
        <Link
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-24 right-4 z-20 flex items-center justify-center rounded-full bg-black/20 p-2 text-gray-300 backdrop-blur-md hover:bg-black/60 transition"
          aria-label={`More information about ${alt}`}
        >
          <Info className="h-5 w-5" />
        </Link>
      )}

      {/* Page content */}
      <div className="relative z-10 pt-24">{children}</div>
    </div>
  );
}
