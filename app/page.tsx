"use client";

import { motion, type Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { LinkAsButton } from "./components/LinkAsButton";

// Font Awesome (Free)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faRightToBracket, // Login
  faUserPlus,       // Signup
  faGear,           // Settings
  faHouse,          // Account Home
  faFlask,          // Testing features
} from "@fortawesome/free-solid-svg-icons";

type LinkItem = {
  href: string;
  label: string;
  icon: IconDefinition;
};

const links: LinkItem[] = [
  { href: "/login",   label: "Login",            icon: faRightToBracket },
  { href: "/signup",  label: "Signup",           icon: faUserPlus },
  { href: "/settings",label: "Settings",         icon: faGear },
  { href: "/home",    label: "Account Home",     icon: faHouse },
  { href: "/testing", label: "Testing features", icon: faFlask },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2, duration: 0.5 },
  },
} satisfies Variants;

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120 },
  },
} satisfies Variants;

export default function Home() {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 1000); // 1s intro
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src="/ChatGPT Image Mar 31, 2025 at 12_13_22 PM.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dim overlay after buttons appear */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: showButtons ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {!showButtons && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {showButtons && (
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10 w-[min(92vw,36rem)]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-white/90 text-2xl sm:text-3xl font-semibold text-center mb-6">
              Welcome to Fluentures!
            </h1>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-stretch space-y-4"
            >
              {links.map(({ href, label, icon }) => (
                <motion.div
                  key={href}
                  variants={item}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LinkAsButton
                    href={href}
                    className="
                      w-full justify-center
                      rounded-xl px-5 py-3
                      bg-white/90 !text-gray-900 hover:bg-white
                      shadow-lg shadow-black/20
                      ring-1 ring-white/30
                      transition-transform duration-200
                      font-medium tracking-wide text-base
                      focus:outline-none focus:ring-2 focus:ring-indigo-400
                    "
                  >
                    {/* icon + label */}
                    <span className="inline-flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={icon}
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </span>
                  </LinkAsButton>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
