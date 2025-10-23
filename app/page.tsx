// app/page.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
  type Variants,
} from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faClock,
  faBookmark,
  faUsers,
  faBookOpen,
  faMapLocationDot,
  faFire,
  faStar,
  faLayerGroup,
  faListCheck,
  faChartLine,
  faTrophy,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import BackToTop from "./components/BackToTop";

/* -----------------------------
   Reveal helpers
------------------------------*/

function useRevealControls(amount = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount });
  const controls = useAnimation();
  useEffect(() => {
    controls.start(inView ? "show" : "hidden");
  }, [inView, controls]);
  return { ref, controls };
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

const containerStagger = (delay = 0.08): Variants => ({
  hidden: {},
  show: { transition: { when: "beforeChildren", staggerChildren: delay } },
});

/* -----------------------------
   Small components
------------------------------*/

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const { ref, controls } = useRevealControls(0.25);
  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
      className="rounded-xl bg-white/90 text-gray-900 p-6 sm:p-7 ring-1 ring-white/30 shadow-lg shadow-black/20"
      style={{ transformOrigin: "center" }}
    >
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-full bg-indigo-50 ring-1 ring-indigo-200">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-gray-700">{desc}</p>
    </motion.div>
  );
}

function Step({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const { ref, controls } = useRevealControls(0.25);
  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -3 }}
      className="rounded-xl bg-white/10 text-white ring-1 ring-white/20 shadow-lg shadow-black/10 p-5"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="mt-3 text-sm text-white/85">{desc}</p>
    </motion.div>
  );
}

// Count-up number that animates when first scrolled into view
function StatCount({
  to,
  suffix = "",
  duration = 1.2,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.5 });
  const mv = useMotionValue(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView && !started) {
      setStarted(true);
      animate(mv, to, { duration, ease: "easeOut" });
    }
  }, [inView, started, mv, to, duration]);

  useEffect(() => {
    const unsub = mv.on("change", (v) => {
      if (spanRef.current) spanRef.current.textContent = `${Math.round(v)}${suffix}`;
    });
    return () => unsub();
  }, [mv, suffix]);

  return (
    <div ref={containerRef}>
      <span ref={spanRef} />
    </div>
  );
}

/* -----------------------------
   Page
------------------------------*/

export default function LandingEngaging() {
  const prefersReducedMotion = useReducedMotion();

  // parallax on hero title
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, prefersReducedMotion ? 0 : -20]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.85]);

  // marquee labels — aligned to documented feature set
  const marquee = useMemo(
    () => [
      "Custom Lists",
      "Quizzes",
      "Flashcards",
      "Stories",
      "Sentences",
      "Definitions",
      "Points & Badges",
      "Friends",
      "Weekly Analytics",
      "Leaderboard",
      "Search",
    ],
    []
  );

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Background */}
      <motion.img
        src="/desert.png"
        alt="Background"
        className="fixed inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      {/* Decorative glow blobs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
            }}
            animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none fixed -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
            }}
            animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* HERO */}
      <section className="relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 pt-6">
        <motion.div
          className="w-[min(92vw,52rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-12"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center">
            <motion.h1
              className="text-white text-3xl sm:text-5xl font-semibold leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
            >
              Fluentures makes language learning
              <span className="relative whitespace-nowrap">
                <span className="mx-2 px-2 rounded-lg bg-indigo-500/80">consistent</span>
              </span>
              and
              <span className="relative whitespace-nowrap">
                <span className="mx-2 px-2 rounded-lg bg-amber-400/80">fun</span>
              </span>
              !
            </motion.h1>
            <motion.p
              className="mt-4 text-white/85 text-base sm:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              Create your own vocabulary lists, practice with quizzes, flashcards, stories and
              sentence-building, save definitions, and share your weekly progress with friends.
            </motion.p>

            {/* animated badges – mapped to documented features */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: faLayerGroup, text: "Custom lists & Preferred Language" },
                { icon: faListCheck, text: "Quizzes" },
                { icon: faWandMagicSparkles, text: "Stories & Sentences" },
                { icon: faBookmark, text: "Definitions & Examples" },
                { icon: faFire, text: "Progress & Consistency" },
                { icon: faUsers, text: "Friends" },
              ].map(({ icon, text }) => (
                <motion.span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-white/95 ring-1 ring-white/20"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.6 }}
                  transition={{ duration: 0.4 }}
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                  <span className="text-sm">{text}</span>
                </motion.span>
              ))}
            </div>

            <motion.p
              className="mt-5 text-white text-base sm:text-lg"
            >
              -camelCase-
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="relative z-10 px-0 py-6">
        <div className="overflow-hidden">
          <div className="flex gap-6 whitespace-nowrap animate-[marquee_22s_linear_infinite] px-6">
            {marquee.concat(marquee).map((label, idx) => (
              <span
                key={`${label}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 ring-1 ring-white/20"
              >
                <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </span>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-4 py-14 sm:py-16">
        <div className="mx-auto w-[min(92vw,70rem)]">
          <motion.h2
            className="text-white text-2xl sm:text-3xl font-semibold text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.25 }}
            transition={{ duration: 0.5 }}
          >
            Everything you need to stay consistent and engaged
          </motion.h2>
          <motion.p
            className="text-white/80 text-center mt-2"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Build custom lists, learn in multiple ways, and see your progress over time.
          </motion.p>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8 sm:gap-y-10 lg:gap-y-12">
            <FeatureCard
              icon={<FontAwesomeIcon icon={faLayerGroup} className="h-5 w-5 text-indigo-600" />}
              title="Custom Vocabulary Lists"
              desc="Create your own lists on seletected language and organize them the way you like."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faListCheck} className="h-5 w-5 text-indigo-600" />}
              title="Study Modes"
              desc="Quizzes, story generation, and sentence practice to learn in context."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faBookmark} className="h-5 w-5 text-indigo-600" />}
              title="Definitions & Examples"
              desc="Look up meanings and ask words to deepen understanding into the chat."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-indigo-600" />}
              title="Friends & Motivation"
              desc="Connect with friends, share progress, and keep each other on track."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-indigo-600" />}
              title="Weekly Analytics"
              desc="Track time learned, words seen, most-used tools, and more."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faTrophy} className="h-5 w-5 text-indigo-600" />}
              title="Leaderboards"
              desc="Earn points, and climb the leaderboard."
            />
          </div>
        </div>
      </section>

      {/* STATS (sample static counters) */}
      <section className="relative z-10 px-4 py-10">
        <div className="mx-auto w-[min(92vw,70rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={12450} suffix="+" />
              </div>
              <div className="text-white/80 text-sm mt-1">XP earned</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={732} />
              </div>
              <div className="text-white/80 text-sm mt-1">Minutes learning</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={86} />
              </div>
              <div className="text-white/80 text-sm mt-1">Words saved</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={12} />
              </div>
              <div className="text-white/80 text-sm mt-1">Day streak</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-4 py-12">
        <div className="mx-auto w-[min(92vw,70rem)]">
          <motion.h2
            className="text-white text-2xl sm:text-3xl font-semibold text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.25 }}
            transition={{ duration: 0.5 }}
          >
            How it works
          </motion.h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Step
              icon={<FontAwesomeIcon icon={faMapLocationDot} className="h-5 w-5" />}
              title="1. Create a list"
              desc="Pick a theme and add 3–20 words to your custom list."
            />
            <Step
              icon={<FontAwesomeIcon icon={faBookOpen} className="h-5 w-5" />}
              title="2. Practice daily"
              desc="Use quizzes, flashcards, stories, and sentence-building to learn in context."
            />
            <Step
              icon={<FontAwesomeIcon icon={faClock} className="h-5 w-5" />}
              title="3. Track progress"
              desc="See weekly analytics, earn points & badges, and invite friends."
            />
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative z-10 px-4 pb-14">
        <div className="mx-auto w-[min(92vw,60rem)] text-center">
          <motion.h3
            className="text-white text-xl sm:text-2xl font-semibold"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            Ready to start your journey?
          </motion.h3>
          <motion.p
            className="text-white/85 mt-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            Use the <span className="font-semibold">Sign in</span> or{" "}
            <span className="font-semibold">Sign up</span> buttons in the top-right navbar.
          </motion.p>
        </div>
      </section>

      {/* Spacer + BackToTop */}
      <div className="h-10" />
      <BackToTop threshold={300} />
    </div>
  );
}
