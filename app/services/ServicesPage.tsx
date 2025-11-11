"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,           // Learning
  faBookOpen,       // Log Book
  faUsers,          // Social
  faMapLocationDot, // Map
  IconDefinition,   // Typescript needs types this
} from "@fortawesome/free-solid-svg-icons";

const Card = ({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: IconDefinition;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="rounded-xl bg-white/90 text-gray-900 p-5 ring-1 ring-white/30 shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-3">
      <FontAwesomeIcon icon={icon} className="h-5 w-5 text-indigo-600" />
      <h3 className="font-semibold">{title}</h3>
    </div>
    <p className="mt-2 text-sm text-gray-700">{desc}</p>
  </motion.div>
);

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <motion.img
        src="/desert.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.main
          className="w-[min(92vw,64rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="text-white text-3xl sm:text-4xl font-semibold">Services</h1>
          <p className="mt-2 text-white/85">
            Tools that make consistent learning easy—and fun.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              title="Learning"
              desc="Learn language, keep a streak, and visualize progress over time."
              icon={faBolt}
            />
            <Card
              title="Log Book"
              desc="Review time spent, words saved, lists made, and favorites."
              icon={faBookOpen}
            />
            <Card
              title="Social"
              desc="See friends on the leaderboard and invite accountability buddies."
              icon={faUsers}
            />
            <Card
              title="Map"
              desc="Gamified environment for entertainment."
              icon={faMapLocationDot}
            />
          </div>
        </motion.main>
      </div>
    </div>
  );
}
