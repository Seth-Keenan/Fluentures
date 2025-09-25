// app/lib/server/getUserSettings.ts
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export type AppUserSettings = {
  language: string;
  difficulty: string;
  display?: boolean | null;
};

// add this factory so Return Type matches exactly
function createSupabaseRouteClient() {
  return createRouteHandlerClient({ cookies });
}

// Query-only core (reuse w/o supabase client)
export async function fetchSettingsForUser(
  supabase: ReturnType<typeof createSupabaseRouteClient>, // <-- changed
  userId: string
): Promise<AppUserSettings> {
  const { data, error } = await supabase
    .from("UserSettings")
    .select("language, difficulty, display")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchSettingsForUser error:", error);
  }

  return {
    language: typeof data?.language === "string" ? data.language : "Japanese",
    difficulty: typeof data?.difficulty === "string" ? data.difficulty : "Beginner",
    display: typeof data?.display === "boolean" ? data.display : null,
  };
}

// Route-ready helper (API routes & server actions)
export async function getUserSettingsFromRoute(): Promise<{
  userId: string;
  settings: AppUserSettings;
}> {
  const supabase = createSupabaseRouteClient(); // <-- changed
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const settings = await fetchSettingsForUser(supabase, user.id);
  return { userId: user.id, settings };
}