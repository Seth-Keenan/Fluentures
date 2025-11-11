import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AboutPage from "./page";

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

  const MotionImg = forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }
  >((props, ref) => {
    const { alt, ...rest } = props;
    return <img ref={ref} alt={alt ?? ""} {...rest} />;
  });
  MotionImg.displayName = "MotionImg";

  const motion = new Proxy(
    {},
    {
      get: (_target, key: string) => {
        if (key === "img") return MotionImg;
        return MotionDiv;
      },
    }
  ) as unknown as typeof import("framer-motion").motion;

  const useReducedMotion = () => true;

  return {
    motion,
    useReducedMotion,
  };
});

describe("AboutPage", () => {
  it("renders the about copy and the three feature cards", () => {
    render(<AboutPage />);

    expect(screen.getByText(/about fluentures/i)).toBeInTheDocument();

    expect(
      screen.getByText(/we’re camelcase - building a lighter, friendlier way to learn languages!/i)
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /mission/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what we build/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /why it works/i })).toBeInTheDocument();

    expect(screen.getByText(/custom vocab lists/i)).toBeInTheDocument();

    expect(
      screen.getByText(/ready to learn\? sign in or sign up from the top-right\./i)
    ).toBeInTheDocument();
  });
});
