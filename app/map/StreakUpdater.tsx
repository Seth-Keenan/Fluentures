"use client";

import { useEffect } from "react";
import { updateDailyStreak } from "@/app/lib/actions/userStatsActions";

export default function StreakUpdater() {
  useEffect(() => {
    updateDailyStreak();
  }, []);

  return null; 
}
