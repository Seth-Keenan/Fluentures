import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// Returns whole row of user settings for a user
export async function getUserSettings() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No logged in user", userError);
    return null;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }

  return data;
}
