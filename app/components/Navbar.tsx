// app/components/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import fluenturesLogo from "@/fluenturesLogo.png";
import { supabase } from "@/app/lib/hooks/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const navLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/contacts", label: "Contacts" },
];

const baseBtn =
  "rounded-lg px-4 py-2 relative overflow-hidden select-none focus:outline-none focus:ring-2 focus:ring-white/60";
const primaryBtn = "!bg-amber-500 hover:!bg-amber-400 text-white shadow-md";
const ghostBtn =
  "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/30";

function Shine() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-[140%] group-hover:translate-x-[140%] transition-transform duration-700 ease-out"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
      }}
    />
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <Link href={href} className="group relative">
        <motion.span
          className="relative inline-flex items-center justify-center px-2 py-1 text-white/90 hover:text-white transition-colors"
          whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
        >
          {/* subtle glass pill on hover */}
          <span className="absolute inset-0 rounded-md bg-white/0 group-hover:bg-white/10 transition-colors" />
          {/* animated underline */}
          <span
            className={[
              "absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-amber-300/90 transition-transform duration-200",
              "group-hover:scale-x-100",
              active ? "scale-x-100" : "",
            ].join(" ")}
          />
          <span className="relative z-10 text-[0.95rem] font-medium tracking-wide">
            {label}
          </span>
        </motion.span>
      </Link>
    );
  };

  const Logo = (
    <Link
      href={user ? "/home" : "/"}
      className="flex items-center z-10"
      aria-label="Fluentures home"
    >
      <motion.div
        whileHover={{
          rotate: prefersReducedMotion ? 0 : -2,
          scale: prefersReducedMotion ? 1 : 1.02,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="rounded-sm"
      >
        <Image
          src={fluenturesLogo}
          alt="Fluentures"
          width={64}
          height={64}
          priority
          className="rounded-sm select-none"
          draggable={false}
        />
      </motion.div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Green gradient bar */}
      <div className="w-full h-20 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 shadow-lg shadow-black/20">
        <nav className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          {/* Left: Logo */}
          {Logo}

          {/* Center: links (desktop) */}
          <ul className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 items-center gap-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <NavLink href={l.href} label={l.label} />
              </li>
            ))}
          </ul>

          {/* Right: Auth buttons (desktop) */}
          <div className="ml-auto hidden md:flex items-center gap-2 z-10">
            {!user ? (
              <>
                {/* Sign in */}
                <Link href="/login" className="inline-block">
                  <motion.span
                    className={`group inline-flex ${baseBtn} ${primaryBtn}`}
                    whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                  >
                    <Shine />
                    Sign in
                  </motion.span>
                </Link>

                {/* Sign up */}
                <Link href="/signup" className="inline-block">
                  <motion.span
                    className={`group inline-flex ${baseBtn} ${ghostBtn}`}
                    whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                  >
                    <Shine />
                    Sign up
                  </motion.span>
                </Link>
              </>
            ) : (
              <>
                {/* Home (shows only when logged in) */}
                <Link href="/home" className="inline-block">
                  <motion.span
                    className={`group inline-flex ${baseBtn} ${ghostBtn}`}
                    whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                    aria-label="Go to Home"
                    title="Home"
                  >
                    <Shine />
                    Home
                  </motion.span>
                </Link>

                {/* Sign out */}
                <motion.button
                  type="button"
                  onClick={handleSignOut}
                  className={`group ${baseBtn} ${primaryBtn}`}
                  whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                >
                  <Shine />
                  Sign out
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile */}
          <motion.button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden ml-auto z-10 rounded-md p-2 text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
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
          </motion.button>
        </nav>
      </div>

      {/* Bottom shimmer */}
      <div className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-emerald-900/95 text-white backdrop-blur-xl border-t border-emerald-700/50 overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
              }}
              className="mx-auto max-w-7xl px-4 py-3 space-y-2"
            >
              {navLinks.map((l) => (
                <motion.div
                  key={l.href}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-white/10"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-1 grid grid-cols-2 gap-2">
                {!user ? (
                  <>
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="block">
                        <span className={`group inline-flex w-full justify-center ${baseBtn} ${primaryBtn}`}>
                          <Shine />
                          Sign in
                        </span>
                      </Link>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                      <Link href="/signup" onClick={() => setMenuOpen(false)} className="block">
                        <span className={`group inline-flex w-full justify-center ${baseBtn} ${ghostBtn}`}>
                          <Shine />
                          Sign up
                        </span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Mobile Home button (you already had this; kept intact) */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                      <Link href="/home" onClick={() => setMenuOpen(false)} className="block">
                        <span className={`group inline-flex w-full justify-center ${baseBtn} ${ghostBtn}`}>
                          <Shine />
                          Home
                        </span>
                      </Link>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                      <motion.button
                        type="button"
                        onClick={async () => {
                          await handleSignOut();
                          setMenuOpen(false);
                        }}
                        className={`group w-full justify-center ${baseBtn} ${primaryBtn}`}
                        whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                      >
                        <Shine />
                        Sign out
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
