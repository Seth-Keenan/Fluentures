// lib/helpers/authHelpers.ts
"use client";

import { clearSettingsSession } from "./userSettingsClient";

/**
 * Call this when user logs out to clear cached settings
 */
export function handleUserLogout(): void {
  clearSettingsSession();
  // You can add other cleanup here if needed
  localStorage.removeItem("targetLanguage");
  localStorage.removeItem("difficultyLevel");
}

/**
 * Call this when user logs in to force a fresh settings fetch
 */
export function handleUserLogin(): void {
  clearSettingsSession(); // This will trigger a fresh DB fetch
}
