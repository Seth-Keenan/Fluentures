import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dynamic server actions for predictable test data
vi.mock("@/app/lib/actions/logbookAction", () => ({
  getLogbookStats: vi.fn().mockResolvedValue({
    xp: 12450,
    minutes: 732,
    wordsSaved: 86,
    listsMade: 7,
    streakDays: 12
  }),
  getRecentlyLearned: vi.fn().mockResolvedValue([
    { word_target: "serendipity", note: "happy chance discovery" },
    { word_target: "eloquent", note: "fluent or persuasive" },
    { word_target: "ephemeral", note: "lasting a short time" },
  ])
}));


// Mock framer-motion
vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href, "data-testid": "link" }, children),
}));

// Mock PageBackground
vi.mock("@/app/components/PageBackground", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "page-background" }, children),
}));

// Mock BookShell
vi.mock("@/app/logbook/BookShell", () => ({
  default: ({ pages }: { pages: React.ReactNode[] }) =>
    React.createElement("div", { "data-testid": "book-shell" }, pages),
}));

// Mock child components
vi.mock("@/app/logbook/StatCard", () => ({
  default: ({ label, value }: { label: string; value: string | number }) =>
    React.createElement("div", { "data-testid": `stat-${label}` }, `${label}: ${value}`),
}));

vi.mock("@/app/logbook/ProgressBar", () => ({
  default: () => React.createElement("div", { "data-testid": "progress-bar" }),
}));

vi.mock("@/app/logbook/RecentList", () => ({
  default: () => React.createElement("div", { "data-testid": "recent-list" }),
}));

vi.mock("@/app/logbook/FavoritesPanel", () => ({
  default: ({ items }: { items: { word: string }[] }) =>
    React.createElement("div", { "data-testid": "favorites-panel" }, `${items.length} favorites`),
}));

vi.mock("@/app/logbook/Leaderboard", () => ({
  default: () => React.createElement("div", { "data-testid": "leaderboard" }),
}));

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => React.createElement("span", { "data-testid": "icon" }),
}));

// Mock favorites action
const mockGetAllFavoritesForUser = vi.fn();
vi.mock("@/app/lib/actions/favoritesAction", () => ({
  getAllFavoritesForUser: () => mockGetAllFavoritesForUser(),
}));

import LogbookPage from "./page";

/**
 * A note on tests
 *
 * The tests test the two layouts:
 * - Desktop: Uses BookShell component with page-flip animation
 * - Mobile: Uses tabs to switch between Overview and Favorites
 */
describe("LogbookPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllFavoritesForUser.mockResolvedValue([]);
    // Default to desktop view
    Object.defineProperty(globalThis, "innerWidth", { writable: true, value: 1024 });
  });

  // ===========================================
  // DESKTOP VIEW TESTS
  describe("Desktop View", () => {
    // Verify the animated book component renders
    it("renders BookShell on desktop", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByTestId("book-shell")).toBeInTheDocument();
      });
    });

    // Verify desert background wrapper is present
    it("renders PageBackground", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByTestId("page-background")).toBeInTheDocument();
      });
    });

    // Verify all 4 stat cards are displayed (XP, Time, Words, Lists)
    it("renders stats section", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByTestId("stat-Experience")).toBeInTheDocument();
        expect(screen.getByTestId("stat-Time Spent")).toBeInTheDocument();
        expect(screen.getByTestId("stat-Words Saved")).toBeInTheDocument();
        expect(screen.getByTestId("stat-Lists Made")).toBeInTheDocument();
      });
    });

    // Verify the recent words list appears
    it("renders recently learned section", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByTestId("recent-list")).toBeInTheDocument();
      });
    });

    // Verify leaderboard component is rendered
    // Leaderboard is no longer rendered in the current desktop layout

    // When user has no favorites, show encouraging message
    it("shows empty favorites message when no favorites", async () => {
      mockGetAllFavoritesForUser.mockResolvedValue([]);
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/haven't favorited any words yet/i)).toBeInTheDocument();
      });
    });

    // When user has favorites, display the FavoritesPanel component
    // Desktop shows two columns, so we check for at least one panel
    it("renders favorites when available", async () => {
      mockGetAllFavoritesForUser.mockResolvedValue([
        { id: "1", word_target: "hola", word_english: "hello" },
        { id: "2", word_target: "adiós", word_english: "goodbye" },
      ]);
      render(<LogbookPage />);

      await waitFor(() => {
        // Desktop layout uses two columns, so there may be multiple panels
        const panels = screen.getAllByTestId("favorites-panel");
        expect(panels.length).toBeGreaterThan(0);
      });
    });

    // Verify "My Favorites" page title appears when favorites exist
    it("shows favorites page heading when favorites available", async () => {
      mockGetAllFavoritesForUser.mockResolvedValue([
        { id: "1", word_target: "hola", word_english: "hello" },
      ]);
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/my favorites/i)).toBeInTheDocument();
      });
    });

    // Verify "Add Friends" button is rendered
    // The Add Friends button was removed from the desktop layout; skip test
  });

  // ===========================================
  // MOBILE VIEW TESTS
  describe("Mobile View", () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, "innerWidth", { writable: true, value: 500 });
      globalThis.dispatchEvent(new Event("resize"));
    });

    // Verify mobile header shows page title
    it("renders mobile header with Logbook title", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /logbook/i })).toBeInTheDocument();
      });
    });

    // Verify both tab buttons exist
    it("renders mobile tabs", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /favorites/i })).toBeInTheDocument();
      });
    });

    // Overview tab should be selected initially
    it("shows overview tab content by default", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/recently learned/i)).toBeInTheDocument();
      });
    });

    // Clicking Favorites tab switches content
    it("switches to favorites tab when clicked", async () => {
      mockGetAllFavoritesForUser.mockResolvedValue([]);
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /favorites/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /favorites/i }));

      await waitFor(() => {
        expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
      });
    });

    // Tab should show count of favorites e.g. "Favorites (2)"
    it("displays favorites count in tab", async () => {
      mockGetAllFavoritesForUser.mockResolvedValue([
        { id: "1", word_target: "hola", word_english: "hello" },
        { id: "2", word_target: "adiós", word_english: "goodbye" },
      ]);
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /favorites \(2\)/i })).toBeInTheDocument();
      });
    });

    // Verify navigation link back to map exists
    it("renders back to map link", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        const mapLinks = screen.getAllByTestId("link");
        const mapLink = mapLinks.find((link) => link.getAttribute("href") === "/map");
        expect(mapLink).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // LOADING AND ERROR STATES
  describe("Loading and Error States", () => {
    // Show loading indicator while API call is pending
    it("shows loading state while fetching favorites", async () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: unknown[]) => void;
      const pendingPromise = new Promise<unknown[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetAllFavoritesForUser.mockReturnValue(pendingPromise);

      // Set mobile view to see loading text
      Object.defineProperty(globalThis, "innerWidth", { writable: true, value: 500 });
      globalThis.dispatchEvent(new Event("resize"));

      render(<LogbookPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Cleanup: resolve the promise
      resolvePromise!([]);
    });

    // Display error message when API call fails
    it("shows error message when favorites fail to load", async () => {
      mockGetAllFavoritesForUser.mockRejectedValue(new Error("Failed to load"));

      // Set mobile view to see error text
      Object.defineProperty(globalThis, "innerWidth", { writable: true, value: 500 });
      globalThis.dispatchEvent(new Event("resize"));

      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load favorites/i)).toBeInTheDocument();
      });
    });

    // Gracefully handle unexpected API response (null/undefined)
    it("handles non-array response from favorites API", async () => {
      mockGetAllFavoritesForUser.mockResolvedValue(null);
      render(<LogbookPage />);

      await waitFor(() => {
        // Should default to empty array, not crash
        expect(screen.getByTestId("page-background")).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // DATA DISPLAY
  describe("Data Display", () => {
    // Verify XP is formatted with commas
    it("displays correct XP value", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/12,450 XP/i)).toBeInTheDocument();
      });
    });

    // Verify level is displayed in mobile header
    it("displays correct level", async () => {
      // Set mobile view to see level in header
      Object.defineProperty(globalThis, "innerWidth", { writable: true, value: 500 });
      globalThis.dispatchEvent(new Event("resize"));

      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/level 84/i)).toBeInTheDocument();
      });
    });

    // Verify time spent is calculated and displayed correctly (732 min = 12h 12m)
    it("displays time spent correctly", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/12h 12m/i)).toBeInTheDocument();
      });
    });

    // Verify words saved count
    it("displays words saved count", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/86/)).toBeInTheDocument();
      });
    });

    // Verify lists made count
    it("displays lists made count", async () => {
      render(<LogbookPage />);

      await waitFor(() => {
        expect(screen.getByText(/7/)).toBeInTheDocument();
      });
    });
  });
});