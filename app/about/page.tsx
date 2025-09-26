"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

export default function AboutPage() {
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
          className="w-[min(92vw,60rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.h1 variants={item} className="text-white text-3xl sm:text-4xl font-semibold">
              About Fluentures
            </motion.h1>
            <motion.p variants={item} className="text-white/85">
              Fluentures helps you build language skills through lightweight daily practice,
              trackable progress, and playful UI.
            </motion.p>

            <motion.section variants={item} className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/90 text-gray-900 p-5 ring-1 ring-white/30 shadow-lg shadow-black/20">
                <h2 className="font-semibold text-lg">Our mission</h2>
                <p className="mt-2 text-sm text-gray-700">
                  Make language learning accessible, delightful, and measurable for everyone.
                </p>
              </div>
              <div className="rounded-xl bg-white/90 text-gray-900 p-5 ring-1 ring-white/30 shadow-lg shadow-black/20">
                <h2 className="font-semibold text-lg">What we’re building</h2>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Daily progress tracking (XP, time, streaks)</li>
                  <li>Save & revisit vocabulary with examples</li>
                  <li>Social features for accountability</li>
                  <li>Friendly, fast UI on any device</li>
                </ul>
              </div>
            </motion.section>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
