import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

// Mock Supabase server action client
const createMockQuery = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
});

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => createMockQuery()),
};

vi.mock("@/app/lib/hooks/supabaseServerActionClient", () => ({
  getSupabaseServerActionClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock LinkAsButton component
vi.mock("@/app/components/LinkAsButton", () => ({
  LinkAsButton: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock PageBackground component
vi.mock("@/app/components/PageBackground", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-background">{children}</div>
  ),
}));

// Mock AnimatedBackground component
vi.mock("./AnimatedBackground", () => ({
  __esModule: true,
  default: ({ children, name }: { children: React.ReactNode; name: string }) => (
    <div data-testid="animated-background" data-name={name}>
      {children}
    </div>
  ),
}));

// Mock MapView client component
vi.mock("./client", () => ({
  __esModule: true,
  default: ({ 
    wordlists, 
    selectedLanguage 
  }: { 
    wordlists: Array<{ id: string; title: string; language: string | null }>; 
    selectedLanguage: string | null;
  }) => (
    <div data-testid="map-view" data-selected-language={selectedLanguage || "null"}>
      <div data-testid="wordlists-count">{wordlists.length}</div>
      {wordlists.map((wl, index) => (
        <div key={wl.id} data-testid={`wordlist-${index}`}>
          {wl.title} - {wl.language}
        </div>
      ))}
    </div>
  ),
}));

// Mock deserts data
vi.mock("@/app/data/deserts", () => ({
  deserts: [
    {
      name: "Namib Desert",
      src: "/images/namib-desert.jpg",
      wikiUrl: "https://en.wikipedia.org/wiki/Namib_Desert",
    },
  ],
}));

import OasisIndex from "./page";

describe("OasisIndex (Map Page)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockSupabaseClient.from.mockReturnValue(createMockQuery());
  });

  it("renders not logged in state when user is not authenticated", async () => {
    // Mock auth failure
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });

    const component = await OasisIndex();
    render(component);

    expect(screen.getByRole("heading", { name: /not logged in/i })).toBeInTheDocument();
    expect(screen.getByText(/please log in to view your word lists/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/home");
    expect(screen.getByTestId("animated-background")).toHaveAttribute("data-name", "Namib Desert");
  });

  it("renders map view with wordlists when user is authenticated", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockWordLists = [
      {
        word_list_id: "list-1",
        word_list_name: "Spanish Basics",
        language: "Spanish",
      },
      {
        word_list_id: "list-2",
        word_list_name: "French Vocabulary",
        language: "French",
      },
    ];

    // Mock successful auth
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock the query chains
    const settingsQueryResult = Promise.resolve({
      data: { language: "Spanish" },
      error: null,
    });

    const wordListQueryResult = Promise.resolve({
      data: mockWordLists.filter(wl => wl.language === "Spanish"),
      error: null,
    });

    // Create separate mock chains for each call
    const settingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnValue(settingsQueryResult),
      order: vi.fn().mockReturnThis(),
    };

    const wordListChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
    };
    
    // Setup .eq() to return itself first (for user_id), then return result (for language)
    wordListChain.eq.mockReturnValueOnce(wordListChain); // First .eq() call returns chain
    wordListChain.eq.mockReturnValueOnce(wordListQueryResult); // Second .eq() call returns result

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain) // First call for UserSettings
      .mockReturnValueOnce(wordListChain); // Second call for WordList

    const component = await OasisIndex();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("page-background")).toBeInTheDocument();
      expect(screen.getByTestId("map-view")).toBeInTheDocument();
      expect(screen.getByTestId("map-view")).toHaveAttribute("data-selected-language", "Spanish");
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("1"); // Only Spanish wordlist
    });
  });

  it("renders all wordlists when no language filter is set", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockWordLists = [
      {
        word_list_id: "list-1",
        word_list_name: "Spanish Basics",
        language: "Spanish",
      },
      {
        word_list_id: "list-2",
        word_list_name: "French Vocabulary", 
        language: "French",
      },
    ];

    // Mock successful auth
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock query chains
    const settingsQueryResult = Promise.resolve({
      data: null,
      error: null,
    });

    const wordListQueryResult = Promise.resolve({
      data: mockWordLists,
      error: null,
    });

    const settingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnValue(settingsQueryResult),
      order: vi.fn().mockReturnThis(),
    };

    const wordListChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(wordListQueryResult),
      maybeSingle: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain)
      .mockReturnValueOnce(wordListChain);

    const component = await OasisIndex();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("map-view")).toHaveAttribute("data-selected-language", "null");
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("2"); // All wordlists
      expect(screen.getByTestId("wordlist-0")).toHaveTextContent("Spanish Basics - Spanish");
      expect(screen.getByTestId("wordlist-1")).toHaveTextContent("French Vocabulary - French");
    });
  });

  it("shows empty state message when no wordlists match the selected language", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    // Mock successful auth
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock query chains
    const settingsQueryResult = Promise.resolve({
      data: { language: "German" },
      error: null,
    });

    const wordListQueryResult = Promise.resolve({
      data: [], // No German wordlists
      error: null,
    });

    const settingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnValue(settingsQueryResult),
      order: vi.fn().mockReturnThis(),
    };

    const wordListChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
    };
    
    // Setup .eq() to return itself first (for user_id), then return result (for language)
    wordListChain.eq.mockReturnValueOnce(wordListChain); // First .eq() call returns chain
    wordListChain.eq.mockReturnValueOnce(wordListQueryResult); // Second .eq() call returns result

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain)
      .mockReturnValueOnce(wordListChain);

    const component = await OasisIndex();
    render(component);

    await waitFor(() => {
      expect(screen.getByText(/no word lists for/i)).toBeInTheDocument();
      expect(screen.getByText("German")).toBeInTheDocument();
      expect(screen.getByText(/yet\./i)).toBeInTheDocument();
    });
  });

  it("handles wordlists with null names by showing (Untitled)", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockWordLists = [
      {
        word_list_id: "list-1",
        word_list_name: null, // Null name
        language: "Spanish",
      },
    ];

    // Mock successful auth
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock query chains
    const settingsQueryResult = Promise.resolve({
      data: null,
      error: null,
    });

    const wordListQueryResult = Promise.resolve({
      data: mockWordLists,
      error: null,
    });

    const settingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnValue(settingsQueryResult),
      order: vi.fn().mockReturnThis(),
    };

    const wordListChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(wordListQueryResult),
      maybeSingle: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain)
      .mockReturnValueOnce(wordListChain);

    const component = await OasisIndex();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("wordlist-0")).toHaveTextContent("(Untitled) - Spanish");
    });
  });

  it("handles database errors gracefully", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock successful auth
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock query chains with errors
    const settingsQueryResult = Promise.resolve({
      data: null,
      error: {
        message: "Database connection failed",
        code: "CONNECTION_ERROR",
        details: "Network timeout",
        hint: "Check network connection",
      },
    });

    const wordListQueryResult = Promise.resolve({
      data: null,
      error: {
        message: "Failed to fetch wordlists",
        code: "FETCH_ERROR",
        details: "Query timeout",
        hint: "Retry the operation",
      },
    });

    const settingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnValue(settingsQueryResult),
      order: vi.fn().mockReturnThis(),
    };

    const wordListChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(wordListQueryResult),
      maybeSingle: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain)
      .mockReturnValueOnce(wordListChain);

    const component = await OasisIndex();
    render(component);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load user_settings:",
        expect.objectContaining({
          message: "Database connection failed",
          code: "CONNECTION_ERROR",
        })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load word lists:",
        expect.objectContaining({
          message: "Failed to fetch wordlists",
          code: "FETCH_ERROR",
        })
      );
    });

    // Should still render the MapView with empty wordlists
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(screen.getByTestId("wordlists-count")).toHaveTextContent("0");

    consoleErrorSpy.mockRestore();
  });

  it("uses correct Namib Desert background", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const settingsQueryResult = Promise.resolve({ data: null, error: null });
    const wordListQueryResult = Promise.resolve({ data: [], error: null });

    const settingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnValue(settingsQueryResult),
      order: vi.fn().mockReturnThis(),
    };

    const wordListChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(wordListQueryResult),
      maybeSingle: vi.fn().mockReturnThis(),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain)
      .mockReturnValueOnce(wordListChain);

    const component = await OasisIndex();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("page-background")).toBeInTheDocument();
    });
  });
});
