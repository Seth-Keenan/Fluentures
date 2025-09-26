// app/components/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import fluenturesLogo from "@/fluenturesLogo.png";
import { Button } from "@/app/components/Button";
import { supabase } from "@/app/lib/hooks/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/contacts", label: "Contacts" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showSignOut = !!user && pathname !== "/";

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link href={href} className="group relative text-white/90 hover:text-white transition">
        <span className="text-[0.95rem] font-medium tracking-wide">{label}</span>
        <span
          className={[
            "absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-amber-300/90 transition-transform duration-200",
            "group-hover:scale-x-100",
            active ? "scale-x-100" : "",
          ].join(" ")}
        />
      </Link>
    );
  };

  const logoHref = user ? "/home" : "/";

  return (
    <header className="sticky top-0 z-50">
      {/* Gradient bar */}
      <div className="w-full h-20 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 shadow-lg shadow-black/20">
        <nav className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          {/* Left: Logo */}
          <Link href={logoHref} className="flex items-center z-10" aria-label="Fluentures home">
            <Image
              src={fluenturesLogo}
              alt="Fluentures company logo"
              width={64}
              height={64}
              priority
              className="rounded-sm"
            />
          </Link>

          {/* Center: links absolutely centered */}
          <ul className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 items-center gap-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <NavLink href={l.href} label={l.label} />
              </li>
            ))}
          </ul>

          {/* Right: Sign Out (only when logged in & not on '/') */}
          <div className="ml-auto hidden md:block z-10">
            {showSignOut ? (
              <Button
                className="!rounded-lg !px-4 !py-2 !bg-amber-500 hover:!bg-amber-400 !text-white shadow-md"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            ) : null}
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden ml-auto z-10 rounded-md p-2 text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* Fancy bottom shimmer line */}
      <div className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-emerald-900/95 text-white backdrop-blur-xl border-t border-emerald-700/50">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}

            {showSignOut ? (
              <Button
                onClick={handleSignOut}
                className="w-full !rounded-lg !px-3 !py-2 !bg-amber-500 hover:!bg-amber-400 !text-white mt-1"
              >
                Sign Out
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
