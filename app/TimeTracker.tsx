"use client";

import { useEffect, useRef } from "react";
import { addStudyTime } from "@/app/lib/actions/userStatsActions";

export default function TimeTracker({ intervalMinutes = 5 }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const intervalMs = intervalMinutes * 60 * 1000;

    function startTimer() {
      // Only run if the tab is active
      if (document.visibilityState === "visible") {
        intervalRef.current = setInterval(() => {
          addStudyTime(intervalMinutes);
        }, intervalMs);
      }
    }

    function stopTimer() {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    // Start when mounted
    startTimer();

    // Pause when the tab goes to background
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") stopTimer();
      else startTimer();
    });

    return () => stopTimer();
  }, [intervalMinutes]);

  return null;
}
