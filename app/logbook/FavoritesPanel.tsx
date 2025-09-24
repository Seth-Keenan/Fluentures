"use client";

type Fav = { word: string; example: string };

export default function FavoritesPanel({ items }: { items: Fav[] }) {
  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((f, i) => (
        <div key={f.word + i} className="rounded-md bg-amber-900/10 ring-1 ring-amber-900/15 p-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900">{f.word}</span>
            <span className="text-[11px] text-amber-900/70">#{i + 1}</span>
          </div>
          <p className="mt-1 text-sm text-amber-900/80">{f.example}</p>
        </div>
      ))}
    </div>
  );
}
