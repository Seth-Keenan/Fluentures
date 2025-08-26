"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

// Animations
const card: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45 } },
};

const fields = {
  label: "text-sm text-white/90 mb-1",
  input:
    "w-full rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 px-4 py-3 ring-1 ring-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400",
};

export default function LoginPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false); // show after intro delay
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowForm(true), 1000); // 3s intro image
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      username: form.get("username"),
      password: form.get("password"),
    } as { username: string | FormDataEntryValue | null; password: string | FormDataEntryValue | null };

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/home");
        return;
      } else {
        setError((data && (data.message || data.error)) || "Login failed. Check your credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image always visible */}
      <img
        src="/ChatGPT Image Mar 31, 2025 at 12_13_22 PM.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dim overlay after intro for contrast */}
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: showForm ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* 3s intro: show just the image */}
      {!showForm && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Login card */}
      {showForm && (
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            variants={card}
            initial="hidden"
            animate="show"
            className="w-[min(92vw,32rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
          >
            <h1 className="text-center text-2xl sm:text-3xl font-semibold text-white mb-6">Login</h1>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className={fields.label}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter username"
                  className={fields.input}
                />
              </div>

              <div>
                <label htmlFor="password" className={fields.label}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    className={fields.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 bg-white/0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/15 ring-1 ring-red-500/40 text-red-200 px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full justify-center rounded-xl px-5 py-3 bg-white/90 text-gray-900 font-medium tracking-wide shadow-lg shadow-black/20 ring-1 ring-white/30 hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </motion.button>

              <p className="text-center text-sm text-white/80">
                Not a user?{" "}
                <Link href="/signup" className="underline decoration-amber-400 text-amber-300 hover:text-amber-200">
                  Sign up
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
