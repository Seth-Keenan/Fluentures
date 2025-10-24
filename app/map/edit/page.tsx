// app/map/edit/page.tsx
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import MapEditView from "./client";
//import CreateTestOasisButton from "../CreateTestOasisButton";

// ---------- SERVER HELPERS & ACTIONS ----------
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

/** Form-friendly wrapper so the client can call delete via <form action>. */
export async function deleteListAction(formData: FormData) {
  "use server";
  const id = String(formData.get("listId") || "");
  if (!id) return;
  await deleteList(id);
}

// ---------- PAGE (server component) ----------
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
        <LinkAsButton href="/home" className="btn mt-2">Back to Home</LinkAsButton>
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
  if (selectedLanguage) query = query.eq("language", selectedLanguage);

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
          {/* Optional create via button that creates/opens a test oasis */}
          
          {/* Or a simple create form: */}
          {/* <form action={createList}><button className="btn">Create New</button></form> */}
          <LinkAsButton href="/map" className="btn">Back</LinkAsButton>
        </div>
      </header>

      {/* 3D editor */}
      <section className="w-full max-w-6xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-[70vh]">
          <MapEditView
            wordlists={wordlists}
            deleteAction={deleteListAction}
            createAction={createList}
          />
        </div>
      </section>
    </div>
  );
}
