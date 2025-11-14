// app/map/page.tsx
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "../components/LinkAsButton";
import MapView from "./client";
import { createOasis } from "./actions";

type WordListRow = {
  word_list_id: string;
  word_list_name: string;
  language: string | null;
};

export const metadata = {
  title: "Fluentures",
  icons: { icon: "/favicon.ico" },
};

export default async function OasisIndex() {
  const supabase = await getSupabaseServerActionClient();

  // Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError?.message);
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-2">Not logged in</h2>
        <p className="text-sm text-gray-500">
          Please log in to view your word lists.
        </p>
        <LinkAsButton href="/home" className="btn mt-4">
          Back to Home
        </LinkAsButton>
      </div>
    );
  }

  // Get user's selected language from user_settings
  const { data: setting, error: settingError } = await supabase
    .from("UserSettings")
    .select("language")
    .eq("user_id", user.id)
    .maybeSingle();

  if (settingError && settingError.code !== "PGRST116") {
    console.error("Failed to load user_settings:", {
      message: settingError.message,
      details: settingError.details,
      hint: settingError.hint,
      code: settingError.code,
    });
  }

  const selectedLanguage = setting?.language?.trim() || null;

  // Fetch this user's wordlists, filtered by selected language (if set)
  let query = supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (selectedLanguage) {
    query = query.eq("language", selectedLanguage);
  }

  const { data: lists, error } = await query;

  if (error) {
    console.error("Failed to load word lists:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  const rows = (lists ?? []) as WordListRow[];

  // Map DB rows to client format
  const wordlists = rows.map((l) => ({
    id: l.word_list_id,
    title: l.word_list_name || "(Untitled)",
    language: l.language,
  }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* All interactive / 3D stuff is in the client component */}
      <MapView
        wordlists={wordlists}
        selectedLanguage={selectedLanguage}
        createAction={createOasis}
      />
    </div>
  );
}