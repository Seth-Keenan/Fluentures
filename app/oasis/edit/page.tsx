"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    (async () => {
      const data = await getWordlist();
      setItems(data);
    })();
  }, []);

  const addRow = () => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { id, target: "", english: "", notes: "" }]);
  };

  const deleteRow = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const updateField = (id: string, field: keyof WordItem, value: string) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, [field]: value } : x))
    );
  };

  const save = async () => {
    setSaving(true);
    const ok = await saveWordlist(items);
    setSaving(false);
    alert(ok ? "✅ Saved!" : "Failed to save.");
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

  return (
    <>
      <div className="p-6 min-h-screen">
          <LinkAsButton href="/oasis">Back</LinkAsButton>

          <div className="flex flex-col mt-4">
              <h1 className="text-xl font-bold mb-2">Edit Oasis — Word List</h1>

              <div className="mb-4 flex gap-2">
                  <Button onClick={addRow}>+ Add Entry</Button>
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
                              onChange={(e) => updateField(item.id, "target", e.target.value)} />
                          <input
                              className="col-span-3 border p-2"
                              placeholder="hello"
                              value={item.english}
                              onChange={(e) => updateField(item.id, "english", e.target.value)} />
                          <input
                              className="col-span-5 border p-2"
                              placeholder="Any notes (e.g., part of speech, hints)"
                              value={item.notes ?? ""}
                              onChange={(e) => updateField(item.id, "notes", e.target.value)} />
                          <div className="col-span-1 flex items-center justify-end">
                              <Button
                                className="destructive"
                                onClick={() => handleDeleteClick(item.id)}
                                >
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

