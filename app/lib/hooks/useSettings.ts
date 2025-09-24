// useSettings.ts (your hook)
"use client";
import { useEffect, useState } from "react";
import {
  fetchUserSettingsFromDB,
  saveUserSettingsToDB
} from "@/app/lib/helpers/userSettingsClient";

export function useSettings() {
  const [language, setLanguage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await fetchUserSettingsFromDB();
      setLanguage(s?.language ?? "Japanese");
      setDifficulty(s?.difficulty ?? "Beginner");
      setIsLoading(false);
    })();
  }, []);

  const saveSettings = async (newLanguage: string, newDifficulty: string) => {
    setLanguage(newLanguage);
    setDifficulty(newDifficulty);
    const saved = await saveUserSettingsToDB({ language: newLanguage, difficulty: newDifficulty });
    if (!saved) console.warn("Settings not saved to DB (unauthorized or error)");
  };

  return { language, difficulty, saveSettings, isLoading };
}
