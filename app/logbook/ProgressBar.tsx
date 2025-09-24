"use client";

type Props = { value: number; max: number; className?: string };

export default function ProgressBar({ value, max, className }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className={`w-full h-2 rounded-full bg-white/20 overflow-hidden ring-1 ring-white/20 ${className ?? ""}`}>
      <div className="h-full bg-indigo-400 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}
