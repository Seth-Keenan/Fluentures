"use client";

import { motion } from "framer-motion";
import Image from "next/image";

//Centralized image paths here
const CAMEL_NORMAL = "/Icons/camelNorm.png";
const CAMEL_THINKING = "/Icons/camelThink.png";

type SpeakingIconProps = {
  size?: number;
  speaking?: boolean;
};

export default function SpeakingIcon({
  size = 56,
  speaking = false,
}: SpeakingIconProps) {
  return (
    <div className="relative inline-flex items-center">
      {/* Avatar (image auto-swaps) */}
      <div
        className="rounded-full overflow-hidden border-2 border-white shadow-md"
        style={{ width: size, height: size }}
      >
        <Image
          src={speaking ? CAMEL_THINKING : CAMEL_NORMAL}
          alt="Chat Guide"
          width={size}
          height={size}
          className="object-cover"
          priority
        />
      </div>

      {/* Speech Bubble (always visible, fixed size) */}
      <div className="relative -ml-2 -mt-5 bg-white rounded-full px-2 py-2 shadow-md min-w-[36px] flex items-center justify-center">

        {/* Dots always visible */}
        <div className="flex gap-1 items-center">
          <Dot delay={0} active={speaking} />
          <Dot delay={0.2} active={speaking} />
          <Dot delay={0.4} active={speaking} />
        </div>
      </div>
    </div>
  );
}

function Dot({
  delay,
  active,
}: {
  delay: number;
  active?: boolean;
}) {
  return (
    <motion.span
      className="w-1.5 h-1.5 bg-gray-700 rounded-full"
      animate={
        active
          ? { opacity: [0.3, 1, 0.3] }
          : { opacity: 0.6 }
      }
      transition={{
        duration: 1,
        repeat: active ? Infinity : 0,
        delay,
      }}
    />
  );
}

