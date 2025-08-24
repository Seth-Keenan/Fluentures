"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { LinkAsButton } from "../components/LinkAsButton";

export default function SettingsPage() {
  const [language, setLanguage] = useState("Japanese");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [isDarkMode, setIsDarkMode] = useState(false); // add boolean state

  useEffect(() => {
    // Load previous values if available (for now localStorage fallback)
    const storedLang = localStorage.getItem("targetLanguage");
    const storedDiff = localStorage.getItem("difficultyLevel");
    const storedDisplay = localStorage.getItem("display");

    if (storedLang) setLanguage(storedLang);
    if (storedDiff) setDifficulty(storedDiff);
    if (storedDisplay !== null) setIsDarkMode(storedDisplay === "true"); // string → boolean
  }, []);

  const saveSettings = async () => {
    // localStorage fallback
    localStorage.setItem("targetLanguage", language);
    localStorage.setItem("difficultyLevel", difficulty);
    localStorage.setItem("display", String(isDarkMode));

    // Save to DB via API
    const res = await fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        difficulty,
        display: isDarkMode,
      }),
    });

    if (!res.ok) {
      alert("Failed to save settings");
      return;
    }

    alert("✅ Settings saved!");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Settings</h1>

      <div className="mb-4">
        <label className="block">Target Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-2"
        >
          <option value="Japanese">Japanese</option>
          <option value="Spanish">Spanish</option>
          <option value="English">English</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border p-2"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Dark Mode Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={(e) => setIsDarkMode(e.target.checked)}
        />
        <label>Dark Mode</label>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <Button onClick={saveSettings}>Save Settings</Button>
        <LinkAsButton href="/">Back</LinkAsButton>
      </div>
    </div>
  );
}
