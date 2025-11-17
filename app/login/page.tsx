"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

// Font Awesome (Free)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket, // submit
  faEnvelope,       // email
  faLock,           // password
  faEye,            // show pwd
  faEyeSlash,       // hide pwd
} from "@fortawesome/free-solid-svg-icons";

const card: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45 } },
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [ready, setReady] = useState(false);         // small entrance delay
  const [loading, setLoading] = useState(false);     // submit spinner
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const desert = deserts.find(d => d.name === "Kalahari Desert")!;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    // Keeping your original "username" field name for compatibility,
    // but we label it as Email in the UI:
    const email = (form.get("username") as string) || "";
    const password = (form.get("password") as string) || "";

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message || "Login failed. Please check your credentials.");
        return;
      }
      router.push("/home");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageBackground
      src={desert.src}
      alt={desert.name}
      wikiUrl={desert.wikiUrl}
    >
      {/* Glow blobs for depth */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={{ y: [0, -16, 0], x: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Centered glass panel */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          variants={card}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="w-[min(92vw,32rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-white text-3xl sm:text-4xl font-semibold">Log in</h1>
            <p className="mt-2 text-white/80 text-sm sm:text-base">
              Welcome back! Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="username" className="text-sm text-white/90 mb-1 block">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 pl-10 pr-4 py-3 ring-1 ring-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm text-white/90 mb-1 block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                  <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 pl-10 pr-10 py-3 ring-1 ring-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/15 ring-1 ring-red-500/40 text-red-200 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full justify-center rounded-xl px-5 py-3 bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-black/20 ring-1 ring-white/20 transition duration-200 font-semibold tracking-wide text-base focus:outline-none focus:ring-2 focus:ring-white/80 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                    Logging in…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRightToBracket} className="h-5 w-5" />
                    Log in
                  </>
                )}
              </span>
            </motion.button>

            {/* Links */}
            <div className="text-center space-y-2">
              <Link
                href="/signup"
                className="text-amber-300 underline decoration-amber-400 hover:text-amber-200 cursor-pointer"
              >
                Not a user? Sign up
              </Link>
              <div>
                <Link
                  href="/reset-password"
                  className="text-amber-300 underline decoration-amber-400 hover:text-amber-200 cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div>
                <Link
                  href="/"
                  className="text-white/80 underline decoration-white/60 hover:text-white cursor-pointer"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </form>

          {/* Tiny footer hint */}
          <p className="mt-6 text-center text-xs text-white/70">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </motion.div>
      </div>
    </PageBackground>
  );
}
