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

// Mock requestQuizSentence
const mockRequestQuizSentence = vi.fn();
vi.mock("@/app/lib/actions/geminiQuizAction", () => ({
  requestQuizSentence: (args: unknown) => mockRequestQuizSentence(args),
}));

// Mock Button
vi.mock("@/app/components/Button", () => {
  return {
    Button: (props: {
      children: React.ReactNode;
      onClick?: () => void;
      className?: string;
      disabled?: boolean;
      title?: string;
    }) =>
      React.createElement(
        "button",
        {
          onClick: props.onClick,
          className: props.className,
          disabled: props.disabled,
          title: props.title,
        },
        props.children
      ),
  };
});

import WrittenQuiz from "./WrittenQuiz";

const mockWords = [
  { id: "1", english: "hello", target: "hola", notes: "" },
  { id: "2", english: "goodbye", target: "adiós", notes: "" },
  { id: "3", english: "thank you", target: "gracias", notes: "" },
  { id: "4", english: "please", target: "por favor", notes: "" },
  { id: "5", english: "yes", target: "sí", notes: "" },
];

const defaultMockData = {
  listId: "test-list-id",
  meta: { id: "test-list-id", name: "Test Oasis", language: "Spanish" },
  words: mockWords,
  loading: false,
};

describe("WrittenQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOasisData.mockReturnValue(defaultMockData);
    mockRequestQuizSentence.mockResolvedValue("This is an example sentence.");
  });

  it("renders missing list id message when listId is null", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      listId: null,
    });

    render(<WrittenQuiz />);

    expect(screen.getByText("Missing list id.")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      loading: true,
    });

    render(<WrittenQuiz />);

    expect(screen.getByText("Loading oasis words…")).toBeInTheDocument();
    expect(
      screen.getByText(/getting your oasis ready/i)
    ).toBeInTheDocument();
  });

  it("renders setup screen with oasis name", () => {
    render(<WrittenQuiz />);

    expect(screen.getByText(/start your quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/test oasis/i)).toBeInTheDocument();
  });

  it("shows available word count on setup screen", () => {
    render(<WrittenQuiz />);

    expect(screen.getByText(/you currently have/i)).toBeInTheDocument();
    expect(screen.getByText(/words in this oasis/i)).toBeInTheDocument();
  });

  it("renders question count selector", () => {
    render(<WrittenQuiz />);

    expect(
      screen.getByRole("combobox", { name: /select number of questions/i })
    ).toBeInTheDocument();
  });

  it("renders mode selector", () => {
    render(<WrittenQuiz />);

    expect(
      screen.getByRole("combobox", { name: /select quiz direction/i })
    ).toBeInTheDocument();
  });

  it("renders start quiz button", () => {
    render(<WrittenQuiz />);

    expect(
      screen.getByRole("button", { name: /start quiz/i })
    ).toBeInTheDocument();
  });

  it("disables start button when no words available", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [],
    });

    render(<WrittenQuiz />);

    const startButton = screen.getByRole("button", {
      name: /add words in edit oasis first/i,
    });
    expect(startButton).toBeDisabled();
  });

  it("starts quiz when start button is clicked", async () => {
    render(<WrittenQuiz />);

    const startButton = screen.getByRole("button", { name: /start quiz/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/question 1/i)).toBeInTheDocument();
      expect(screen.getByText("Translate")).toBeInTheDocument();
    });
  });

  it("shows question progress during quiz", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/question 1 \/ 5/i)).toBeInTheDocument();
    });
  });

  it("renders answer input field during quiz", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /your answer/i })
      ).toBeInTheDocument();
    });
  });

  it("renders submit button during quiz", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });
  });

  it("renders next button during quiz", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });
  });

  it("renders example sentence button during quiz", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /example sentence/i })
      ).toBeInTheDocument();
    });
  });

  it("shows score during quiz", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/score:/i)).toBeInTheDocument();
    });
  });

  it("next button is disabled before submitting", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });
  });

  it("submit button is disabled after submitting", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    // Type any answer and submit
    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    });
  });

  it("shows correct feedback for right answer", async () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [{ id: "1", english: "hello", target: "hola", notes: "" }],
    });

    render(<WrittenQuiz />);

    // Set count to 1 first
    const countSelect = screen.getByRole("combobox", {
      name: /select number of questions/i,
    });
    fireEvent.change(countSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /your answer/i })).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct!/i)).toBeInTheDocument();
    });
  });

  it("shows incorrect feedback for wrong answer", async () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [{ id: "1", english: "hello", target: "hola", notes: "" }],
    });

    render(<WrittenQuiz />);

    const countSelect = screen.getByRole("combobox", {
      name: /select number of questions/i,
    });
    fireEvent.change(countSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /your answer/i })).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
      expect(screen.getByText("hola")).toBeInTheDocument();
    });
  });

  it("fetches example sentence when button is clicked", async () => {
    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /example sentence/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /example sentence/i }));

    await waitFor(() => {
      expect(mockRequestQuizSentence).toHaveBeenCalled();
      expect(screen.getByText("This is an example sentence.")).toBeInTheDocument();
    });
  });

  it("shows quiz complete screen after all questions", async () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [{ id: "1", english: "hello", target: "hola", notes: "" }],
    });

    render(<WrittenQuiz />);

    const countSelect = screen.getByRole("combobox", {
      name: /select number of questions/i,
    });
    fireEvent.change(countSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /your answer/i })).toBeInTheDocument();
    });

    // Submit an answer
    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });

    // Click next to finish
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/quiz complete/i)).toBeInTheDocument();
    });
  });

  it("shows final score on complete screen", async () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [{ id: "1", english: "hello", target: "hola", notes: "" }],
    });

    render(<WrittenQuiz />);

    const countSelect = screen.getByRole("combobox", {
      name: /select number of questions/i,
    });
    fireEvent.change(countSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /your answer/i })).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/score:/i)).toBeInTheDocument();
      expect(screen.getByText(/accuracy:/i)).toBeInTheDocument();
    });
  });

  it("shows play again button on complete screen", async () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [{ id: "1", english: "hello", target: "hola", notes: "" }],
    });

    render(<WrittenQuiz />);

    const countSelect = screen.getByRole("combobox", {
      name: /select number of questions/i,
    });
    fireEvent.change(countSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /your answer/i })).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /play again/i })
      ).toBeInTheDocument();
    });
  });

  it("can change quiz mode to target-to-english", () => {
    render(<WrittenQuiz />);

    const modeSelect = screen.getByRole("combobox", {
      name: /select quiz direction/i,
    });

    fireEvent.change(modeSelect, { target: { value: "target-to-en" } });

    expect(modeSelect).toHaveValue("target-to-en");
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

    render(<WrittenQuiz />);

    // Only 1 valid word
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("handles example sentence error gracefully", async () => {
    mockRequestQuizSentence.mockRejectedValue(new Error("API error"));

    render(<WrittenQuiz />);

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /example sentence/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /example sentence/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/could not generate a sentence right now/i)
      ).toBeInTheDocument();
    });
  });

  it("uses fallback language name when meta language is null", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      meta: { id: "test-list-id", name: "Test Oasis", language: null },
    });

    render(<WrittenQuiz />);

    // Should show "Target language" in the mode options
    expect(screen.getAllByText(/target language/i).length).toBeGreaterThan(0);
  });

  it("uses fallback oasis name when meta name is null", () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      meta: null,
    });

    render(<WrittenQuiz />);

    expect(screen.getByText(/start your quiz/i)).toBeInTheDocument();
    // When meta is null, it falls back to "Oasis"
    expect(screen.getByText(/— oasis$/i)).toBeInTheDocument();
  });

  it("answer comparison is case insensitive", async () => {
    mockUseOasisData.mockReturnValue({
      ...defaultMockData,
      words: [{ id: "1", english: "hello", target: "Hola", notes: "" }],
    });

    render(<WrittenQuiz />);

    const countSelect = screen.getByRole("combobox", {
      name: /select number of questions/i,
    });
    fireEvent.change(countSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /your answer/i })).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", { name: /your answer/i });
    fireEvent.change(input, { target: { value: "hola" } }); // lowercase
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct!/i)).toBeInTheDocument();
    });
  });
});
