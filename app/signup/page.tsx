"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion, type Variants } from "framer-motion";

type FormFields = {
  firstName: string;
  username: string;
  password: string;
};

const card: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45 } },
};

const fields = {
  label: "text-sm text-white/90 mb-1",
  input:
    "w-full rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 px-4 py-3 ring-1 ring-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400",
};

export default function SignUp() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false); // reveal after 3s intro image
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowForm(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>({ mode: "onTouched" });

  function loadUsers(): FormFields[] {
    try {
      const raw = localStorage.getItem("users");
      return raw ? (JSON.parse(raw) as FormFields[]) : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users: FormFields[]) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const existing = loadUsers();
      if (existing.some((u) => u.username === data.username)) {
        setError("That username is already taken.");
        return;
      }

      const updated = [...existing, data];
      saveUsers(updated);
      setSuccess("Account created! Redirecting to login...");
      reset();

      setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Could not save your account. Please try again.");
    } finally {
      setLoading(false);
    }
  });

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

      {/* 3s intro: just the image */}
      {!showForm && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Sign Up card */}
      {showForm && (
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            variants={card}
            initial="hidden"
            animate="show"
            className="w-[min(92vw,32rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
          >
            <h1 className="text-center text-2xl sm:text-3xl font-semibold text-white mb-6">Sign Up</h1>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="firstName" className={fields.label}>
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  className={fields.input}
                  {...register("firstName", { required: "First name is required" })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-200">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className={fields.label}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  className={fields.input}
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "At least 3 characters" },
                  })}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-200">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className={fields.label}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className={fields.input}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "At least 6 characters" },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-200">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/15 ring-1 ring-red-500/40 text-red-200 px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/40 text-emerald-200 px-3 py-2 text-sm">
                  {success}
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
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </motion.button>

              <p className="text-center text-sm text-white/80">
                Have an account?{" "}
                <Link href="/login" className="underline decoration-amber-400 text-amber-300 hover:text-amber-200">
                  Log in
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
