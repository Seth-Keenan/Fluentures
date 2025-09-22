// lib/helpers/userSettingsClient.ts
"use client";

export interface UserSettings {
  language: string;
  difficulty: string;
  display?: boolean;
}

const SETTINGS_SESSION_KEY = 'user_settings_loaded';
const SETTINGS_CACHE_KEY = 'cached_user_settings';

/**
 * Fetches user settings from the database API
 * Returns null if user is not authenticated or fetch fails
 */
export async function fetchUserSettingsFromDB(): Promise<UserSettings | null> {
  try {
    const response = await fetch('/api/user/settings', {
      method: 'GET',
      credentials: 'include', // Important for cookie-based auth
    });

    if (response.status === 401) {
      // User not authenticated
      return null;
    }

    if (!response.ok) {
      console.error('Failed to fetch user settings:', response.statusText);
      return null;
    }

    const settings: UserSettings = await response.json();
    
    // Cache the settings and mark as loaded this session
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
    sessionStorage.setItem(SETTINGS_SESSION_KEY, 'true');
    
    return settings;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

/**
 * Saves user settings to the database
 * Also updates localStorage cache
 */
export async function saveUserSettingsToDB(settings: Omit<UserSettings, 'display'>): Promise<boolean> {
  try {
    const response = await fetch('/api/user/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });

    if (response.status === 401) {
      // User not authenticated, save to localStorage only
      localStorage.setItem("targetLanguage", settings.language);
      localStorage.setItem("difficultyLevel", settings.difficulty);
      return false; // Indicates fallback was used
    }

    if (!response.ok) {
      console.error('Failed to save user settings:', response.statusText);
      return false;
    }

    // Update cache and mark as loaded
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
    localStorage.setItem("targetLanguage", settings.language);
    localStorage.setItem("difficultyLevel", settings.difficulty);
    sessionStorage.setItem(SETTINGS_SESSION_KEY, 'true');
    
    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    // Fallback to localStorage
    localStorage.setItem("targetLanguage", settings.language);
    localStorage.setItem("difficultyLevel", settings.difficulty);
    return false;
  }
}

/**
 * Checks if settings have been loaded from DB this session
 */
export function hasLoadedSettingsThisSession(): boolean {
  return sessionStorage.getItem(SETTINGS_SESSION_KEY) === 'true';
}

/**
 * Gets cached settings from localStorage
 */
export function getCachedSettings(): UserSettings | null {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error parsing cached settings:', error);
  }

  // Fallback to old localStorage keys
  const language = localStorage.getItem("targetLanguage");
  const difficulty = localStorage.getItem("difficultyLevel");
  
  if (language && difficulty) {
    return { language, difficulty };
  }

  return null;
}

/**
 * Clears the session flag (useful for logout)
 */
export function clearSettingsSession(): void {
  sessionStorage.removeItem(SETTINGS_SESSION_KEY);
  localStorage.removeItem(SETTINGS_CACHE_KEY);
}
