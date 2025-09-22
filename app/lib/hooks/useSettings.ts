// useSettings.ts (your hook)
"use client";
import { useEffect, useState } from "react";
import {
  fetchUserSettingsFromDB,
  saveUserSettingsToDB,
  hasLoadedSettingsThisSession,
  getCachedSettings,
} from "@/app/lib/helpers/userSettingsClient";

export function useSettings() {
  const [language, setLanguage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (hasLoadedSettingsThisSession()) {
        const cached = getCachedSettings();
        if (cached) {
          setLanguage(cached.language);
          setDifficulty(cached.difficulty);
          setIsLoading(false);
          return;
        }
      }
      const dbSettings = await fetchUserSettingsFromDB(); // cached fetch
      if (dbSettings) {
        setLanguage(dbSettings.language);
        setDifficulty(dbSettings.difficulty);
      } else {
        const cached = getCachedSettings();
        if (cached) {
          setLanguage(cached.language);
          setDifficulty(cached.difficulty);
        } else {
          setLanguage("Japanese");
          setDifficulty("Beginner");
          localStorage.setItem("targetLanguage", "Japanese");
          localStorage.setItem("difficultyLevel", "Beginner");
        }
      }
      setIsLoading(false);
    };
    loadSettings();

    // react to updates from anywhere in the app
    const onUpdated = async () => {
      const fresh = await fetchUserSettingsFromDB(true); // FORCE refresh
      if (fresh) {
        setLanguage(fresh.language);
        setDifficulty(fresh.difficulty);
      }
    };
    window.addEventListener("user-settings-updated", onUpdated);
    return () => window.removeEventListener("user-settings-updated", onUpdated);
  }, []);

  const saveSettings = async (newLanguage: string, newDifficulty: string) => {
    // Optimistic UI
    setLanguage(newLanguage);
    setDifficulty(newDifficulty);

    // Save; our helper should dispatch "user-settings-updated"
    const saved = await saveUserSettingsToDB({
      language: newLanguage,
      difficulty: newDifficulty,
    });

    // If your helper returns boolean, keep as-is;
    // If it returns the saved row, you can set state from it.
    if (!saved) {
      console.log("Saved locally only (not authenticated or error).");
    } else {
      // Also force a re-fetch to ensure cache + other tabs are consistent.
      await fetchUserSettingsFromDB(true);
    }
  };

  return { language, difficulty, saveSettings, isLoading };
}
