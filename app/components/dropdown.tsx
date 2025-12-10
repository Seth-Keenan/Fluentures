"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Option = {
  label: string;
  value: string;
};

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select",
  widthClass = "min-w-[160px]", // ✅ DEFAULT SIZE (safe fallback)
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  widthClass?: string; // ✅ NEW
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className={`relative ${widthClass}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm
                    ring-1 ring-white/30 inline-flex items-center
                    whitespace-nowrap justify-center w-full ${widthClass}`}
      >
        <span>{selected?.label || placeholder}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`absolute z-50 mt-1 rounded-lg overflow-hidden
                        bg-gray-900 border border-white/20 shadow-xl
                        min-w-full`}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-white
                           whitespace-nowrap hover:bg-white/10 transition"
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
