import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const ReactModule = await import("react");
  const { forwardRef } = ReactModule;

  const MotionDiv = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      variants?: unknown;
      whileHover?: unknown;
    }
  >((props, ref) => {
    const { children, ...rest } = props;
    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    );
  });
  MotionDiv.displayName = "MotionDiv";

  const motion = new Proxy(
    {},
    {
      get: () => MotionDiv,
    }
  ) as unknown as typeof import("framer-motion").motion;

  const useReducedMotion = vi.fn(() => false);

  return {
    motion,
    useReducedMotion,
  };
});

// Mock components
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
    <a href={href} className={className} data-testid="back-button">
      {children}
    </a>
  ),
}));

vi.mock("@/app/components/Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    "aria-label": ariaLabel,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      data-testid={`button-${typeof children === 'string' ? children.toLowerCase().replaceAll(/\s+/g, "-") : "unknown"}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/app/components/PageBackground", () => ({
  __esModule: true,
  default: ({ 
    children, 
    src, 
    alt, 
    wikiUrl 
  }: { 
    children: React.ReactNode; 
    src: string; 
    alt: string; 
    wikiUrl: string; 
  }) => (
    <div data-testid="page-background" data-src={src} data-alt={alt} data-wiki-url={wikiUrl}>
      {children}
    </div>
  ),
}));

// Mock oasis hook
const mockUseOasisData = vi.fn();
vi.mock("@/app/lib/hooks/useOasis", () => ({
  useOasisData: () => mockUseOasisData(),
}));

// Mock sentence actions
const mockRequestSentence = vi.fn();
const mockSendSentenceChat = vi.fn();
vi.mock("@/app/lib/actions/geminiSentenceAction", () => ({
  requestSentence: (...args: unknown[]) => mockRequestSentence(...args),
  sendSentenceChat: (...args: unknown[]) => mockSendSentenceChat(...args),
}));

// Mock deserts data
vi.mock("@/app/data/deserts", () => ({
  deserts: [
    {
      name: "Gobi Desert",
      src: "/images/gobi-desert.jpg",
      wikiUrl: "https://en.wikipedia.org/wiki/Gobi_Desert",
    },
  ],
}));

// Mock crypto for ID generation
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid"),
  },
  writable: true,
});

// Mock scrollIntoView
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
});

// Import the component after mocking
import SentencesPage from "./page";

describe("SentencesPage", () => {
  const mockWordItems = [
    {
      id: "1",
      target: "hola",
      english: "hello",
      notes: "greeting",
    },
    {
      id: "2", 
      target: "adiós",
      english: "goodbye",
      notes: "farewell",
    },
    {
      id: "3",
      target: "gracias",
      english: "thank you", 
      notes: "gratitude",
    },
  ];

  const mockOasisMeta = {
    id: "test-list-id",
    name: "Spanish Basics",
    language: "Spanish",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseOasisData.mockReturnValue({
      listId: "test-list-id",
      meta: mockOasisMeta,
      words: mockWordItems,
      loading: false,
    });
    
    mockRequestSentence.mockResolvedValue("This is a sample sentence with the word.");
    mockSendSentenceChat.mockResolvedValue({
      text: "Here's my response about the sentences.",
    });
  });

  it("renders missing list id error when listId is null", () => {
    mockUseOasisData.mockReturnValue({
      listId: null,
      meta: null,
      words: [],
      loading: false,
    });

    render(<SentencesPage />);

    expect(screen.getByText("Missing list id.")).toBeInTheDocument();
  });

  it("shows loading state when data is loading", () => {
    mockUseOasisData.mockReturnValue({
      listId: "test-list-id",
      meta: null,
      words: [],
      loading: true,
    });

    render(<SentencesPage />);

    expect(screen.getByText("Loading example sentences")).toBeInTheDocument();
  });

  it("renders main content when data is loaded", async () => {
    render(<SentencesPage />);

    await waitFor(() => {
      expect(screen.getByText("Example Sentences")).toBeInTheDocument();
      expect(screen.getByText("Spanish Basics")).toBeInTheDocument();
      expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    // Check that word entries are displayed
    expect(screen.getByText("hola")).toBeInTheDocument();
    expect(screen.getByText("adiós")).toBeInTheDocument();
    expect(screen.getByText("gracias")).toBeInTheDocument();
  });

  it("generates initial sentences for all words on load", async () => {
    render(<SentencesPage />);

    await waitFor(() => {
      expect(mockRequestSentence).toHaveBeenCalledTimes(3);
      expect(mockRequestSentence).toHaveBeenCalledWith({
        listId: "test-list-id",
        word: "hola",
        language: "Spanish",
      });
      expect(mockRequestSentence).toHaveBeenCalledWith({
        listId: "test-list-id",
        word: "adiós",
        language: "Spanish",
      });
      expect(mockRequestSentence).toHaveBeenCalledWith({
        listId: "test-list-id",
        word: "gracias",
        language: "Spanish",
      });
    });
  });

  it("displays sentence count in header subtitle", async () => {
    mockRequestSentence.mockResolvedValue("Sample sentence");

    render(<SentencesPage />);

    await waitFor(() => {
      expect(screen.getByText("3/3 sentences ready")).toBeInTheDocument();
    });
  });

  it("shows empty state when no words exist", () => {
    mockUseOasisData.mockReturnValue({
      listId: "test-list-id",
      meta: mockOasisMeta,
      words: [],
      loading: false,
    });

    render(<SentencesPage />);

    expect(screen.getByText(/No words yet. Add some in/)).toBeInTheDocument();
    expect(screen.getByText("Edit Oasis")).toBeInTheDocument();
  });

  it("regenerates sentence when regenerate button is clicked", async () => {
    const user = userEvent.setup();
    render(<SentencesPage />);

    await waitFor(() => {
      expect(screen.getByText("hola")).toBeInTheDocument();
    });

    // Wait for initial generation to complete
    await waitFor(() => {
      expect(mockRequestSentence).toHaveBeenCalledTimes(3);
    });

    mockRequestSentence.mockClear();
    mockRequestSentence.mockResolvedValue("New regenerated sentence");

    const regenerateButton = screen.getByLabelText("Regenerate sentence for hola");
    await user.click(regenerateButton);

    await waitFor(() => {
      expect(mockRequestSentence).toHaveBeenCalledWith({
        listId: "test-list-id", 
        word: "hola",
        language: "Spanish",
      });
    });
  });

  it("shows loading state for individual word when generating", async () => {
    const user = userEvent.setup();
    
    // Make initial requests resolve quickly, but then slow down regeneration
    let resolveCount = 0;
    mockRequestSentence.mockImplementation(() => {
      resolveCount++;
      if (resolveCount <= 3) {
        return Promise.resolve("Initial sentence");
      }
      // For regeneration, return a promise that takes time
      return new Promise(resolve => setTimeout(resolve, 100, "Regenerated sentence"));
    });

    render(<SentencesPage />);

    await waitFor(() => {
      expect(screen.getByText("hola")).toBeInTheDocument();
    });

    const regenerateButton = screen.getByLabelText("Regenerate sentence for hola");
    await user.click(regenerateButton);

    // Should show generating state
    expect(screen.getByText("Generating…")).toBeInTheDocument();
    expect(regenerateButton).toBeDisabled();
  });

  it("handles sentence generation errors gracefully", async () => {
    mockRequestSentence.mockRejectedValue(new Error("API Error"));

    render(<SentencesPage />);

    await waitFor(() => {
      // Should show error message in all textareas
      const errorMessages = screen.getAllByDisplayValue("Request failed");
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it("sends chat messages and displays responses", async () => {
    const user = userEvent.setup();
    
    mockSendSentenceChat.mockResolvedValue({
      text: "Great question! The sentence uses basic vocabulary."
    });

    render(<SentencesPage />);

    await waitFor(() => {
      expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    const sendButton = screen.getByTestId("button-send");

    await user.type(chatInput, "How difficult are these sentences?");
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockSendSentenceChat).toHaveBeenCalledWith(
        "How difficult are these sentences?",
        [{ role: "user", parts: [{ text: "How difficult are these sentences?" }] }],
        { listId: "test-list-id" }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("You")).toBeInTheDocument();
      expect(screen.getByText("How difficult are these sentences?")).toBeInTheDocument();
      expect(screen.getByText("Gemini")).toBeInTheDocument();
      expect(screen.getByText("Great question! The sentence uses basic vocabulary.")).toBeInTheDocument();
    });
  });

  it("sends chat message with Enter key", async () => {
    const user = userEvent.setup();
    
    mockSendSentenceChat.mockResolvedValue({
      text: "Response via Enter key"
    });

    render(<SentencesPage />);

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    
    await user.type(chatInput, "Test message");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSendSentenceChat).toHaveBeenCalled();
    });
  });

  it("allows Shift+Enter for new lines in chat", async () => {
    const user = userEvent.setup();
    
    render(<SentencesPage />);

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    
    await user.type(chatInput, "Line 1");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(chatInput, "Line 2");

    expect(chatInput).toHaveValue("Line 1\nLine 2");
    expect(mockSendSentenceChat).not.toHaveBeenCalled();
  });

  it("disables send button when chat input is empty", () => {
    render(<SentencesPage />);

    const sendButton = screen.getByTestId("button-send");
    expect(sendButton).toBeDisabled();
  });

  it("shows sending state when chat message is in progress", async () => {
    const user = userEvent.setup();
    
    // Make chat response take time
    mockSendSentenceChat.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100, { text: "Response" }))
    );

    render(<SentencesPage />);

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    const sendButton = screen.getByTestId("button-send");

    await user.type(chatInput, "Test message");
    await user.click(sendButton);

    expect(screen.getByText("Sending…")).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it("handles chat errors gracefully", async () => {
    const user = userEvent.setup();
    
    mockSendSentenceChat.mockRejectedValue(new Error("Chat API Error"));

    render(<SentencesPage />);

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    const sendButton = screen.getByTestId("button-send");

    await user.type(chatInput, "Test message");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Chat failed")).toBeInTheDocument();
    });
  });

  it("maintains chat history for context", async () => {
    const user = userEvent.setup();
    
    mockSendSentenceChat
      .mockResolvedValueOnce({ text: "First response" })
      .mockResolvedValueOnce({ text: "Second response with context" });

    render(<SentencesPage />);

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    const sendButton = screen.getByTestId("button-send");

    // Send first message
    await user.type(chatInput, "First question");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("First response")).toBeInTheDocument();
    });

    // Send second message
    await user.type(chatInput, "Follow-up question");
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockSendSentenceChat).toHaveBeenLastCalledWith(
        "Follow-up question",
        [
          { role: "user", parts: [{ text: "First question" }] },
          { role: "model", parts: [{ text: "First response" }] },
          { role: "user", parts: [{ text: "Follow-up question" }] },
        ],
        { listId: "test-list-id" }
      );
    });
  });

  it("renders back button with correct href", () => {
    render(<SentencesPage />);

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toHaveAttribute("href", "/oasis/test-list-id");
    expect(backButton).toHaveTextContent("Back");
  });

  it("displays oasis metadata in top bar", () => {
    render(<SentencesPage />);

    expect(screen.getByText("Spanish Basics")).toBeInTheDocument();
  });

  it("handles missing oasis metadata gracefully", () => {
    mockUseOasisData.mockReturnValue({
      listId: "test-list-id",
      meta: null,
      words: mockWordItems,
      loading: false,
    });

    render(<SentencesPage />);

    expect(screen.getByText("Oasis")).toBeInTheDocument();
  });

  it("displays sentence in readonly textarea", async () => {
    mockRequestSentence.mockResolvedValue("¡Hola! Esta es una oración de ejemplo.");

    render(<SentencesPage />);

    await waitFor(() => {
      const textareas = screen.getAllByRole("textbox");
      const sentenceTextarea = textareas.find(textarea => 
        (textarea as HTMLTextAreaElement).value.includes("¡Hola!")
      );
      expect(sentenceTextarea).toBeInTheDocument();
      expect(sentenceTextarea).toHaveAttribute("readonly");
    });
  });

  it("shows chat placeholder text when no messages exist", () => {
    render(<SentencesPage />);

    expect(screen.getByText(/Ask about the generated sentences/)).toBeInTheDocument();
    expect(screen.getByText("Enter")).toBeInTheDocument();
    expect(screen.getByText("Shift+Enter")).toBeInTheDocument();
  });

  it("uses correct desert background", () => {
    render(<SentencesPage />);

    const pageBackground = screen.getByTestId("page-background");
    expect(pageBackground).toHaveAttribute("data-src", "/images/gobi-desert.jpg");
    expect(pageBackground).toHaveAttribute("data-alt", "Gobi Desert");
    expect(pageBackground).toHaveAttribute("data-wiki-url", "https://en.wikipedia.org/wiki/Gobi_Desert");
  });

  it("clears chat input after sending message", async () => {
    const user = userEvent.setup();
    
    mockSendSentenceChat.mockResolvedValue({ text: "Response" });

    render(<SentencesPage />);

    const chatInput = screen.getByPlaceholderText("Ask about the sentences...");
    const sendButton = screen.getByTestId("button-send");

    await user.type(chatInput, "Test message");
    expect(chatInput).toHaveValue("Test message");

    await user.click(sendButton);

    await waitFor(() => {
      expect(chatInput).toHaveValue("");
    });
  });

  it("shows tip text at bottom of page", () => {
    render(<SentencesPage />);

    expect(screen.getByText(/Tip: Regenerate tricky words and ask the chat/)).toBeInTheDocument();
  });
});
