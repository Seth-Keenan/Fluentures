import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

// Mock useOasisData hook
const mockUseOasisData = vi.fn();
vi.mock("@/app/lib/hooks/useOasis", () => ({
  useOasisData: () => mockUseOasisData(),
}));

// Mock Button
vi.mock("@/app/components/Button", () => {
  return {
    Button: (props: {
      children: React.ReactNode;
      onClick?: () => void;
      className?: string;
      disabled?: boolean;
      "aria-pressed"?: boolean;
      "aria-label"?: string;
    }) =>
      React.createElement(
        "button",
        {
          onClick: props.onClick,
          className: props.className,
          disabled: props.disabled,
          "aria-pressed": props["aria-pressed"],
          "aria-label": props["aria-label"],
        },
        props.children
      ),
  };
});

import WordMatcher from "./WordMatcher";

const mockWords = [
  { id: "1", english: "hello", target: "hola", notes: "" },
  { id: "2", english: "goodbye", target: "adiós", notes: "" },
  { id: "3", english: "thank you", target: "gracias", notes: "" },
];

const defaultMockData = {
  listId: "test-list-id",
  meta: { id: "test-list-id", name: "Test Oasis", language: "Spanish" },
  words: mockWords,
  loading: false,
};

describe("WordMatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOasisData.mockReturnValue(defaultMockData);
  });

  it("renders missing list id message when listId is null", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      listId: null,
    });

    render(<WordMatcher />);

    expect(screen.getByText("Missing list id.")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      loading: true,
    });

    render(<WordMatcher />);

    expect(screen.getByText("Preparing Word Matcher…")).toBeInTheDocument();
    expect(
      screen.getByText(/fetching your oasis words/i)
    ).toBeInTheDocument();
  });

  it("renders empty state when no words exist", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [],
    });

    render(<WordMatcher />);

    expect(screen.getByText("No words in this oasis yet.")).toBeInTheDocument();
    expect(
      screen.getByText(/add words in/i)
    ).toBeInTheDocument();
  });

  it("renders word matcher board with words", () => {
    render(<WordMatcher />);

    // Check for English column
    expect(screen.getByText("English")).toBeInTheDocument();
    
    // Check for target language column
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    
    // Check for word buttons
    expect(screen.getByRole("button", { name: /select hello/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select goodbye/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select thank you/i })).toBeInTheDocument();
  });

  it("renders target language words", () => {
    render(<WordMatcher />);

    expect(screen.getByRole("button", { name: /choose hola/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose adiós/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose gracias/i })).toBeInTheDocument();
  });

  it("renders progress bar showing 0/3 initially", () => {
    render(<WordMatcher />);

    expect(screen.getByText("0/3")).toBeInTheDocument();
  });

  it("renders reset button", () => {
    render(<WordMatcher />);

    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("renders helper hint text", () => {
    render(<WordMatcher />);

    expect(
      screen.getByText(/select a word on the left, then its translation on the right/i)
    ).toBeInTheDocument();
  });

  it("selects a word when clicked on the left column", async () => {
    render(<WordMatcher />);

    const helloButton = screen.getByRole("button", { name: /select hello/i });
    fireEvent.click(helloButton);

    await waitFor(() => {
      expect(helloButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("matches words correctly when correct pair is selected", async () => {
    render(<WordMatcher />);

    // Click on "hello" in the left column
    const helloButton = screen.getByRole("button", { name: /select hello/i });
    fireEvent.click(helloButton);

    // Click on "hola" in the right column (correct match)
    const holaButton = screen.getByRole("button", { name: /choose hola/i });
    fireEvent.click(holaButton);

    await waitFor(() => {
      // Progress should update to 1/3
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });
  });

  it("does not match when wrong pair is selected", async () => {
    render(<WordMatcher />);

    // Click on "hello" in the left column
    const helloButton = screen.getByRole("button", { name: /select hello/i });
    fireEvent.click(helloButton);

    // Click on "gracias" in the right column (wrong match)
    const graciasButton = screen.getByRole("button", { name: /choose gracias/i });
    fireEvent.click(graciasButton);

    await waitFor(() => {
      // Progress should still be 0/3
      expect(screen.getByText("0/3")).toBeInTheDocument();
    });
  });

  it("shows win state when all words are matched", async () => {
    render(<WordMatcher />);

    // Match all three pairs
    // Pair 1: hello - hola
    fireEvent.click(screen.getByRole("button", { name: /select hello/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose hola/i }));

    // Pair 2: goodbye - adiós
    fireEvent.click(screen.getByRole("button", { name: /select goodbye/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose adiós/i }));

    // Pair 3: thank you - gracias
    fireEvent.click(screen.getByRole("button", { name: /select thank you/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose gracias/i }));

    await waitFor(() => {
      expect(screen.getByText("You win! 🎉")).toBeInTheDocument();
      expect(screen.getByText("Test Oasis")).toBeInTheDocument();
    });
  });

  it("shows play again button in win state", async () => {
    render(<WordMatcher />);

    // Match all pairs
    fireEvent.click(screen.getByRole("button", { name: /select hello/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose hola/i }));
    fireEvent.click(screen.getByRole("button", { name: /select goodbye/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose adiós/i }));
    fireEvent.click(screen.getByRole("button", { name: /select thank you/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose gracias/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play again/i })).toBeInTheDocument();
    });
  });

  it("resets game when reset button is clicked", async () => {
    render(<WordMatcher />);

    // Make a match first
    fireEvent.click(screen.getByRole("button", { name: /select hello/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose hola/i }));

    await waitFor(() => {
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });

    // Click reset
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    await waitFor(() => {
      expect(screen.getByText("0/3")).toBeInTheDocument();
    });
  });

  it("uses fallback language name when meta language is null", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      meta: { id: "test-list-id", name: "Test Oasis", language: null },
    });

    render(<WordMatcher />);

    expect(screen.getByText("Target")).toBeInTheDocument();
  });

  it("filters out words with empty english or target", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [
        { id: "1", english: "hello", target: "hola", notes: "" },
        { id: "2", english: "", target: "adiós", notes: "" },
        { id: "3", english: "thank you", target: "", notes: "" },
      ],
    });

    render(<WordMatcher />);

    // Only hello/hola should be rendered
    expect(screen.getByRole("button", { name: /select hello/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /select goodbye/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /select thank you/i })).not.toBeInTheDocument();
    
    // Progress should show 0/1
    expect(screen.getByText("0/1")).toBeInTheDocument();
  });

  it("disables matched word buttons", async () => {
    render(<WordMatcher />);

    // Match hello - hola
    fireEvent.click(screen.getByRole("button", { name: /select hello/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose hola/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /select hello/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /choose hola/i })).toBeDisabled();
    });
  });

  it("does not select already matched words", async () => {
    render(<WordMatcher />);

    // Match hello - hola
    fireEvent.click(screen.getByRole("button", { name: /select hello/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose hola/i }));

    await waitFor(() => {
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });

    // Try to click on matched word again
    fireEvent.click(screen.getByRole("button", { name: /select hello/i }));

    // Select another word and try to match with already matched target
    fireEvent.click(screen.getByRole("button", { name: /select goodbye/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose hola/i }));

    // Progress should still be 1/3 (no change)
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });
});
