// app/logbook/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookShell from "@/app/logbook/BookShell";
import { getAllFavoritesForUser, type FavoriteWord } from "@/app/lib/actions/favoritesAction";

// Simple item renderer
function FavoriteRow({ w }: { w: FavoriteWord }) {
  return (
    <div className="rounded-lg border border-amber-900/15 bg-white/40 px-3 py-2 shadow-sm mb-2">
      <div className="text-[15px] font-semibold text-amber-900/90">
        {w.word_target ?? "(no target)"}
      </div>
      <div className="text-sm text-amber-900/70">{w.word_english ?? ""}</div>
    </div>
  );
}

// Utility: chunk an array into arrays of `size`
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function LogbookPage() {
  const [favorites, setFavorites] = useState<FavoriteWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        console.log("🔍 Loading favorites...");
        const data = await getAllFavoritesForUser();
        console.log("🔍 Favorites loaded:", data.length, "items");
        setFavorites(data);
      } catch (err) {
        console.error("❌ Error loading favorites:", err);
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Layout rules: 2 columns per "page" (BookShell uses a 2-col grid)
  const ITEMS_PER_COLUMN = 6; // Reduced for better display
  const ITEMS_PER_PAGE = ITEMS_PER_COLUMN * 2; // because 2 columns

  // Split into physical "pages" (each page = two columns)
  const pageChunks = useMemo(() => {
    console.log("🔍 Creating page chunks from", favorites.length, "favorites");
    return chunk(favorites, ITEMS_PER_PAGE);
  }, [favorites, ITEMS_PER_PAGE]);

  // Build the pages array expected by <BookShell pages={...}>
  const pages = useMemo(() => {
    console.log("🔍 Building pages, loading:", loading, "pageChunks:", pageChunks.length);

    if (loading) {
      return [
        <div key="loading" className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* LEFT */}
          <div className="pr-6">
            <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">My Favorites</h2>
            <div className="mt-4 text-amber-900/70">Loading your favorites...</div>
          </div>
          {/* RIGHT */}
          <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
            <div className="animate-pulse">
              <div className="h-4 bg-amber-900/20 rounded mb-2"></div>
              <div className="h-4 bg-amber-900/20 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-amber-900/20 rounded mb-2 w-1/2"></div>
            </div>
          </div>
        </div>
      ];
    }

    if (error) {
      return [
        <div key="error" className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* LEFT */}
          <div className="pr-6">
            <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">My Favorites</h2>
            <div className="mt-4 text-red-600">{error}</div>
          </div>
          {/* RIGHT */}
          <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
            <p className="text-amber-900/70 text-sm italic">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      ];
    }

    if (!pageChunks.length || favorites.length === 0) {
      return [
        <div key="empty" className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* LEFT */}
          <div className="pr-6">
            <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">My Favorites</h2>
            <div className="mt-4 text-amber-900/70">
              You haven`t favorited any words yet.
            </div>
            <div className="mt-4 p-4 bg-amber-900/10 rounded-lg">
              <p className="text-sm text-amber-900/80">
                To add favorites, go to any word list and click the heart icon next to words you want to save.
              </p>
            </div>
          </div>
          {/* RIGHT */}
          <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
            <p className="text-amber-900/70 text-sm italic">
              Tip: Tap the bookmark icon on any word to add it here.
            </p>
          </div>
        </div>
      ];
    }

    return pageChunks.map((slice, idx) => {
      // Left column gets first half, right column gets second half
      const leftCol = slice.slice(0, ITEMS_PER_COLUMN);
      const rightCol = slice.slice(ITEMS_PER_COLUMN);

      return (
        <div key={`page-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* LEFT PAGE */}
          <div className="pr-6">
            <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">
              My Favorites {pageChunks.length > 1 ? `· Page ${idx + 1}` : ""}
            </h2>
            <div className="space-y-2">
              {leftCol.map((w) => (
                <FavoriteRow key={w.word_id} w={w} />
              ))}
            </div>
            {leftCol.length === 0 && (
              <div className="text-amber-900/50 text-sm italic">
                No more items on this side
              </div>
            )}
          </div>

          {/* RIGHT PAGE */}
          <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
            <div className="md:pt-0 pt-6">
              <div className="space-y-2">
                {rightCol.map((w) => (
                  <FavoriteRow key={w.word_id} w={w} />
                ))}
              </div>
              {rightCol.length === 0 && leftCol.length > 0 && (
                <div className="text-amber-900/50 text-sm italic">
                  Continue on next page →
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  }, [loading, error, pageChunks, favorites.length, ITEMS_PER_COLUMN]);

  console.log("🔍 Final pages array:", pages.length, "pages");

  return (
    <BookShell
      pages={pages}
      showPageControls={pages.length > 1}
      rightExtras={
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Link
            href="/map"
            className="rounded-xl px-5 py-2 bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/30 shadow-md transition focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            Back to Map
          </Link>
        </div>
      }
    />
  );
}
