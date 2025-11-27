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

// Mock hooks
const mockUseListId = vi.fn(() => "test-list-id");
vi.mock("@/app/lib/hooks/useListId", () => ({
  useListId: () => mockUseListId(),
}));

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
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={`button-${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, "-") : "unknown"}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/app/components/PageBackground", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-background">{children}</div>
  ),
}));

vi.mock("@/app/components/ConfirmDialog", () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    onConfirm,
    title,
    description,
  }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={onConfirm} data-testid="confirm-delete">
          Confirm
        </button>
        <button onClick={onClose} data-testid="cancel-delete">
          Cancel
        </button>
      </div>
    ) : null,
}));

// Mock wordlist actions
const mockGetWordlist = vi.fn();
const mockGetWordListMeta = vi.fn();
const mockSaveWordlist = vi.fn();
const mockRenameWordList = vi.fn();

vi.mock("@/app/lib/actions/wordlistAction", () => ({
  getWordlist: (...args: unknown[]) => mockGetWordlist(...args),
  getWordListMeta: (...args: unknown[]) => mockGetWordListMeta(...args),
  saveWordlist: (...args: unknown[]) => mockSaveWordlist(...args),
  renameWordList: (...args: unknown[]) => mockRenameWordList(...args),
}));

// Mock AI service separately
const mockGetAiWordlistHelp = vi.fn();
vi.mock("@/app/lib/actions/aiWordlistRecommendations", () => ({
  getAiWordlistHelp: (...args: unknown[]) => mockGetAiWordlistHelp(...args),
}));

// Mock deserts data
vi.mock("@/app/data/deserts", () => ({
  deserts: [
    {
      name: "Death Valley",
      src: "/images/death-valley.jpg",
      wikiUrl: "https://en.wikipedia.org/wiki/Death_Valley",
    },
  ],
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "mock-uuid-123"),
  },
});

import EditOasisPage from "./page";

describe("EditOasisPage", () => {
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
  ];

  const mockWordListMeta = {
    word_list_id: "test-list-id",
    name: "Spanish Basics",
    language: "Spanish",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseListId.mockReturnValue("test-list-id");
    mockGetWordlist.mockResolvedValue(mockWordItems);
    mockGetWordListMeta.mockResolvedValue(mockWordListMeta);
    mockSaveWordlist.mockResolvedValue(true);
    mockRenameWordList.mockResolvedValue(true);
    mockGetAiWordlistHelp.mockResolvedValue({
      ok: true,
      data: {
        suggestions: [],
        corrections: [],
      },
    });
  });

  it("renders missing list id error when listId is null", () => {
    mockUseListId.mockReturnValue("");

    render(<EditOasisPage />);

    expect(screen.getByText("Missing list id in the URL.")).toBeInTheDocument();
  });

  it("loads and displays wordlist data on mount", async () => {
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
      expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
      expect(screen.getByDisplayValue("adiós")).toBeInTheDocument();
      expect(screen.getByDisplayValue("goodbye")).toBeInTheDocument();
    });

    expect(screen.getByText("Edit Oasis — Spanish Basics")).toBeInTheDocument();
    expect(screen.getByText("2/20 entries")).toBeInTheDocument();
    expect(screen.getByText("Target language:")).toBeInTheDocument();
    expect(screen.getAllByText("Spanish")).toHaveLength(2); // Header column and language tag
  });

  it("shows loading state initially", () => {
    render(<EditOasisPage />);

    // Should show loading skeleton
    expect(screen.getByText("Edit Oasis — Word List")).toBeInTheDocument();
  });

  it("adds a new row when add entry button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const addButton = screen.getByTestId("button-+-add-entry");
    await user.click(addButton);

    // Should have 3 entries now
    await waitFor(() => {
      expect(screen.getByText("3/20 entries")).toBeInTheDocument();
    });
  });

  it("prevents adding more than 20 entries", async () => {
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    
    // Mock 20 items already
    const maxItems = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      target: `word${i}`,
      english: `word${i}`,
      notes: "",
    }));
    
    mockGetWordlist.mockResolvedValue(maxItems);

    render(<EditOasisPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("20/20 entries")).toBeInTheDocument();
    });

    const addButton = screen.getByTestId("button-+-add-entry");
    
    // Button should be disabled when at max capacity, preventing further adds
    expect(addButton).toBeDisabled();
    expect(addButton).toHaveAttribute("title", "Max 20 entries");
    
    // Since the button is properly disabled, we test that the UI prevents further additions
    // This is the correct behavior - users shouldn't be able to trigger the alert
    // if the UI properly disables the button
    alertSpy.mockRestore();
  });

  it("updates field values with character limits", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const targetInput = screen.getByDisplayValue("hola");
    
    // Try to enter text longer than 50 characters
    const longText = "a".repeat(60);
    await user.clear(targetInput);
    await user.type(targetInput, longText);

    // Should be capped at 50 characters
    expect(targetInput).toHaveValue("a".repeat(50));
  });

  it("deletes an entry when delete button is clicked and confirmed", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    // Click delete on first entry
    const deleteButtons = screen.getAllByTestId("button-delete");
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete this entry?")).toBeInTheDocument();

    // Confirm delete
    const confirmButton = screen.getByTestId("confirm-delete");
    await user.click(confirmButton);

    // Entry should be removed
    await waitFor(() => {
      expect(screen.queryByDisplayValue("hola")).not.toBeInTheDocument();
      expect(screen.getByText("1/20 entry")).toBeInTheDocument();
    });
  });

  it("cancels delete when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    // Click delete on first entry
    const deleteButtons = screen.getAllByTestId("button-delete");
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    // Cancel delete
    const cancelButton = screen.getByTestId("cancel-delete");
    await user.click(cancelButton);

    // Entry should still be there
    expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    expect(screen.getByText("2/20 entries")).toBeInTheDocument();
  });

  it("saves wordlist when save button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId("button-save-changes");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSaveWordlist).toHaveBeenCalledWith("test-list-id", mockWordItems);
      expect(screen.getByText("✅ Saved changes")).toBeInTheDocument();
    });
  });

  it("shows error message when save fails", async () => {
    const user = userEvent.setup();
    mockSaveWordlist.mockResolvedValue(false);
    
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId("button-save-changes");
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("❌ Failed to save")).toBeInTheDocument();
    });
  });

  it("renames wordlist when rename button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    // Enter new name
    const nameInput = screen.getByPlaceholderText("Spanish Basics");
    await user.clear(nameInput);
    await user.type(nameInput, "New Spanish List");

    // Click rename
    const renameButton = screen.getByTestId("button-rename");
    await user.click(renameButton);

    await waitFor(() => {
      expect(mockRenameWordList).toHaveBeenCalledWith("test-list-id", "New Spanish List");
      expect(screen.getByText("✅ Renamed!")).toBeInTheDocument();
    });
  });

  it("shows error when trying to rename with empty name", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});
    
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    // Click rename without entering name
    const renameButton = screen.getByTestId("button-rename");
    await user.click(renameButton);

    expect(alertSpy).toHaveBeenCalledWith("Please enter a name.");
    alertSpy.mockRestore();
  });

  it("handles keyboard shortcuts", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    // Test Ctrl+S for save
    await user.keyboard("{Control>}s{/Control}");

    await waitFor(() => {
      expect(mockSaveWordlist).toHaveBeenCalled();
    });

    // Test Ctrl+B for add row
    await user.keyboard("{Control>}b{/Control}");

    await waitFor(() => {
      expect(screen.getByText("3/20 entries")).toBeInTheDocument();
    });
  });

  it("requests AI help and displays suggestions", async () => {
    const user = userEvent.setup();
    const mockSuggestions = [
      {
        target: "gracias",
        english: "thank you",
        notes: "expression of gratitude",
        reason: "Common polite expression",
      },
      {
        target: "por favor",
        english: "please",
        notes: "polite request",
        reason: "Essential courtesy word",
      },
    ];

    mockGetAiWordlistHelp.mockResolvedValue({
      ok: true,
      data: {
        suggestions: mockSuggestions,
        corrections: [],
      },
    });

    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const aiButton = screen.getByTestId("button-ai:-suggest-&-fix");
    await user.click(aiButton);

    await waitFor(() => {
      expect(mockGetAiWordlistHelp).toHaveBeenCalledWith({
        language: "Spanish",
        items: mockWordItems,
      });
      expect(screen.getByText("AI suggested words")).toBeInTheDocument();
      expect(screen.getByText("gracias")).toBeInTheDocument();
      expect(screen.getByText("por favor")).toBeInTheDocument();
    });
  });

  it("shows error when AI help fails", async () => {
    const user = userEvent.setup();
    mockGetAiWordlistHelp.mockResolvedValue({
      ok: false,
      error: "AI service unavailable",
    });

    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const aiButton = screen.getByTestId("button-ai:-suggest-&-fix");
    await user.click(aiButton);

    await waitFor(() => {
      expect(screen.getByText("AI service unavailable")).toBeInTheDocument();
    });
  });

  it("shows error when requesting AI help without language", async () => {
    const user = userEvent.setup();
    mockGetWordListMeta.mockResolvedValue({
      ...mockWordListMeta,
      language: null,
    });

    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const aiButton = screen.getByTestId("button-ai:-suggest-&-fix");
    await user.click(aiButton);

    await waitFor(() => {
      expect(screen.getByText("Set a target language first so AI knows what to use.")).toBeInTheDocument();
    });
  });

  it("adds AI suggested words to the list", async () => {
    const user = userEvent.setup();
    const mockSuggestions = [
      {
        target: "gracias",
        english: "thank you",
        notes: "expression of gratitude",
        reason: "Common polite expression",
      },
    ];

    mockGetAiWordlistHelp.mockResolvedValue({
      ok: true,
      data: {
        suggestions: mockSuggestions,
        corrections: [],
      },
    });

    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    // Get AI suggestions
    const aiButton = screen.getByTestId("button-ai:-suggest-&-fix");
    await user.click(aiButton);

    await waitFor(() => {
      expect(screen.getByText("gracias")).toBeInTheDocument();
    });

    // Add suggestion to list
    const addButton = screen.getByRole("button", { name: "Add" });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("3/20 entries")).toBeInTheDocument();
      expect(screen.getByDisplayValue("gracias")).toBeInTheDocument();
    });
  });

  it("shows dirty state indicator", async () => {
    const user = userEvent.setup();
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
      expect(screen.getByText("All changes saved")).toBeInTheDocument();
    });

    // Make a change
    const targetInput = screen.getByDisplayValue("hola");
    await user.clear(targetInput);
    await user.type(targetInput, "hola!");

    await waitFor(() => {
      expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    });
  });

  it("filters out empty rows when saving", async () => {
    const user = userEvent.setup();
    
    // Mock data with some empty entries
    const mixedItems = [
      ...mockWordItems,
      { id: "3", target: "", english: "", notes: "" },
      { id: "4", target: "word", english: "", notes: "" },
    ];
    
    mockGetWordlist.mockResolvedValue(mixedItems);

    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("hola")).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId("button-save-changes");
    await user.click(saveButton);

    await waitFor(() => {
      // Should only save non-empty entries
      expect(mockSaveWordlist).toHaveBeenCalledWith("test-list-id", [
        mockWordItems[0],
        mockWordItems[1],
        { id: "4", target: "word", english: "", notes: "" },
      ]);
    });
  });

  it("renders back button with correct href", async () => {
    render(<EditOasisPage />);

    await waitFor(() => {
      const backButton = screen.getByTestId("back-button");
      expect(backButton).toHaveAttribute("href", "/oasis/test-list-id");
    });
  });

  it("shows empty state when no entries exist", async () => {
    mockGetWordlist.mockResolvedValue([]);
    
    render(<EditOasisPage />);

    await waitFor(() => {
      expect(screen.getByText(/No entries yet\. Click/)).toBeInTheDocument();
      expect(screen.getByText("0/20 entries")).toBeInTheDocument();
      // Check for the span with the button text inside the empty message
      expect(screen.getByRole("button", { name: "+ Add Entry" })).toBeInTheDocument();
    });
  });
});
