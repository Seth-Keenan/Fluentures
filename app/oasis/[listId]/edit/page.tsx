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
      <div className="p-6 min-h-screen">
        <LinkAsButton href={`/oasis/${listId}`} className="btn">
          Back
        </LinkAsButton>

        <div className="flex flex-col mt-4 gap-3">
          {/* rename UI */}
          <div className="flex items-center gap-2">
            <input
              className="border p-2 rounded min-w-[260px]"
              placeholder="Oasis name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <Button onClick={handleRename} disabled={renaming}>
              {renaming ? "Renaming..." : "Rename"}
            </Button>
          </div>

          <h1 className="text-xl font-bold">Edit Oasis — Word List</h1>

          <div className="mb-1 text-sm text-gray-500">
            {items.length}/{MAX_ITEMS} entries
          </div>

          <div className="mb-4 flex gap-2">
            <Button
              onClick={addRow}
              disabled={items.length >= MAX_ITEMS}
              title={items.length >= MAX_ITEMS ? `Max ${MAX_ITEMS} entries` : ""}
            >
              + Add Entry
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="border rounded">
            <div className="grid grid-cols-12 gap-2 p-2 font-semibold border-b">
              <div className="col-span-3">Target Language</div>
              <div className="col-span-3">English</div>
              <div className="col-span-5">Notes</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {items.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No entries yet. Click “Add Entry”.</div>
            )}

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border-b">
                <input
                  className="col-span-3 border p-2"
                  placeholder="こんにちは"
                  value={item.target}
                  onChange={(e) => updateField(item.id, "target", e.target.value)}
                />
                <input
                  className="col-span-3 border p-2"
                  placeholder="hello"
                  value={item.english}
                  onChange={(e) => updateField(item.id, "english", e.target.value)}
                />
                <input
                  className="col-span-5 border p-2"
                  placeholder="Any notes (e.g., part of speech, hints)"
                  value={item.notes ?? ""}
                  onChange={(e) => updateField(item.id, "notes", e.target.value)}
                />
                <div className="col-span-1 flex items-center justify-end">
                  <Button className="destructive" onClick={() => handleDeleteClick(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
