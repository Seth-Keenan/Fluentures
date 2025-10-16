// app/map/page.tsx

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "../components/LinkAsButton";

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
        <p className="text-sm text-gray-500">Please log in to view your word lists.</p>
        <LinkAsButton href="/home" className="btn mt-4">Back to Home</LinkAsButton>
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
    // PGRST116 = no rows found for single() — safe to ignore if using maybeSingle()
    console.error("Failed to load user_settings:", {
      message: settingError.message,
      details: settingError.details,
      hint: settingError.hint,
      code: settingError.code,
    });
  }

  const selectedLanguage = setting?.language?.trim() || null;

  // 2) Fetch this user's wordlists, filtered by selected language (if set)
  let query = supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (selectedLanguage) {
    query = query.eq("language", selectedLanguage); // exact match; make consistent in your data
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

  const hasFilter = !!selectedLanguage;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen gap-3 px-4">
      {/* Corner badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs text-neutral-700 bg-white/80">
          <span className="mr-1 opacity-70">Current Language:</span>
          <strong>{selectedLanguage ?? "Not set"}</strong>
        </span>
      </div>

      <h2 className="text-xl font-semibold">Your Oases</h2>

      {hasFilter && rows.length === 0 && (
        <div className="text-sm text-gray-500 max-w-md text-center">
          No word lists for <strong>{selectedLanguage}</strong> yet.
        </div>
      )}

      {!hasFilter && rows.length === 0 && (
        <div className="text-sm text-gray-500">You don’t have any word lists yet.</div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-1">
        <LinkAsButton href="/map/edit" className="btn">Edit Map</LinkAsButton>
        <LinkAsButton href="/home" className="btn">Back</LinkAsButton>
      </div>

      {/* Lists */}
      <div className="mt-2 flex flex-col items-stretch w-full max-w-md gap-2">
        {rows.map((l) => (
          <LinkAsButton
            key={l.word_list_id}
            href={`/oasis/${l.word_list_id}`}
            className="btn w-full"
          >
            {l.word_list_name || "(Untitled)"}{" "}
          </LinkAsButton>
        ))}
      </div>
    </div>
  );
}
