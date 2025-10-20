"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

interface LinkAsButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export const LinkAsButton: React.FC<LinkAsButtonProps> = ({
  onClick,
  children,
  className = "",
  href = "",
  size = "md",
}) => {
  let sizeClass = "";
  switch (size) {
    case "sm":
      sizeClass = "px-3 py-1.5 text-sm";
      break;
    case "md":
      sizeClass = "px-5 py-2.5 text-base";
      break;
    case "lg":
      sizeClass = "px-6 py-3 text-lg";
      break;
  }

  const baseClass = `
    flex items-center justify-center
    rounded-xl font-medium tracking-wide
    backdrop-blur-md border border-white/20
    bg-white/10 text-white
    hover:bg-white/20 hover:shadow-lg hover:shadow-white/10
    transition duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-white/40
    ${sizeClass}
  `;

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
      <Link href={href} onClick={onClick}>
        <span className={`${baseClass} ${className}`}>{children}</span>
      </Link>
    </motion.div>
  );
};
