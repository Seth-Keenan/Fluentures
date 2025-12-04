import "@testing-library/jest-dom";
import { vi } from "vitest";

// -------------------------------
// 1. Mock Supabase client (yours)
// -------------------------------
vi.mock("@/app/lib/hooks/supabaseServerActionClient", () => {
  function makeChain() {
    return {
      select: () => makeChain(),
      eq: () => makeChain(),
      in: () => makeChain(),
      order: () => makeChain(),

      single: async () => ({ data: {}, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),

      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
    };
  }

  return {
    getSupabaseServerActionClient: async () => ({
      auth: {
        getUser: async () => ({
          data: { user: { id: "test-user" } },
          error: null,
        }),
      },
      from: () => makeChain(),
    }),
  };
});

// ----------------------------------------------
// 2. NEW: Completely ignore updateDailyStreak()
// ----------------------------------------------
vi.mock("@/app/lib/actions/userStatsActions", () => ({
  updateDailyStreak: vi.fn().mockResolvedValue(undefined),
}));
