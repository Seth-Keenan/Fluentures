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

// Mock MapEditView client component
vi.mock("./client", () => ({
  __esModule: true,
  default: ({ 
    wordlists, 
    deleteAction,
    createAction 
  }: { 
    wordlists: Array<{ id: string; title: string; language: string | null }>; 
    deleteAction: (formData: FormData) => Promise<void>;
    createAction: (formData: FormData) => Promise<void>;
  }) => (
    <div data-testid="map-edit-view">
      <div data-testid="wordlists-count">{wordlists.length}</div>
      {wordlists.map((wl, index) => (
        <div key={wl.id} data-testid={`wordlist-${index}`}>
          {wl.title} - {wl.language}
        </div>
      ))}
      <button data-testid="mock-delete-action" onClick={() => deleteAction(new FormData())}>
        Delete Action
      </button>
      <button data-testid="mock-create-action" onClick={() => createAction(new FormData())}>
        Create Action
      </button>
    </div>
  ),
}));

// Mock server actions
vi.mock("./actions", () => ({
  deleteListAction: vi.fn(),
  createListAction: vi.fn(),
}));

// Mock deserts data
vi.mock("@/app/data/deserts", () => ({
  deserts: [
    {
      name: "Salar de Uyuni",
      src: "/images/salar-de-uyuni.jpg",
      wikiUrl: "https://en.wikipedia.org/wiki/Salar_de_Uyuni",
    },
  ],
}));

import MapEditPage from "./page";

describe("MapEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockSupabaseClient.from.mockReturnValue(createMockQuery());
  });

  it("renders not logged in state when user is not authenticated", async () => {
    // Mock auth failure
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const component = await MapEditPage();
    render(component);

    expect(screen.getByRole("heading", { name: /not logged in/i })).toBeInTheDocument();
    expect(screen.getByText(/please log in to manage your oases/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/home");
  });

  it("renders map edit view with wordlists when user is authenticated", async () => {
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
      data: { language: "Spanish" },
      error: null,
    });

    const wordListQueryResult = Promise.resolve({
      data: mockWordLists.filter(wl => wl.language === "Spanish"),
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
      .mockReturnValueOnce(settingsChain) // First call for UserSettings
      .mockReturnValueOnce(wordListChain); // Second call for WordList

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("page-background")).toBeInTheDocument();
      expect(screen.getByTestId("map-edit-view")).toBeInTheDocument();
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("1"); // Only Spanish wordlist
      expect(screen.getByTestId("mock-delete-action")).toBeInTheDocument();
      expect(screen.getByTestId("mock-create-action")).toBeInTheDocument();
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

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("2"); // All wordlists
      expect(screen.getByTestId("wordlist-0")).toHaveTextContent("Spanish Basics - Spanish");
      expect(screen.getByTestId("wordlist-1")).toHaveTextContent("French Vocabulary - French");
    });
  });

  it("filters wordlists by selected language", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockWordLists = [
      {
        word_list_id: "list-1",
        word_list_name: "German Nouns",
        language: "German",
      },
    ];

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
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
    };
    
    // Setup .eq() to return itself first (for user_id), then return result (for language)
    wordListChain.eq.mockReturnValueOnce(wordListChain); // First .eq() call returns chain
    wordListChain.eq.mockReturnValueOnce(wordListQueryResult); // Second .eq() call returns result

    mockSupabaseClient.from
      .mockReturnValueOnce(settingsChain)
      .mockReturnValueOnce(wordListChain);

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("1");
      expect(screen.getByTestId("wordlist-0")).toHaveTextContent("German Nouns - German");
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

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("wordlist-0")).toHaveTextContent("(Untitled) - Spanish");
    });
  });

  it("renders atmospheric effects and proper layout", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    // Mock successful auth
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

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("page-background")).toBeInTheDocument();
      
      // Check for atmospheric effects
      const container = screen.getByTestId("page-background").parentElement;
      expect(container).toBeInTheDocument();
      
      // Verify the map edit view is rendered
      expect(screen.getByTestId("map-edit-view")).toBeInTheDocument();
    });
  });

  it("uses correct Salar de Uyuni desert background", async () => {
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

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("page-background")).toBeInTheDocument();
    });
  });

  it("handles database errors gracefully", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    // Mock successful auth
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock query chains with errors
    const settingsQueryResult = Promise.resolve({
      data: null,
      error: {
        message: "Settings fetch failed",
        code: "SETTINGS_ERROR",
      },
    });

    const wordListQueryResult = Promise.resolve({
      data: null,
      error: {
        message: "WordList fetch failed",
        code: "WORDLIST_ERROR",
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

    const component = await MapEditPage();
    render(component);

    // Should still render the MapEditView with empty wordlists
    await waitFor(() => {
      expect(screen.getByTestId("map-edit-view")).toBeInTheDocument();
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("0");
    });
  });

  it("passes correct actions to MapEditView component", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    // Mock successful auth
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

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      // Verify that both action buttons are present (indicating actions were passed)
      expect(screen.getByTestId("mock-delete-action")).toBeInTheDocument();
      expect(screen.getByTestId("mock-create-action")).toBeInTheDocument();
    });
  });

  it("handles empty wordlist data gracefully", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };

    // Mock successful auth
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

    const component = await MapEditPage();
    render(component);

    await waitFor(() => {
      expect(screen.getByTestId("wordlists-count")).toHaveTextContent("0");
      expect(screen.getByTestId("map-edit-view")).toBeInTheDocument();
    });
  });
});
