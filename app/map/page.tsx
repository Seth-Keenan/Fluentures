// app/map/page.tsx

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "../components/LinkAsButton";
import MapView from "./client"; // Client component for displaying the 3D map

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

// Map DB rows to client format
  const wordlists = rows.map((l) => ({
    id: l.word_list_id,
    title: l.word_list_name || "(Untitled)",
    language: l.language,
  }));

  return (
  <div className="relative min-h-screen w-full overflow-hidden">
    {/*COMMENTED OUT: The server’s duplicate UI (badge + header). 
        These are already shown in the client’s MapView with better styling. */}

    {/*
    <div className="absolute top-4 right-4 z-20">
      <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs text-neutral-700 bg-white/80">
        <span className="mr-1 opacity-70">Current Language:</span>
        <strong>{selectedLanguage ?? "Not set"}</strong>
      </span>
    </div>

    <header className="relative z-10 w-full">
      <div className="mx-auto mt-6 flex w-[min(95vw,72rem)] items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-semibold">Map</h1>
          <p className="text-white/85 text-sm">Explore your saved oases in 3D.</p>
        </div>
        <div className="flex gap-2">
          <LinkAsButton
            href="/map/edit"
            className="rounded-lg px-4 py-2 bg-white/90 !text-gray-900 hover:bg-white shadow-lg shadow-black/20 ring-1 ring-white/30 transition"
          >
            Edit Map
          </LinkAsButton>
          <LinkAsButton
            href="/home"
            className="rounded-lg px-4 py-2 bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/30 transition"
          >
            Back
          </LinkAsButton>
        </div>
      </div>
    </header>
    */}

    {/* This renders the interactive client scene (with styled header + edit button). */}
    <MapView wordlists={wordlists} selectedLanguage={selectedLanguage} />

    {/* Optional empty-state messaging */}
    {hasFilter && rows.length === 0 && (
      <div className="relative z-10 mx-auto my-4 w-[min(95vw,72rem)] text-sm text-white/85">
        No word lists for <strong>{selectedLanguage}</strong> yet.
      </div>
    )}
  </div>
);
}