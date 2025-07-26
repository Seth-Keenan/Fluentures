"use client";
import { redirect } from "next/navigation";
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

  // Save settings to the server
  const saveSettings = async () => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, difficulty }),
    });

    //DEBUG 
    const data = await res.json();
    console.log("🔍 API response:", data);

    if (res.ok) {
      alert("Settings saved to your account!");
      redirect("/");
    } else {
      alert("Failed to save settings.");
    }
  };

  return { language, difficulty, saveSettings };
}