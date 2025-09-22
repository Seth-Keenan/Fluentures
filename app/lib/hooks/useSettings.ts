"use client";
import { useEffect, useState } from "react";
import { 
  fetchUserSettingsFromDB, 
  saveUserSettingsToDB, 
  hasLoadedSettingsThisSession, 
  getCachedSettings
} from "@/app/lib/helpers/userSettingsClient";

export function useSettings() {
  const [language, setLanguage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      // Check if we've already loaded from DB this session
      if (hasLoadedSettingsThisSession()) {
        // Use cached settings
        const cached = getCachedSettings();
        if (cached) {
          setLanguage(cached.language);
          setDifficulty(cached.difficulty);
          setIsLoading(false);
          return;
        }
      }

      // Try to fetch from database
      const dbSettings = await fetchUserSettingsFromDB();
      
      if (dbSettings) {
        // Successfully loaded from DB
        setLanguage(dbSettings.language);
        setDifficulty(dbSettings.difficulty);
      } else {
        // Fallback to localStorage or defaults
        const cached = getCachedSettings();
        if (cached) {
          setLanguage(cached.language);
          setDifficulty(cached.difficulty);
        } else {
          console.log("No cached or DB settings, defaulting...");
          // Ultimate fallback to defaults
          setLanguage("Japanese");
          setDifficulty("Beginner");
          // Save defaults to localStorage
          localStorage.setItem("targetLanguage", "Japanese");
          localStorage.setItem("difficultyLevel", "Beginner");
        }
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  const saveSettings = async (newLanguage: string, newDifficulty: string) => {
    // Optimistically update UI
    setLanguage(newLanguage);
    setDifficulty(newDifficulty);

    // Try to save to database
    const success = await saveUserSettingsToDB({
      language: newLanguage,
      difficulty: newDifficulty,
    });

    if (!success) {
      console.log("Settings saved to localStorage (database save failed or user not authenticated)");
    }
  };

  return { language, difficulty, saveSettings, isLoading };
}