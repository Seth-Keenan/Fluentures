import React, { ForwardedRef } from "react";

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & {
  whileTap?: unknown;
  whileHover?: unknown;
  variants?: unknown;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  viewport?: unknown;
  whileInView?: unknown;
};

const MotionDiv = React.forwardRef<HTMLDivElement, MotionDivProps>(
  (props, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      whileTap,
      whileHover,
      variants,
      initial,
      animate,
      exit,
      transition,
      viewport,
      whileInView,
      ...rest
    } = props;
    return <div ref={ref} {...rest} />;
  }
);

MotionDiv.displayName = "MotionDiv";

const fakeMotionValue = {
  get: () => 0,
  set: (_v: number) => {
  },
  on: (_e: string, _cb: () => void) => () => {
  },
};

export const motion = new Proxy(
  {},
  {
    get: () => MotionDiv,
  }
);

export const useReducedMotion = () => true;
export const useScroll = () => ({ scrollY: fakeMotionValue });
export const useMotionValueEvent = () => undefined;
export const useTransform = () => 0;
export const useInView = () => true;
export const animate = async () => undefined;
