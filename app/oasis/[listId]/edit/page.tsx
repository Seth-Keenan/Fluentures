"use client";

import { useEffect, useMemo, useState } from "react";
import { useListId } from "@/app/lib/hooks/useListId";
import { motion, useReducedMotion } from "framer-motion";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { Button } from "@/app/components/Button";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import type { WordItem } from "@/app/types/wordlist";
import {
  getWordlist,
  saveWordlist,
  renameWordList,
  getWordListMeta,
  type WordListMeta,
} from "@/app/lib/actions/wordlistAction";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

/** Hard caps */
const MAX_ITEMS = 20;

/** Field character limits */
const TARGET_MAX = 50;
const ENGLISH_MAX = 50;
const NOTES_MAX = 100;

export default function EditOasisPage() {
  const listId = useListId(); // from URL
  const prefersReducedMotion = useReducedMotion();

  // data
  const [items, setItems] = useState<WordItem[]>([]);
  const [meta, setMeta] = useState<WordListMeta | null>(null);

  // ui state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedJSON, setLastSavedJSON] = useState<string>("[]");
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  // rename state
  const [listName, setListName] = useState<string>("");
  const [renaming, setRenaming] = useState(false);

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);

  // dirty flag (compare to last saved snapshot)
  const isDirty = useMemo(
    () => JSON.stringify(items) !== lastSavedJSON,
    [items, lastSavedJSON]
  );

  // ui extras
  const desert = deserts.find(d => d.name === "Death Valley")!;

  // initial load
  useEffect(() => {
    if (!listId) return;
    (async () => {
      setLoading(true);
      const [data, metaRow] = await Promise.all([
        getWordlist(listId),
        getWordListMeta(listId),
      ]);

      // Enforce cap on load (if DB already has > cap)
      if (data.length > MAX_ITEMS) {
        alert(
          `This list has ${data.length} items. Showing and saving only the first ${MAX_ITEMS}.`
        );
      }
      const sliced = data.slice(0, MAX_ITEMS);
      setItems(sliced);
      setLastSavedJSON(JSON.stringify(sliced));

      setMeta(metaRow ?? null);
      setLoading(false);
    })();
  }, [listId]);

  /** Add a new row (respect cap) */
  const addRow = () => {
    if (items.length >= MAX_ITEMS) {
      alert(`You can only have up to ${MAX_ITEMS} entries in a list.`);
      return;
    }
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { id, target: "", english: "", notes: "" }]);
  };

  /** Update a field with hard length caps */
  const updateField = (id: string, field: keyof WordItem, value: string) => {
    let capped = value ?? "";
    if (field === "target") capped = capped.slice(0, TARGET_MAX);
    if (field === "english") capped = capped.slice(0, ENGLISH_MAX);
    if (field === "notes") capped = capped.slice(0, NOTES_MAX);

    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, [field]: capped } : x)));
  };

  /** Delete local row (opens confirm first) */
  const handleDeleteClick = (id: string) => {
    setRowToDelete(id);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = () => {
    if (rowToDelete) {
      setItems((prev) => prev.filter((x) => x.id !== rowToDelete));
      setRowToDelete(null);
    }
    setConfirmOpen(false);
  };

  /** Save (respect cap and ignore empty rows) */
  const save = async () => {
    if (!listId) {
      setLastMessage("❌ Missing list id");
      return;
    }
    setSaving(true);
    const cleaned = items
      .slice(0, MAX_ITEMS)
      .filter((i) => i.target?.trim() || i.english?.trim() || i.notes?.trim());

    if (cleaned.length > MAX_ITEMS) {
      setSaving(false);
      alert(`Please keep the list at ${MAX_ITEMS} items or fewer before saving.`);
      return;
    }

    const ok = await saveWordlist(listId, cleaned);
    setSaving(false);
    setLastMessage(ok ? "✅ Saved changes" : "❌ Failed to save");
    if (ok) setLastSavedJSON(JSON.stringify(cleaned));
    setTimeout(() => setLastMessage(null), 1800);
  };

  /** Rename list */
  const handleRename = async () => {
    if (!listId) return;
    const name = listName.trim();
    if (!name) {
      alert("Please enter a name.");
      return;
    }
    setRenaming(true);
    const ok = await renameWordList(listId, name);
    setRenaming(false);
    setLastMessage(ok ? "✅ Renamed!" : "❌ Failed to rename");
    setTimeout(() => setLastMessage(null), 1800);
  };

  /** Keyboard shortcuts: ⌘/Ctrl+S (save), ⌘/Ctrl+B (add row) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === "s") {
        e.preventDefault();
        if (!saving) void save();
      }
      if ((e.metaKey || e.ctrlKey) && key === "b") {
        e.preventDefault();
        addRow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, items]);

  if (!listId) return <div className="p-6">Missing list id in the URL.</div>;

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background (animated) */}
        <PageBackground
          src={desert.src}
          alt={desert.name}
          wikiUrl={desert.wikiUrl}
        >
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
        {/* Grain + veil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
            backgroundSize: "160px 160px",
          }}
        />
        {/* Shell */}
        <div className="relative z-10 pt-24 mx-auto w-[min(92vw,72rem)] p-4 pb-8">
          {/* Top bar: status + back */}
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
              href={`/oasis/${listId}`}
              className="ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
            >
              Back
            </LinkAsButton>
          </div>

          {/* Header card: title + quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-5 w-full rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-white drop-shadow">
                  Edit Oasis — {meta?.name ?? "Word List"}
                </h1>
                <p className="text-sm text-white/80">
                  {items.length}/{MAX_ITEMS} {items.length === 1 ? "entry" : "entries"}
                </p>
                {meta?.language && (
                  <p className="mt-1 text-xs text-white/75">
                    Target language: <span className="font-medium">{meta.language}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={addRow}
                  className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
                  disabled={items.length >= MAX_ITEMS}
                  title={items.length >= MAX_ITEMS ? `Max ${MAX_ITEMS} entries` : ""}
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

          {/* Settings (Rename) */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-5 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
          >
            <h2 className="mb-3 text-lg font-semibold text-white/95">List Settings</h2>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <input
                className="min-w-[260px] flex-1 rounded-xl border border-white/20 bg-white/90 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 shadow-inner focus:ring-2 focus:ring-amber-400/60 text-gray-900"
                placeholder={meta?.name ?? "Oasis name"}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
              <Button onClick={handleRename} disabled={renaming} className="px-4 py-2">
                {renaming ? "Renaming..." : "Rename"}
              </Button>
            </div>
          </motion.section>

          {/* Table card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-0 shadow-2xl backdrop-blur-xl"
          >
            {/* Shine on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
              style={{
                background:
                  "radial-gradient(1200px 300px at 0% -20%, rgba(255,255,255,0.12), transparent 60%)",
              }}
            />

            {/* Header row */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-2 border-b border-white/15 bg-white/10 p-3 text-white/95 backdrop-blur-xl">
              <div className="col-span-3 font-semibold">
                {meta?.language ?? "Target Language"}
              </div>
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

              {!loading && items.length === 0 && (
                <div className="p-4 text-sm text-white/80">
                  No entries yet. Click <span className="font-semibold">“+ Add Entry”</span>.
                </div>
              )}

              {!loading &&
                items.map((item) => {
                  const targetLen = item.target?.length ?? 0;
                  const englishLen = item.english?.length ?? 0;
                  const notesLen = item.notes?.length ?? 0;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      whileHover={{ y: -2 }}
                      className="grid grid-cols-12 items-start gap-2 border-b border-white/10 p-2"
                    >
                      {/* Target */}
                      <div className="col-span-3 flex flex-col gap-1">
                        <input
                          className="rounded-lg border border-white/20 bg-white/5 p-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-white/60"
                          placeholder={
                            meta?.language === "Japanese"
                              ? "こんにちは"
                              : meta?.language === "Spanish"
                              ? "hola"
                              : meta?.name ?? "Hej"
                          }
                          value={item.target}
                          maxLength={TARGET_MAX}
                          onChange={(e) => updateField(item.id, "target", e.target.value)}
                          aria-describedby={`target-help-${item.id}`}
                        />
                        <div className="flex items-center justify-between">
                          <span
                            id={`target-help-${item.id}`}
                            className={`text-[11px] ${
                              targetLen >= TARGET_MAX ? "text-rose-300" : "text-white/60"
                            }`}
                          >
                            {targetLen >= TARGET_MAX ? "Reached 50 character limit" : "\u00A0"}
                          </span>
                          <span
                            className={`text-[11px] ${
                              targetLen >= TARGET_MAX ? "text-rose-300" : "text-white/60"
                            }`}
                          >
                            {targetLen}/{TARGET_MAX}
                          </span>
                        </div>
                      </div>

                      {/* English */}
                      <div className="col-span-3 flex flex-col gap-1">
                        <input
                          className="rounded-lg border border-white/20 bg-white/5 p-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-white/60"
                          placeholder="hello"
                          value={item.english}
                          maxLength={ENGLISH_MAX}
                          onChange={(e) => updateField(item.id, "english", e.target.value)}
                          aria-describedby={`english-help-${item.id}`}
                        />
                        <div className="flex items-center justify-between">
                          <span
                            id={`english-help-${item.id}`}
                            className={`text-[11px] ${
                              englishLen >= ENGLISH_MAX ? "text-rose-300" : "text-white/60"
                            }`}
                          >
                            {englishLen >= ENGLISH_MAX ? "Reached 50 character limit" : "\u00A0"}
                          </span>
                          <span
                            className={`text-[11px] ${
                              englishLen >= ENGLISH_MAX ? "text-rose-300" : "text-white/60"
                            }`}
                          >
                            {englishLen}/{ENGLISH_MAX}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="col-span-5 flex flex-col gap-1">
                        <input
                          className="rounded-lg border border-white/20 bg-white/5 p-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-white/60"
                          placeholder="Any notes (e.g., part of speech, hints)"
                          value={item.notes ?? ""}
                          maxLength={NOTES_MAX}
                          onChange={(e) => updateField(item.id, "notes", e.target.value)}
                          aria-describedby={`notes-help-${item.id}`}
                        />
                        <div className="flex items-center justify-between">
                          <span
                            id={`notes-help-${item.id}`}
                            className={`text-[11px] ${
                              notesLen >= NOTES_MAX ? "text-rose-300" : "text-white/60"
                            }`}
                          >
                            {notesLen >= NOTES_MAX ? "Reached 100 character limit" : "\u00A0"}
                          </span>
                          <span
                            className={`text-[11px] ${
                              notesLen >= NOTES_MAX ? "text-rose-300" : "text-white/60"
                            }`}
                          >
                            {notesLen}/{NOTES_MAX}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end">
                        <Button
                          className="destructive !py-1.5 !px-3 ring-1 ring-white/20 hover:ring-white/40"
                          onClick={() => handleDeleteClick(item.id)}
                          aria-label="Delete entry"
                          title="Delete entry"
                        >
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
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
        </PageBackground>
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
