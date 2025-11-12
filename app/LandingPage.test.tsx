import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "./LandingPage";

vi.mock("framer-motion", async () => {
  const ReactMod = await import("react");

  type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
    whileHover?: unknown;
    whileTap?: unknown;
    variants?: unknown;
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
    viewport?: unknown;
    whileInView?: unknown;
  };

  const stripMotionProps = (props: MotionDivProps): React.HTMLAttributes<HTMLDivElement> => {
    const rest = { ...props };
    delete rest.whileHover;
    delete rest.whileTap;
    delete rest.variants;
    delete rest.initial;
    delete rest.animate;
    delete rest.exit;
    delete rest.transition;
    delete rest.viewport;
    delete rest.whileInView;
    return rest;
  };

  const MotionDiv = ReactMod.forwardRef<HTMLDivElement, MotionDivProps>((props, ref) => {
    return <div ref={ref} {...stripMotionProps(props)} />;
  });
  MotionDiv.displayName = "MockMotionDiv";

  const createMotionValue = (initial = 0) => {
    let value = initial;
    const listeners: Array<(v: number) => void> = [];
    return {
      get: () => value,
      set: (v: number) => {
        value = v;
        listeners.forEach((l) => l(value));
      },
      onChange: (cb: (v: number) => void) => {
        listeners.push(cb);
        return () => {
          const idx = listeners.indexOf(cb);
          if (idx !== -1) listeners.splice(idx, 1);
        };
      },
      on: (event: string, cb: (v: number) => void) => {
        if (event === "change") {
          listeners.push(cb);
          return () => {
            const idx = listeners.indexOf(cb);
            if (idx !== -1) listeners.splice(idx, 1);
          };
        }
        return () => {};
      },
    };
  };

  return {
    motion: new Proxy(
      {},
      {
        get: () => MotionDiv,
      }
    ),
    useReducedMotion: () => true,
    useScroll: () => ({ scrollY: createMotionValue(0) }),
    useTransform: () => 0,
    useInView: () => true,
    useAnimation: () => ({ start: async () => {} }),
    useMotionValue: (initial?: number) => createMotionValue(initial ?? 0),
    useMotionValueEvent: (
      mv: { onChange?: (cb: (v: number) => void) => () => void } | undefined,
      _event: string,
      cb: (v: number) => void
    ) => {
      if (mv?.onChange) {
        mv.onChange(cb);
      }
    },
    animate: async () => {},
  };
});

vi.mock("@/app/components/LinkAsButton", () => {
  interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    "aria-label"?: string;
  }

  const LinkAsButton = ({ href, children, className, "aria-label": ariaLabel }: LinkProps) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );

  return { LinkAsButton };
});

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the hero heading and description", () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/fluentures makes language learning/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/create your own vocabulary lists/i)
    ).toBeInTheDocument();
  });

  it("renders the feature chips", () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/custom lists & preferred language/i)
    ).toBeInTheDocument();

    const quizzes = screen.getAllByText(/quizzes/i);
    expect(quizzes.length).toBeGreaterThan(0);
  });

  it("renders the glass panel container", () => {
    const { container } = render(<LandingPage />);
    const glass = container.querySelector(".backdrop-blur-xl");
    expect(glass).toBeInTheDocument();
  });

  it("renders the background layer", () => {
    const { container } = render(<LandingPage />);
    const bg = container.querySelector('[src="/desert.png"]');
    expect(bg).toBeInTheDocument();
  });

  it("does NOT render login/signup links in hero (current layout)", () => {
    render(<LandingPage />);

    expect(screen.queryByRole("link", { name: /log in/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /sign up/i })).toBeNull();
  });
});
