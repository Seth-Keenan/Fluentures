"use client";
import { useEffect, useState } from "react";

export function useSettings() {
  const [language, setLanguage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("targetLanguage");
    const storedDifficulty = localStorage.getItem("difficultyLevel");

    if (storedLanguage) setLanguage(storedLanguage);
    if (storedDifficulty) setDifficulty(storedDifficulty);
  }, []);

  const saveSettings = (newLanguage: string, newDifficulty: string) => {
    localStorage.setItem("targetLanguage", newLanguage);
    localStorage.setItem("difficultyLevel", newDifficulty);
    setLanguage(newLanguage);
    setDifficulty(newDifficulty);
  };

  return { language, difficulty, saveSettings };
}