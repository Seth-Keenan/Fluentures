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
  <div className="min-h-screen bg-neutral-50">
    <div className="flex">
      {/* Left sidebar */}
      <aside className="w-60 shrink-0 border-r border-neutral-200 bg-white/70 p-4">
        <div className="mb-2 text-sm font-semibold text-neutral-600">Actions</div>

        <div className="flex flex-col gap-2">
          <LinkAsButton href={`/oasis/${listId}/quiz`} className="px-4 py-2">
            Quiz
          </LinkAsButton>

          <LinkAsButton href={`/oasis/${listId}/story`} className="px-4 py-2">
            Story
          </LinkAsButton>

          <LinkAsButton href={`/oasis/${listId}/sentences`} className="px-4 py-2">
            Sentences
          </LinkAsButton>

          <LinkAsButton href={`/oasis/${listId}/edit`} className="px-4 py-2">
            Edit Oasis
          </LinkAsButton>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-3">
          <LinkAsButton href="/map" className="px-4 py-2">
            Back
          </LinkAsButton>
        </div>
      </aside>

      {/* Right content */}
      <main className="flex-1">
        <div className="mx-auto h-full max-w-5xl p-4 md:p-8">
          {/* Header */}
          <header className="mb-4">
            <h1 className="text-xl font-semibold tracking-tight">{listName ?? "Word List"}</h1>
            <p className="text-xs text-neutral-500">
              List ID: <span className="font-mono text-neutral-700">{listId}</span>
            </p>
          </header>

          {/* States */}
          {loading && (
            <div role="status" aria-live="polite" className="text-sm text-neutral-500">
              Loading words…
            </div>
          )}
          {error && (
            <div role="alert" className="text-sm text-red-600">
              Error: {error}
            </div>
          )}
          {!loading && !error && words.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm">
              No words found in this list yet.
            </div>
          )}

          {/* Word table with Heart column */}
          {!loading && !error && words.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              {/* Header row */}
              <div className="sticky top-0 grid grid-cols-12 gap-2 border-b border-neutral-100 bg-white/90 px-4 py-3 text-sm font-semibold text-neutral-700 backdrop-blur">
                <div className="col-span-2">Favorite</div>
                <div className="col-span-5">Target</div>
                <div className="col-span-5">English</div>
              </div>

              {/* Body */}
              <div className="divide-y divide-neutral-100">
                {words.map((w) => {
                  const fav = !!w.is_favorite;
                  const isBusy = pending.has(w.id);
                  return (
                    <div
                      key={w.id}
                      className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-sm"
                    >
                      {/* Heart column */}
                      <div className="col-span-2">
                        <button
                          type="button"
                          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                          onClick={() => toggleFavorite(w.id, w.is_favorite)}
                          disabled={isBusy}
                          className={[
                            "inline-flex items-center gap-2 rounded-full px-2 py-1 transition",
                            "focus:outline-none focus:ring-2 focus:ring-amber-400/60",
                            isBusy
                              ? "cursor-not-allowed opacity-60"
                              : "hover:bg-rose-50 active:scale-[0.98]",
                          ].join(" ")}
                          title={fav ? "Unfavorite" : "Favorite"}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-5 w-5 ${
                              fav ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-rose-500"
                            }`}
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="M16.5 3.5c-1.8 0-3.2 1-4.5 2.7C10.7 4.5 9.3 3.5 7.5 3.5 5 3.5 3 5.5 3 8c0 4.5 5.7 7.8 8.5 11 2.8-3.2 8.5-6.5 8.5-11 0-2.5-2-4.5-4.5-4.5z" />
                          </svg>
                          <span className="sr-only">{fav ? "Favorited" : "Not favorited"}</span>
                        </button>
                      </div>

                      {/* Target */}
                      <div className="col-span-5 text-neutral-900">
                        {w.word_target ?? <span className="text-neutral-400">—</span>}
                      </div>

                      {/* English */}
                      <div className="col-span-5 text-neutral-900">
                        {w.word_english ?? <span className="text-neutral-400">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  </div>
);

}
