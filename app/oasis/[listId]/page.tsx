"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type WordRow = {
  id: string;
  word_target: string | null;
  word_english: string | null;
  is_favorite: boolean | null;
};

export default function OasisHubPage() {
  const params = useParams<{ listId: string }>();
  const listId = params?.listId;
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [words, setWords] = useState<WordRow[]>([]);
  const [listName, setListName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set()); // rows currently updating

  useEffect(() => {
    console.log("🔍 useEffect triggered with listId:", listId);
    
    if (!listId || listId === 'undefined') {
      console.error("❌ Invalid listId:", listId);
      setError("Invalid list ID");
      setLoading(false);
      return;
    }
    
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Fetch words (now includes id + is_favorite)
      const wordsPromise = supabase
        .from("Word")
        .select("word_id, word_target, word_english, is_favorite")
        .eq("word_list_id", listId as string)
        .order("word_id", { ascending: true })
        .limit(200);

      // Fetch list name (your current table/column)
      const namePromise = (async () => {
        const { data, error } = await supabase
          .from("WordList")
          .select("word_list_name")
          .eq("word_list_id", listId as string)
          .single();
        if (error) return { name: null, err: error.message };
        return { name: (data as { word_list_name: string | null })?.word_list_name, err: null };
      })();

      const [wordsRes, nameRes] = await Promise.all([wordsPromise, namePromise]);
      if (cancelled) return;

      if (wordsRes.error) {
        setError(wordsRes.error.message ?? "Failed to load words");
        setWords([]);
      } else {
        // Map database columns to WordRow interface
        const mappedWords: WordRow[] = (wordsRes.data ?? []).map(w => ({
          id: w.word_id,
          word_target: w.word_target,
          word_english: w.word_english,
          is_favorite: w.is_favorite
        }));
        setWords(mappedWords);
      }

      setListName(nameRes.err ? null : nameRes.name ?? null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [listId, supabase]);

  // toggle favorite status 
  async function toggleFavorite(id: string, current: boolean | null) {
    // optimistic update
    setPending((s) => new Set(s).add(id));
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, is_favorite: !current } : w))
    );

    const { error } = await supabase
      .from("Word")
      .update({ is_favorite: !current })
      .eq("word_id", id)
      .single();

    setPending((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });

    if (error) {
      // revert on failure
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_favorite: current } : w))
      );
      // optional: show a small toast; for now surface in UI error slot
      setError(error.message ?? "Failed to update favorite");
      // clear the error after a moment so it doesn't stick forever
      setTimeout(() => setError(null), 3000);
    }
  }

  if (!listId || listId === 'undefined') {
    return (
      <div className="p-6">
        <div className="text-red-600">Invalid list ID: {String(listId)}</div>
        <div className="text-sm text-gray-500 mt-2">
          Expected a valid UUID but got: &quot;{listId}&quot;
        </div>
        <LinkAsButton href="/map" className="mt-4">
          Back to Map
        </LinkAsButton>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <aside className="w-56 shrink-0 border-r bg-neutral-50/60 p-4 flex flex-col gap-3">
        <div className="text-sm font-semibold text-neutral-600 mb-1">Actions</div>

        <LinkAsButton href={`/oasis/${listId}/quiz`} className="btn">
          Quiz
        </LinkAsButton>

        <LinkAsButton href={`/oasis/${listId}/story`} className="btn">
          Story
        </LinkAsButton>

        <LinkAsButton href={`/oasis/${listId}/sentences`} className="btn">
          Sentences
        </LinkAsButton>

        <LinkAsButton href={`/oasis/${listId}/edit`} className="btn">
          Edit Oasis
        </LinkAsButton>

        <div className="mt-auto pt-2 border-t">
          <LinkAsButton href="/map" className="btn">
            Back
          </LinkAsButton>
        </div>
      </aside>

      {/* Right content */}
      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          <header className="mb-4">
            <h1 className="text-xl font-semibold">
              {listName ?? "Word List"}
            </h1>
            <p className="text-xs text-neutral-500">
              List ID: <span className="font-mono">{listId}</span>
            </p>
          </header>

          {/* States */}
          {loading && (
            <div className="text-sm text-neutral-500">Loading words…</div>
          )}
          {error && (
            <div className="text-sm text-red-600">Error: {error}</div>
          )}
          {!loading && !error && words.length === 0 && (
            <div className="text-sm text-neutral-500">
              No words found in this list yet.
            </div>
          )}

          {/* Word table with Heart column */}
          {!loading && !error && words.length > 0 && (
            <div className="rounded-xl border bg-white/70">
              {/* Header row */}
              <div className="grid grid-cols-12 px-4 py-3 text-sm font-semibold text-neutral-700">
                <div className="col-span-2">Favorite</div>
                <div className="col-span-5">Target</div>
                <div className="col-span-5">English</div>
              </div>

              <div className="divide-y">
                {words.map((w) => {
                  const fav = !!w.is_favorite;
                  const isBusy = pending.has(w.id);
                  return (
                    <div key={w.id} className="grid grid-cols-12 px-4 py-2 text-sm items-center">
                      {/* Heart column */}
                      <div className="col-span-2">
                        <button
                          type="button"
                          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                          onClick={() => toggleFavorite(w.id, w.is_favorite)}
                          disabled={isBusy}
                          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 transition ${
                            isBusy
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:bg-rose-50 active:scale-[0.98]"
                          }`}
                          title={fav ? "Unfavorite" : "Favorite"}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-5 w-5 ${
                              fav ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-rose-500"
                            }`}
                            strokeWidth="1.8"
                          >
                            <path d="M16.5 3.5c-1.8 0-3.2 1-4.5 2.7C10.7 4.5 9.3 3.5 7.5 3.5 5 3.5 3 5.5 3 8c0 4.5 5.7 7.8 8.5 11 2.8-3.2 8.5-6.5 8.5-11 0-2.5-2-4.5-4.5-4.5z" />
                          </svg>
                          <span className="sr-only">{fav ? "Favorited" : "Not favorited"}</span>
                        </button>
                      </div>

                      {/* Target */}
                      <div className="col-span-5">
                        {w.word_target ?? <span className="text-neutral-400">—</span>}
                      </div>

                      {/* English */}
                      <div className="col-span-5">
                        {w.word_english ?? <span className="text-neutral-400">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
