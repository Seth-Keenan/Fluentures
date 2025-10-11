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

  // Get the currently logged-in user
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

  // Fetch only this user’s word lists
  const { data: lists, error } = await supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load word lists:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  const rows = (lists ?? []) as WordListRow[];

  // Render the lists
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <h2 className="text-xl font-semibold">Your Oases</h2>

      {rows.length === 0 && (
        <div className="text-sm text-gray-500">
          You don’t have any word lists yet.
        </div>
      )}

      {rows.map((l) => (
        <LinkAsButton
          key={l.word_list_id}
          href={`/oasis/${l.word_list_id}`}
          className="btn"
        >
          {l.word_list_name || "(Untitled)"}{" "}
          {l.language ? `— ${l.language}` : ""}
        </LinkAsButton>
      ))}

      <LinkAsButton href="/map" className="btn mt-4">
        Back
      </LinkAsButton>
    </div>
  );
}
