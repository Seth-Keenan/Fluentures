// lib/helpers/userSettingsClient.ts
"use client";

export interface UserSettings {
  language: string;
  difficulty: string;
  display?: boolean;
}

const SETTINGS_SESSION_KEY = "user_settings_loaded";
const SETTINGS_CACHE_KEY = "cached_user_settings";

export async function fetchUserSettingsFromDB(force = false): Promise<UserSettings | null> {
  try {
    if (!force && sessionStorage.getItem(SETTINGS_SESSION_KEY) === "true") {
      const cached = getCachedSettings();
      if (cached) return cached;
    }

    const res = await fetch("/api/user/settings", { method: "GET", credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) {
      console.error("Failed to fetch user settings:", res.statusText);
      return null;
    }

    const settings: UserSettings = await res.json();
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
    sessionStorage.setItem(SETTINGS_SESSION_KEY, "true");
    return settings;
  } catch (err) {
    console.error("Error fetching user settings:", err);
    return null;
  }
}

export async function saveUserSettingsToDB(
  settings: Omit<UserSettings, "display"> & { display?: boolean }
): Promise<UserSettings | null> {
  try {
    const res = await fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });

    if (res.status === 401) {
      // Not logged in → fallback only
      localStorage.setItem("targetLanguage", settings.language);
      localStorage.setItem("difficultyLevel", settings.difficulty);
      if (typeof settings.display === "boolean") localStorage.setItem("display", String(settings.display));
      // Also write the cache key so readers don’t pick stale JSON
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
      sessionStorage.setItem(SETTINGS_SESSION_KEY, "true");
      return settings;
    }

    if (!res.ok) {
      console.error("Failed to save user settings:", await res.text());
      return null;
    }

    // Server returns canonical row
    const fresh: UserSettings = await res.json();
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(fresh));
    localStorage.setItem("targetLanguage", fresh.language);
    localStorage.setItem("difficultyLevel", fresh.difficulty);
    if (typeof fresh.display === "boolean") localStorage.setItem("display", String(fresh.display));
    sessionStorage.setItem(SETTINGS_SESSION_KEY, "true");

    // Let other tabs/components know
    window.dispatchEvent(new Event("user-settings-updated"));
    return fresh;
  } catch (err) {
    console.error("Error saving user settings:", err);
    return null;
  }
}

export function getCachedSettings(): UserSettings | null {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error("Error parsing cached settings:", e);
  }
  // fallback
  const language = localStorage.getItem("targetLanguage");
  const difficulty = localStorage.getItem("difficultyLevel");
  const display = localStorage.getItem("display");
  if (language && difficulty) return { language, difficulty, display: display === "true" };
  return null;
}

export async function refreshUserSettingsCache(): Promise<UserSettings | null> {
  sessionStorage.removeItem(SETTINGS_SESSION_KEY);
  localStorage.removeItem(SETTINGS_CACHE_KEY);
  return fetchUserSettingsFromDB(true);
}

export function clearSettingsSession(): void {
  sessionStorage.removeItem(SETTINGS_SESSION_KEY);
  localStorage.removeItem(SETTINGS_CACHE_KEY);
}
