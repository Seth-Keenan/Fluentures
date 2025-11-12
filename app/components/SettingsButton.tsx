"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export default function SettingsButtonGear() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/settings")}
      aria-label="Settings"
      className="
        relative group
        p-4
        rounded-full
        transition
        hover:scale-105
        hover:shadow-2xl
        active:scale-95
      "
    >
      {/* Fading circular mask around the icon */}
      <div
        className="
          absolute inset-0 rounded-full
          bg-gradient-radial from-white/30 via-white/10 to-transparent
          opacity-60 group-hover:opacity-80
          transition-opacity duration-300
          pointer-events-none
        "
      />

      {/* The lantern gear icon */}
<Image
  src="/Icons/laternGear.png"
  alt="Settings"
  width={90}
  height={90}
  className="
    opacity-80
    rounded-full
    shadow-lg
    hover:opacity-100
    transition
    backdrop-blur-md
    [background:radial-gradient(circle,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)]
  "
/>
    </button>
  );
}
