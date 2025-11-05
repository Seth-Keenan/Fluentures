"use client";

import { PropsWithChildren, ReactNode, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

type Props = PropsWithChildren<{
  rightExtras?: ReactNode;
  pages?: ReactNode[]; // Array of page content
  showPageControls?: boolean;
}>;

export default function BookShell({ children, rightExtras, pages = [], showPageControls = false }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useTransform(my, [0, 1], [6, -6]);
  const rotateY = useTransform(mx, [0, 1], [-6, 6]);

  const nextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setIsFlipping(false), 600);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev - 1);
      setTimeout(() => setIsFlipping(false), 600);
    }
  };

  const totalPages = pages.length;
  const hasMultiplePages = totalPages > 1;
  const hasPages = pages.length > 0;

  // Debug logging
  console.log("🔍 BookShell render:", { 
    totalPages, 
    hasPages, 
    hasChildren: !!children, 
    currentPage,
    showPageControls 
  });

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

          {/* cream pages with flip animation */}
          <div className="relative mx-10 my-6 rounded-[22px] bg-[#FFF1C9] ring-1 ring-amber-900/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(95%_110%_at_50%_-40%,rgba(0,0,0,0.10),rgba(0,0,0,0)_60%)]" />
            <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-amber-800/30 via-amber-900/40 to-amber-800/30" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 w-20 rounded-full bg-red-700/70 blur-[1px]" />

            {/* pages content with animation */}
            <div className="relative p-6 sm:p-8 md:px-10 md:py-8 min-h-[600px]">
              {hasPages ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ rotateY: -15, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 15, opacity: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: "easeInOut"
                    }}
                  >
                    {pages[currentPage]}
                  </motion.div>
                </AnimatePresence>
              ) : children ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {children}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="pr-6">
                    <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">Logbook</h2>
                    <div className="text-amber-900/70">No content available</div>
                  </div>
                  <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
                    <div className="text-amber-900/50 text-sm">Loading...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Page navigation */}
            {hasMultiplePages && showPageControls && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0 || isFlipping}
                  className="px-3 py-1 text-sm bg-amber-700 text-amber-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition"
                >
                  ← Prev
                </button>
                <span className="text-sm text-amber-900/70">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1 || isFlipping}
                  className="px-3 py-1 text-sm bg-amber-700 text-amber-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Click areas for page turning */}
            {hasMultiplePages && (
              <>
                {/* Left side - previous page */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0 || isFlipping}
                  className="absolute left-0 top-0 w-1/2 h-full bg-transparent hover:bg-amber-900/5 transition-colors disabled:cursor-not-allowed z-5"
                  aria-label="Previous page"
                />
                {/* Right side - next page */}
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1 || isFlipping}
                  className="absolute right-0 top-0 w-1/2 h-full bg-transparent hover:bg-amber-900/5 transition-colors disabled:cursor-not-allowed z-5"
                  aria-label="Next page"
                />
              </>
            )}
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