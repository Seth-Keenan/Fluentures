import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ServicesPage from "./page";

vi.mock("framer-motion", async () => {
  const ReactModule = await import("react");
  const { forwardRef } = ReactModule;

  type MotionProps = React.HTMLAttributes<HTMLDivElement> & {
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

  const MotionDiv = forwardRef<HTMLDivElement, MotionProps>((props, ref) => {
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

  const useReducedMotion = (): boolean => true;

  return {
    motion,
    useReducedMotion,
  };
});

describe("ServicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the services heading and subtitle", () => {
    render(<ServicesPage />);

    expect(
      screen.getByRole("heading", { name: /services/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/tools that make consistent learning easy—and fun\./i)
    ).toBeInTheDocument();
  });

  it("renders all four service cards (by heading)", () => {
    render(<ServicesPage />);

    expect(
      screen.getByRole("heading", { name: "Learning" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Log Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Social" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Map" })
    ).toBeInTheDocument();
  });
});
