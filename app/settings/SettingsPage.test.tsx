import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import SettingsPage from "./page";

vi.mock("framer-motion", async () => {
  const ReactModule = await import("react");
  const { forwardRef } = ReactModule;

  type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    variants?: unknown;
    transition?: unknown;
    whileTap?: unknown;
    whileHover?: unknown;
    viewport?: unknown;
    whileInView?: unknown;
  };

  const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>((props, ref) => {
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

  return {
    motion,
    useReducedMotion: () => true,
  };
});

vi.mock("@/app/lib/helpers/userSettingsClient", () => ({
  fetchUserSettingsFromDB: vi.fn(),
  saveUserSettingsToDB: vi.fn(),
}));

vi.mock("../components/Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../components/LinkAsButton", () => ({
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

import * as settingsClient from "@/app/lib/helpers/userSettingsClient";

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads settings from DB and shows them", async () => {
    const fetchMock = settingsClient.fetchUserSettingsFromDB as Mock;

    fetchMock.mockResolvedValueOnce({
      language: "Spanish",
      difficulty: "Advanced",
      display: true,
    });

    render(<SettingsPage />);

    const langSelect = await screen.findByDisplayValue("Spanish");
    expect(langSelect).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Advanced" })).toBeInTheDocument();

    expect(screen.getByText(/dark mode enabled/i)).toBeInTheDocument();
  });

  it("lets the user change settings and save", async () => {
    const fetchMock = settingsClient.fetchUserSettingsFromDB as Mock;
    const saveMock = settingsClient.saveUserSettingsToDB as Mock;

    fetchMock.mockResolvedValueOnce({
      language: "Japanese",
      difficulty: "Beginner",
      display: false,
    });

    saveMock.mockResolvedValueOnce({
      language: "English",
      difficulty: "Intermediate",
      display: true,
    });

    render(<SettingsPage />);

    await screen.findByDisplayValue("Japanese");

    const languageSelect = screen.getByRole("combobox");
    fireEvent.change(languageSelect, { target: { value: "English" } });

    fireEvent.click(screen.getByRole("button", { name: "Intermediate" }));

    const displayText = screen.getByText(/light mode enabled/i);
    const toggleButton = displayText.previousElementSibling as HTMLButtonElement;
    fireEvent.click(toggleButton);

    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalledWith({
        language: "English",
        difficulty: "Intermediate",
        display: true,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });

  it("falls back to defaults when DB returns null", async () => {
    const fetchMock = settingsClient.fetchUserSettingsFromDB as Mock;
    fetchMock.mockResolvedValueOnce(null);

    render(<SettingsPage />);

    const select = await screen.findByDisplayValue("Japanese");
    expect(select).toBeInTheDocument();
  });
});
