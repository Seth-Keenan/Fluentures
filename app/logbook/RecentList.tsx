"use client";

type Item = { word: string; note: string };

export default function RecentList({ items }: { items: Item[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((r) => (
        <li key={r.word} className="text-amber-900/95">
          <span className="font-semibold">{r.word}</span>
          <span className="ml-2 text-amber-900/70 text-sm">— {r.note}</span>
        </li>
      ))}
    </ul>
  );
}
