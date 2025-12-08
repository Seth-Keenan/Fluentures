// app/map/page.tsx

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "../components/LinkAsButton";
import MapView from "./client"; // Client component for displaying the 3D map
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";
import AnimatedBackground from "./AnimatedBackground";
import StreakUpdater from "./StreakUpdater";

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
  const desert = deserts.find(d => d.name === "Namib Desert")!;

  // Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError?.message);
    return (
      <AnimatedBackground name="Namib Desert">
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-xl font-semibold mb-2 text-white">Not logged in</h2>
          <p className="text-sm text-white/70">Please log in to view your word lists.</p>
          <LinkAsButton href="/home" className="btn mt-4">Back to Home</LinkAsButton>
        </div>
      </AnimatedBackground>
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

  // If the user has no settings row or no language set, ask them to set it first
  if (!setting || !selectedLanguage) {
    return (
      <PageBackground
        src={desert.src}
        alt={desert.name}
        wikiUrl={desert.wikiUrl}
      >
        <StreakUpdater />
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-white px-4">
          <h2 className="text-2xl font-semibold mb-3">
            Set your language to view your oases
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-md">
            You haven`t set your language in your user settings yet.  
            Please go to your settings page and choose a language to see your
            word lists on the map.
          </p>
          <LinkAsButton href="/home" className="btn mt-4">
            Back to Home
          </LinkAsButton>
        </div>
      </PageBackground>
    );
  }

  // Fetch this user's wordlists, filtered by selected language
  const { data: lists, error } = await supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .eq("language", selectedLanguage)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load word lists:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

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
    <PageBackground
      src={desert.src}
      alt={desert.name}
      wikiUrl={desert.wikiUrl}
    >
      {/* Runs streak update on client-side load */}
      <StreakUpdater />

      <MapView wordlists={wordlists} selectedLanguage={selectedLanguage} />

      {hasFilter && rows.length === 0 && (
        <div className="relative z-10 mx-auto my-4 w-[min(95vw,72rem)] text-sm text-white/85">
          No word lists for <strong>{selectedLanguage}</strong> yet.
        </div>
      )}
    </PageBackground>
  );
}