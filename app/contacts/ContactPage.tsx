"use client";

import { motion } from "framer-motion";

const TEAM = [
  {
    name: "Seth Ek",
    role: "Backend Engineer",
    linkedin: "https://www.linkedin.com/in/seth-ek/",
  },
  {
    name: "Member Two",
    role: "Product Designer",
    linkedin: "https://www.linkedin.com/in/member-two",
  },
  {
    name: "Member Three",
    role: "Full-Stack Engineer",
    linkedin: "https://www.linkedin.com/in/member-three",
  },
  {
    name: "Seth Keenan",
    role: "QA, Frontend, and Hosting",
    linkedin: "https://www.linkedin.com/in/sethkeenan4002",
  },
  {
    name: "Member Five",
    role: "DevOps Engineer",
    linkedin: "https://www.linkedin.com/in/member-five",
  },
  {
    name: "Member Six",
    role: "Mobile Developer",
    linkedin: "https://www.linkedin.com/in/member-six",
  },
];

// === REPO URL ===
const GITHUB_REPO = "https://github.com/Seth-Keenan/Fluentures";

export default function TeamPage() {
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

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/60" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.main
          className="w-[min(92vw,52rem)] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-10"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h1 className="text-white text-3xl sm:text-4xl font-semibold tracking-tight">
                Meet the Team
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl">
                The six creators behind this project. Connect with us or explore our codebase.
              </p>
            </div>

            {/* GitHub repo button */}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-sm text-white/90 shadow-md hover:bg-black/60 hover:border-white/40 transition"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/20 text-xs font-mono">
                &lt;/&gt;
              </span>
              <span className="font-medium">View GitHub repo</span>
            </a>
          </div>

          {/* Team grid — now 3x2 on desktop */}
          <div className="mt-8 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member, idx) => (
              <motion.article
                key={member.name}
                className="group rounded-2xl border border-white/20 bg-black/25 bg-gradient-to-br from-white/10 via-white/5 to-black/40 backdrop-blur-md p-4 shadow-lg hover:border-indigo-300/70 hover:shadow-indigo-500/30 transition"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.06 * idx, duration: 0.35 }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar with initials */}
                  <div className="relative h-12 w-12 rounded-full border border-white/30 bg-white/15 shadow-inner flex items-center justify-center">
                    <span className="text-lg font-semibold text-white/95 tracking-tight">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>

                    <div className="pointer-events-none absolute inset-[-2px] rounded-full bg-indigo-400/20 opacity-0 group-hover:opacity-100 blur-lg transition" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                      {member.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200/90">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* LinkedIn link */}
                <div className="mt-4 flex justify-between items-center">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:bg-indigo-400 transition"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                    >
                      <path
                        fill="currentColor"
                        d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.23 8.25h4.54V24H.23zM8.54 8.25h4.35v2.13h.06c.61-1.16 2.1-2.38 4.33-2.38 4.63 0 5.48 3.05 5.48 7.02V24h-4.54v-7.15c0-1.7-.03-3.88-2.37-3.88-2.37 0-2.73 1.85-2.73 3.76V24H8.54z"
                      />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 border-t border-white/10 pt-4 text-center text-xs text-white/55">
            Built with teamwork — and a desert breeze.
          </div>
        </motion.main>
      </div>
    </div>
  );
}
