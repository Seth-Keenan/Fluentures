"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket, // Login
  faUserPlus,       // Signup
} from "@fortawesome/free-solid-svg-icons";
import { LinkAsButton } from "./components/LinkAsButton";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15, duration: 0.5 },
  },
} satisfies Variants;

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
} satisfies Variants;

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with gentle zoom */}
      <motion.img
        src="/desert.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft gradient/dim for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      {/* Glow blobs for depth */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Centered glass panel */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          className="w-[min(92vw,36rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="text-center"
          >
            <h1 className="text-white text-3xl sm:text-4xl font-semibold">
              Welcome to Fluentures
            </h1>
            <p className="mt-2 text-white/80 text-sm sm:text-base">
              Jump back in or create a new account to get started.
            </p>
          </motion.div>

          {/* Two fancy buttons */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Login */}
            <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <LinkAsButton
                href="/login"
                className="
                  group w-full justify-center
                  rounded-xl px-5 py-3
                  bg-white/90 !text-gray-900 hover:bg-white
                  shadow-lg shadow-black/20
                  ring-1 ring-white/30
                  transition duration-200
                  font-medium tracking-wide text-base
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                "
                aria-label="Log in"
              >
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon className="h-5 w-5 transition -translate-x-0 group-hover:-translate-x-0.5" icon={faRightToBracket} />
                  <span>Log in</span>
                </span>
              </LinkAsButton>
            </motion.div>

            {/* Sign up (accent) */}
            <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <LinkAsButton
                href="/signup"
                className="
                  group w-full justify-center
                  rounded-xl px-5 py-3
                  bg-indigo-500 text-white hover:bg-indigo-400
                  shadow-lg shadow-black/20
                  ring-1 ring-white/20
                  transition duration-200
                  font-semibold tracking-wide text-base
                  focus:outline-none focus:ring-2 focus:ring-white/80
                "
                aria-label="Sign up"
              >
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon className="h-5 w-5 transition group-hover:translate-x-0.5" icon={faUserPlus} />
                  <span>Sign up</span>
                </span>
              </LinkAsButton>
            </motion.div>
          </motion.div>

          {/* Tiny footer hint */}
          <p className="mt-6 text-center text-xs text-white/70">
            -camelCase-
          </p>
        </motion.div>
      </div>
    </div>
  );
}
