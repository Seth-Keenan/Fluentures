"use client";

export default function Leaderboard({ names }: { names: string[] }) {
  return (
    <ol className="mt-3 list-decimal list-inside space-y-2 text-amber-900/95">
      {names.map((n, i) => (
        <li key={n} className={i === 0 ? "font-semibold text-amber-900" : ""}>
          {n}
        </li>
      ))}
    </ol>
  );
}
