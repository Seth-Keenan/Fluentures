// "use client";

// import React, { useState } from "react";
// import { Button } from "@/app/components/Button";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import WordMatcher from "./WordMatcher";
// import WrittenQuiz from "./WrittenQuiz";
// import { useListId } from "@/app/lib/hooks/useListId";

// export default function Quiz() {
//   const [selectedQuiz, setSelectedQuiz] = useState<"matching" | "written" | null>(null);
//   const listId = useListId();

//   const handleBackToChooser = () => setSelectedQuiz(null);

// return (
//   <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
//     <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-6">
//       {/* QUIZ SELECTION MENU */}
//       {selectedQuiz === null && (
//         <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
//           <div className="mb-6 text-center">
//             <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Choose a Quiz</h1>
//           </div>

//           <div className="mx-auto grid max-w-md gap-3 sm:grid-cols-2">
//             <Button onClick={() => setSelectedQuiz("matching")} className="px-4 py-3">
//               Matching Tiles
//             </Button>
//             <Button onClick={() => setSelectedQuiz("written")} className="px-4 py-3">
//               Written Quiz
//             </Button>
//           </div>

//           <div className="mt-6 flex justify-center">
//             {listId ? (
//               <LinkAsButton href={`/oasis/${listId}`} className="px-5 py-2">
//                 Back
//               </LinkAsButton>
//             ) : (
//               <LinkAsButton href="/oasis" className="px-5 py-2">
//                 Back
//               </LinkAsButton>
//             )}
//           </div>
//         </section>
//       )}

//       {/* MATCHING QUIZ */}
//       {selectedQuiz === "matching" && (
//         <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-lg font-semibold tracking-tight md:text-xl">Matching Tiles</h2>
//             <Button onClick={handleBackToChooser}>Back</Button>
//           </div>
//           <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
//             <WordMatcher />
//           </div>
//         </section>
//       )}

//       {/* WRITTEN QUIZ */}
//       {selectedQuiz === "written" && (
//         <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-lg font-semibold tracking-tight md:text-xl">Written Quiz</h2>
//             <Button onClick={handleBackToChooser}>Back</Button>
//           </div>
//           <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
//             <WrittenQuiz />
//           </div>
//         </section>
//       )}
//     </div>
//   </div>
// );

// }

// app/oasis/quiz/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import WordMatcher from "./WordMatcher";
import WrittenQuiz from "./WrittenQuiz";
import { useListId } from "@/app/lib/hooks/useListId";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge, // Matching tiles
  faKeyboard,        // Written quiz
  faArrowLeft,       // Back
  faWandMagicSparkles, // Accent badge
} from "@fortawesome/free-solid-svg-icons";

type Mode = "matching" | "written" | null;

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

export default function Quiz() {
  const [selectedQuiz, setSelectedQuiz] = useState<Mode>(null);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const listId = useListId();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const backHref = listId ? `/oasis/${listId}` : "/oasis";

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

      {/* Heat-haze band */}
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-12 opacity-60">
        <motion.div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
            filter: "blur(6px)",
          }}
          animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Glow blobs */}
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

      {/* Soft gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      {/* Shell */}
      <div className="relative z-10 mx-auto flex min-h-screen w-[min(92vw,64rem)] flex-col items-center justify-center p-4">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
                  Choose a Quiz
                </h1>
                <p className="text-white/85 text-sm">
                  Practice vocab your way—matching tiles or a written challenge.
                </p>
              </div>
            </div>

            <LinkAsButton
              href={backHref}
              className="!cursor-pointer rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 transition !px-6 !py-2 min-w-[12rem] md:min-w-[14rem] justify-center shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="Back to Oasis"
            >
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                Back to Oasis
              </span>
            </LinkAsButton>
          </div>
        </motion.div>

        {/* Selection or Active Quiz */}
        {selectedQuiz === null ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            className="mt-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2"
          >
            {/* Matching Tiles card */}
            <motion.div
              variants={item}
              className="rounded-2xl ring-1 ring-white/25 bg-white/10 backdrop-blur-xl shadow-2xl"
              style={{ transformPerspective: 800 }}
              whileHover={{
                y: -6,
                rotateX: 2,
                rotateY: -2,
                transition: { type: "spring", stiffness: 180, damping: 15 },
              }}
              whileTap={{
                scale: 0.98,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            >
              <button
                onClick={() => setSelectedQuiz("matching")}
                className="
                  !cursor-pointer group flex w-full items-center justify-between
                  rounded-2xl px-7 py-6 min-h-[7.25rem]
                  bg-transparent text-left text-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                "
                aria-label="Start Matching Tiles"
              >
                <div className="inline-flex items-start gap-3">
                  {/* Icon inside a circular glass chip */}
                  <span className="relative grid h-9 w-9 place-items-center">
                    <span
                      aria-hidden
                      className="absolute h-10 w-10 rounded-full bg-white/20 ring-1 ring-white/30"
                    />
                    <FontAwesomeIcon
                      icon={faTableCellsLarge}
                      className="relative h-5 w-5 transition-transform group-hover:-translate-y-0.5"
                    />
                  </span>

                  <div>
                    <div className="text-lg font-semibold">Matching Tiles</div>
                    <div className="text-[13px] text-white/80">
                      Pair words with meanings—fast and visual.
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Written Quiz card */}
            <motion.div
              variants={item}
              className="rounded-2xl ring-1 ring-white/25 bg-white/10 backdrop-blur-xl shadow-2xl"
              style={{ transformPerspective: 800 }}
              whileHover={{
                y: -6,
                rotateX: 2,
                rotateY: -2,
                transition: { type: "spring", stiffness: 180, damping: 15 },
              }}
              whileTap={{
                scale: 0.98,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            >
              <button
                onClick={() => setSelectedQuiz("written")}
                className="
                  !cursor-pointer group flex w-full items-center justify-between
                  rounded-2xl px-7 py-6 min-h-[7.25rem]
                  bg-transparent text-left text-white
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                "
                aria-label="Start Written Quiz"
              >
                <div className="inline-flex items-start gap-3">
                  {/* Icon inside a circular glass chip */}
                  <span className="relative grid h-9 w-9 place-items-center">
                    <span
                      aria-hidden
                      className="absolute h-10 w-10 rounded-full bg-white/20 ring-1 ring-white/30"
                    />
                    <FontAwesomeIcon
                      icon={faKeyboard}
                      className="relative h-5 w-5 transition-transform group-hover:-translate-y-0.5"
                    />
                  </span>

                  <div>
                    <div className="text-lg font-semibold">Written Quiz</div>
                    <div className="text-[13px] text-white/80">
                      Type your answers and check understanding.
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          // --- Active Quiz Panel ---
          <motion.div
            key={selectedQuiz}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="mt-6 w-full rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Top controls */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-white/90 text-sm">
                {selectedQuiz === "matching" ? "Matching Tiles" : "Written Quiz"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedQuiz(null)}
                  className="!cursor-pointer !rounded-lg !px-4 !py-2 !bg-amber-500 hover:!bg-amber-400 !text-white shadow-md"
                >
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                    Back
                  </span>
                </Button>
                <LinkAsButton
                  href={backHref}
                  className="!cursor-pointer rounded-lg bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25 transition !px-4 !py-2"
                >
                  Oasis Hub
                </LinkAsButton>
              </div>
            </div>

            {/* Render selected quiz */}
            <div className="rounded-xl bg-white/90 p-3 sm:p-4 ring-1 ring-white/30 shadow-lg">
              {selectedQuiz === "matching" && <WordMatcher />}
              {selectedQuiz === "written" && <WrittenQuiz />}
            </div>
          </motion.div>
        )}

        {/* Footer tip */}
        {selectedQuiz === null && (
          <p className="mt-6 text-center text-xs text-white/75">
            Tip: You can switch modes anytime—each strengthens different skills.
          </p>
        )}
      </div>
    </div>
  );
}

// // app/oasis/quiz/page.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { motion, useReducedMotion, type Variants } from "framer-motion";
// import { Button } from "@/app/components/Button";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import WordMatcher from "./WordMatcher";
// import WrittenQuiz from "./WrittenQuiz";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faTableCellsLarge, // Matching tiles
//   faKeyboard,        // Written quiz
//   faArrowLeft,       // Back
//   faWandMagicSparkles, // Accent badge
// } from "@fortawesome/free-solid-svg-icons";

// type Mode = "matching" | "written" | null;

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

// export default function Quiz() {
//   const [selectedQuiz, setSelectedQuiz] = useState<Mode>(null);
//   const [ready, setReady] = useState(false);
//   const prefersReducedMotion = useReducedMotion();

//   useEffect(() => {
//     const t = setTimeout(() => setReady(true), 300);
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

//       {/* Heat-haze band */}
//       <div className="pointer-events-none absolute inset-x-0 top-[22%] h-12 opacity-60">
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

//       {/* Glow blobs */}
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

//       {/* Soft gradient overlay for contrast */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

//       {/* Shell */}
//       <div className="relative z-10 mx-auto flex min-h-screen w-[min(92vw,64rem)] flex-col items-center justify-center p-4">
//         {/* Header card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.45 }}
//           className="w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
//         >
//           <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//             <div className="flex items-center gap-3">
//               <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
//                 <FontAwesomeIcon icon={faWandMagicSparkles} className="h-5 w-5 text-white/90" />
//               </div>
//               <div>
//                 <h1 className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
//                   Choose a Quiz
//                 </h1>
//                 <p className="text-white/85 text-sm">
//                   Practice vocab your way—matching tiles or a written challenge.
//                 </p>
//               </div>
//             </div>

//             <LinkAsButton
//               href="/oasis"
//               className="!cursor-pointer rounded-lg bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 transition !px-6 !py-2 min-w-[12rem] md:min-w-[14rem] justify-center shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/70"
//               aria-label="Back to Oasis"
//             >
//               <span className="inline-flex items-center gap-2">
//                 <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
//                 Back to Oasis
//               </span>
//             </LinkAsButton>
//           </div>
//         </motion.div>

//         {/* Selection or Active Quiz */}
//         {selectedQuiz === null ? (
//           <motion.div
//             variants={container}
//             initial="hidden"
//             animate={ready ? "show" : "hidden"}
//             className="mt-6 grid w-full grid-cols-1 gap-5 sm:grid-cols-2"
//           >
//             {/* Matching Tiles card */}
//             <motion.div
//               variants={item}
//               className="rounded-2xl ring-1 ring-white/25 bg-white/10 backdrop-blur-xl shadow-2xl"
//               style={{ transformPerspective: 800 }}
//               whileHover={{
//                 y: -6,
//                 rotateX: 2,
//                 rotateY: -2,
//                 transition: { type: "spring", stiffness: 180, damping: 15 },
//               }}
//               whileTap={{
//                 scale: 0.98,
//                 transition: { type: "spring", stiffness: 300, damping: 20 },
//               }}
//             >
//               <button
//                 onClick={() => setSelectedQuiz("matching")}
//                 className="
//                   !cursor-pointer group flex w-full items-center justify-between
//                   rounded-2xl px-7 py-6 min-h-[7.25rem]
//                   bg-transparent text-left text-white
//                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
//                 "
//                 aria-label="Start Matching Tiles"
//               >
//                 <div className="inline-flex items-start gap-3">
//                   {/* Icon inside a circular glass chip */}
//                   <span className="relative grid h-9 w-9 place-items-center">
//                     <span
//                       aria-hidden
//                       className="absolute h-10 w-10 rounded-full bg-white/20 ring-1 ring-white/30"
//                     />
//                     <FontAwesomeIcon
//                       icon={faTableCellsLarge}
//                       className="relative h-5 w-5 transition-transform group-hover:-translate-y-0.5"
//                     />
//                   </span>

//                   <div>
//                     <div className="text-lg font-semibold">Matching Tiles</div>
//                     <div className="text-[13px] text-white/80">
//                       Pair words with meanings—fast and visual.
//                     </div>
//                   </div>
//                 </div>

//                 {/* removed the right-side decorative dot */}
//               </button>
//             </motion.div>

//             {/* Written Quiz card */}
//             <motion.div
//               variants={item}
//               className="rounded-2xl ring-1 ring-white/25 bg-white/10 backdrop-blur-xl shadow-2xl"
//               style={{ transformPerspective: 800 }}
//               whileHover={{
//                 y: -6,
//                 rotateX: 2,
//                 rotateY: -2,
//                 transition: { type: "spring", stiffness: 180, damping: 15 },
//               }}
//               whileTap={{
//                 scale: 0.98,
//                 transition: { type: "spring", stiffness: 300, damping: 20 },
//               }}
//             >
//               <button
//                 onClick={() => setSelectedQuiz("written")}
//                 className="
//                   !cursor-pointer group flex w-full items-center justify-between
//                   rounded-2xl px-7 py-6 min-h-[7.25rem]
//                   bg-transparent text-left text-white
//                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80
//                 "
//                 aria-label="Start Written Quiz"
//               >
//                 <div className="inline-flex items-start gap-3">
//                   {/* Icon inside a circular glass chip */}
//                   <span className="relative grid h-9 w-9 place-items-center">
//                     <span
//                       aria-hidden
//                       className="absolute h-10 w-10 rounded-full bg-white/20 ring-1 ring-white/30"
//                     />
//                     <FontAwesomeIcon
//                       icon={faKeyboard}
//                       className="relative h-5 w-5 transition-transform group-hover:-translate-y-0.5"
//                     />
//                   </span>

//                   <div>
//                     <div className="text-lg font-semibold">Written Quiz</div>
//                     <div className="text-[13px] text-white/80">
//                       Type your answers and check understanding.
//                     </div>
//                   </div>
//                 </div>

//                 {/* removed the right-side decorative dot */}
//               </button>
//             </motion.div>
//           </motion.div>
//         ) : (
//           // --- Active Quiz Panel ---
//           <motion.div
//             key={selectedQuiz}
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10 }}
//             transition={{ duration: 0.4 }}
//             className="mt-6 w-full rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
//           >
//             {/* Top controls */}
//             <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//               <div className="text-white/90 text-sm">
//                 {selectedQuiz === "matching" ? "Matching Tiles" : "Written Quiz"}
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button
//                   onClick={() => setSelectedQuiz(null)}
//                   className="!cursor-pointer !rounded-lg !px-4 !py-2 !bg-amber-500 hover:!bg-amber-400 !text-white shadow-md"
//                 >
//                   <span className="inline-flex items-center gap-2">
//                     <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
//                     Back
//                   </span>
//                 </Button>
//                 <LinkAsButton
//                   href="/oasis"
//                   className="!cursor-pointer rounded-lg bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25 transition !px-4 !py-2"
//                 >
//                   Oasis Hub
//                 </LinkAsButton>
//               </div>
//             </div>

//             {/* Render selected quiz */}
//             <div className="rounded-xl bg-white/90 p-3 sm:p-4 ring-1 ring-white/30 shadow-lg">
//               {selectedQuiz === "matching" && <WordMatcher />}
//               {selectedQuiz === "written" && <WrittenQuiz />}
//             </div>
//           </motion.div>
//         )}

//         {/* Footer tip */}
//         {selectedQuiz === null && (
//           <p className="mt-6 text-center text-xs text-white/75">
//             Tip: You can switch modes anytime—each strengthens different skills.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
