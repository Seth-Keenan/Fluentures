// app/oasis/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faBookOpen,
  faPenNib,
  faWandMagicSparkles,
  faArrowLeft,
  faTree,
} from "@fortawesome/free-solid-svg-icons";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

const looksOpaqueId = (v: string) =>
  !!v && /^(?:[0-9a-f]{12,}|[0-9a-f-]{12,}|[a-z0-9]{16,})$/i.test(v);

export default function OasisHubPage() {
  const search = useSearchParams();
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const oasisId = search?.get("id") ?? "";
  const hideId = looksOpaqueId(oasisId);

  const oasisTitle = useMemo(() => {
    if (!oasisId) return "Your Oasis";
    return hideId ? "Oasis" : `Oasis – ${oasisId}`;
  }, [oasisId, hideId]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background (parallax zoom) */}
      <motion.img
        src="/desert.png"
        alt="Desert background"
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise for texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />

      {/* Heat-haze band */}
      <div className="pointer-events-none absolute inset-x-0 top-[20%] h-12 opacity-60">
        <motion.div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
            filter: "blur(6px)",
          }}
          animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Aurora blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 16, 0], x: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -14, 0], x: [0, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Contrast veil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      {/* Shell (narrower overall to make cards smaller horizontally) */}
      <div className="relative z-10 mx-auto flex min-h-screen w-[min(92vw,56rem)] flex-col items-center justify-center p-4">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <FontAwesomeIcon icon={faTree} className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <h1
                  className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-2xl font-semibold leading-tight text-transparent sm:text-3xl drop-shadow-[0_2px_10px_rgba(255,255,255,0.12)]"
                  title={oasisId ? `Oasis ID: ${oasisId}` : undefined}
                >
                  {oasisTitle}
                </h1>
                <p className="text-white/85 text-sm">
                  Practice, read, build sentences, or edit this oasis.
                </p>
              </div>
            </div>

            {/* Back to map */}
            <div className="flex items-center gap-3">
              <LinkAsButton
                href="/map"
                className="
                  !cursor-pointer rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30
                  transition !px-5 !py-2.5
                  min-w-[8.5rem] justify-center shrink-0 whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-white/70
                "
                aria-label="Back to map"
              >
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                  Back to Map
                </span>
              </LinkAsButton>
            </div>
          </div>
        </motion.div>

        {/* Actions grid (narrower cards: smaller gap & inner padding) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="mt-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {[
            {
              href: `/oasis/quiz${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
              icon: faCircleQuestion,
              title: "Quiz",
              desc: "Test yourself with targeted questions.",
              aria: "Open Quiz",
            },
            {
              href: `/oasis/story${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
              icon: faBookOpen,
              title: "Story",
              desc: "Immerse in context with short tales.",
              aria: "Read Story",
            },
            {
              href: `/oasis/sentences${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
              icon: faPenNib,
              title: "Sentences",
              desc: "Craft example sentences and variations.",
              aria: "Build Sentences",
            },
            {
              href: `/oasis/edit${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
              icon: faWandMagicSparkles,
              title: "Edit Oasis",
              desc: "Tweak words, hints, and difficulty.",
              aria: "Edit Oasis",
            },
          ].map(({ href, icon, title, desc, aria }) => (
            <motion.div
              key={title}
              variants={item}
              className="relative rounded-2xl ring-1 ring-white/15 backdrop-blur-xl shadow-2xl group bg-white/10"
              style={{ transformPerspective: 800 }}
              whileHover={{
                y: -6,
                rotateX: prefersReducedMotion ? 0 : 2,
                rotateY: prefersReducedMotion ? 0 : -2,
                transition: { type: "spring", stiffness: 180, damping: 15 },
              }}
              whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              {/* Subtle diagonal shimmer (indigo/cyan tint) */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.10) 40%, transparent 60%)",
                  maskImage:
                    "radial-gradient(200% 60% at 0% 0%, black 30%, transparent 65%)",
                  WebkitMaskImage:
                    "radial-gradient(200% 60% at 0% 0%, black 30%, transparent 65%)",
                }}
              />
              {/* Gentle border tint on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-indigo-300/30 transition" />

              <LinkAsButton
                href={href}
                className="
                  !cursor-pointer group flex w-full items-center justify-between
                  rounded-2xl px-5 py-5 min-h-[6.75rem]
                  bg-transparent !text-white text-left
                  transition focus:outline-none focus:ring-2 focus:ring-white/70
                "
                aria-label={aria}
              >
                <div className="inline-flex items-center gap-3">
                  <span className="relative grid h-7 w-7 place-items-center">
                    {/* soft halo */}
                    <span
                      aria-hidden
                      className="absolute h-8 w-8 rounded-full ring-1 ring-white/25 bg-white/15 transition-transform duration-300 group-hover:scale-110"
                    />
                    <FontAwesomeIcon
                      icon={icon}
                      className="relative h-4 w-4 transition-transform group-hover:-translate-y-0.5"
                    />
                  </span>
                  <div className="leading-tight">
                    <div className="text-base font-semibold">{title}</div>
                    <div className="text-[13px] text-white/80">{desc}</div>
                  </div>
                </div>
              </LinkAsButton>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer tip */}
        <p className="mt-6 text-center text-xs text-white/75">
          Tip: Each section is tailored to this oasis—quiz yourself, read context, or craft sentences.
        </p>
      </div>
    </div>
  );
}
