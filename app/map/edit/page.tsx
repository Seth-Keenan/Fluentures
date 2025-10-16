// app/map/edit/page.tsx
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import OasisRowActions from "@/app/components/OasisRowActions";

// ---------- SERVER HELPERS & ACTIONS (module scope) ----------
export async function getSelectedLanguageFor(userId: string) {
  "use server";
  const supa = await getSupabaseServerActionClient();
  const { data: st } = await supa
    .from("UserSettings")
    .select("language")
    .eq("user_id", userId)
    .maybeSingle();
  return st?.language?.trim() || null;
}

export async function createList(formData: FormData) {
  "use server";
  const supa = await getSupabaseServerActionClient();

  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/home");

  const name = (formData.get("name") as string)?.trim() || "New Oasis";

  // force language from settings; block if not set
  const lang = await getSelectedLanguageFor(user.id);
  if (!lang) {
    redirect("/map/edit?flash=Set%20your%20language%20in%20Settings%20first&type=error");
  }

  const { data: inserted, error: insErr } = await supa
    .from("WordList")
    .insert([{ word_list_name: name, language: lang, user_id: user.id }])
    .select("word_list_id")
    .single();

  if (insErr || !inserted) {
    console.error("Create failed:", insErr?.message, insErr?.details ?? "");
    redirect("/map/edit?flash=Failed%20to%20create%20oasis&type=error");
  }

  redirect(`/oasis/${inserted.word_list_id}/edit`);
}

export async function deleteList(listId: string) {
  "use server";
  const supa = await getSupabaseServerActionClient();

  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/home");

  const { error: delErr } = await supa
    .from("WordList")
    .delete()
    .eq("word_list_id", listId)
    .eq("user_id", user.id);

  if (delErr) {
    console.error("Delete failed:", delErr.message, delErr.details ?? "");
    redirect("/map/edit?flash=Delete%20failed&type=error");
  }

  revalidatePath("/map/edit");
  redirect("/map/edit?flash=Deleted&type=success");
}

// ---------- PAGE (server component) ----------
type WordListRow = {
  word_list_id: string;
  word_list_name: string | null;
  language: string | null;
  created_at: string | null;
  user_id: string;
};

export const metadata = {
  title: "Fluentures | Edit Map",
  icons: { icon: "/favicon.ico" },
};

export default async function MapEditPage({
  searchParams,
}: {
  searchParams: { flash?: string; type?: "success" | "error" };
}) {
  const supabase = await getSupabaseServerActionClient();

  // Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-6 gap-3">
        <h1 className="text-xl font-semibold">Not logged in</h1>
        <p className="text-sm text-neutral-500">Please log in to manage your oases.</p>
        <LinkAsButton href="/home" className="btn mt-2">Back to Home</LinkAsButton>
      </div>
    );
  }

  // Current language (same table name as your /map page)
  const { data: setting, error: settingError } = await supabase
    .from("UserSettings")
    .select("language")
    .eq("user_id", user.id)
    .maybeSingle();
  if (settingError && settingError.code !== "PGRST116") {
    console.error("UserSettings error:", settingError);
  }
  const selectedLanguage = setting?.language?.trim() || null;

  // Lists: user-scoped, filtered by selected language (if set)
  let query = supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language, created_at, user_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (selectedLanguage) query = query.eq("language", selectedLanguage);

  const { data, error } = await query;
  if (error) console.error("WordList query error:", error);
  const rows = (data ?? []) as WordListRow[];

  // Flash
  const flashMsg = searchParams?.flash;
  const flashType = (searchParams?.type ?? "success") as "success" | "error";

  return (
    <div className="relative flex flex-col items-center min-h-screen p-6 gap-5 w-full">
      {/* Current Language badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs text-neutral-700 bg-white/80">
          <span className="mr-1 opacity-70">Current Language:</span>
          <strong>{selectedLanguage ?? "Not set"}</strong>
        </span>
      </div>

      <h1 className="text-xl font-semibold text-center">
        Create a new oasis or delete existing ones
      </h1>

      {flashMsg && (
        <output
          className={`w-full max-w-5xl rounded-md px-4 py-3 text-sm ${
            flashType === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {flashMsg}
        </output>
      )}

      {/* Create (language fixed from settings; button disabled if not set) */}
      <form action={createList} className="flex flex-wrap items-end gap-2 w-full max-w-5xl">

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-amber-500 text-white text-sm hover:bg-amber-600 disabled:opacity-50"
          disabled={!selectedLanguage}
          title={!selectedLanguage ? "Set your language in Settings first" : "Create new oasis"}
        >
          Create New
        </button>
      </form>

      {/* Table */}
      <div className="w-full max-w-5xl overflow-x-auto">
        {/* Grid with fixed Actions width so it's never off-screen hopefully */}
        <div className="overflow-hidden rounded-xl border bg-white/80 min-w-[820px]">
          {/* Header */}
          <div
            className="
              grid sticky top-0 bg-white/90 backdrop-blur px-4 py-3 text-sm font-semibold text-neutral-700
              [grid-template-columns:minmax(240px,1fr)_220px_120px]
              sm:[grid-template-columns:minmax(280px,1fr)_260px_140px]
            "
          >
            {/* Name */}
            <div>Oasis Name</div>

            {/* Created (sortable) */}
            <div className="flex items-center gap-2">
              <span>Created</span>
              <div className="flex items-center gap-1">
                <a
                  href="?sort=created_at&dir=asc"
                  className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100"
                  title="Sort by Created (oldest → newest)"
                  aria-label="Sort ascending"
                >
                  ▲
                </a>
                <a
                  href="?sort=created_at&dir=desc"
                  className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100"
                  title="Sort by Created (newest → oldest)"
                  aria-label="Sort descending"
                >
                  ▼
                </a>
              </div>
            </div>

            {/* Actions (fixed ~120–140px) */}
            <div className="text-right">Actions</div>
          </div>

          {/* Body */}
          <div className="divide-y">
            {rows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-500">
                {selectedLanguage
                  ? <>No word lists for <strong>{selectedLanguage}</strong> yet.</>
                  : <>No word lists yet. Set a language in Settings to filter your view.</>}
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.word_list_id}
                  className="
                    grid px-4 py-3 items-center text-sm
                    [grid-template-columns:minmax(240px,1fr)_220px_120px]
                    sm:[grid-template-columns:minmax(280px,1fr)_260px_140px]
                  "
                >
                  {/* Name */}
                  <div className="truncate">{r.word_list_name || "(Untitled)"}</div>

                  {/* Created */}
                  <div className="text-neutral-500">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    {/* Uses your ConfirmDialog via client helper */}
                    {/* Import at top of page: 
                        import OasisRowActions from "@/app/components/OasisRowActions"; */}
                    <OasisRowActions
                      listId={r.word_list_id}
                      listName={r.word_list_name}
                      deleteAction={deleteList.bind(null, r.word_list_id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>



      <div className="flex gap-3">
        <LinkAsButton href="/map" className="btn">Back</LinkAsButton>
        <LinkAsButton href="/settings" className="btn">Settings</LinkAsButton>
      </div>
    </div>
  );
}
