import * as React from "react";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      className,
      type = "button",          // <-- default prevents accidental form submits
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded px-4 py-2 text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-amber-400 text-white hover:bg-amber-500 focus:ring-amber-300",
      secondary:
        "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-300",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={clsx(base, variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
