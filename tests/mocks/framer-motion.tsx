// tests/__mocks__/framer-motion.tsx
import React, { forwardRef } from "react";

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

// simple "just render a div" motion component
const MotionDiv = forwardRef<HTMLDivElement, MotionProps>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
});
MotionDiv.displayName = "MotionDiv";

// proxy so motion.img / motion.div / motion.section all return MotionDiv
const motion = new Proxy(
  {},
  {
    get: () => MotionDiv,
  }
) as unknown as typeof import("framer-motion").motion;

// your page calls useReducedMotion
const useReducedMotion = (): boolean => true;

// optional, in case something else imports it
const AnimatePresence = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);

export { motion, useReducedMotion, AnimatePresence };
