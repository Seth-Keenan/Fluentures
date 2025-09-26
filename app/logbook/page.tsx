"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faClock, faBookmark, faListUl, faFire } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

import BookShell from "@/app/logbook/BookShell";
import StatCard from "@/app/logbook/StatCard";
import ProgressBar from "@/app/logbook/ProgressBar";
import RecentList from "@/app/logbook/RecentList";
import FavoritesPanel from "@/app/logbook/FavoritesPanel";
import Leaderboard from "@/app/logbook/Leaderboard";

// TODO: Replace with real data
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
    { word: "camaraderie", example: "The team’s camaraderie fueled late-night sprints." },
  ],
  leaderboard: ["You", "Mina", "Leo", "Harper"],
};
// TODO

const level = Math.floor(DATA.xp / 1000) + 1;
const into = DATA.xp % 1000;
const toNext = 1000;

export default function LogbookPage() {
  return (
    <BookShell
      rightExtras={
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Link
            href="/home"
            className="rounded-xl px-5 py-2 bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/30 shadow-md transition focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            Back to Home
          </Link>
        </div>
      }
    >
      {/* LEFT PAGE */}
      <div className="pr-6">
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
      <div className="md:pl-10 border-t md:border-t-0 md:border-l border-amber-900/20">
        <h2 className="text-amber-900/90 text-2xl font-semibold">Leaderboard</h2>
        <Leaderboard names={DATA.leaderboard} />

        <div className="mt-6">
          <button className="inline-flex items-center rounded-full px-4 py-1.5 bg-amber-700 text-amber-50 hover:bg-amber-600 shadow-md ring-1 ring-amber-900/30 transition">
            Add Friends
          </button>
        </div>

        <h3 className="mt-8 text-amber-900/90 text-xl font-semibold">Favorites</h3>
        <FavoritesPanel items={DATA.favorites} />
      </div>
    </BookShell>
  );
}
