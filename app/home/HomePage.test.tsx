import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";


vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

const mockUseDisplayName = vi.fn(() => ({ name: "guest", loading: false }));
vi.mock("@/app/lib/hooks/useDisplayName", () => ({
  useDisplayName: () => mockUseDisplayName(),
}));

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
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/components/SettingsButton", () => ({
  __esModule: true,
  default: () => <div data-testid="settings-gear" />,
}));

import HomePage from "./page";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDisplayName.mockReturnValue({ name: "guest", loading: false });
  });

  it("renders welcome message for guest when hook returns guest", () => {
    mockUseDisplayName.mockReturnValue({ name: "guest", loading: false });

    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /welcome, guest!/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pick where you’d like to go next\./i)
    ).toBeInTheDocument();
  });

  it("renders welcome message with user name from hook", () => {
    mockUseDisplayName.mockReturnValue({ name: "John Doe", loading: false });

    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /welcome, john doe!/i })
    ).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows loading state when hook is loading", () => {
    mockUseDisplayName.mockReturnValue({ name: "", loading: true });

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /welcome…/i })).toBeInTheDocument();
    expect(screen.getByText(/loading…/i)).toBeInTheDocument();
  });

  it("renders all navigation links", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /social/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /map/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /log book/i })).toBeInTheDocument();
    });
  });

  it("navigation links have correct href attributes", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /social/i })).toHaveAttribute("href", "/social");
      expect(screen.getByRole("link", { name: /map/i })).toHaveAttribute("href", "/map");
      expect(screen.getByRole("link", { name: /log book/i })).toHaveAttribute("href", "/logbook");
    });
  });

  it("renders footer text", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/explore, connect, and keep track of your journey/i)
    ).toBeInTheDocument();
  });

  it("shows the settings gear", () => {
    render(<HomePage />);

    expect(screen.getByTestId("settings-gear")).toBeInTheDocument();
  });

  it("uses whatever name the hook returns", () => {
    mockUseDisplayName.mockReturnValue({ name: "Alice Wonder", loading: false });

    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /welcome, alice wonder!/i })
    ).toBeInTheDocument();
  });
});
