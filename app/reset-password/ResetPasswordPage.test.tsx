import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResetPasswordPage from "./ResetPasswordPage";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockResetPasswordForEmail = vi.fn();

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
  });

  it("renders heading, email input, submit button, and back link", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("shows success message when Supabase responds without error", async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "ok@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/check your email for the password reset link/i)
      ).toBeInTheDocument()
    );
  });

  it("calls Supabase and does not show success when Supabase returns an error", async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: "Invalid email address" },
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "bad@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        "bad@example.com",
        expect.any(Object)
      );
    });

    expect(
      screen.queryByText(/check your email for the password reset link/i)
    ).not.toBeInTheDocument();
  });

  it("shows catch-block message when the call throws", async () => {
    mockResetPasswordForEmail.mockRejectedValueOnce(new Error("Boom"));

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/an error occurred while requesting password reset: error: boom/i)
      ).toBeInTheDocument()
    );
  });
});
