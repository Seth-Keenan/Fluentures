import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContactsPage from "./page";

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

describe("ContactsPage", () => {
  it("renders contact form and shows thank-you message after submit", () => {
    render(<ContactsPage />);

    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);

    fireEvent.change(nameInput, { target: { value: "Ada Lovelace" } });
    fireEvent.change(emailInput, { target: { value: "ada@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Just saying hi" } });

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(screen.getByText(/thanks! we/i)).toBeInTheDocument();
  });
});
