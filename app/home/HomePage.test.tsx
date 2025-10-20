import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

const mockUseSession = vi.fn();

vi.mock("@supabase/auth-helpers-react", () => ({
  useSession: () => mockUseSession(),
}));

vi.mock("@/app/components/LinkAsButton", () => ({
  LinkAsButton: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));


describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome message for guest when no session", () => {
    mockUseSession.mockReturnValue(null);

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome!/i })).toBeInTheDocument();
    expect(screen.getByText(/Pick where you’d like to go next./i)).toBeInTheDocument();
    expect(screen.getByText(/guest/i)).toBeInTheDocument();
  });

  it("renders welcome message with user name from metadata", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: "john@example.com",
        user_metadata: {
          name: "John Doe",
        },
      },
    });

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome, john doe!/i })).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders welcome message with full_name from metadata", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: "jane@example.com",
        user_metadata: {
          full_name: "Jane Smith",
        },
      },
    });

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome, jane smith!/i })).toBeInTheDocument();
  });

  it("renders welcome message with combined first and last name", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: "bob@example.com",
        user_metadata: {
          first_name: "Bob",
          last_name: "Johnson",
        },
      },
    });

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome, bob johnson!/i })).toBeInTheDocument();
  });

  it("falls back to titleized email local part when no name metadata", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: "john_doe-123@example.com",
        user_metadata: {},
      },
    });

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome, john doe 123!/i })).toBeInTheDocument();
  });

  it("renders all navigation links", async () => {
    mockUseSession.mockReturnValue(null);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /social/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /map/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /log book/i })).toBeInTheDocument();
    });
  });

  it("navigation links have correct href attributes", async () => {
    mockUseSession.mockReturnValue(null);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /social/i })).toHaveAttribute("href", "/social");
      expect(screen.getByRole("link", { name: /map/i })).toHaveAttribute("href", "/map");
      expect(screen.getByRole("link", { name: /log book/i })).toHaveAttribute("href", "/logbook");
    });
  });

  it("renders footer text", () => {
    mockUseSession.mockReturnValue(null);

    render(<HomePage />);

    expect(screen.getByText(/explore, connect, and keep track of your journey/i)).toBeInTheDocument();
  });

  it("prioritizes user_metadata name fields in correct order", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: "test@example.com",
        user_metadata: {
          preferred_username: "TestUser",
          username: "testuser123",
          name: "Test Name",
        },
      },
    });

    render(<HomePage />);

    // Should prioritize 'name' over other fields
    expect(screen.getByRole("heading", { name: /welcome, test name!/i })).toBeInTheDocument();
  });

  it("handles given_name and family_name combination", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: "test@example.com",
        user_metadata: {
          given_name: "Alice",
          family_name: "Wonder",
        },
      },
    });

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome, alice wonder!/i })).toBeInTheDocument();
  });

  it("handles user with no email gracefully", () => {
    mockUseSession.mockReturnValue({
      user: {
        id: "123",
        email: undefined,
        user_metadata: {},
      },
    });

    render(<HomePage />);

    // Should fall back to "Friend"
    expect(screen.getByRole("heading", { name: /welcome, friend!/i })).toBeInTheDocument();
  });
});