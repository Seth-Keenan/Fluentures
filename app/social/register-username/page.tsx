"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterSocialUsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const show = (type: "error" | "success", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 2500);
  };

  const validate = (name: string) => {
    if (name.length < 3) return "Username must be at least 3 characters.";
    if (name.length > 20) return "Username must be at most 20 characters.";
    if (!/^[A-Za-z0-9_]+$/.test(name)) return "Only letters, numbers, and _ allowed.";
    return null;
  };

  const submit = async () => {
    const validation = validate(username.trim());
    if (validation) {
      show("error", validation);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/users/set-social-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ social_username: username.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        show("error", data.error || "Failed to save.");
        return;
      }

      show("success", "Username saved!");
      setTimeout(() => router.push("/social"), 900);

    } catch (e) {
      console.log(e);
      show("error", "Unexpected server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black/40 to-gray-900 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
        
        <h1 className="text-white text-3xl font-semibold text-center">
          Choose Your Username
        </h1>
        <p className="text-white/70 text-center mt-2 text-sm">
          This name will appear to other users.
        </p>

        {message && (
          <p className={`mt-4 text-center px-4 py-2 rounded-lg ${
            message.type === "error" ? "bg-red-500/80" : "bg-green-600/80"
          } text-white`}>
            {message.text}
          </p>
        )}

        <div className="mt-6">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="w-full bg-white/80 text-gray-900 px-4 py-3 rounded-lg focus:outline-none ring-1 ring-white/30"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Username"}
        </button>
      </div>
    </div>
  );
}
