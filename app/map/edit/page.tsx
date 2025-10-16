// app/map/edit/page.tsx
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  // --- Auth ---
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

  // --- Data: only this user's lists ---
  const { data } = await supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language, created_at, user_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as WordListRow[];

  // --- Server actions ---
  async function createList(formData: FormData) {
    "use server";
    const supa = await getSupabaseServerActionClient();
    const {
      data: { user: u },
    } = await supa.auth.getUser();
    if (!u) redirect("/home");

    const name = (formData.get("name") as string)?.trim() || "New Oasis";
    const language = (formData.get("language") as string)?.trim() || "Japanese";

    const { data: inserted, error: insErr } = await supa
      .from("WordList")
      .insert([{ word_list_name: name, language, user_id: u.id }])
      .select("word_list_id")
      .single();

    if (insErr || !inserted) {
      console.error("Create failed:", insErr?.message, insErr?.details ?? "");
      redirect("/map/edit?flash=Failed%20to%20create%20oasis&type=error");
    }

    // Success → go straight to edit page
    redirect(`/oasis/${inserted.word_list_id}/edit`);
  }

  async function deleteList(listId: string) {
    "use server";
    const supa = await getSupabaseServerActionClient();
    const {
      data: { user: u },
    } = await supa.auth.getUser();
    if (!u) redirect("/home");

    const { error: delErr } = await supa
      .from("WordList")
      .delete()
      .eq("word_list_id", listId)
      .eq("user_id", u.id);

    if (delErr) {
      console.error("Delete failed:", delErr.message, delErr.details ?? "");
      redirect("/map/edit?flash=Delete%20failed&type=error");
    }

    // Revalidate + flash
    revalidatePath("/map/edit");
    redirect("/map/edit?flash=Deleted&type=success");
  }

  // --- Flash banner (searchParams) ---
  const flashMsg = searchParams?.flash;
  const flashType = searchParams?.type ?? "success";

  return (
    <div className="flex flex-col items-center min-h-screen p-6 gap-5 w-full">
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

      {/* Simple Create form */}
      <form action={createList} className="flex flex-wrap items-end gap-2 w-full max-w-5xl">
        <div className="flex flex-col">
          <label className="text-xs text-neutral-600 mb-1">Name</label>
          <input
            name="name"
            placeholder="New Oasis"
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-neutral-600 mb-1">Language</label>
          <input
            name="language"
            placeholder="Japanese"
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-amber-500 text-white text-sm hover:bg-amber-600"
        >
          Create New
        </button>
      </form>

      {/* Wider, scrollable table wrapper so the Delete button never clips */}
      <div className="w-full max-w-5xl overflow-x-auto">
        <div className="min-w-[760px] overflow-hidden rounded-xl border bg-white/80">
          <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-neutral-700">
            <div className="col-span-6">Oasis Name</div>
            <div className="col-span-3">Language</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y">
            {rows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-500">
                You don’t have any word lists yet.
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.word_list_id}
                  className="grid grid-cols-12 px-4 py-3 items-center text-sm"
                >
                  <div className="col-span-6 truncate">
                    {r.word_list_name || "(Untitled)"}
                  </div>
                  <div className="col-span-3">{r.language || "—"}</div>
                  <div className="col-span-2 text-neutral-500">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </div>
                  <div className="col-span-1 text-right">
                    <div className="inline-flex gap-2">
                      <LinkAsButton
                        href={`/oasis/${r.word_list_id}`}
                        className="btn"
                        size="sm"
                      >
                        View
                      </LinkAsButton>
                      <form action={deleteList.bind(null, r.word_list_id)}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md border text-sm hover:bg-red-50 hover:border-red-300"
                          title="Delete this oasis"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <LinkAsButton href="/map" className="btn">Back</LinkAsButton>
      </div>
    </div>
  );
}
