"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSocialLogin(provider: "google" | "discord") {
      const redirectToPage = window.location.href;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login/${provider}?redirect=${redirectToPage}`;
      window.location.href = url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      // backend already set the session cookie
      // refresh UI / reload session state
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
      >
        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email/Username"
          required
          className="p-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="p-2 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--primary)] hover:bg-[var(--secondary)] rounded p-2 text-white transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="my-4 border-t border-[var(--border)]" />

      {/* Social logins */}
      <div className="flex flex-col gap-2">
        {" "}
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-2 bg-[#2f3cb5] hover:bg-[#2634b0] text-white rounded p-2 transition"
        >
          <FcGoogle size={20} />
          <span>Login with Google</span>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {" "}
        <button
          onClick={() => handleSocialLogin("discord")}
          className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded p-2 transition"
        >
          <FaDiscord size={20} />
          <span>Login with Discord</span>
        </button>
      </div>
    </div>
  );
}
