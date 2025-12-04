"use client";
import Image from "next/image";
import glassJournal from "@/public/images/glassJournal.png"; 

import { PropsWithChildren, ReactNode, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

type Props = PropsWithChildren<{
  rightExtras?: ReactNode;
  pages?: ReactNode[]; // Array of page content
  showPageControls?: boolean;
  side?: "full" | "left" | "right";
}>;

export default function BookShell({ children, rightExtras, pages = [], showPageControls = false, side = "full" }: Props) {
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

  // page side class
  const sideClass = side === "left" ? "left-[9%] w-[36%]" 
                  : side === "right" ? "left-[55%] w-[36%]" 
                  : "left-[14%] w-[72%]";

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
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="relative w-[min(96vw,1100px)]"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45 }}
    >

      {/* --- YOUR JOURNAL IMAGE --- */}
      <div className="relative w-full">
        <Image
          src={glassJournal}
          alt="Glass Journal"
          className="w-full h-auto select-none pointer-events-none"
          priority
        />

        {/* ---- CONTENT INSIDE THE JOURNAL ---- */}
        <div
          className="
            absolute 
            top-[5%]
            left-[9%]
            w-[72%]
            h-[76%]
            overflow-hidden
            p-6 sm:p-8 md:px-10 md:py-8
          "
        >
          {hasPages ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ rotateY: -15, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 15, opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
              >
                {pages[currentPage]}
              </motion.div>
            </AnimatePresence>
          ) : (
            children
          )}
        </div>

        {/* ---- Page Navigation Arrows ---- */}
        {hasMultiplePages && showPageControls && (
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0 || isFlipping}
              className="px-3 py-1 text-sm bg-amber-700 text-amber-50 rounded-lg disabled:opacity-50"
            >
              ← Prev
            </button>

            <span className="text-sm text-amber-900/70">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1 || isFlipping}
              className="px-3 py-1 text-sm bg-amber-700 text-amber-50 rounded-lg disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* ---- Invisible Click Zones for Page Flips ---- */}
        {hasMultiplePages && (
          <>
            <button
              onClick={prevPage}
              disabled={currentPage === 0 || isFlipping}
              className="absolute left-0 top-0 w-1/2 h-full bg-transparent"
            />

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1 || isFlipping}
              className="absolute right-0 top-0 w-1/2 h-full bg-transparent"
            />
          </>
        )}
      </div>

      {rightExtras}
    </motion.div>
  </div>
);
}