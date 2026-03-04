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

  function handleSocialLogin(arg0: string): void {
    throw new Error("Function not implemented.");
  }

  function onLoginClick() {
    

}

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => e.preventDefault()}
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
          onClick={() => handleSocialLogin("Google")}
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
