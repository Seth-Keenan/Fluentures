"use client";

import { PropsWithChildren, ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

type Props = PropsWithChildren<{
  rightExtras?: ReactNode;
}>;

export default function BookShell({ children, rightExtras }: Props) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useTransform(my, [0, 1], [6, -6]);
  const rotateY = useTransform(mx, [0, 1], [-6, 6]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
    >
      {/* Wooden desk */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-900 via-amber-800 to-amber-700" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_10%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_60%)]" />

      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        className="relative w-[min(96vw,1100px)]"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        {/* under-glow */}
        <div className="absolute -inset-x-6 -inset-y-4 rounded-[40px] bg-black/25 blur-2xl" aria-hidden />

        {/* dark book base */}
        <div className="relative rounded-[28px] bg-[#5E2F23] p-3 shadow-2xl">
          {/* red covers */}
          <div className="absolute left-6 top-6 bottom-6 w-4 rounded-l-xl bg-red-700/95" />
          <div className="absolute right-6 top-6 bottom-6 w-4 rounded-r-xl bg-red-700/95" />

          {/* ribbon */}
          <motion.div
            className="absolute right-10 top-8 h-40 w-7 bg-indigo-800 origin-top"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
            animate={{ rotateZ: [-2, 2, -2] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />

          {/* cream pages */}
          <div className="relative mx-10 my-6 rounded-[22px] bg-[#FFF1C9] ring-1 ring-amber-900/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(95%_110%_at_50%_-40%,rgba(0,0,0,0.10),rgba(0,0,0,0)_60%)]" />
            <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-amber-800/30 via-amber-900/40 to-amber-800/30" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 w-20 rounded-full bg-red-700/70 blur-[1px]" />

            {/* pages content */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 p-6 sm:p-8 md:px-10 md:py-8">
              {children}
            </div>
          </div>

          {/* bottom cover peeks */}
          <div className="absolute left-8 bottom-6 h-3 w-28 rounded-b-full bg-red-700/70 blur-[0.5px]" aria-hidden />
          <div className="absolute right-8 bottom-6 h-3 w-28 rounded-b-full bg-red-700/70 blur-[0.5px]" aria-hidden />
        </div>

        {rightExtras}
      </motion.div>
    </div>
  );
}
