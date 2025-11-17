// app/logbook/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookShell from "@/app/logbook/BookShell";
import { getAllFavoritesForUser, type FavoriteWord } from "@/app/lib/actions/favoritesAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faClock, faBookmark, faListUl } from "@fortawesome/free-solid-svg-icons";

import StatCard from "@/app/logbook/StatCard";
import ProgressBar from "@/app/logbook/ProgressBar";
import RecentList from "@/app/logbook/RecentList";
import FavoritesPanel from "@/app/logbook/FavoritesPanel";
import Leaderboard from "@/app/logbook/Leaderboard";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

const DATA = {
  xp: 12450,
  minutes: 732,
  wordsSaved: 86,
  listsMade: 7,
  streakDays: 12,
  recent: [
    { word: "serendipity", note: "happy chance discovery" },
    { word: "eloquent", note: "fluent or persuasive" },
    { word: "ephemeral", note: "lasting a short time" },
  ],
  favorites: [
    { word: "ubiquitous", example: "Smartphones are ubiquitous in modern life." },
    { word: "camaraderie", example: "The team's camaraderie fueled late-night sprints." },
  ],
  leaderboard: ["You", "Mina", "Leo", "Harper"],
};

const level = Math.floor(DATA.xp / 1000) + 1;
const into = DATA.xp % 1000;
const toNext = 1000;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function LogbookPage() {
  const [favorites, setFavorites] = useState<FavoriteWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const desert = deserts.find(d => d.name === "Wadi Rum Desert")!;
  
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllFavoritesForUser();
        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          console.log("[favorites debug output]", data);
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

  const ITEMS_PER_COLUMN = 6;
  const ITEMS_PER_PAGE = ITEMS_PER_COLUMN * 2;

  const favChunks = useMemo(() => {
    return chunk(favorites, ITEMS_PER_PAGE);
  }, [favorites, ITEMS_PER_PAGE]);

  const pages = useMemo(() => {
    if (loading) {
      return [
        <div key="loading" className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="pr-6">
            <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">Logbook</h2>
            <div className="mt-4 text-amber-900/70">Loading…</div>
          </div>
          <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20" />
        </div>,
      ];
    }

    if (error) {
      return [
        <div key="error" className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="pr-6">
            <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">Logbook</h2>
            <div className="mt-4 text-red-600">{error}</div>
          </div>
          <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20" />
        </div>,
      ];
    }

    const homePage = (
      <>
        {/* LEFT PAGE */}
        <div className="pr-8 md:pr-10">
          <h2 className="text-amber-900/90 text-2xl font-semibold">Recently learned</h2>
          <RecentList items={DATA.recent} />

          <div className="mt-6 h-px w-full bg-amber-900/20" />

          <h3 className="mt-5 text-amber-900/90 text-xl font-semibold">My stats</h3>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Experience"
              value={`${DATA.xp.toLocaleString()} XP`}
              icon={<FontAwesomeIcon icon={faBolt} className="h-5 w-5 text-indigo-600" />}
              hint={`Level ${level}`}
              footer={<ProgressBar value={into} max={toNext} />}
            />
            <StatCard
              label="Time Spent"
              value={`${Math.floor(DATA.minutes / 60)}h ${DATA.minutes % 60}m`}
              icon={<FontAwesomeIcon icon={faClock} className="h-5 w-5 text-indigo-600" />}
              hint={`${DATA.minutes} minutes total`}
            />
            <StatCard
              label="Words Saved"
              value={DATA.wordsSaved}
              icon={<FontAwesomeIcon icon={faBookmark} className="h-5 w-5 text-indigo-600" />}
              hint="Keep collecting vocabulary!"
            />
            <StatCard
              label="Lists Made"
              value={DATA.listsMade}
              icon={<FontAwesomeIcon icon={faListUl} className="h-5 w-5 text-indigo-600" />}
              hint="Organize your learning"
            />
          </div>
        </div>

        {/* RIGHT PAGE */}
        <div className="md:pl-12 lg:pl-14 border-t md:border-t-0 md:border-l border-amber-900/20">
          <Leaderboard names={DATA.leaderboard} />

          <div className="mt-6">
            <button className="inline-flex items-center rounded-full px-4 py-1.5 bg-amber-700 text-amber-50 hover:bg-amber-600 shadow-md ring-1 ring-amber-900/30 transition">
              Add Friends
            </button>
          </div>
        </div>
      </>
    );

    const favoritePages =
      favChunks.length === 0
        ? [
            <>
              {/* LEFT */}
              <div className="pr-6">
                <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">My Favorites</h2>
                <div className="mt-4 text-amber-900/70">You haven&apos;t favorited any words yet.</div>
                <div className="mt-4 p-4 bg-amber-900/10 rounded-lg">
                  <p className="text-sm text-amber-900/80">
                    Go to any word list and tap the heart icon to add favorites.
                  </p>
                </div>
                <p className="mt-6 text-amber-900/60 text-sm italic">← Flip back for Home</p>
              </div>
              {/* RIGHT */}
              <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20" />
            </>,
          ]
        : favChunks.map((slice, idx) => {
            const leftCol = slice.slice(0, ITEMS_PER_COLUMN);
            const rightCol = slice.slice(ITEMS_PER_COLUMN);

            const toFav = (w: FavoriteWord) => ({
              word: w.word_target ?? "(no target)",
              example: w.word_english ?? "",
            });

            return (
              <div key={`fav-${idx}`} className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* LEFT */}
                <div className="pr-6">
                  <h2 className="text-amber-900/90 text-2xl font-semibold mb-4">
                    My Favorites · Page {idx + 1}
                  </h2>
                  <FavoritesPanel items={leftCol.map(toFav)} />
                </div>

                {/* RIGHT */}
                <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
                  <div className="md:pt-0 pt-6">
                    <FavoritesPanel items={rightCol.map(toFav)} />
                  </div>
                  <div className="mt-6 text-amber-900/60 text-sm italic">
                    {idx === 0 ? "← Flip back for Home" : "← Previous page"}
                  </div>
                </div>
              </div>
            );
          });

    return [homePage, ...favoritePages];
  }, [loading, error, favChunks, ITEMS_PER_COLUMN]);

  return (
    <PageBackground
      src={desert.src}
      alt={desert.name}
      wikiUrl={desert.wikiUrl}
    >
      <BookShell
        pages={pages}
        showPageControls={pages.length > 1}
        rightExtras={
          <div className="absolute top-1 left-1/2 -translate-x-1/2">
            <Link
              href="/map"
              className="rounded-xl px-5 py-2 bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/30 shadow-md transition focus:outline-none focus:ring-2 focus:ring-white/80"
            >
              Back to Map
            </Link>
          </div>
        }
      />
    </PageBackground>
  );
}