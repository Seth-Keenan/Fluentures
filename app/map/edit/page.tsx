// app/map/edit/page.tsx
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import MapEditView from "./client";
import { deleteListAction, createListAction } from "./actions"; 

type WordListRow = {
  word_list_id: string;
  word_list_name: string | null;
  language: string | null;
};

export const metadata = {
  title: "Fluentures | Edit Map",
  icons: { icon: "/favicon.ico" },
};

export default async function MapEditPage() {
  const supabase = await getSupabaseServerActionClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-6 gap-3">
        <h1 className="text-xl font-semibold">Not logged in</h1>
        <p className="text-sm text-neutral-500">Please log in to manage your oases.</p>
        <LinkAsButton href="/home" className="btn mt-2">
          Back to Home
        </LinkAsButton>
      </div>
    );
  }

  // Current language
  const { data: setting } = await supabase
    .from("UserSettings")
    .select("language")
    .eq("user_id", user.id)
    .maybeSingle();
  const selectedLanguage = setting?.language?.trim() || null;

  // Lists: user-scoped, optional language filter
  let query = supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (selectedLanguage) {
    query = query.eq("language", selectedLanguage);
  }

  const { data } = await query;
  const rows = (data ?? []) as WordListRow[];

  const wordlists = rows.map((r) => ({
    id: r.word_list_id,
    title: r.word_list_name || "(Untitled)",
    language: r.language,
  }));

return (
  <MapEditView
    wordlists={wordlists}
    selectedLanguage={selectedLanguage}
    deleteAction={deleteListAction}
    createAction={createListAction}
  />
);
}
