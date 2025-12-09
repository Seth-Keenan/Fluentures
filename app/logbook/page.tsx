// app/logbook/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookShell from "@/app/logbook/BookShell";
import {
  getAllFavoritesForUser,
  type FavoriteWord,
} from "@/app/lib/actions/favoritesAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faClock,
  faBookmark,
  faListUl,
  faChartPie,
  faFire,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

import StatCard from "@/app/logbook/StatCard";
import ProgressBar from "@/app/logbook/ProgressBar";
import RecentList from "@/app/logbook/RecentList";
import FavoritesPanel from "@/app/logbook/FavoritesPanel";
import { getLogbookStats } from "@/app/lib/actions/logbookAction";
import { getRecentlyLearned } from "@/app/lib/actions/logbookAction";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

// ------------------------------------------------------------
// HOOKS
// ------------------------------------------------------------
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------
export default function LogbookPage() {
  // Real stats
  const [stats, setStats] = useState({
    xp: 0,
    minutes: 0,
    wordsSaved: 0,
    listsMade: 0,
    streakDays: 0,
  });

  const [recentWords, setRecentWords] = useState<
    Array<{
      word_id?: string | number;
      word_target?: string;
      word_english?: string;
      note?: string;
      created_at?: string;
    }>
  >([]);

  const [favorites, setFavorites] = useState<FavoriteWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"overview" | "favorites">("overview");

  const isMobile = useIsMobile();
  const desert = deserts.find((d) => d.name === "Wadi Rum Desert")!;

  // LEVEL CALCULATION
  const level = Math.floor(stats.xp / 150) + 1;
  const into = stats.xp % 150;
  const toNext = 150;

  useEffect(() => {
    (async () => {
      const result = await getLogbookStats();
      if (!("error" in result)) {
        setStats(result);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const recent = await getRecentlyLearned(10);
      setRecentWords(recent);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllFavoritesForUser();
        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("❌ Error loading favorites:", err);
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------------------------------------------------------------
  // DESKTOP LOGIC
  // ------------------------------------------------------------
  const ITEMS_PER_COLUMN = 6;
  const ITEMS_PER_PAGE = ITEMS_PER_COLUMN * 2;

  const favChunks = useMemo(() => {
    return chunk(favorites, ITEMS_PER_PAGE);
  }, [favorites]);

  const desktopPages = useMemo(() => {
    if (loading) return [<div key="loading">Loading...</div>];
    if (error) return [<div key="error">{error}</div>];

    const mappedRecent = recentWords.map((w) => ({
      word: w.word_target ?? w.word_english ?? "",
      note: w.note ?? "",
    }));

    const homePage = (
      <div className="grid grid-cols-2 gap-50 h-full">
        {/* LEFT PAGE */}
        <div className="pr-8">
          <h2 className="text-amber-900/90 text-xl font-semibold">
            Recently learned
          </h2>
          <div className="h-px w-full bg-amber-900/20" />
          <RecentList items={mappedRecent} />

          {/* <div className="mt-6 h-px w-full bg-amber-900/20" /> */}
        </div>

        {/* RIGHT PAGE */}
        <div className="pl-8">
          {/* <div className="h-px w-full bg-amber-900/20" /> */}

          <h3 className="mt-0 text-amber-900/90 text-xl font-semibold">My Stats</h3>
          <div className="h-px w-full bg-amber-900/20" />

          <div className="mt-3 space-y-4">
            <StatCard
              label="Experience"
              value={`${stats.xp.toLocaleString()} XP`}
              icon={
                <FontAwesomeIcon
                  icon={faBolt}
                  className="h-5 w-5 text-indigo-600"
                />
              }
              hint={`Level ${level}`}
              footer={<ProgressBar value={into} max={toNext} />}
            />

            <StatCard
              label="Words Saved"
              value={stats.wordsSaved}
              icon={
                <FontAwesomeIcon
                  icon={faBookmark}
                  className="h-5 w-5 text-indigo-600"
                />
              }
              hint="Keep collecting vocabulary!"
            />

            <StatCard
              label="Time Spent"
              value={`${Math.floor(stats.minutes / 60)}h ${
                stats.minutes % 60
              }m`}
              icon={
                <FontAwesomeIcon
                  icon={faClock}
                  className="h-5 w-5 text-indigo-600"
                />
              }
              hint={`${stats.minutes} minutes total`}
            />

            <StatCard
              label="Lists Made"
              value={stats.listsMade}
              icon={
                <FontAwesomeIcon
                  icon={faListUl}
                  className="h-5 w-5 text-indigo-600"
                />
              }
              hint="Organize your learning"
            />
          </div>
        </div>
      </div>
    );

    // FAVORITES PAGES
    const favoritePages =
      favChunks.length === 0
        ? [
            <>
              <div className="pr-6">
                <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">
                  My Favorites
                </h2>
                <div className="mt-4 text-amber-900/70">
                  You haven&apos;t favorited any words yet.
                </div>
                <div className="mt-4 p-4 bg-amber-900/10 rounded-lg">
                  <p className="text-sm text-amber-900/80">
                    Go to any word list and tap the heart icon to add favorites.
                  </p>
                </div>
              </div>
              <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20" />
            </>,
          ]
        : favChunks.map((slice, idx) => {
            const leftCol = slice.slice(0, ITEMS_PER_COLUMN);
            const rightCol = slice.slice(ITEMS_PER_COLUMN);

            return (
              <div
                key={`fav-${idx}`}
                className="grid grid-cols-1 md:grid-cols-2 gap-0"
              >
                <div className="pr-6">
                  <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">
                    My Favorites · Page {idx + 1}
                  </h2>
                  <FavoritesPanel
                    items={leftCol.map((w) => ({
                      word: w.word_target ?? "(no target)",
                      example: w.word_english ?? "",
                    }))}
                  />
                </div>

                <div className="md:pl-10 border-t md:border-t-0">
                  <div className="md:pt-0 pt-6">
                    <FavoritesPanel
                      items={rightCol.map((w) => ({
                        word: w.word_target ?? "(no target)",
                        example: w.word_english ?? "",
                      }))}
                    />
                  </div>
                </div>
              </div>
            );
          });

    return [homePage, ...favoritePages];
  }, [
    loading,
    error,
    favChunks,
    recentWords,
    stats.xp,
    stats.minutes,
    stats.wordsSaved,
    stats.listsMade,
    into,
    level,
  ]);

  // ------------------------------------------------------------
  // MOBILE VIEW
  // ------------------------------------------------------------
  const renderMobileContent = () => {
    if (loading)
      return (
        <div className="p-8 text-center text-amber-900/70">
          Loading Logbook...
        </div>
      );
    if (error)
      return <div className="p-8 text-center text-red-600">{error}</div>;

    const mappedRecent = recentWords.map((w) => ({
      word: w.word_target ?? w.word_english ?? "",
      note: w.note ?? "",
    }));

    return (
      <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
        {/* Header */}
        <div className="px-5 pt-6 pb-2">
          <h1 className="text-3xl font-bold text-amber-900/90">Logbook</h1>
          <p className="text-amber-900/60 text-sm mt-1">
            Level {level} · {stats.xp.toLocaleString()} XP
          </p>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-20 bg-[#fdfbf7]/95 backdrop-blur-sm px-5 mt-2 flex border-b border-amber-900/10">
          <button
            onClick={() => setActiveMobileTab("overview")}
            className={`pb-3 pr-6 text-sm font-semibold transition-colors ${
              activeMobileTab === "overview"
                ? "text-amber-800 border-b-2 border-amber-800"
                : "text-amber-900/40"
            }`}
          >
            <FontAwesomeIcon icon={faChartPie} className="mr-2" /> Overview
          </button>

          <button
            onClick={() => setActiveMobileTab("favorites")}
            className={`pb-3 px-6 text-sm font-semibold transition-colors ${
              activeMobileTab === "favorites"
                ? "text-amber-800 border-b-2 border-amber-800"
                : "text-amber-900/40"
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="mr-2" /> Favorites (
            {favorites.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 pb-32">
          {activeMobileTab === "overview" ? (
            <div className="space-y-8">
              {/* Stats grid */}
              <section>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="XP"
                    value={stats.xp.toLocaleString()}
                    icon={
                      <FontAwesomeIcon
                        icon={faBolt}
                        className="h-4 w-4 text-indigo-600"
                      />
                    }
                    footer={<ProgressBar value={into} max={toNext} />}
                  />

                  <StatCard
                    label="Time"
                    value={`${Math.floor(stats.minutes / 60)}h ${
                      stats.minutes % 60
                    }m`}
                    icon={
                      <FontAwesomeIcon
                        icon={faClock}
                        className="h-4 w-4 text-indigo-600"
                      />
                    }
                  />

                  <StatCard
                    label="Saved"
                    value={stats.wordsSaved}
                    icon={
                      <FontAwesomeIcon
                        icon={faBookmark}
                        className="h-4 w-4 text-indigo-600"
                      />
                    }
                  />

                  <StatCard
                    label="Lists"
                    value={stats.listsMade}
                    icon={
                      <FontAwesomeIcon
                        icon={faListUl}
                        className="h-4 w-4 text-indigo-600"
                      />
                    }
                  />
                </div>
              </section>

              {/* Recent */}
              <section>
                <h3 className="text-amber-900/80 text-lg font-bold mb-3">
                  Recently Learned
                </h3>
                <div className="bg-white/50 rounded-xl p-4 border border-amber-900/5 shadow-sm">
                  <RecentList items={mappedRecent} />
                </div>
              </section>
            </div>
          ) : (
            // Favorites Mobile
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-10 text-amber-900/50">
                  <FontAwesomeIcon
                    icon={faBookmark}
                    className="h-8 w-8 mb-3 opacity-50"
                  />
                  <p>No favorites yet.</p>
                </div>
              ) : (
                <FavoritesPanel
                  items={favorites.map((w) => ({
                    word: w.word_target ?? "Unknown",
                    example: w.word_english ?? "",
                  }))}
                />
              )}
            </div>
          )}
        </div>

        {/* FAB */}
        <div className="fixed bottom-6 right-6 z-30">
          <Link
            href="/map"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-700 text-white shadow-lg shadow-amber-900/30 hover:bg-amber-600 active:scale-95 transition"
          >
            <FontAwesomeIcon icon={faListUl} className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------
  // RENDER ROOT
  // ------------------------------------------------------------
  return (
    <PageBackground src={desert.src} alt={desert.name} wikiUrl={desert.wikiUrl}>
      {isMobile ? (
        <div className="relative w-full min-h-screen z-10">
          {renderMobileContent()}
        </div>
      ) : (
        <BookShell
          pages={desktopPages}
          showPageControls={desktopPages.length > 1}
          rightExtras={
            <>
              <div className="absolute top-1 left-1/2 -translate-x-1/2">
                <Link
                  href="/home"
                  className="rounded-xl px-5 py-2 bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/30 shadow-md transition focus:outline-none focus:ring-2 focus:ring-white/80"
                >
                  Back to Home
                </Link>
              </div>

              <div className="absolute top-16 right-24 flex items-center gap-2 z-30">
                <div className="flex flex-col">
                  <span className="text-amber-900/80 text-sm font-medium">Streak</span>

                  <span className="text-amber-900/95 text-lg font-semibold flex items-center gap-1">
                    <FontAwesomeIcon icon={faFire} className="h-4 w-4 text-orange-500" />
                    {stats.streakDays ?? 0}d
                  </span>
                </div>
              </div>
            </>
          }
        />
      )}
    </PageBackground>
  );
}
