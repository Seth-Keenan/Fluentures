"use client";

// app/components/SettingsButtonGear.tsx
// quick settings button with gear icon that navigates to /settings page
// probably add animation jump later to fit with jay's design in main page

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SettingsButtonGear() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/settings")}
      className="p-2 rounded-full transition"
      aria-label="Settings"
    >
      <Image
        src="/Icons/gearIcon.svg"
        alt="Settings"
        width={40}
        height={40}
      />
    </button>
  );
}
