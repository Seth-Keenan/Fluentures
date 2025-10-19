"use client";

import { useEffect, useState } from "react";
import { useListId } from "@/app/lib/hooks/useListId";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { Button } from "@/app/components/Button";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import type { WordItem } from "@/app/types/wordlist";
import { getWordlist, saveWordlist, renameWordList } from "@/app/lib/actions/wordlistAction";

const MAX_ITEMS = 20; // ← hard cap

export default function EditOasisPage() {
  const listId = useListId();
  const [items, setItems] = useState<WordItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [listName, setListName] = useState<string>("");
  const [renaming, setRenaming] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!listId) return;
    (async () => {
      const data = await getWordlist(listId);
      // Enforce cap on load (in case DB already has > 20)
      if (data.length > MAX_ITEMS) {
        alert(`This list has ${data.length} items. Showing and saving only the first ${MAX_ITEMS}.`);
        setItems(data.slice(0, MAX_ITEMS));
      } else {
        setItems(data);
      }
    })();
  }, [listId]);

  const addRow = () => {
    // Prevent adding beyond cap
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

  const updateField = (id: string, field: keyof WordItem, value: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const deleteRowLocal = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const save = async () => {
    if (!listId) return alert("Missing list id");
    setSaving(true);
    const cleaned = items.filter(
      (i) => i.target?.trim() || i.english?.trim() || i.notes?.trim()
    );
    if (cleaned.length > MAX_ITEMS) {
      setSaving(false);
      alert(`Please keep the list at ${MAX_ITEMS} items or fewer before saving.`);
      return;
    }
    const ok = await saveWordlist(listId, cleaned);
    setSaving(false);
    alert(ok ? "✅ Saved!" : "Failed to save.");
  };

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
    alert(ok ? "✅ Renamed!" : "Failed to rename.");
  };

  const handleDeleteClick = (id: string) => {
    setRowToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (rowToDelete) {
      deleteRowLocal(rowToDelete);
      setRowToDelete(null);
    }
  };

  if (!listId) return <div className="p-6">Missing list id in the URL.</div>;

  return (
  <>
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <LinkAsButton href={`/oasis/${listId}`}>Back</LinkAsButton>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Edit Oasis — Word List</p>
            <p className="text-base font-medium text-neutral-800">
              {items.length}/{MAX_ITEMS} entries
            </p>
          </div>
        </div>

        {/* Rename + Actions */}
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 p-4 md:p-5">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              List Settings
            </h1>
          </div>
          <div className="p-4 md:p-5 space-y-4">
            {/* Rename UI */}
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <input
                className="min-w-[260px] flex-1 rounded-xl border border-neutral-200 bg-white/90 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 shadow-inner focus:ring-2 focus:ring-amber-400/60"
                placeholder="Oasis name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
              <Button onClick={handleRename} disabled={renaming} className="px-4 py-2">
                {renaming ? "Renaming..." : "Rename"}
              </Button>
            </div>

            {/* Entry Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={addRow}
                disabled={items.length >= MAX_ITEMS}
                title={items.length >= MAX_ITEMS ? `Max ${MAX_ITEMS} entries` : ""}
                className="px-4 py-2"
              >
                + Add Entry
              </Button>
              <Button onClick={save} disabled={saving} className="px-4 py-2">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </section>

        {/* Word Table */}
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 p-4 md:p-5">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">Entries</h2>
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 border-b border-neutral-100 p-3 text-sm font-semibold text-neutral-700">
            <div className="col-span-3">Target Language</div>
            <div className="col-span-3">English</div>
            <div className="col-span-5">Notes</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Body */}
          <div className="divide-y divide-neutral-100">
            {items.length === 0 && (
              <div className="p-4 text-sm text-neutral-600">
                No entries yet. Click <span className="font-medium">“Add Entry”</span>.
              </div>
            )}

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-3">
                <input
                  className="col-span-3 rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm outline-none shadow-inner placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  placeholder="こんにちは"
                  value={item.target}
                  onChange={(e) => updateField(item.id, "target", e.target.value)}
                />
                <input
                  className="col-span-3 rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm outline-none shadow-inner placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  placeholder="hello"
                  value={item.english}
                  onChange={(e) => updateField(item.id, "english", e.target.value)}
                />
                <input
                  className="col-span-5 rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm outline-none shadow-inner placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  placeholder="Any notes (e.g., part of speech, hints)"
                  value={item.notes ?? ""}
                  onChange={(e) => updateField(item.id, "notes", e.target.value)}
                />
                <div className="col-span-1 flex items-center justify-end">
                  <Button
                    className="destructive px-3 py-2"
                    onClick={() => handleDeleteClick(item.id)}
                    aria-label="Delete entry"
                    title="Delete entry"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
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
