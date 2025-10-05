import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const pushMock = vi.fn();
const signInWithPasswordMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form and inputs", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome back! enter your credentials to continue/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("submits successfully and redirects to home", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({ error: null });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  it("displays error message on failed login", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("displays generic error message when error has no message", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: {},
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed\. please check your credentials/i)).toBeInTheDocument();
    });
  });

  it("handles network errors", async () => {
    signInWithPasswordMock.mockRejectedValueOnce(new Error("Network error"));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error\. please try again/i)).toBeInTheDocument();
    });
  });

  it("toggles password visibility", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/hide password/i));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("disables submit button while loading", async () => {
    signInWithPasswordMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/logging in…/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it("renders navigation links", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /not a user\? sign up/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  it("renders footer text", () => {
    render(<LoginPage />);

    expect(screen.getByText(/by continuing you agree to our terms & privacy policy/i)).toBeInTheDocument();
  });

  it("clears error message on new submission", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: { message: "Invalid credentials" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Now submit again with success
    signInWithPasswordMock.mockResolvedValueOnce({ error: null });

    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "correct" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });
});