// LandingPage.test.tsx (or page.test.tsx for app/page.tsx)
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

vi.mock("./components/LinkAsButton", () => ({
  LinkAsButton: ({ href, children, className, "aria-label": ariaLabel }: LinkProps) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

import Home from "./LandingPage";

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the welcome heading and description", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /welcome to fluentures/i })).toBeInTheDocument();
    expect(screen.getByText(/jump back in or create a new account to get started/i)).toBeInTheDocument();
  });

  it("renders login button with correct attributes", async () => {
    render(<Home />);

    await waitFor(() => {
      const loginLink = screen.getByRole("link", { name: /log in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  it("renders signup button with correct attributes", async () => {
    render(<Home />);

    await waitFor(() => {
      const signupLink = screen.getByRole("link", { name: /sign up/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/signup");
    });
  });

  it("renders both navigation buttons", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
    });
  });

  it("renders footer text", () => {
    render(<Home />);

    expect(screen.getByText(/-camelCase-/i)).toBeInTheDocument();
  });

  it("renders background image", () => {
    render(<Home />);

    const backgroundImage = screen.getByAltText(/background/i);
    expect(backgroundImage).toBeInTheDocument();
    expect(backgroundImage).toHaveAttribute("src", "/desert.png");
  });

  it("has proper structure with glass panel container", () => {
    const { container } = render(<Home />);

    // Check for glassmorphism classes
    const glassPanel = container.querySelector(".backdrop-blur-xl");
    expect(glassPanel).toBeInTheDocument();
  });

  it("displays buttons after ready state timeout", async () => {
    render(<Home />);

    // Buttons should appear after animation delay
    await waitFor(
      () => {
        expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});