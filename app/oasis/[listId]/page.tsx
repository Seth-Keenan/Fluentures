"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { WordListMeta } from "@/app/lib/actions/wordlistAction";
import { motion, type Variants } from "framer-motion";

type WordRow = {
  id: string;
  word_target: string | null;
  word_english: string | null;
  is_favorite: boolean | null;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

export default function OasisHubPage() {
  const params = useParams<{ listId: string }>();
  const listId = params?.listId;
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [words, setWords] = useState<WordRow[]>([]);
  const [listName, setListName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [meta, setMeta] = useState<WordListMeta | null>(null);

  useEffect(() => {
    if (!listId || listId === "undefined") {
      setError("Invalid list ID");
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      const wordsPromise = supabase
        .from("Word")
        .select("word_id, word_target, word_english, is_favorite")
        .eq("word_list_id", listId as string)
        .order("word_id", { ascending: true })
        .limit(200);

      const metaPromise = (async () => {
        const { data, error } = await supabase
          .from("WordList")
          .select("word_list_name, language")
          .eq("word_list_id", listId as string)
          .single();
        if (error)
          return {
            name: null as string | null,
            language: null as string | null,
            err: error.message,
          };
        return {
          name: (data as { word_list_name: string | null })?.word_list_name ?? null,
          language: (data as { language: string | null })?.language ?? null,
          err: null as string | null,
        };
      })();

      const [wordsRes, metaRes] = await Promise.all([wordsPromise, metaPromise]);
      if (cancelled) return;

      if (wordsRes.error) {
        setError(wordsRes.error.message ?? "Failed to load words");
        setWords([]);
      } else {
        const mapped: WordRow[] = (wordsRes.data ?? []).map((w) => ({
          id: w.word_id,
          word_target: w.word_target,
          word_english: w.word_english,
          is_favorite: w.is_favorite,
        }));
        setWords(mapped);
      }

      if (metaRes.err) {
        setMeta(null);
        setListName(null);
      } else {
        setMeta({
          id: String(listId),
          name: metaRes.name ?? "",
          language: metaRes.language,
        });
        setListName(metaRes.name ?? null);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [listId, supabase]);

  async function toggleFavorite(id: string, current: boolean | null) {
    setPending((s) => new Set(s).add(id));
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, is_favorite: !current } : w)));

    const { error } = await supabase.from("Word").update({ is_favorite: !current }).eq("word_id", id).single();

    setPending((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });

    if (error) {
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, is_favorite: current } : w)));
      setError(error.message ?? "Failed to update favorite");
      setTimeout(() => setError(null), 3000);
    }
  }

  if (!listId || listId === "undefined") {
    return (
      <div className="p-6">
        <div className="text-red-600">Invalid list ID: {String(listId)}</div>
        <div className="mt-2 text-sm text-gray-500">
          Expected a valid UUID but got: &quot;{listId}&quot;
        </div>
        <LinkAsButton href="/map" className="mt-4">
          Back to Map
        </LinkAsButton>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <motion.img
        src="/desert.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content Layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-white/10 bg-white/10 backdrop-blur-xl p-4 text-white">
          <div className="mb-2 text-sm font-semibold opacity-80">Actions</div>
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
          <div className="mt-6 border-t border-white/10 pt-3">
            <LinkAsButton href="/map" className="px-4 py-2">
              Back
            </LinkAsButton>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex justify-center items-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-[min(90vw,70rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-10 text-white"
          >
            <header className="mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {listName ?? "Word List"}
                {meta?.language && (
                  <span className="ml-2 text-base font-normal opacity-80">
                    • {meta.language}
                  </span>
                )}
              </h1>
            </header>

            {loading && (
              <div role="status" aria-live="polite" className="text-sm opacity-80">
                Loading words…
              </div>
            )}
            {error && (
              <div role="alert" className="text-sm text-rose-300">
                Error: {error}
              </div>
            )}
            {!loading && !error && words.length === 0 && (
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm opacity-80">
                No words found in this list yet.
              </div>
            )}

            {!loading && !error && words.length > 0 && (
              <motion.section
                variants={container}
                initial="hidden"
                animate="show"
                className="overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-lg"
              >
                <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold opacity-90">
                  <div className="col-span-2">Favorite</div>
                  <div className="col-span-5">{meta?.language ?? "Target"}</div>
                  <div className="col-span-5">English</div>
                </div>
                <div className="divide-y divide-white/10">
                  {words.map((w) => {
                    const fav = !!w.is_favorite;
                    const isBusy = pending.has(w.id);
                    return (
                      <motion.div
                        key={w.id}
                        variants={item}
                        className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-sm"
                      >
                        <div className="col-span-2">
                          <button
                            type="button"
                            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                            onClick={() => toggleFavorite(w.id, w.is_favorite)}
                            disabled={isBusy}
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-2 py-1 transition",
                              "focus:outline-none focus:ring-2 focus:ring-amber-400/60",
                              isBusy ? "cursor-not-allowed opacity-60" : "hover:bg-rose-100/20 active:scale-[0.98]",
                            ].join(" ")}
                            title={fav ? "Unfavorite" : "Favorite"}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className={`h-5 w-5 ${fav ? "fill-rose-400 stroke-rose-400" : "fill-none stroke-rose-300"}`}
                              strokeWidth="1.8"
                              aria-hidden="true"
                            >
                              <path d="M16.5 3.5c-1.8 0-3.2 1-4.5 2.7C10.7 4.5 9.3 3.5 7.5 3.5 5 3.5 3 5.5 3 8c0 4.5 5.7 7.8 8.5 11 2.8-3.2 8.5-6.5 8.5-11 0-2.5-2-4.5-4.5-4.5z" />
                            </svg>
                          </button>
                        </div>
                        <div className="col-span-5">{w.word_target ?? <span className="opacity-60">—</span>}</div>
                        <div className="col-span-5">{w.word_english ?? <span className="opacity-60">—</span>}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
