import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContactsPage from "./page";

// Mock framer-motion so tests don't choke on animations
vi.mock("framer-motion", async () => {
  const ReactModule = await import("react");
  const { forwardRef } = ReactModule;

  type MotionProps = React.HTMLAttributes<HTMLDivElement> & {
    initial?: unknown;
    animate?: unknown;
    transition?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
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

  const MotionImg = forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }
  >((props, ref) => {
    const { ...rest } = props;
    return <img ref={ref} alt="" {...rest} />;
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

describe("TeamPage", () => {
  it("renders heading, repo link, and all team members", () => {
    render(<ContactsPage />);

    // Heading
    expect(
      screen.getByRole("heading", { name: /meet the team/i })
    ).toBeInTheDocument();

    // GitHub repo button with correct href
    const repoLink = screen.getByRole("link", { name: /view github repo/i });
    expect(repoLink).toBeInTheDocument();
    expect(repoLink).toHaveAttribute(
      "href",
      "https://github.com/Seth-Keenan/Fluentures"
    );

    // Specific member text
    expect(screen.getByText("Seth Keenan")).toBeInTheDocument();
    expect(
      screen.getByText(/QA, Optimization, and Hosting/i)
    ).toBeInTheDocument();

    // There should be 6 LinkedIn links (one per team member)
    const linkedinLinks = screen.getAllByRole("link", { name: /linkedin/i });
    expect(linkedinLinks).toHaveLength(6);
  });
});
