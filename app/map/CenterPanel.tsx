"use client";

import { motion } from "framer-motion";
import { LinkAsButton } from "../components/LinkAsButton";

interface CenterPanelProps {
  selectedLanguage: string | null;
  hasFilter: boolean;
  rows: { word_list_id: string; word_list_name: string }[];
}

export default function CenterPanel({ selectedLanguage, hasFilter, rows }: CenterPanelProps) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-[min(90vw,30rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-white"
      >
        {/* Corner badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md">
            <span className="mr-1 opacity-70">Current Language:</span>
            <strong>{selectedLanguage ?? "Not set"}</strong>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center">Your Oases</h2>

        {/* Empty states */}
        {hasFilter && rows.length === 0 && (
          <div className="text-sm text-white/70 text-center mb-2">
            No word lists for <strong>{selectedLanguage}</strong> yet.
          </div>
        )}
        {!hasFilter && rows.length === 0 && (
          <div className="text-sm text-white/70 text-center mb-2">
            You don’t have any word lists yet.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <LinkAsButton href="/map/edit">Edit Map</LinkAsButton>
          <LinkAsButton href="/home">Back</LinkAsButton>
        </div>

        {/* List buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {rows.map((l) => (
            <LinkAsButton
              key={l.word_list_id}
              href={`/oasis/${l.word_list_id}`}
              className="w-full"
            >
              {l.word_list_name || "(Untitled)"}
            </LinkAsButton>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
