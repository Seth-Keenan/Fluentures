// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "next/navigation";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import type { WordListMeta } from "@/app/lib/actions/wordlistAction";
// import { motion, type Variants } from "framer-motion";

// type WordRow = {
//   id: string;
//   word_target: string | null;
//   word_english: string | null;
//   is_favorite: boolean | null;
// };

// const container: Variants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
// };

// const item: Variants = {
//   hidden: { opacity: 0, y: 14 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
// };

// export default function OasisHubPage() {
//   const params = useParams<{ listId: string }>();
//   const listId = params?.listId;
//   const supabase = useMemo(() => createClientComponentClient(), []);
//   const [words, setWords] = useState<WordRow[]>([]);
//   const [listName, setListName] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pending, setPending] = useState<Set<string>>(new Set());
//   const [meta, setMeta] = useState<WordListMeta | null>(null);

//   useEffect(() => {
//     if (!listId || listId === "undefined") {
//       setError("Invalid list ID");
//       setLoading(false);
//       return;
//     }

//     let cancelled = false;
//     async function load() {
//       setLoading(true);
//       setError(null);

//       const wordsPromise = supabase
//         .from("Word")
//         .select("word_id, word_target, word_english, is_favorite")
//         .eq("word_list_id", listId as string)
//         .order("word_id", { ascending: true })
//         .limit(200);

//       const metaPromise = (async () => {
//         const { data, error } = await supabase
//           .from("WordList")
//           .select("word_list_name, language")
//           .eq("word_list_id", listId as string)
//           .single();
//         if (error)
//           return {
//             name: null as string | null,
//             language: null as string | null,
//             err: error.message,
//           };
//         return {
//           name: (data as { word_list_name: string | null })?.word_list_name ?? null,
//           language: (data as { language: string | null })?.language ?? null,
//           err: null as string | null,
//         };
//       })();

//       const [wordsRes, metaRes] = await Promise.all([wordsPromise, metaPromise]);
//       if (cancelled) return;

//       if (wordsRes.error) {
//         setError(wordsRes.error.message ?? "Failed to load words");
//         setWords([]);
//       } else {
//         const mapped: WordRow[] = (wordsRes.data ?? []).map((w) => ({
//           id: w.word_id,
//           word_target: w.word_target,
//           word_english: w.word_english,
//           is_favorite: w.is_favorite,
//         }));
//         setWords(mapped);
//       }

//       if (metaRes.err) {
//         setMeta(null);
//         setListName(null);
//       } else {
//         setMeta({
//           id: String(listId),
//           name: metaRes.name ?? "",
//           language: metaRes.language,
//         });
//         setListName(metaRes.name ?? null);
//       }

//       setLoading(false);
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [listId, supabase]);

//   async function toggleFavorite(id: string, current: boolean | null) {
//     setPending((s) => new Set(s).add(id));
//     setWords((prev) => prev.map((w) => (w.id === id ? { ...w, is_favorite: !current } : w)));

//     const { error } = await supabase.from("Word").update({ is_favorite: !current }).eq("word_id", id).single();

//     setPending((s) => {
//       const next = new Set(s);
//       next.delete(id);
//       return next;
//     });

//     if (error) {
//       setWords((prev) => prev.map((w) => (w.id === id ? { ...w, is_favorite: current } : w)));
//       setError(error.message ?? "Failed to update favorite");
//       setTimeout(() => setError(null), 3000);
//     }
//   }

//   if (!listId || listId === "undefined") {
//     return (
//       <div className="p-6">
//         <div className="text-red-600">Invalid list ID: {String(listId)}</div>
//         <div className="mt-2 text-sm text-gray-500">
//           Expected a valid UUID but got: &quot;{listId}&quot;
//         </div>
//         <LinkAsButton href="/map" className="mt-4">
//           Back to Map
//         </LinkAsButton>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden">
//       {/* Animated Background */}
//       <motion.img
//         src="/desert.png"
//         alt="Background"
//         className="absolute inset-0 h-full w-full object-cover"
//         initial={{ scale: 1 }}
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
//         }}
//         animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
//         }}
//         animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Content Layout */}
//       <div className="relative z-10 flex min-h-screen">
//         {/* Sidebar */}
//         <aside className="w-60 shrink-0 border-r border-white/10 bg-white/10 backdrop-blur-xl p-4 text-white">
//           <div className="mb-2 text-sm font-semibold opacity-80">Actions</div>
//           <div className="flex flex-col gap-2">
//             <LinkAsButton href={`/oasis/${listId}/quiz`} className="px-4 py-2">
//               Quiz
//             </LinkAsButton>
//             <LinkAsButton href={`/oasis/${listId}/story`} className="px-4 py-2">
//               Story
//             </LinkAsButton>
//             <LinkAsButton href={`/oasis/${listId}/sentences`} className="px-4 py-2">
//               Sentences
//             </LinkAsButton>
//             <LinkAsButton href={`/oasis/${listId}/edit`} className="px-4 py-2">
//               Edit Oasis
//             </LinkAsButton>
//           </div>
//           <div className="mt-6 border-t border-white/10 pt-3">
//             <LinkAsButton href="/map" className="px-4 py-2">
//               Back
//             </LinkAsButton>
//           </div>
//         </aside>

//         {/* Main Panel */}
//         <main className="flex-1 flex justify-center items-center p-6">
//           <motion.div
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             transition={{ duration: 0.5 }}
//             className="w-[min(90vw,70rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-10 text-white"
//           >
//             <header className="mb-6 text-center">
//               <h1 className="text-2xl sm:text-3xl font-semibold">
//                 {listName ?? "Word List"}
//                 {meta?.language && (
//                   <span className="ml-2 text-base font-normal opacity-80">
//                     • {meta.language}
//                   </span>
//                 )}
//               </h1>
//             </header>

//             {loading && (
//               <div role="status" aria-live="polite" className="text-sm opacity-80">
//                 Loading words…
//               </div>
//             )}
//             {error && (
//               <div role="alert" className="text-sm text-rose-300">
//                 Error: {error}
//               </div>
//             )}
//             {!loading && !error && words.length === 0 && (
//               <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm opacity-80">
//                 No words found in this list yet.
//               </div>
//             )}

//             {!loading && !error && words.length > 0 && (
//               <motion.section
//                 variants={container}
//                 initial="hidden"
//                 animate="show"
//                 className="overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-lg"
//               >
//                 <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold opacity-90">
//                   <div className="col-span-2">Favorite</div>
//                   <div className="col-span-5">{meta?.language ?? "Target"}</div>
//                   <div className="col-span-5">English</div>
//                 </div>
//                 <div className="divide-y divide-white/10">
//                   {words.map((w) => {
//                     const fav = !!w.is_favorite;
//                     const isBusy = pending.has(w.id);
//                     return (
//                       <motion.div
//                         key={w.id}
//                         variants={item}
//                         className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-sm"
//                       >
//                         <div className="col-span-2">
//                           <button
//                             type="button"
//                             aria-label={fav ? "Remove from favorites" : "Add to favorites"}
//                             onClick={() => toggleFavorite(w.id, w.is_favorite)}
//                             disabled={isBusy}
//                             className={[
//                               "inline-flex items-center gap-2 rounded-full px-2 py-1 transition",
//                               "focus:outline-none focus:ring-2 focus:ring-amber-400/60",
//                               isBusy ? "cursor-not-allowed opacity-60" : "hover:bg-rose-100/20 active:scale-[0.98]",
//                             ].join(" ")}
//                             title={fav ? "Unfavorite" : "Favorite"}
//                           >
//                             <svg
//                               viewBox="0 0 24 24"
//                               className={`h-5 w-5 ${fav ? "fill-rose-400 stroke-rose-400" : "fill-none stroke-rose-300"}`}
//                               strokeWidth="1.8"
//                               aria-hidden="true"
//                             >
//                               <path d="M16.5 3.5c-1.8 0-3.2 1-4.5 2.7C10.7 4.5 9.3 3.5 7.5 3.5 5 3.5 3 5.5 3 8c0 4.5 5.7 7.8 8.5 11 2.8-3.2 8.5-6.5 8.5-11 0-2.5-2-4.5-4.5-4.5z" />
//                             </svg>
//                           </button>
//                         </div>
//                         <div className="col-span-5">{w.word_target ?? <span className="opacity-60">—</span>}</div>
//                         <div className="col-span-5">{w.word_english ?? <span className="opacity-60">—</span>}</div>
//                       </motion.div>
//                     );
//                   })}
//                 </div>
//               </motion.section>
//             )}
//           </motion.div>
//         </main>
//       </div>
//     </div>
//   );
// }

// app/oasis/[listId]/page.tsx (or wherever your routed file lives)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { WordListMeta } from "@/app/lib/actions/wordlistAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faBookOpen,
  faPenNib,
  faWandMagicSparkles,
  faArrowLeft,
  faTree,
} from "@fortawesome/free-solid-svg-icons";

type WordRow = {
  id: string;
  word_target: string | null;
  word_english: string | null;
  is_favorite: boolean | null;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function OasisHubPage() {
  const params = useParams<{ listId: string }>();
  const listId = params?.listId;
  const supabase = useMemo(() => createClientComponentClient(), []);
  const prefersReducedMotion = useReducedMotion();

  const [ready, setReady] = useState(false);
  const [words, setWords] = useState<WordRow[]>([]);
  const [listName, setListName] = useState<string | null>(null);
  const [meta, setMeta] = useState<WordListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

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

  const actions = [
    {
      href: `/oasis/${listId}/quiz`,
      icon: faCircleQuestion,
      title: "Quiz",
      desc: "Test yourself with targeted questions.",
      aria: "Open Quiz",
    },
    {
      href: `/oasis/${listId}/story`,
      icon: faBookOpen,
      title: "Story",
      desc: "Immerse in context with short tales.",
      aria: "Read Story",
    },
    {
      href: `/oasis/${listId}/sentences`,
      icon: faPenNib,
      title: "Sentences",
      desc: "Craft example sentences and variations.",
      aria: "Build Sentences",
    },
    {
      href: `/oasis/${listId}/edit`,
      icon: faWandMagicSparkles,
      title: "Edit Oasis",
      desc: "Tweak words, hints, and difficulty.",
      aria: "Edit Oasis",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background (parallax zoom) */}
      <motion.img
        src="/desert.png"
        alt="Desert background"
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise + contrast veil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      {/* Aurora blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 16, 0], x: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -14, 0], x: [0, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Shell (slim width like v2) */}
      <div className="relative z-10 mx-auto flex min-h-screen w-[min(92vw,56rem)] flex-col items-center justify-center p-4">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <FontAwesomeIcon icon={faTree} className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-2xl font-semibold leading-tight text-transparent sm:text-3xl drop-shadow-[0_2px_10px_rgba(255,255,255,0.12)]">
                  {listName ?? "Oasis"}
                </h1>
                <p className="text-white/85 text-sm">
                  {meta?.language ? `Language: ${meta.language}` : "Your personalized oasis"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LinkAsButton
                href="/map"
                className="
                  !cursor-pointer rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30
                  transition !px-5 !py-2.5
                  min-w-[8.5rem] justify-center shrink-0 whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-white/70
                "
                aria-label="Back to map"
              >
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                  Back to Map
                </span>
              </LinkAsButton>
            </div>
          </div>
        </motion.div>

        {/* Actions grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="mt-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {actions.map(({ href, icon, title, desc, aria }) => (
            <motion.div
              key={title}
              variants={item}
              className="relative rounded-2xl ring-1 ring-white/15 backdrop-blur-xl shadow-2xl group bg-white/10"
              style={{ transformPerspective: 800 }}
              whileHover={{
                y: -6,
                rotateX: prefersReducedMotion ? 0 : 2,
                rotateY: prefersReducedMotion ? 0 : -2,
                transition: { type: "spring", stiffness: 180, damping: 15 },
              }}
              whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              {/* Subtle diagonal shimmer */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.10) 40%, transparent 60%)",
                  maskImage:
                    "radial-gradient(200% 60% at 0% 0%, black 30%, transparent 65%)",
                  WebkitMaskImage:
                    "radial-gradient(200% 60% at 0% 0%, black 30%, transparent 65%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-indigo-300/30 transition" />

              <LinkAsButton
                href={href}
                className="
                  !cursor-pointer group flex w-full items-center justify-between
                  rounded-2xl px-5 py-5 min-h-[6.75rem]
                  bg-transparent !text-white text-left
                  transition focus:outline-none focus:ring-2 focus:ring-white/70
                "
                aria-label={aria}
              >
                <div className="inline-flex items-center gap-3">
                  <span className="relative grid h-7 w-7 place-items-center">
                    <span
                      aria-hidden
                      className="absolute h-8 w-8 rounded-full ring-1 ring-white/25 bg-white/15 transition-transform duration-300 group-hover:scale-110"
                    />
                    <FontAwesomeIcon
                      icon={icon}
                      className="relative h-4 w-4 transition-transform group-hover:-translate-y-0.5"
                    />
                  </span>
                  <div className="leading-tight">
                    <div className="text-base font-semibold">{title}</div>
                    <div className="text-[13px] text-white/80">{desc}</div>
                  </div>
                </div>
              </LinkAsButton>
            </motion.div>
          ))}
        </motion.div>

        {/* Words list (from first file), shown below the grid */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-6 w-full rounded-2xl border border-white/20 bg-white/10 p-0 shadow-2xl backdrop-blur-xl text-white"
        >
          <div className="border-b border-white/15 px-4 py-3 text-sm opacity-90">
            {loading ? "Loading words…" : error ? `Error: ${error}` : `${words.length} words`}
          </div>

          {!loading && !error && words.length === 0 && (
            <div className="p-4 text-sm opacity-90">
              No words found in this list yet.
            </div>
          )}

          {!loading && !error && words.length > 0 && (
            <div className="overflow-hidden">
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
                    <div
                      key={w.id}
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
                            "focus:outline-none focus:ring-2 focus:ring-amber-300/60",
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
                      <div className="col-span-5">
                        {w.word_target ?? <span className="opacity-60">—</span>}
                      </div>
                      <div className="col-span-5">
                        {w.word_english ?? <span className="opacity-60">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


// // app/oasis/page.tsx
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { motion, useReducedMotion, type Variants } from "framer-motion";
// import { useSearchParams } from "next/navigation";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faCircleQuestion,
//   faBookOpen,
//   faPenNib,
//   faWandMagicSparkles,
//   faArrowLeft,
//   faTree,
// } from "@fortawesome/free-solid-svg-icons";

// const container: Variants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
// };

// const item: Variants = {
//   hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
//   show: {
//     opacity: 1,
//     y: 0,
//     filter: "blur(0px)",
//     transition: { type: "spring", stiffness: 120, damping: 18 },
//   },
// };

// const looksOpaqueId = (v: string) =>
//   !!v && /^(?:[0-9a-f]{12,}|[0-9a-f-]{12,}|[a-z0-9]{16,})$/i.test(v);

// export default function OasisHubPage() {
//   const search = useSearchParams();
//   const [ready, setReady] = useState(false);
//   const prefersReducedMotion = useReducedMotion();

//   const oasisId = search?.get("id") ?? "";
//   const hideId = looksOpaqueId(oasisId);

//   const oasisTitle = useMemo(() => {
//     if (!oasisId) return "Your Oasis";
//     return hideId ? "Oasis" : `Oasis – ${oasisId}`;
//   }, [oasisId, hideId]);

//   useEffect(() => {
//     const t = setTimeout(() => setReady(true), 350);
//     return () => clearTimeout(t);
//   }, []);

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden">
//       {/* Background (parallax zoom) */}
//       <motion.img
//         src="/desert.png"
//         alt="Desert background"
//         className="absolute inset-0 h-full w-full object-cover will-change-transform"
//         initial={{ scale: 1 }}
//         animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Subtle noise for texture */}
//       <div
//         aria-hidden
//         className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light"
//         style={{
//           backgroundImage:
//             "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
//           backgroundSize: "160px 160px",
//         }}
//       />

//       {/* Heat-haze band */}
//       <div className="pointer-events-none absolute inset-x-0 top-[20%] h-12 opacity-60">
//         <motion.div
//           className="h-full w-full"
//           style={{
//             background:
//               "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
//             filter: "blur(6px)",
//           }}
//           animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.6, 0.3] }}
//           transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
//         />
//       </div>

//       {/* Aurora blobs */}
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
//         }}
//         animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 16, 0], x: [0, 10, 0] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
//         }}
//         animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -14, 0], x: [0, -8, 0] }}
//         transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Contrast veil */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

//       {/* Shell (narrower overall to make cards smaller horizontally) */}
//       <div className="relative z-10 mx-auto flex min-h-screen w-[min(92vw,56rem)] flex-col items-center justify-center p-4">
//         {/* Header card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.45 }}
//           className="w-full rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
//         >
//           <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//             <div className="flex items-center gap-3">
//               <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
//                 <FontAwesomeIcon icon={faTree} className="h-5 w-5 text-white/90" />
//               </div>
//               <div>
//                 <h1
//                   className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-2xl font-semibold leading-tight text-transparent sm:text-3xl drop-shadow-[0_2px_10px_rgba(255,255,255,0.12)]"
//                   title={oasisId ? `Oasis ID: ${oasisId}` : undefined}
//                 >
//                   {oasisTitle}
//                 </h1>
//                 <p className="text-white/85 text-sm">
//                   Practice, read, build sentences, or edit this oasis.
//                 </p>
//               </div>
//             </div>

//             {/* Back to map */}
//             <div className="flex items-center gap-3">
//               <LinkAsButton
//                 href="/map"
//                 className="
//                   !cursor-pointer rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30
//                   transition !px-5 !py-2.5
//                   min-w-[8.5rem] justify-center shrink-0 whitespace-nowrap
//                   focus:outline-none focus:ring-2 focus:ring-white/70
//                 "
//                 aria-label="Back to map"
//               >
//                 <span className="inline-flex items-center gap-2">
//                   <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
//                   Back to Map
//                 </span>
//               </LinkAsButton>
//             </div>
//           </div>
//         </motion.div>

//         {/* Actions grid (narrower cards: smaller gap & inner padding) */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate={ready ? "show" : "hidden"}
//           className="mt-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
//         >
//           {[
//             {
//               href: `/oasis/quiz${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
//               icon: faCircleQuestion,
//               title: "Quiz",
//               desc: "Test yourself with targeted questions.",
//               aria: "Open Quiz",
//             },
//             {
//               href: `/oasis/story${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
//               icon: faBookOpen,
//               title: "Story",
//               desc: "Immerse in context with short tales.",
//               aria: "Read Story",
//             },
//             {
//               href: `/oasis/sentences${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
//               icon: faPenNib,
//               title: "Sentences",
//               desc: "Craft example sentences and variations.",
//               aria: "Build Sentences",
//             },
//             {
//               href: `/oasis/edit${oasisId ? `?id=${encodeURIComponent(oasisId)}` : ""}`,
//               icon: faWandMagicSparkles,
//               title: "Edit Oasis",
//               desc: "Tweak words, hints, and difficulty.",
//               aria: "Edit Oasis",
//             },
//           ].map(({ href, icon, title, desc, aria }) => (
//             <motion.div
//               key={title}
//               variants={item}
//               className="relative rounded-2xl ring-1 ring-white/15 backdrop-blur-xl shadow-2xl group bg-white/10"
//               style={{ transformPerspective: 800 }}
//               whileHover={{
//                 y: -6,
//                 rotateX: prefersReducedMotion ? 0 : 2,
//                 rotateY: prefersReducedMotion ? 0 : -2,
//                 transition: { type: "spring", stiffness: 180, damping: 15 },
//               }}
//               whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 300, damping: 20 } }}
//             >
//               {/* Subtle diagonal shimmer (indigo/cyan tint) */}
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
//                 style={{
//                   background:
//                     "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.10) 40%, transparent 60%)",
//                   maskImage:
//                     "radial-gradient(200% 60% at 0% 0%, black 30%, transparent 65%)",
//                   WebkitMaskImage:
//                     "radial-gradient(200% 60% at 0% 0%, black 30%, transparent 65%)",
//                 }}
//               />
//               {/* Gentle border tint on hover */}
//               <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-indigo-300/30 transition" />

//               <LinkAsButton
//                 href={href}
//                 className="
//                   !cursor-pointer group flex w-full items-center justify-between
//                   rounded-2xl px-5 py-5 min-h-[6.75rem]
//                   bg-transparent !text-white text-left
//                   transition focus:outline-none focus:ring-2 focus:ring-white/70
//                 "
//                 aria-label={aria}
//               >
//                 <div className="inline-flex items-center gap-3">
//                   <span className="relative grid h-7 w-7 place-items-center">
//                     {/* soft halo */}
//                     <span
//                       aria-hidden
//                       className="absolute h-8 w-8 rounded-full ring-1 ring-white/25 bg-white/15 transition-transform duration-300 group-hover:scale-110"
//                     />
//                     <FontAwesomeIcon
//                       icon={icon}
//                       className="relative h-4 w-4 transition-transform group-hover:-translate-y-0.5"
//                     />
//                   </span>
//                   <div className="leading-tight">
//                     <div className="text-base font-semibold">{title}</div>
//                     <div className="text-[13px] text-white/80">{desc}</div>
//                   </div>
//                 </div>
//               </LinkAsButton>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Footer tip */}
//         <p className="mt-6 text-center text-xs text-white/75">
//           Tip: Each section is tailored to this oasis—quiz yourself, read context, or craft sentences.
//         </p>
//       </div>
//     </div>
//   );
// }
