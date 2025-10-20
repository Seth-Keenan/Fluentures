"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { Button } from "@/app/components/Button";
import { getWordlist, saveWordlist } from "@/app/lib/actions/wordlistAction";
import type { WordItem } from "@/app/types/wordlist";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function EditOasisPage() {
  const [items, setItems] = useState<WordItem[]>([]);
  const [saving, setSaving] = useState(false);

  // state for confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);

  // local ui states
  const [loading, setLoading] = useState(true);
  const [lastSavedJSON, setLastSavedJSON] = useState<string>("[]");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getWordlist();
      setItems(data);
      setLoading(false);
      setLastSavedJSON(JSON.stringify(data));
    })();
  }, []);

  const addRow = () => {
    const id =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { id, target: "", english: "", notes: "" }]);
  };

  const deleteRow = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const updateField = (id: string, field: keyof WordItem, value: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const isDirty = useMemo(() => JSON.stringify(items) !== lastSavedJSON, [items, lastSavedJSON]);

  const save = async () => {
    setSaving(true);
    const ok = await saveWordlist(items);
    setSaving(false);
    setLastMessage(ok ? "✅ Saved changes" : "❌ Failed to save");
    if (ok) setLastSavedJSON(JSON.stringify(items));
    // subtle auto-clear
    setTimeout(() => setLastMessage(null), 1800);
  };

  const handleDeleteClick = (id: string) => {
    setRowToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (rowToDelete) {
      deleteRow(rowToDelete);
      setRowToDelete(null);
    }
  };

  // Keyboard shortcuts: ⌘/Ctrl+S = Save, ⌘/Ctrl+B = Add Entry
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) void save();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        addRow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, items]);

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background image (reuses oasis vibe) */}
        <motion.img
          src="/desert.png"
          alt="Desert dunes"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1 }}
          animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Aurora blobs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
          }}
          animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 18, 0], x: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
          }}
          animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -16, 0], x: [0, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grain + contrast veil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
            backgroundSize: "160px 160px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />

        {/* Content shell */}
        <div className="relative z-10 mx-auto w-[min(92vw,72rem)] p-4 pb-8">
          {/* Top bar: Back on the right + status pill */}
          <div className="mb-4 flex items-center justify-end gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs ring-1 ${
                isDirty
                  ? "bg-amber-500/20 text-amber-100 ring-amber-300/40"
                  : "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40"
              }`}
            >
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <LinkAsButton
              href="/oasis"
              className="ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
            >
              Back
            </LinkAsButton>
          </div>

          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-5 w-full rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-white drop-shadow">
                  Edit Oasis - Word List
                </h1>
                <p className="text-sm text-white/80">
                  {items.length} {items.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={addRow}
                  className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
                >
                  + Add Entry
                </Button>
                <Button
                  onClick={save}
                  disabled={saving}
                  className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
            {lastMessage ? (
              <div className="mt-3 text-sm text-white/90">{lastMessage}</div>
            ) : null}
          </motion.div>

          {/* Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-0 shadow-2xl backdrop-blur-xl"
          >
            {/* Hover shine */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
              style={{
                background:
                  "radial-gradient(1200px 300px at 0% -20%, rgba(255,255,255,0.12), transparent 60%)",
              }}
            />

            {/* Sticky header */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-2 border-b border-white/15 bg-white/10 p-3 text-white/95 backdrop-blur-xl">
              <div className="col-span-3 font-semibold">Target Language</div>
              <div className="col-span-3 font-semibold">English</div>
              <div className="col-span-5 font-semibold">Notes</div>
              <div className="col-span-1 text-right font-semibold">Actions</div>
            </div>

            {/* Body */}
            <div className="max-h-[65vh] overflow-y-auto p-2">
              {loading && (
                <div className="p-4">
                  <div className="mb-2 h-12 w-1/2 animate-pulse rounded-lg bg-white/15" />
                  <div className="mb-2 h-12 w-3/4 animate-pulse rounded-lg bg-white/15" />
                  <div className="mb-2 h-12 w-2/3 animate-pulse rounded-lg bg-white/15" />
                </div>
              )}

              {items.length === 0 && !loading && (
                <div className="p-4 text-sm text-white/80">
                  No entries yet. Click <span className="font-semibold">“ + Add Entry”</span>.
                </div>
              )}

              {!loading &&
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ y: -2 }}
                    className="grid grid-cols-12 items-start gap-2 border-b border-white/10 p-2"
                  >
                    <input
                      className="col-span-3 rounded-lg border border-white/20 bg-white/5 p-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-white/60"
                      placeholder="こんにちは"
                      value={item.target}
                      onChange={(e) => updateField(item.id, "target", e.target.value)}
                    />
                    <input
                      className="col-span-3 rounded-lg border border-white/20 bg-white/5 p-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-white/60"
                      placeholder="hello"
                      value={item.english}
                      onChange={(e) => updateField(item.id, "english", e.target.value)}
                    />
                    <input
                      className="col-span-5 rounded-lg border border-white/20 bg-white/5 p-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-white/60"
                      placeholder="Any notes (e.g., part of speech, hints)"
                      value={item.notes ?? ""}
                      onChange={(e) => updateField(item.id, "notes", e.target.value)}
                    />
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        className="destructive !py-1.5 !px-3 ring-1 ring-white/20 hover:ring-white/40"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Footer tip */}
          <p className="mt-4 text-center text-xs text-white/80">
            Tip: Use <kbd className="rounded bg-white/20 px-1">⌘/Ctrl</kbd>+
            <kbd className="rounded bg-white/20 px-1">S</kbd> to save,{" "}
            <kbd className="rounded bg-white/20 px-1">⌘/Ctrl</kbd>+
            <kbd className="rounded bg-white/20 px-1">B</kbd> to add an entry.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this entry?"
        description="This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
