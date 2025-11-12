// app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useDisplayName } from "@/app/lib/hooks/useDisplayName";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faUsers,
  faMapLocationDot,
  faBookOpen,
  faCircleUser,
  faArrowRight,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import SettingsButtonGear from "@/app/components/SettingsButton";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

type Dest = { label: string; href: string; icon: IconDefinition; description: string };

const DESTINATIONS: Dest[] = [
  { label: "Social",   href: "/social",  icon: faUsers,          description: "Share progress with your friends" },
  { label: "Map",      href: "/map",     icon: faMapLocationDot, description: "Jump to your oases and explore" },
  { label: "Log Book", href: "/logbook", icon: faBookOpen,       description: "Review stories, quizzes, and notes" },
];

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { name: displayName, loading: nameLoading } = useDisplayName();

  const desert = deserts.find(d => d.name === "Sahara Desert")!;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
      <PageBackground
      src={desert.src}
      alt={desert.name}
      wikiUrl={desert.wikiUrl}
      >
        <div className="relative min-h-screen w-full overflow-hidden">
          {/* Aurora blobs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
            style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))" }}
            animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 18, 0], x: [0, 12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))" }}
            animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -16, 0], x: [0, -10, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Contrast + grain */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
              backgroundSize: "160px 160px",
            }}
          />

          {/* Centered glass panel — narrower, taller */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="w-[min(92vw,66rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl px-6 py-10 sm:px-8 sm:py-12"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className="text-center"
              >
                <h1 className="text-white text-3xl sm:text-4xl font-semibold">
                  {nameLoading ? "Welcome…" : `Welcome, ${displayName}!`}
                </h1>
                <p className="mt-2 text-white/80 text-sm sm:text-base">
                  Pick where you’d like to go next.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-white/90 ring-1 ring-white/20">
                  <FontAwesomeIcon icon={faCircleUser} className="h-4 w-4" />
                  <span className="text-sm">{nameLoading ? "Loading…" : displayName}</span>
                </div>
              </motion.div>

              {/* Glass buttons — taller; grid wraps 1 → 2 → 3 */}
              <motion.div
                variants={container}
                initial="hidden"
                animate={ready ? "show" : "hidden"}
                className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {DESTINATIONS.map((d) => (
                  <motion.div
                    key={d.href}
                    variants={item}
                    style={{ transformPerspective: 900 }}
                    whileHover={{
                      y: -3,
                      rotateX: prefersReducedMotion ? 0 : 2,
                      rotateY: prefersReducedMotion ? 0 : -2,
                      transition: { type: "spring", stiffness: 200, damping: 16 },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    {/* subtle outer glow (white, glassy) */}
                    <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-white/20 blur-[6px] opacity-30 group-hover:opacity-50 transition" />
                    <LinkAsButton
                      href={d.href}
                      className="
                        cursor-pointer
                        group relative w-full overflow-hidden justify-between items-center
                        rounded-2xl px-5 py-5
                        bg-white/15 !text-white hover:bg-white/25
                        shadow-xl shadow-black/30 ring-1 ring-white/25
                        transition
                        focus:outline-none focus:ring-2 focus:ring-white/70
                        min-h-[5.25rem]
                      "
                      aria-label={d.label}
                    >
                      {/* shine */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -left-1/2 top-0 h[150%] w-[60%] -rotate-12 translate-x-[-40%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 blur-md transition duration-700 group-hover:translate-x-[140%] group-hover:opacity-100"
                      />
                      {/* icon + copy */}
                      <span className="inline-flex items-center gap-4 min-w-0">
                        <span className="relative grid h-10 w-10 place-items-center shrink-0">
                          <span className="absolute h-11 w-11 rounded-full bg-white/20 ring-1 ring-white/30" />
                          <FontAwesomeIcon
                            className="relative h-5 w-5 text-white transition-transform group-hover:-translate-y-0.5"
                            icon={d.icon}
                          />
                        </span>
                        <span className="min-w-0 text-left">
                          <span className="block text-base font-semibold leading-tight truncate">
                            {d.label}
                          </span>
                          <span className="hidden sm:block text-xs text-white/80 truncate">
                            {d.description}
                          </span>
                        </span>
                      </span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5 shrink-0 hidden sm:block"
                      />
                    </LinkAsButton>
                  </motion.div>
                ))}
              </motion.div>

              <p className="mt-8 text-center text-xs text-white/70">
                Explore, connect, and keep track of your journey.
              </p>
            </motion.div>
          </div>

        <div className="fixed bottom-4 right-4  z-50 pointer-events-auto">
          <SettingsButtonGear />
        </div>
      </div>
    </PageBackground>
  );
}