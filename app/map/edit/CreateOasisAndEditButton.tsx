// app/map/CreateTestOasisButton.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWordList } from "@/app/lib/actions/wordlistAction";
import { Button } from "@/app/components/Button";

const STORAGE_KEY = "testOasisId";

export default function CreateTestOasisButton() {
  const [busy, setBusy] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setTestId(saved);
  }, []);

  async function openOrCreate() {
    try {
      setBusy(true);

      // already have an id? just go there
      if (testId) {
        router.push(`/oasis/${testId}/edit`); // ← backticks
        return;
      }

      // otherwise create it once and remember the id
      const newId = await createWordList("Test Oasis 1", "Japanese");
      if (!newId) {
        alert("Failed to create Test Oasis 1");
        return;
      }
      localStorage.setItem(STORAGE_KEY, newId);
      setTestId(newId);
      router.push(`/oasis/${newId}/edit`); // ← backticks
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={openOrCreate} disabled={busy} className="btn">
      {busy ? "Working…" : "Open 'Test Oasis 1' (create if needed)"}
    </Button>
  );
}
