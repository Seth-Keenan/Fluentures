// app/lib/hooks/useListId.ts
"use client";

import { useParams } from "next/navigation";

/** Safely returns the listId from /oasis/[listId]/edit (or null if missing). */
export function useListId(): string | null {
  const params = useParams<{ listId?: string | string[] }>();
  const raw = params?.listId;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}
