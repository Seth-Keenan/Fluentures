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
    <div className="relative flex flex-col items-center min-h-screen p-6 gap-5 w-full">
      <header className="w-full max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Edit Map</h1>
          <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs text-neutral-700 bg-white/80">
            <span className="mr-1 opacity-70">Language:</span>
            <strong>{selectedLanguage ?? "All"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LinkAsButton href="/map" className="btn">
            Back
          </LinkAsButton>
        </div>
      </header>

      {/* 3D editor */}
      <section className="w-full max-w-6xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-[70vh]">
          <MapEditView
            wordlists={wordlists}
            deleteAction={deleteListAction}
            createAction={createListAction}
          />
        </div>
      </section>
    </div>
  );
}
