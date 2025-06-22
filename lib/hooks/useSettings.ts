"use client";
import { useEffect, useState } from "react";

export function useSettings() {
  const [language, setLanguage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  useEffect(() => {
    setLanguage(localStorage.getItem("targetLanguage"));
    setDifficulty(localStorage.getItem("difficultyLevel"));
  }, []);

  return { language, difficulty };
}