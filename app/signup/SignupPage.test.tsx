import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

global.fetch = vi.fn() as unknown as typeof fetch;

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form and inputs", () => {
    render(<SignUpPage />);

    expect(
      screen.getByRole("heading", { name: /create your account/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("submits successfully and redirects to login", async () => {
    (global.fetch as unknown as {
      mockResolvedValueOnce: (value: unknown) => void;
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          username: "john@example.com",
          password: "password123",
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/account created/i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/login");
      },
      { timeout: 1500 }
    );
  });

  it("displays error message on failed signup", async () => {
    (global.fetch as unknown as {
      mockResolvedValueOnce: (value: unknown) => void;
    }).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Email already exists" }),
    });
    

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});