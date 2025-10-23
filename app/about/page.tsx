// app/about/page.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,        // Mission
  faLayerGroup,  // What we build
  faHeart,       // Why it works
  faCheckCircle, // bullet embellishments
} from "@fortawesome/free-solid-svg-icons";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

function Card({
  icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className={[
        "relative overflow-hidden rounded-2xl p-5 sm:p-6",
        "bg-white/90 text-gray-900 ring-1 ring-white/30 shadow-lg shadow-black/20",
      ].join(" ")}
      style={{ transformOrigin: "center" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.06))",
        }}
      />

      <div className="relative inline-flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 ring-1 ring-indigo-200">
          <FontAwesomeIcon icon={icon} className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>

      <div className="relative mt-3 text-sm text-gray-700">{children}</div>

      <span
        aria-hidden
        className="pointer-events-none absolute -top-1/3 -left-1/3 h-[220%] w-[220%] rotate-12 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(40% 40% at 50% 50%, rgba(255,255,255,0.25), rgba(255,255,255,0))",
        }}
      />
    </motion.div>
  );
}

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
              About Fluentures 🐪
            </motion.h1>

            <motion.p variants={item} className="text-white/85">
              We’re camelCase - building a lighter, friendlier way to learn languages!
            </motion.p>

            <motion.section
              variants={container}
              className="grid gap-4 sm:grid-cols-3 group"
            >
              <Card icon={faFlag} title="Mission">
                Make language learning accessible, delightful, and measurable—so showing up every
                day feels easy.
              </Card>

              <Card icon={faLayerGroup} title="What we build">
                <ul className="mt-1.5 space-y-1.5">
                  {[
                    "Custom vocab lists",
                    "Quizzes, stories, sentences",
                    "Definitions & saved examples",
                    "Ask questions in chat while learning",
                    "Share progress with friends",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="mt-0.5 h-4 w-4 text-indigo-600"
                      />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card icon={faHeart} title="Why it works">
                <ul className="mt-1.5 space-y-1.5">
                  <li>
                    <strong>Consistency:</strong> small, daily wins that build momentum
                  </li>
                  <li>
                    <strong>Context:</strong> learn by using words in stories & sentences
                  </li>
                  <li>
                    <strong>Community:</strong> friends & gentle motivation
                  </li>
                </ul>
              </Card>
            </motion.section>

            <motion.p variants={item} className="text-white/75 text-sm">
              Ready to learn? Sign in or Sign up from the top-right.
            </motion.p>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
