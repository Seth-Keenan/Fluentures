// app/components/ConfirmDialog.tsx
"use client";

import React from "react";
import { Button } from "@/app/components/Button";

export default function ConfirmDialog({
  open,
  onClose,
  title = "Are you sure?",
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: Readonly<{
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" className="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            type="button"
            className="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
