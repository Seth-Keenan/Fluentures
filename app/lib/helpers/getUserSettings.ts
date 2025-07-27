// lib/getUserSettings.ts
import { getSupabaseServer } from "../util/supabaseServer";

export async function getUserSettings() {
  const supabase = getSupabaseServer();

  // Get the user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ No user found:", userError);
    return { user: null, settings: null };
  }

  // Fetch user settings from DB
  const { data, error } = await supabase
    .from("UserSettings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("❌ Error fetching settings:", error);
  }

  // Fallback defaults
  const settings = {
    language: data?.language || "Spanish",
    difficulty: data?.difficulty || "Beginner",
  };

  return { user, settings };
}
