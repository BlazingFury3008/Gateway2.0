import React, { useEffect, useRef, useState } from "react";
import Login from "./AuthWindows/Login";
import Signup from "./AuthWindows/Signup";

export default function AuthWindow() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openDrawer) {
      // focus the wrapper so blur logic is consistent
      wrapperRef.current?.focus();
    }
  }, [openDrawer]);

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      className="relative"
      onBlurCapture={(e) => {
        const nextFocused = e.relatedTarget as Node | null;

        // If focus is moving to something inside the wrapper (button or drawer), keep open
        if (nextFocused && wrapperRef.current?.contains(nextFocused)) return;

        setOpenDrawer(false);
      }}
    >
      <button
        type="button"
        className="rounded-lg border border-[var(--border)] text-[var(--foreground)] px-4 py-2 hover:bg-[var(--border)] transition cursor-pointer"
        onClick={() => {
          setOpenDrawer(!openDrawer);
          setTab("login");
        }}
      >
        Login / Signup
      </button>

      {openDrawer && (
        <div
          ref={drawerRef}
          className="absolute top-12 right-0 w-90 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 shadow-lg"
        >
          <div className="flex gap-2 mb-3">
            <div className="relative flex w-full border border-[var(--border)] rounded-lg overflow-hidden">
              <button className={`flex-1 py-2 z-10 border-r border-gray-400 ${tab === "login" ? "bg-[var(--foreground)] text-[var(--background)]" : ""}`} onClick={() => setTab("login")}>Login</button>
              <button className={`flex-1 py-2 z-10 border-l border-gray-400 ${tab === "signup" ? "bg-[var(--foreground)] text-[var(--background)]" : ""}`} onClick={() => setTab("signup")}>Signup</button>

            </div>
          </div>

          {tab === "login" ? <Login /> : <Signup />}
        </div>
      )}
    </div>
  );
}
