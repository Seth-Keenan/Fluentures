import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import RegisterSocialUsernamePage from "./page";

describe("RegisterSocialUsernamePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the page with heading", () => {
    render(<RegisterSocialUsernamePage />);

    expect(
      screen.getByRole("heading", { name: /choose your username/i })
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<RegisterSocialUsernamePage />);

    expect(
      screen.getByText(/this name will appear to other users/i)
    ).toBeInTheDocument();
  });

  it("renders username input field", () => {
    render(<RegisterSocialUsernamePage />);

    expect(
      screen.getByPlaceholderText(/your username/i)
    ).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<RegisterSocialUsernamePage />);

    expect(
      screen.getByRole("button", { name: /save username/i })
    ).toBeInTheDocument();
  });

  it("updates input value when typing", () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "testuser" } });

    expect(input).toHaveValue("testuser");
  });

  it("shows error for username less than 3 characters", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "ab" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 3 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error for username more than 20 characters", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "a".repeat(21) } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/username must be at most 20 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error for invalid characters in username", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "test@user!" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/only letters, numbers, and _ allowed/i)
      ).toBeInTheDocument();
    });
  });

  it("accepts valid username with letters, numbers, and underscore", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "Test_User123" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/set-social-username",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ social_username: "Test_User123" }),
        })
      );
    });
  });

  it("shows loading state while submitting", async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }), 1000))
    );

    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("shows success message after saving", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/username saved/i)).toBeInTheDocument();
    });
  });

  it("redirects to /social after successful save", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/username saved/i)).toBeInTheDocument();
    });

    // Advance timer for the redirect delay (900ms)
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/social");
    });
  });

  it("shows error message when API returns error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Username already taken" }),
    });

    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "takenuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
    });
  });

  it("shows generic error when API returns error without message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "someuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  it("shows error on network failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/unexpected server error/i)).toBeInTheDocument();
    });
  });

  it("trims whitespace from username before submitting", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "  validuser  " } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/set-social-username",
        expect.objectContaining({
          body: JSON.stringify({ social_username: "validuser" }),
        })
      );
    });
  });

  it("does not redirect on API error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Some error" }),
    });

    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("re-enables button after submission completes", async () => {
    render(<RegisterSocialUsernamePage />);

    const input = screen.getByPlaceholderText(/your username/i);
    fireEvent.change(input, { target: { value: "validuser" } });

    const button = screen.getByRole("button", { name: /save username/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save username/i })).not.toBeDisabled();
    });
  });
});
