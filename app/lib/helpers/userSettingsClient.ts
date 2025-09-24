// lib/helpers/userSettingsClient.ts
"use client";

export interface UserSettings { language: string; difficulty: string; display?: boolean; }

export async function fetchUserSettingsFromDB(): Promise<UserSettings | null> {
  try {
    const res = await fetch("/api/user/settings", { credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return (await res.json()) as UserSettings;
  } catch {
    return null;
  }
}

export async function saveUserSettingsToDB(settings: Partial<UserSettings>): Promise<UserSettings | null> {
  try {
    const res = await fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });
    if (!res.ok) return null;
    return (await res.json()) as UserSettings; // server returns canonical row
  } catch {
    return null;
  }
}
