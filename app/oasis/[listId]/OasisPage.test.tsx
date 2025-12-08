import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

// Mock next/navigation
const mockUseParams = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

// Mock Supabase client
const mockFrom = vi.fn();

const mockSupabaseClient = {
  from: mockFrom,
};

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: () => mockSupabaseClient,
}));

// Mock LinkAsButton
vi.mock("@/app/components/LinkAsButton", () => {
  return {
    LinkAsButton: (props: {
      href: string;
      children: React.ReactNode;
      className?: string;
      "aria-label"?: string;
    }) =>
      React.createElement(
        "a",
        {
          href: props.href,
          className: props.className,
          "aria-label": props["aria-label"],
        },
        props.children
      ),
  };
});

// Mock PageBackground
vi.mock("@/app/components/PageBackground", () => {
  return {
    __esModule: true,
    default: (props: { children: React.ReactNode }) =>
      React.createElement(
        "div",
        { "data-testid": "page-background" },
        props.children
      ),
  };
});

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => {
  return {
    FontAwesomeIcon: (props: { className?: string }) =>
      React.createElement("span", {
        "data-testid": "font-awesome-icon",
        className: props.className,
      }),
  };
});

// Mock deserts data
vi.mock("@/app/data/deserts", () => ({
  deserts: [
    {
      name: "Arabian Desert",
      src: "/images/deserts/arabian.jpg",
      wikiUrl: "https://en.wikipedia.org/wiki/Arabian_Desert",
    },
  ],
}));

import OasisHubPage from "./page";

describe("OasisHubPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ listId: "test-list-id" });

    // Setup default mock chain for Word query
    const wordQueryChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            word_id: "word-1",
            word_target: "hola",
            word_english: "hello",
            is_favorite: false,
          },
          {
            word_id: "word-2",
            word_target: "adiós",
            word_english: "goodbye",
            is_favorite: true,
          },
        ],
        error: null,
      }),
    };

    // Setup default mock chain for WordList query
    const metaQueryChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          word_list_name: "Spanish Basics",
          language: "Spanish",
        },
        error: null,
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue(wordQueryChain),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue(metaQueryChain),
        };
      }
      return { select: vi.fn() };
    });
  });

  it("renders invalid list ID error when listId is undefined", () => {
    mockUseParams.mockReturnValue({ listId: "undefined" });

    render(<OasisHubPage />);

    expect(screen.getByText(/Invalid list ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Expected a valid UUID but got:/)).toBeInTheDocument();
  });

  it("renders back to map button when listId is invalid", () => {
    mockUseParams.mockReturnValue({ listId: "undefined" });

    render(<OasisHubPage />);

    const backLink = screen.getByRole("link", { name: /back to map/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/map");
  });

  it("renders page background component", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByTestId("page-background")).toBeInTheDocument();
    });
  });

  it("displays list name in header", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("Spanish Basics")).toBeInTheDocument();
    });
  });

  it("displays language information", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText(/Language: Spanish/)).toBeInTheDocument();
    });
  });

  it("renders back to map button in header", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      const backButton = screen.getByRole("link", { name: /back to map/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute("href", "/map");
    });
  });

  it("renders quiz action button with correct link", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      const quizLink = screen.getByRole("link", { name: /open quiz/i });
      expect(quizLink).toBeInTheDocument();
      expect(quizLink).toHaveAttribute("href", "/oasis/test-list-id/quiz");
      expect(screen.getByText("Quiz")).toBeInTheDocument();
      expect(screen.getByText(/Test yourself with targeted questions/)).toBeInTheDocument();
    });
  });

  it("renders story action button with correct link", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      const storyLink = screen.getByRole("link", { name: /read story/i });
      expect(storyLink).toBeInTheDocument();
      expect(storyLink).toHaveAttribute("href", "/oasis/test-list-id/story");
      expect(screen.getByText("Story")).toBeInTheDocument();
      expect(screen.getByText(/Immerse in context with short tales/)).toBeInTheDocument();
    });
  });

  it("renders sentences action button with correct link", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      const sentencesLink = screen.getByRole("link", { name: /build sentences/i });
      expect(sentencesLink).toBeInTheDocument();
      expect(sentencesLink).toHaveAttribute("href", "/oasis/test-list-id/sentences");
      expect(screen.getByText("Sentences")).toBeInTheDocument();
      expect(screen.getByText(/Craft example sentences and variations/)).toBeInTheDocument();
    });
  });

  it("renders edit oasis action button with correct link", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      const editLink = screen.getByRole("link", { name: /edit oasis/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute("href", "/oasis/test-list-id/edit");
      expect(screen.getByText("Edit Oasis")).toBeInTheDocument();
      expect(screen.getByText(/Tweak words, hints, and difficulty/)).toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    render(<OasisHubPage />);

    expect(screen.getByText(/Loading words…/)).toBeInTheDocument();
  });

  it("displays word count after loading", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("2 words")).toBeInTheDocument();
    });
  });

  it("displays words list with correct data", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("hola")).toBeInTheDocument();
      expect(screen.getByText("hello")).toBeInTheDocument();
      expect(screen.getByText("adiós")).toBeInTheDocument();
      expect(screen.getByText("goodbye")).toBeInTheDocument();
    });
  });

  it("displays column headers in words list", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("Favorite")).toBeInTheDocument();
      expect(screen.getByText("Spanish")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });

  it("renders favorite buttons for each word", async () => {
    render(<OasisHubPage />);

    await waitFor(() => {
      const favoriteButtons = screen.getAllByRole("button", {
        name: /add to favorites|remove from favorites/i,
      });
      expect(favoriteButtons).toHaveLength(2);
    });
  });

  it("handles toggle favorite interaction", async () => {
    const mockUpdateChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "Word" && mockFrom.mock.calls.length > 2) {
        return {
          update: vi.fn().mockReturnValue(mockUpdateChain),
        };
      }
      // Return default mock for initial queries
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  word_id: "word-1",
                  word_target: "hola",
                  word_english: "hello",
                  is_favorite: false,
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                word_list_name: "Spanish Basics",
                language: "Spanish",
              },
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("hola")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByRole("button", {
      name: /add to favorites/i,
    });

    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("Word");
    });
  });

  it("displays error message when word loading fails", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                word_list_name: "Spanish Basics",
                language: "Spanish",
              },
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Database error/)).toBeInTheDocument();
    });
  });

  it("displays message when no words are found", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                word_list_name: "Spanish Basics",
                language: "Spanish",
              },
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("0 words")).toBeInTheDocument();
      expect(screen.getByText(/No words found in this list yet/)).toBeInTheDocument();
    });
  });

  it("displays fallback text when list name is not available", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                word_list_name: null,
                language: null,
              },
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("Oasis")).toBeInTheDocument();
      expect(screen.getByText(/Your personalized oasis/)).toBeInTheDocument();
    });
  });

  it("displays 'Target' as column header when language is not available", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  word_id: "word-1",
                  word_target: "hola",
                  word_english: "hello",
                  is_favorite: false,
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                word_list_name: "My List",
                language: null,
              },
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    render(<OasisHubPage />);

    await waitFor(() => {
      expect(screen.getByText("Target")).toBeInTheDocument();
    });
  });

  it("handles null word values gracefully", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "Word") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  word_id: "word-1",
                  word_target: null,
                  word_english: null,
                  is_favorite: false,
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "WordList") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                word_list_name: "Spanish Basics",
                language: "Spanish",
              },
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    render(<OasisHubPage />);

    await waitFor(() => {
      // Check for em dash placeholders
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });
  });
});
