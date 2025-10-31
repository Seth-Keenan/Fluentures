
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "../components/Button";
import { LinkAsButton } from "../components/LinkAsButton";
import {
  fetchUserSettingsFromDB,
  saveUserSettingsToDB,
} from "@/app/lib/helpers/userSettingsClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLanguage,
  faGaugeHigh,
  faMoon,
  faSun,
  faFloppyDisk,
  faCircleCheck,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function SettingsPage() {
  const [language, setLanguage] = useState("Japanese");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Load existing settings
  useEffect(() => {
    (async () => {
      const db = await fetchUserSettingsFromDB();
      if (db) {
        setLanguage(db.language);
        setDifficulty(db.difficulty);
        setIsDarkMode(!!db.display);
        return;
      }
      // fallback to local
      const storedLang = localStorage.getItem("targetLanguage");
      const storedDiff = localStorage.getItem("difficultyLevel");
      const storedDisplay = localStorage.getItem("display");
      if (storedLang) setLanguage(storedLang);
      if (storedDiff) setDifficulty(storedDiff);
      if (storedDisplay !== null) setIsDarkMode(storedDisplay === "true");
    })();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const saved = await saveUserSettingsToDB({
      language,
      difficulty,
      display: isDarkMode,
    });
    setSaving(false);
    if (saved) {
      setLanguage(saved.language);
      setDifficulty(saved.difficulty);
      setIsDarkMode(!!saved.display);
      setSavedAt(Date.now());
      // sprinkle a little confetti-like pulse on save badge for 1.2s
      setTimeout(() => setSavedAt(null), 1400);
    } else {
      alert("Failed to save settings");
    }
  };

  const headerSubtitle = useMemo(
    () =>
      `Tune your learning experience — language, difficulty, and display preferences.`,
    []
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with gentle zoom */}
      <motion.img
        src="/desert.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft gradient/dim for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50 pointer-events-none" />

      {/* Glow blobs for depth */}
      {!prefersReducedMotion && (
        <>
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
        </>
      )}

      {/* Centered glass panel */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-[min(92vw,46rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-5 sm:p-7">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-semibold">
                Settings
              </h1>
              <p className="text-white/80 text-sm mt-1">{headerSubtitle}</p>
            </div>
            <LinkAsButton
              href="/home"
              className="rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 transition px-4 py-2 whitespace-nowrap"
              aria-label="Back to Home"
            >
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                Back
              </span>
            </LinkAsButton>
          </div>

          {/* Content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-5 p-5 sm:p-7"
          >
            {/* Language */}
            <motion.div
              variants={item}
              className="rounded-xl bg-white/90 text-gray-900 ring-1 ring-white/30 shadow-lg shadow-black/20 p-4"
            >
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <FontAwesomeIcon icon={faLanguage} className="h-4 w-4 text-indigo-600" />
                Target Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Japanese">Japanese</option>
                <option value="Spanish">Spanish</option>
                <option value="English">English</option>
              </select>
            </motion.div>

            {/* Difficulty */}
            <motion.div
              variants={item}
              className="rounded-xl bg-white/90 text-gray-900 ring-1 ring-white/30 shadow-lg shadow-black/20 p-4"
            >
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <FontAwesomeIcon icon={faGaugeHigh} className="h-4 w-4 text-indigo-600" />
                Difficulty
              </label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((d) => {
                  const active = difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={[
                        "rounded-lg px-3 py-2 text-sm font-medium transition ring-1",
                        active
                          ? "bg-indigo-500 text-white ring-white/20 shadow"
                          : "bg-white text-gray-800 hover:bg-gray-50 ring-gray-200",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Dark Mode */}
            <motion.div
              variants={item}
              className="rounded-xl bg-white/90 text-gray-900 ring-1 ring-white/30 shadow-lg shadow-black/20 p-4"
            >
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <FontAwesomeIcon
                  icon={isDarkMode ? faMoon : faSun}
                  className="h-4 w-4 text-indigo-600"
                />
                Display
              </label>

              {/* Fancy switch */}
              <button
                onClick={() => setIsDarkMode((v) => !v)}
                aria-pressed={isDarkMode}
                className={[
                  "mt-3 relative inline-flex h-9 w-[4.5rem] items-center rounded-full transition",
                  isDarkMode ? "bg-gray-900" : "bg-indigo-500",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow transition-transform",
                    isDarkMode ? "translate-x-[2.5rem]" : "translate-x-0",
                  ].join(" ")}
                />
                <span className="sr-only">Toggle Dark Mode</span>
              </button>
              <div className="mt-2 text-sm text-gray-700">
                {isDarkMode ? "Dark mode enabled" : "Light mode enabled"}
              </div>
            </motion.div>

            {/* Save row */}
            <motion.div
              variants={item}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 ring-1 ring-white/20 p-4 text-white"
            >
              <div className="inline-flex flex-wrap items-center gap-2 text-sm">
                <span className="opacity-90">Preview:</span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 ring-1 ring-white/20">
                  {language}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 ring-1 ring-white/20">
                  {difficulty}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 ring-1 ring-white/20">
                  {isDarkMode ? "Dark" : "Light"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {savedAt && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/30"
                  >
                    <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" />
                    Saved
                  </motion.span>
                )}

                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="!rounded-lg !px-4 !py-2 !bg-indigo-500 hover:!bg-indigo-400 !text-white !ring-1 !ring-white/30 shadow-md inline-flex items-center gap-2"
                >
                  {saving ? (
                    <span className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faFloppyDisk} className="h-4 w-4" />
                  )}
                  <span>{saving ? "Saving..." : "Save Settings"}</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
