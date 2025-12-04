import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

// Mock useListId hook
const mockUseListId = vi.fn<() => string | null>(() => "test-list-id");
vi.mock("@/app/lib/hooks/useListId", () => ({
  useListId: () => mockUseListId(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ listId: "test-list-id" }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
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

// Mock Button
vi.mock("@/app/components/Button", () => {
  return {
    Button: (props: {
      children: React.ReactNode;
      onClick?: () => void;
      className?: string;
    }) =>
      React.createElement(
        "button",
        { onClick: props.onClick, className: props.className },
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

// Mock WordMatcher
vi.mock("./WordMatcher", () => {
  return {
    __esModule: true,
    default: () =>
      React.createElement(
        "div",
        { "data-testid": "word-matcher" },
        "Word Matcher Component"
      ),
  };
});

// Mock WrittenQuiz
vi.mock("./WrittenQuiz", () => {
  return {
    __esModule: true,
    default: () =>
      React.createElement(
        "div",
        { "data-testid": "written-quiz" },
        "Written Quiz Component"
      ),
  };
});

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => {
  return {
    FontAwesomeIcon: () =>
      React.createElement("span", { "data-testid": "font-awesome-icon" }),
  };
});

import Quiz from "./page";

describe("Quiz Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseListId.mockReturnValue("test-list-id");
  });

  it("renders the quiz selection page with heading", () => {
    render(<Quiz />);

    expect(
      screen.getByRole("heading", { name: /choose a quiz/i })
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<Quiz />);

    expect(
      screen.getByText(/practice vocab your way—matching tiles or a written challenge/i)
    ).toBeInTheDocument();
  });

  it("renders back to oasis link with correct href", () => {
    render(<Quiz />);

    const backLink = screen.getByRole("link", { name: /back to oasis/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/oasis/test-list-id");
  });

  it("renders matching tiles button", () => {
    render(<Quiz />);

    expect(
      screen.getByRole("button", { name: /start matching tiles/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Matching Tiles")).toBeInTheDocument();
    expect(
      screen.getByText(/pair words with meanings—fast and visual/i)
    ).toBeInTheDocument();
  });

  it("renders written quiz button", () => {
    render(<Quiz />);

    expect(
      screen.getByRole("button", { name: /start written quiz/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Written Quiz")).toBeInTheDocument();
    expect(
      screen.getByText(/type your answers and check understanding/i)
    ).toBeInTheDocument();
  });

  it("renders footer tip when no quiz is selected", () => {
    render(<Quiz />);

    expect(
      screen.getByText(/tip: you can switch modes anytime/i)
    ).toBeInTheDocument();
  });

  it("shows WordMatcher component when matching tiles is selected", async () => {
    render(<Quiz />);

    const matchingButton = screen.getByRole("button", { name: /start matching tiles/i });
    fireEvent.click(matchingButton);

    await waitFor(() => {
      expect(screen.getByTestId("word-matcher")).toBeInTheDocument();
    });
  });

  it("shows WrittenQuiz component when written quiz is selected", async () => {
    render(<Quiz />);

    const writtenButton = screen.getByRole("button", { name: /start written quiz/i });
    fireEvent.click(writtenButton);

    await waitFor(() => {
      expect(screen.getByTestId("written-quiz")).toBeInTheDocument();
    });
  });

  it("hides footer tip when a quiz is selected", async () => {
    render(<Quiz />);

    const matchingButton = screen.getByRole("button", { name: /start matching tiles/i });
    fireEvent.click(matchingButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/tip: you can switch modes anytime/i)
      ).not.toBeInTheDocument();
    });
  });

  it("shows back button when quiz is active", async () => {
    render(<Quiz />);

    const matchingButton = screen.getByRole("button", { name: /start matching tiles/i });
    fireEvent.click(matchingButton);

    await waitFor(() => {
      expect(screen.getByText("Back")).toBeInTheDocument();
    });
  });

  it("returns to quiz selection when back button is clicked", async () => {
    render(<Quiz />);

    // Select a quiz
    const matchingButton = screen.getByRole("button", { name: /start matching tiles/i });
    fireEvent.click(matchingButton);

    await waitFor(() => {
      expect(screen.getByTestId("word-matcher")).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /start matching tiles/i })
      ).toBeInTheDocument();
      expect(screen.queryByTestId("word-matcher")).not.toBeInTheDocument();
    });
  });

  it("shows oasis hub link when quiz is active", async () => {
    render(<Quiz />);

    const writtenButton = screen.getByRole("button", { name: /start written quiz/i });
    fireEvent.click(writtenButton);

    await waitFor(() => {
      expect(screen.getByText("Oasis Hub")).toBeInTheDocument();
    });
  });

  it("uses fallback href when listId is null", () => {
    mockUseListId.mockReturnValue(null);

    render(<Quiz />);

    const backLink = screen.getByRole("link", { name: /back to oasis/i });
    expect(backLink).toHaveAttribute("href", "/oasis");
  });

  it("renders page background component", () => {
    render(<Quiz />);

    expect(screen.getByTestId("page-background")).toBeInTheDocument();
  });
});
 