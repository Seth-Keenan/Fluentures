// app/components/OasisRowActions.tsx
"use client";

import { useRef, useState } from "react";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { Button } from "@/app/components/Button";

export default function OasisRowActions({
  listId,
  listName,
  deleteAction,
}: {
  readonly listId: string;
  readonly listName?: string | null;
  readonly deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <a href={`/oasis/${listId}`} className="btn px-3 py-1.5 text-sm">
        View
      </a>

      <form ref={formRef} action={deleteAction} className="inline">
        <Button
          type="button"
          className="px-3 py-1.5 text-sm border hover:bg-red-50 hover:border-red-300"
          onClick={() => setOpen(true)}
        >
          Delete
        </Button>
      </form>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this oasis?"
        description={`“${(listName ?? "Untitled").trim()}” and its words will be permanently deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
