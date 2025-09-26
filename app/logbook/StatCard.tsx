"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  footer?: ReactNode; // progress bar, etc.
};

export default function StatCard({ label, value, icon, hint, footer }: Props) {
  return (
    <div className="rounded-xl bg-white/90 text-gray-900 p-4 ring-1 ring-white/30 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-600">{hint}</div>}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}
