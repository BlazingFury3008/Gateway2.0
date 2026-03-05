import React, { useEffect, useRef, useState } from "react";
import Login from "./AuthWindows/Login";
import Signup from "./AuthWindows/Signup";
import ProfileSection from "./ProfileSection";
import { UserObject } from "@/app/lib/definitions";


type AuthState = "checking" | "guest" | "authed";

export default function AuthWindow() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");

  // single source of truth for what to render
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [userData, setUserData] = useState<null | UserObject>(null);

  // show a "buffering..." line only when we *suspect* a cookie exists
  const [showBufferLine, setShowBufferLine] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openDrawer) {
      wrapperRef.current?.focus();
    }
  }, [openDrawer]);


  useEffect(() => {
    const checkSession = async () => {
      // Best-effort: if any cookies exist, show buffering while we confirm session.
      // Note: HttpOnly cookies won't be visible here; this is just a heuristic.
      const maybeHasCookie = typeof document !== "undefined" && document.cookie.length > 0;
      if (maybeHasCookie) setShowBufferLine(true);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          setAuthState("guest");
          return;
        }

        if (!res.ok) {
          console.error("Unexpected response:", res.status);
          setAuthState("guest");
          return;
        }

        const data = await res.json();

        if (data?.user) {
          setUserData(data.user);
          setAuthState("authed");
        } else {
          setAuthState("guest");
        }
      } catch (err) {
        console.error("Session check failed", err);
        setAuthState("guest");
      } finally {
        setShowBufferLine(false);
      }
    };

    checkSession();
  }, []);

  const showAuth = authState === "guest";
  const showProfile = authState === "authed" && userData;
  const isChecking = authState === "checking";

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      className="relative"
      onBlurCapture={(e) => {
        const nextFocused = e.relatedTarget as Node | null;
        if (nextFocused && wrapperRef.current?.contains(nextFocused)) return;
        setOpenDrawer(false);
      }}
    >
      {/* Buffering line: only when we suspect a cookie and are still confirming */}
      {showBufferLine && (
        <div className="mb-2 text-sm text-[var(--foreground)] opacity-70">
          Buffering… checking session
        </div>
      )}

      {/* Optional: if you want *nothing else* to show while checking, keep this block */}
      {isChecking && showBufferLine ? null : (
        <>
          {showAuth && (
            <>
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] text-[var(--foreground)] px-4 py-2 max-h-15 min-h-15 hover:bg-[var(--border)] transition cursor-pointer flex items-center gap-2 min-w-45 max-w-45 justify-center"
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
                  className="absolute top-16 right-0 w-90 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 shadow-lg"
                >
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex w-full border border-[var(--border)] rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className={`flex-1 py-2 z-10 border-r border-gray-400 ${
                          tab === "login" ? "bg-[var(--foreground)] text-[var(--background)]" : ""
                        }`}
                        onClick={() => setTab("login")}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 z-10 border-l border-gray-400 ${
                          tab === "signup" ? "bg-[var(--foreground)] text-[var(--background)]" : ""
                        }`}
                        onClick={() => setTab("signup")}
                      >
                        Signup
                      </button>
                    </div>
                  </div>

                  {tab === "login" ? <Login /> : <Signup />}

                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout_token`, {
                        method: "POST",
                        credentials: "include",
                      });
                      window.location.reload();
                    }}
                    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}

          {showProfile && (
            <ProfileSection userData={userData} />
          )}
        </>
      )}
    </div>
  );
}