"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Button } from "../components/Button";
import { LinkAsButton } from "../components/LinkAsButton";

const card: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45 } },
};

const fieldClass =
  "w-full rounded-xl bg-white/90 text-gray-900 px-4 py-3 ring-1 ring-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function SettingsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState("Japanese");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [showPanel, setShowPanel] = useState(false); // reveal after intro image
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Delay to show the plain background image first
    const t = setTimeout(() => setShowPanel(true), 1000);

    // Load stored values (client-only)
    try {
      const storedLang = localStorage.getItem("targetLanguage");
      const storedDiff = localStorage.getItem("difficultyLevel");
      if (storedLang) setLanguage(storedLang);
      if (storedDiff) setDifficulty(storedDiff);
    } catch {}

    return () => clearTimeout(t);
  }, []);

  const saveSettings = () => {
    setSaving(true);
    try {
      localStorage.setItem("targetLanguage", language);
      localStorage.setItem("difficultyLevel", difficulty);
      setSaved(true);
      // brief pause so user sees the success state
      setTimeout(() => router.push("/"), 900);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Always-visible background image */}
      <img
        src="/ChatGPT Image Mar 31, 2025 at 12_13_22 PM.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dim overlay (for contrast) appears when panel shows */}
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: showPanel ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Intro state: just the image */}
      {!showPanel && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Settings card */}
      {showPanel && (
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            variants={card}
            initial="hidden"
            animate="show"
            className="w-[min(92vw,36rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8"
          >
            <h1 className="text-2xl sm:text-3xl font-semibold text-center text-white mb-6">
              Settings
            </h1>

            <div className="space-y-5">
              <div>
                <label htmlFor="language" className="block text-sm text-white/90 mb-1">
                  Target Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={fieldClass}
                >
                  <option value="Japanese">Japanese</option>
                  <option value="Spanish">Spanish</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm text-white/90 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={fieldClass}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {saved && (
                <div className="rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/40 text-emerald-200 px-3 py-2 text-sm">
                  Settings saved! Redirecting…
                </div>
              )}

              <div className="flex flex-col items-center gap-3 pt-2">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "Saving…" : "Save Settings"}
                </Button>
                <LinkAsButton href="/">Back</LinkAsButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
