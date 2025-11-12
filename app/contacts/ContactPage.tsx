"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactsPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <motion.img
        src="/desert.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/50" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.main
          className="w-[min(92vw,42rem)] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-10"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="text-white text-3xl sm:text-4xl font-semibold">Contact us</h1>
          <p className="mt-2 text-white/85">
            Questions, feedback, or ideas — we’d love to hear from you.
          </p>

          <form
            className="mt-6 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              // TODO: wire to API / email service
            }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-white/90 text-sm">Name</span>
                <input
                  required
                  name="name"
                  className="mt-1 w-full rounded-lg border border-white/30 bg-white/90 p-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-white/90 text-sm">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-1 w-full rounded-lg border border-white/30 bg-white/90 p-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-white/90 text-sm">Message</span>
              <textarea
                required
                name="message"
                rows={5}
                className="mt-1 w-full rounded-lg border border-white/30 bg-white/90 p-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="How can we help?"
              />
            </label>

            <div className="flex items-center gap-3 justify-end">
              {sent && (
                <span className="text-sm text-white/85">
                  Thanks! We’ll get back to you soon.
                </span>
              )}
              <button
                type="submit"
                className="cursor-pointer rounded-lg px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-400 ring-1 ring-white/20 shadow-md transition"
              >
                Send
              </button>
            </div>
          </form>
        </motion.main>
      </div>
    </div>
  );
}
