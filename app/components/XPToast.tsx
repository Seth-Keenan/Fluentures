"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Toast = { id: number; amount: number };

export function XPToastPortal() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let idCounter = 1;
    const h = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as { amount: number } | undefined;
      if (!detail) return;
      const id = idCounter++;
      setToasts((t) => [...t, { id, amount: detail.amount }]);
      // auto-remove after 2200ms (longer so users notice it)
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 5000);
    };

    window.addEventListener("xp-toast", h as EventListener);
    return () => window.removeEventListener("xp-toast", h as EventListener);
  }, []);

  return (
    <div aria-live="polite">
      <div className="fixed top-5 right-5 z-60 flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.28 }}
              className="pointer-events-auto"
            >
              <div className="rounded-lg bg-emerald-500 px-3 py-1 text-white font-semibold shadow-md">
                +{t.amount} XP
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function XPToast() {
  return <XPToastPortal />;
}
