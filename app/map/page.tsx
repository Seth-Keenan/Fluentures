import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "../components/LinkAsButton";
import { motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import CenterPanel from "./CenterPanel";

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
      <div className="flex flex-col items-center justify-center h-screen text-white bg-neutral-900/80">
        <h2 className="text-xl font-semibold mb-2">Not logged in</h2>
        <p className="text-sm opacity-80 mb-4">Please log in to view your word lists.</p>
        <LinkAsButton href="/home" className="mt-2">Back to Home</LinkAsButton>
      </div>
    );
  }

  // Get user's selected language
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

  // Fetch user's word lists
  let query = supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (selectedLanguage) {
    query = query.eq("language", selectedLanguage);
  }

  const { data: lists, error } = await query;
  if (error) console.error("Failed to load word lists:", error);

  const rows = (lists ?? []) as WordListRow[];
  const hasFilter = !!selectedLanguage;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background (client component) */}
      <AnimatedBackground />

      {/* Center panel (client component) */}
        <CenterPanel
          selectedLanguage={selectedLanguage}
          hasFilter={hasFilter}
          rows={rows}
        />

    </div>
  );
}
