// "use client";

// import { useEffect, useState } from "react";
// import { motion, type Variants } from "framer-motion";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faRightToBracket, // Login
//   faUserPlus,       // Signup
// } from "@fortawesome/free-solid-svg-icons";
// import { LinkAsButton } from "./components/LinkAsButton";

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.08, delayChildren: 0.15, duration: 0.5 },
//   },
// } satisfies Variants;

// const item = {
//   hidden: { opacity: 0, y: 14 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
// } satisfies Variants;

// export default function Home() {
//   const [ready, setReady] = useState(false);
//   useEffect(() => {
//     const t = setTimeout(() => setReady(true), 600);
//     return () => clearTimeout(t);
//   }, []);

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden">
//       {/* Background with gentle zoom */}
//       <motion.img
//         src="/desert.png"
//         alt="Background"
//         className="absolute inset-0 h-full w-full object-cover"
//         initial={{ scale: 1 }}
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Soft gradient/dim for contrast */}
//       <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

//       {/* Glow blobs for depth */}
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

//       {/* Centered glass panel */}
//       <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
//         <motion.div
//           className="w-[min(92vw,36rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
//           initial={{ opacity: 0, scale: 0.98, y: 8 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           transition={{ duration: 0.45 }}
//         >
//           <motion.div
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.15, duration: 0.35 }}
//             className="text-center"
//           >
//             <h1 className="text-white text-3xl sm:text-4xl font-semibold">
//               Welcome to Fluentures
//             </h1>
//             <p className="mt-2 text-white/80 text-sm sm:text-base">
//               Jump back in or create a new account to get started.
//             </p>
//           </motion.div>

//           {/* Two fancy buttons */}
//           <motion.div
//             variants={container}
//             initial="hidden"
//             animate={ready ? "show" : "hidden"}
//             className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
//           >
//             {/* Login */}
//             <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
//               <LinkAsButton
//                 href="/login"
//                 className="
//                   group w-full justify-center
//                   rounded-xl px-5 py-3
//                   bg-white/90 !text-gray-900 hover:bg-white
//                   shadow-lg shadow-black/20
//                   ring-1 ring-white/30
//                   transition duration-200
//                   font-medium tracking-wide text-base
//                   focus:outline-none focus:ring-2 focus:ring-indigo-400
//                 "
//                 aria-label="Log in"
//               >
//                 <span className="inline-flex items-center gap-3">
//                   <FontAwesomeIcon className="h-5 w-5 transition -translate-x-0 group-hover:-translate-x-0.5" icon={faRightToBracket} />
//                   <span>Log in</span>
//                 </span>
//               </LinkAsButton>
//             </motion.div>

//             {/* Sign up (accent) */}
//             <motion.div variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
//               <LinkAsButton
//                 href="/signup"
//                 className="
//                   group w-full justify-center
//                   rounded-xl px-5 py-3
//                   bg-indigo-500 text-white hover:bg-indigo-400
//                   shadow-lg shadow-black/20
//                   ring-1 ring-white/20
//                   transition duration-200
//                   font-semibold tracking-wide text-base
//                   focus:outline-none focus:ring-2 focus:ring-white/80
//                 "
//                 aria-label="Sign up"
//               >
//                 <span className="inline-flex items-center gap-3">
//                   <FontAwesomeIcon className="h-5 w-5 transition group-hover:translate-x-0.5" icon={faUserPlus} />
//                   <span>Sign up</span>
//                 </span>
//               </LinkAsButton>
//             </motion.div>
//           </motion.div>

//           {/* Tiny footer hint */}
//           <p className="mt-6 text-center text-xs text-white/70">
//             -camelCase🐪-
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// // app/page.tsx
// "use client";

// import { motion, useReducedMotion } from "framer-motion";

// export default function LandingIntro() {
//   const prefersReducedMotion = useReducedMotion();

//   return (
//     <div className="relative w-full overflow-x-hidden">
//       {/* Fixed background so the page scrolls */}
//       <motion.img
//         src="/desert.png"
//         alt="Background"
//         className="fixed inset-0 h-full w-full object-cover"
//         initial={{ scale: 1 }}
//         animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

//       {/* INTRO HERO */}
//       <section className="relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 pt-6">
//         <motion.div
//           className="w-[min(92vw,48rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-12"
//           initial={{ opacity: 0, scale: 0.98, y: 8 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           transition={{ duration: 0.45 }}
//         >
//           <motion.h1
//             className="text-white text-3xl sm:text-5xl font-semibold text-center"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1, duration: 0.45 }}
//           >
//             Fluentures makes language learning consistent, visible, and fun.
//           </motion.h1>
//           <motion.p
//             className="mt-4 text-white/85 text-center text-base sm:text-lg"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.45 }}
//           >
//             Track XP and streaks, save words with examples, and see your progress at a glance.
//             Learn solo or with friends—any time, anywhere.
//           </motion.p>

//           <motion.div
//             className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center"
//             initial="hidden"
//             animate="show"
//             variants={{
//               hidden: {},
//               show: { transition: { staggerChildren: 0.07, when: "beforeChildren" } },
//             }}
//           >
//             {[
//               { title: "XP & Streaks", body: "Earn XP every session and keep your streak alive." },
//               { title: "Save Vocabulary", body: "Bookmark words with examples and study later." },
//               { title: "Progress You Can See", body: "Time spent, lists made, favorites & more." },
//             ].map((f) => (
//               <motion.div
//                 key={f.title}
//                 className="rounded-xl bg-white/10 text-white ring-1 ring-white/20 shadow-lg shadow-black/10 p-5"
//                 initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
//                 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
//                 transition={{ type: "spring", stiffness: 120, damping: 18 }}
//                 whileHover={{ y: -3 }}
//               >
//                 <div className="text-base font-semibold">{f.title}</div>
//                 <div className="mt-1 text-sm text-white/85">{f.body}</div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* (Optional) More sections… keep your existing “Features / How it works / Why” sections below */}
//       <div className="relative z-10 px-4 py-12">
//         <div className="mx-auto w-[min(92vw,70rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
//           <h2 className="text-white text-2xl sm:text-3xl font-semibold text-center">Why Fluentures?</h2>
//           <p className="text-white/85 mt-3 text-center">
//             It’s simple, fast, and fun. Fluentures wraps serious learning tools in a playful UI, so making
//             progress feels rewarding—not like a chore.
//           </p>
//           <p className="text-white/75 mt-3 text-center text-sm">
//             Ready to jump in? Use the <span className="font-semibold">Sign in</span> or <span className="font-semibold">Sign up</span> buttons in the top right.
//           </p>
//         </div>
//       </div>

//       <div className="h-10" />
//     </div>
//   );
// }


// // app/page.tsx
// "use client";

// import BackToTop from "./components/BackToTop";
// import { useEffect, useMemo } from "react";
// import {
//   motion,
//   useAnimation,
//   useInView,
//   useMotionValue,
//   animate,
//   useReducedMotion,
//   useScroll,
//   useTransform,
//   type Variants,
// } from "framer-motion";
// import { useRef } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faBolt,
//   faClock,
//   faBookmark,
//   faUsers,
//   faBookOpen,
//   faMapLocationDot,
//   faFire,
//   faStar,
// } from "@fortawesome/free-solid-svg-icons";

// /* -----------------------------
//    Small helpers (local)
// ------------------------------*/

// // Reveal that re-animates whenever it enters the viewport
// function useRevealControls(amount = 0.25) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { amount });
//   const controls = useAnimation();
//   useEffect(() => {
//     controls.start(inView ? "show" : "hidden"); // reset when leaving
//   }, [inView, controls]);
//   return { ref, controls };
// }

// const fadeInUp: Variants = {
//   hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
//   show: {
//     opacity: 1,
//     y: 0,
//     filter: "blur(0px)",
//     transition: { type: "spring", stiffness: 120, damping: 18 },
//   },
// };

// const containerStagger = (delay = 0.08): Variants => ({
//   hidden: {},
//   show: { transition: { when: "beforeChildren", staggerChildren: delay } },
// });

// // Count-up number that animates when visible
// function StatCount({ to, suffix = "", duration = 1.2 }: { to: number; suffix?: string; duration?: number }) {
//   const ref = useRef<HTMLSpanElement>(null);
//   const mv = useMotionValue(0);
//   const reveal = useRevealControls(0.3);

//   useEffect(() => {
//     if (!ref.current) return;
//     // animate when controls becomes "show"
//     reveal.controls.start("show").then(() => {
//       animate(mv, to, { duration, ease: "easeOut" });
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once; value animates on mount when visible

//   useEffect(() => {
//     const unsub = mv.on("change", (v) => {
//       if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
//     });
//     return () => unsub();
//   }, [mv, suffix]);

//   return (
//     <motion.span ref={ref} variants={fadeInUp} />
//   );
// }

// /* Card-ish helpers */
// function FeatureCard({
//   icon,
//   title,
//   desc,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   desc: string;
// }) {
//   const { ref, controls } = useRevealControls(0.25);
//   return (
//     <motion.div
//       ref={ref}
//       variants={fadeInUp}
//       initial="hidden"
//       animate={controls}
//       whileHover={{ y: -4, scale: 1.02 }}
//       transition={{ type: "spring", stiffness: 180, damping: 16 }}
//       className="rounded-xl bg-white/90 text-gray-900 p-5 ring-1 ring-white/30 shadow-lg shadow-black/20"
//       style={{ transformOrigin: "center" }}
//     >
//       <div className="flex items-center gap-3">
//         <div className="grid place-items-center h-10 w-10 rounded-full bg-indigo-50 ring-1 ring-indigo-200">
//           {icon}
//         </div>
//         <h3 className="font-semibold">{title}</h3>
//       </div>
//       <p className="mt-2 text-sm text-gray-700">{desc}</p>
//     </motion.div>
//   );
// }

// function Step({
//   icon,
//   title,
//   desc,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   desc: string;
// }) {
//   const { ref, controls } = useRevealControls(0.25);
//   return (
//     <motion.div
//       ref={ref}
//       variants={fadeInUp}
//       initial="hidden"
//       animate={controls}
//       whileHover={{ y: -3 }}
//       className="rounded-xl bg-white/10 text-white ring-1 ring-white/20 shadow-lg shadow-black/10 p-5"
//     >
//       <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
//         {icon}
//         <span className="text-sm">{title}</span>
//       </div>
//       <p className="mt-3 text-sm text-white/85">{desc}</p>
//     </motion.div>
//   );
// }

// /* -----------------------------
//    Page
// ------------------------------*/

// export default function LandingEngaging() {
//   const prefersReducedMotion = useReducedMotion();

//   // parallax on hero title
//   const { scrollY } = useScroll();
//   const heroY = useTransform(scrollY, [0, 300], [0, prefersReducedMotion ? 0 : -20]);
//   const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.85]);

//   // marquee items
//   const marquee = useMemo(
//     () => [
//       "Daily XP",
//       "Keep Streaks",
//       "Save Words",
//       "Friendly Challenges",
//       "Quick Sessions",
//       "Smart Reviews",
//       "Progress You Can See",
//       "Learn Together",
//     ],
//     []
//   );

//   return (
//     <div className="relative w-full overflow-x-hidden">
//       {/* Background */}
//       <motion.img
//         src="/desert.png"
//         alt="Background"
//         className="fixed inset-0 h-full w-full object-cover"
//         initial={{ scale: 1 }}
//         animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

//       {/* Decorative glow blobs */}
//       {!prefersReducedMotion && (
//         <>
//           <motion.div
//             aria-hidden
//             className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
//             style={{
//               background:
//                 "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
//             }}
//             animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
//             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.div
//             aria-hidden
//             className="pointer-events-none fixed -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
//             style={{
//               background:
//                 "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
//             }}
//             animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
//             transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//           />
//         </>
//       )}

//       {/* HERO */}
//       <section className="relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 pt-6">
//         <motion.div
//           className="w-[min(92vw,52rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-12"
//           initial={{ opacity: 0, scale: 0.98, y: 8 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           transition={{ duration: 0.45 }}
//         >
//           <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center">
//             <motion.h1
//               className="text-white text-3xl sm:text-5xl font-semibold leading-tight"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1, duration: 0.45 }}
//             >
//               Fluentures makes language learning
//               <span className="relative whitespace-nowrap">
//                 <span className="mx-2 px-2 rounded-lg bg-indigo-500/80">consistent</span>
//               </span>
//               and
//               <span className="relative whitespace-nowrap">
//                 <span className="mx-2 px-2 rounded-lg bg-amber-400/80">fun</span>
//               </span>
//               .
//             </motion.h1>
//             <motion.p
//               className="mt-4 text-white/85 text-base sm:text-lg"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2, duration: 0.45 }}
//             >
//               Track XP & streaks, save words with examples, and see your progress at a glance.
//               Learn solo or with friends—any time, anywhere.
//             </motion.p>

//             {/* animated badges */}
//             <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
//               {[
//                 { icon: faFire, text: "Daily streaks" },
//                 { icon: faBookmark, text: "Saved words" },
//                 { icon: faClock, text: "Time tracked" },
//                 { icon: faBolt, text: "XP every session" },
//               ].map(({ icon, text }) => (
//                 <motion.span
//                   key={text}
//                   className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-white/95 ring-1 ring-white/20"
//                   initial={{ opacity: 0, y: 8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.4 }}
//                 >
//                   <FontAwesomeIcon icon={icon} className="h-4 w-4" />
//                   <span className="text-sm">{text}</span>
//                 </motion.span>
//               ))}
//             </div>

//             <motion.p
//               className="mt-4 text-white/85 text-base sm:text-lg"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2, duration: 0.45 }}
//             >
//               --camelCase🐪--
//             </motion.p>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* MARQUEE */}
//       <section className="relative z-10 px-0 py-6">
//         <div className="overflow-hidden">
//           <div className="flex gap-6 whitespace-nowrap animate-[marquee_22s_linear_infinite] px-6">
//             {marquee.concat(marquee).map((label, idx) => (
//               <span
//                 key={`${label}-${idx}`}
//                 className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 ring-1 ring-white/20"
//               >
//                 <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
//                 <span className="text-sm">{label}</span>
//               </span>
//             ))}
//           </div>
//         </div>
//         {/* marquee keyframes */}
//         <style jsx>{`
//           @keyframes marquee {
//             0% { transform: translateX(0); }
//             100% { transform: translateX(-50%); }
//           }
//         `}</style>
//       </section>

//       {/* FEATURES */}
//       <section className="relative z-10 px-4 py-12">
//         <div className="mx-auto w-[min(92vw,70rem)]">
//           <motion.h2
//             className="text-white text-2xl sm:text-3xl font-semibold text-center"
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ amount: 0.25 }}
//             transition={{ duration: 0.5 }}
//           >
//             Everything you need to stay consistent
//           </motion.h2>
//           <motion.p
//             className="text-white/80 text-center mt-2"
//             initial={{ opacity: 0, y: 8 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ amount: 0.3 }}
//             transition={{ duration: 0.5 }}
//           >
//             Track progress, save vocabulary, and learn with friends.
//           </motion.p>

//           <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             <FeatureCard
//               icon={<FontAwesomeIcon icon={faBolt} className="h-5 w-5 text-indigo-600" />}
//               title="XP & Streaks"
//               desc="Earn XP for every session and keep your learning streak alive."
//             />
//             <FeatureCard
//               icon={<FontAwesomeIcon icon={faClock} className="h-5 w-5 text-indigo-600" />}
//               title="Time Tracking"
//               desc="See exactly how much time you spend learning each week."
//             />
//             <FeatureCard
//               icon={<FontAwesomeIcon icon={faBookmark} className="h-5 w-5 text-indigo-600" />}
//               title="Save Vocabulary"
//               desc="Bookmark words with examples and revisit them anytime."
//             />
//             <FeatureCard
//               icon={<FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-indigo-600" />}
//               title="Learn Together"
//               desc="Invite friends, compare progress, and keep each other motivated."
//             />
//           </div>
//         </div>
//       </section>

//       {/* STATS */}
//       <section className="relative z-10 px-4 py-10">
//         <div className="mx-auto w-[min(92vw,70rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
//             <div className="text-white">
//               <div className="text-3xl font-semibold">
//                 <StatCount to={12450} suffix="+" />
//               </div>
//               <div className="text-white/80 text-sm mt-1">XP earned</div>
//             </div>
//             <div className="text-white">
//               <div className="text-3xl font-semibold">
//                 <StatCount to={732} />
//               </div>
//               <div className="text-white/80 text-sm mt-1">Minutes learning</div>
//             </div>
//             <div className="text-white">
//               <div className="text-3xl font-semibold">
//                 <StatCount to={86} />
//               </div>
//               <div className="text-white/80 text-sm mt-1">Words saved</div>
//             </div>
//             <div className="text-white">
//               <div className="text-3xl font-semibold">
//                 <StatCount to={12} />
//               </div>
//               <div className="text-white/80 text-sm mt-1">Day streak</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section className="relative z-10 px-4 py-12">
//         <div className="mx-auto w-[min(92vw,70rem)]">
//           <motion.h2
//             className="text-white text-2xl sm:text-3xl font-semibold text-center"
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ amount: 0.25 }}
//             transition={{ duration: 0.5 }}
//           >
//             How it works
//           </motion.h2>
//           <div className="mt-6 grid gap-6 sm:grid-cols-3">
//             <Step
//               icon={<FontAwesomeIcon icon={faMapLocationDot} className="h-5 w-5" />}
//               title="1. Pick a path"
//               desc="Choose a language focus or theme, and set your daily goal."
//             />
//             <Step
//               icon={<FontAwesomeIcon icon={faBookOpen} className="h-5 w-5" />}
//               title="2. Practice daily"
//               desc="Short sessions that fit your day—earn XP and build streaks."
//             />
//             <Step
//               icon={<FontAwesomeIcon icon={faBookmark} className="h-5 w-5" />}
//               title="3. Save & review"
//               desc="Collect words with examples. Review when you’re ready."
//             />
//           </div>
//         </div>
//       </section>

//       {/* CTA STRIP */}
//       <section className="relative z-10 px-4 pb-14">
//         <div className="mx-auto w-[min(92vw,60rem)] text-center">
//           <motion.h3
//             className="text-white text-xl sm:text-2xl font-semibold"
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ amount: 0.3 }}
//             transition={{ duration: 0.45 }}
//           >
//             Ready to start your journey?
//           </motion.h3>
//           <motion.p
//             className="text-white/85 mt-3"
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ amount: 0.3 }}
//             transition={{ duration: 0.45 }}
//           >
//             Use the <span className="font-semibold">Sign in</span> or{" "}
//             <span className="font-semibold">Sign up</span> buttons in the top-right navbar.
//           </motion.p>
//         </div>
//       </section>

//       <div className="h-10" />
//     </div>
    
//   );
// }

// app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
  type Variants,
} from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faClock,
  faBookmark,
  faUsers,
  faBookOpen,
  faMapLocationDot,
  faFire,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import BackToTop from "./components/BackToTop";

/* -----------------------------
   Reveal helpers
------------------------------*/

function useRevealControls(amount = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount });
  const controls = useAnimation();
  useEffect(() => {
    controls.start(inView ? "show" : "hidden");
  }, [inView, controls]);
  return { ref, controls };
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

const containerStagger = (delay = 0.08): Variants => ({
  hidden: {},
  show: { transition: { when: "beforeChildren", staggerChildren: delay } },
});

/* -----------------------------
   Small components
------------------------------*/

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const { ref, controls } = useRevealControls(0.25);
  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
      className="rounded-xl bg-white/90 text-gray-900 p-5 ring-1 ring-white/30 shadow-lg shadow-black/20"
      style={{ transformOrigin: "center" }}
    >
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-full bg-indigo-50 ring-1 ring-indigo-200">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-gray-700">{desc}</p>
    </motion.div>
  );
}

function Step({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const { ref, controls } = useRevealControls(0.25);
  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -3 }}
      className="rounded-xl bg-white/10 text-white ring-1 ring-white/20 shadow-lg shadow-black/10 p-5"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="mt-3 text-sm text-white/85">{desc}</p>
    </motion.div>
  );
}

// Count-up number that animates when first scrolled into view
function StatCount({
  to,
  suffix = "",
  duration = 1.2,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.5 });
  const mv = useMotionValue(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView && !started) {
      setStarted(true);
      animate(mv, to, { duration, ease: "easeOut" });
    }
  }, [inView, started, mv, to, duration]);

  useEffect(() => {
    const unsub = mv.on("change", (v) => {
      if (spanRef.current) spanRef.current.textContent = `${Math.round(v)}${suffix}`;
    });
    return () => unsub();
  }, [mv, suffix]);

  return (
    <div ref={containerRef}>
      <span ref={spanRef} />
    </div>
  );
}

/* -----------------------------
   Page
------------------------------*/

export default function LandingEngaging() {
  const prefersReducedMotion = useReducedMotion();

  // parallax on hero title
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, prefersReducedMotion ? 0 : -20]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.85]);

  // marquee labels
  const marquee = useMemo(
    () => [
      "Daily XP",
      "Keep Streaks",
      "Save Words",
      "Friendly Challenges",
      "Quick Sessions",
      "Smart Reviews",
      "Progress You Can See",
      "Learn Together",
    ],
    []
  );

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Background */}
      <motion.img
        src="/desert.png"
        alt="Background"
        className="fixed inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      {/* Decorative glow blobs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
            }}
            animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none fixed -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
            }}
            animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* HERO */}
      <section className="relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 pt-6">
        <motion.div
          className="w-[min(92vw,52rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-12"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center">
            <motion.h1
              className="text-white text-3xl sm:text-5xl font-semibold leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
            >
              Fluentures makes language learning{" "}
              <span className="relative whitespace-nowrap">
                <span className="mx-2 px-2 rounded-lg bg-indigo-500/80">consistent</span>
              </span>{" "}
              and{" "}
              <span className="relative whitespace-nowrap">
                <span className="mx-2 px-2 rounded-lg bg-amber-400/80">fun</span>
              </span>
              .
            </motion.h1>
            <motion.p
              className="mt-4 text-white/85 text-base sm:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              Track XP & streaks, save words with examples, and see your progress at a glance.
              Learn solo or with friends—any time, anywhere.
            </motion.p>

            {/* animated badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: faFire, text: "Daily streaks" },
                { icon: faBookmark, text: "Saved words" },
                { icon: faClock, text: "Time tracked" },
                { icon: faBolt, text: "Social" },
              ].map(({ icon, text }) => (
                <motion.span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-white/95 ring-1 ring-white/20"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.6 }}
                  transition={{ duration: 0.4 }}
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                  <span className="text-sm">{text}</span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="relative z-10 px-0 py-6">
        <div className="overflow-hidden">
          <div className="flex gap-6 whitespace-nowrap animate-[marquee_22s_linear_infinite] px-6">
            {marquee.concat(marquee).map((label, idx) => (
              <span
                key={`${label}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 ring-1 ring-white/20"
              >
                <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </span>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-4 py-12">
        <div className="mx-auto w-[min(92vw,70rem)]">
          <motion.h2
            className="text-white text-2xl sm:text-3xl font-semibold text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.25 }}
            transition={{ duration: 0.5 }}
          >
            Everything you need to stay consistent
          </motion.h2>
          <motion.p
            className="text-white/80 text-center mt-2"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Track progress, save vocabulary, and learn with friends.
          </motion.p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FontAwesomeIcon icon={faBolt} className="h-5 w-5 text-indigo-600" />}
              title="XP & Streaks"
              desc="Earn XP for every session and keep your learning streak alive."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faClock} className="h-5 w-5 text-indigo-600" />}
              title="Time Tracking"
              desc="See exactly how much time you spend learning each week."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faBookmark} className="h-5 w-5 text-indigo-600" />}
              title="Save Vocabulary"
              desc="Bookmark words with examples and revisit them anytime."
            />
            <FeatureCard
              icon={<FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-indigo-600" />}
              title="Learn Together"
              desc="Invite friends, compare progress, and keep each other motivated."
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 px-4 py-10">
        <div className="mx-auto w-[min(92vw,70rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={12450} suffix="+" />
              </div>
              <div className="text-white/80 text-sm mt-1">XP earned</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={732} />
              </div>
              <div className="text-white/80 text-sm mt-1">Minutes learning</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={86} />
              </div>
              <div className="text-white/80 text-sm mt-1">Words saved</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-semibold">
                <StatCount to={12} />
              </div>
              <div className="text-white/80 text-sm mt-1">Day streak</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-4 py-12">
        <div className="mx-auto w-[min(92vw,70rem)]">
          <motion.h2
            className="text-white text-2xl sm:text-3xl font-semibold text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.25 }}
            transition={{ duration: 0.5 }}
          >
            How it works
          </motion.h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Step
              icon={<FontAwesomeIcon icon={faMapLocationDot} className="h-5 w-5" />}
              title="1. Pick a path"
              desc="Choose a language focus or theme, and set your daily goal."
            />
            <Step
              icon={<FontAwesomeIcon icon={faBookOpen} className="h-5 w-5" />}
              title="2. Practice daily"
              desc="Short sessions that fit your day—earn XP and build streaks."
            />
            <Step
              icon={<FontAwesomeIcon icon={faBookmark} className="h-5 w-5" />}
              title="3. Save & review"
              desc="Collect words with examples. Review when you’re ready."
            />
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative z-10 px-4 pb-14">
        <div className="mx-auto w-[min(92vw,60rem)] text-center">
          <motion.h3
            className="text-white text-xl sm:text-2xl font-semibold"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            Ready to start your journey?
          </motion.h3>
          <motion.p
            className="text-white/85 mt-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            Use the <span className="font-semibold">Sign in</span> or{" "}
            <span className="font-semibold">Sign up</span> buttons in the top-right navbar.
          </motion.p>
        </div>
      </section>

      {/* Spacer + BackToTop */}
      <div className="h-10" />
      <BackToTop threshold={300} />
    </div>
  );
}
