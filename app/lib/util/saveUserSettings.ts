// lib/util/saveUserSettings.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export type SaveSettingsInput = {
  language: string;
  difficulty: string;
  display?: boolean; // set for now, light v dark mode
};

export async function saveUserSettings(input: SaveSettingsInput): Promise<boolean> {
  const supabase = createServerComponentClient({ cookies });

  // Identify user
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    console.error("saveUserSettings: no logged-in user", userErr);
    return false;
  }

  // Upsert row for this user_id
  const payload = {
    user_id: user.id,
    language: input.language,
    difficulty: input.difficulty,
    display: typeof input.display === "boolean" ? input.display : null
  };

  const { error } = await supabase
    .from("UserSettings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("saveUserSettings upsert error:", error);
    return false;
  }
  return true;
}
