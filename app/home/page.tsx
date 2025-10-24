"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import  SettingsButtonGear from "@/app/components/SettingsButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,            // Social
  faMapLocationDot,   // Map
  faBookOpen,         // Log Book
  faCircleUser,       // User badge
} from "@fortawesome/free-solid-svg-icons";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15, duration: 0.5 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

// Title-case a handle like "john_doe-123" -> "John Doe 123"
function titleize(handle: string) {
  return handle
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function HomePage() {
  const session = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Compute a friendly display name:
  const displayName = useMemo(() => {
    const user = session?.user;
    if (!user) return null;

    const m: Record<string, string | null | undefined> = user.user_metadata || {};
    // Try common metadata fields first
    const fromMeta =
      m.name ||
      m.full_name ||
      (m.first_name && m.last_name && `${m.first_name} ${m.last_name}`) ||
      (m.given_name && m.family_name && `${m.given_name} ${m.family_name}`) ||
      m.preferred_username ||
      m.username ||
      m.user_name;

    if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();

    // Fallback: email local part, title-cased
    const local = user.email?.split("@")[0] ?? "Friend";
    return titleize(local);
  }, [session]);

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50 pointer-events-none" />

      {/* Centered glass panel */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          className="w-[min(92vw,38rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="text-center"
          >
            <h1 className="text-white text-3xl sm:text-4xl font-semibold">
              {displayName ? `Welcome, ${displayName}!` : "Welcome!"}
            </h1>
            <p className="mt-2 text-white/80 text-sm sm:text-base">
              Pick where you’d like to go next.
            </p>

            {/* Session badge (shows name instead of email) */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-white/90 ring-1 ring-white/20">
              <FontAwesomeIcon icon={faCircleUser} className="h-4 w-4" />
              <span className="text-sm">
                {displayName ? displayName : "Guest"}
              </span>
            </div>
          </motion.div>

          {/* Menu */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {/* Social */}
            <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <LinkAsButton
                href="/social"
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
              >
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon className="h-5 w-5 transition group-hover:-translate-y-0.5" icon={faUsers} />
                  <span>Social</span>
                </span>
              </LinkAsButton>
            </motion.div>

            {/* Map */}
            <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <LinkAsButton
                href="/map"
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
              >
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon className="h-5 w-5 transition group-hover:-translate-y-0.5" icon={faMapLocationDot} />
                  <span>Map</span>
                </span>
              </LinkAsButton>
            </motion.div>

            {/* Log Book */}
            <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <LinkAsButton
                href="/logbook"
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
              >
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon className="h-5 w-5 transition group-hover:-translate-y-0.5" icon={faBookOpen} />
                  <span>Log Book</span>
                </span>
              </LinkAsButton>
            </motion.div>
          </motion.div>

          {/* Tiny footer hint */}
          <p className="mt-6 text-center text-xs text-white/70">
            Explore, connect, and keep track of your journey.
          </p>
        </motion.div>
      </div>
      
    {/*I am just placing setting button in bottom right corner. Feel free to move or reposisiton. */}
    <div className="fixed bottom-4 right-4  z-50 pointer-events-auto">
      <SettingsButtonGear />
    </div>

    
    </div>
  );
}
