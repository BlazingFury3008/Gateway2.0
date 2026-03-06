"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserObject, AuthState } from "../lib/definitions";

export default function Page() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [userData, setUserData] = useState<UserObject | null>(null);
  const [showBufferLine, setShowBufferLine] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [avatarOk, setAvatarOk] = useState(true);

  const router = useRouter();

  const tabs = useMemo(
    () =>
      [
        { key: "overview", label: "Overview" },
        { key: "friends", label: "Friends" },
        { key: "messages", label: "Messages" },
        { key: "forumPosts", label: "Forum Posts" },
        { key: "characters", label: "Characters" },
        { key: "homebrew", label: "Homebrew" },
        { key: "wiki", label: "Wiki" },
        { key: "settings", label: "Settings/Options" },
      ] as const,
    [],
  );

  type TabKey = (typeof tabs)[number]["key"];

  useEffect(() => {
    const checkSession = async () => {
      const maybeHasCookie =
        typeof document !== "undefined" && document.cookie.length > 0;

      if (maybeHasCookie) setShowBufferLine(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

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

  useEffect(() => {
    if (authState === "guest") {
      router.back();
    }
  }, [authState, router]);

  const onSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const TabPill = ({ tabKey, label }: { tabKey: TabKey; label: string }) => {
    const isActive = activeTab === tabKey;

    return (
      <button
        type="button"
        onClick={() => onSelectTab(tabKey)}
        className={[
          "relative px-3 py-2 text-sm rounded-full transition-all whitespace-nowrap",
          "border border-[var(--border)]",
          "backdrop-blur-sm",
          isActive
            ? "text-[var(--foreground)] bg-[var(--background)] shadow-sm"
            : "text-[var(--muted)] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--foreground)]",
        ].join(" ")}
        aria-current={isActive ? "page" : undefined}
      >
        <span
          className={[
            "absolute -bottom-[2px] left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full transition-opacity",
            "bg-[var(--primary)]",
            isActive ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        {label}
      </button>
    );
  };

  const avatarSrc =
    avatarOk && userData?.image_url?.trim()
      ? userData.image_url
      : `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(
          userData?.username ?? "user",
        )}`;

  const Panel = () => {
    switch (activeTab) {
      case "friends":
        return <div className="card p-6">Friends</div>;
      case "messages":
        return <div className="card p-6">Messages</div>;
      case "forumPosts":
        return <div className="card p-6">Forum Posts</div>;
      case "characters":
        return <div className="card p-6">Characters</div>;
      case "homebrew":
        return <div className="card p-6">Homebrew</div>;
      case "wiki":
        return <div className="card p-6">Wiki</div>;
      case "settings":
        return <div className="card p-6">Settings / Options</div>;
      case "overview":
      default:
        return <div className="card p-6">Overview</div>;
    }
  };

  if (authState === "checking") {
    return (
      <div className="p-4">
        Checking...
        {showBufferLine && (
          <div className="text-sm text-[var(--muted)]">Buffering session...</div>
        )}
      </div>
    );
  }

  return (
    <div className="section section-light min-h-screen flex flex-col items-center justify-start py-12 px-4 sm:px-6">
      <div className="w-full max-w-7xl space-y-6 border-2 p-4 border-(--navbar) rounded-2xl min-h-[25lh] bg-(--navbar)">
        <div className="card overflow-hidden">
          <div className="relative">
            <div className="h-24 sm:h-28 bg-gradient-to-r from-black/10 via-black/0 to-black/10 dark:from-white/5 dark:via-white/0 dark:to-white/5" />

            <div className="px-5 sm:px-6 pb-4 -mt-10 sm:-mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={avatarSrc}
                    alt={`${userData?.username ?? "User"} avatar`}
                    width={96}
                    height={96}
                    unoptimized
                    onError={() => setAvatarOk(false)}
                    className="w-24 h-24 rounded-2xl border border-[var(--border)] object-cover bg-[var(--background)]"
                  />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                      Account ID {userData?.uuid ? `#${userData.uuid}` : "--"}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                      Discord ID{" "}
                      {userData?.discord_id ? `#${userData.discord_id}` : "--"}
                    </p>
                                        <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                      Google ID{" "}
                      {userData?.google_id ? `#${userData.google_id}` : "--"}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] mt-1">
                      {userData?.username || "Unnamed User"}
                    </h1>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      {userData?.email || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-5">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              {tabs.map((t) => (
                <TabPill key={t.key} tabKey={t.key} label={t.label} />
              ))}
            </div>
          </div>
        </div>

        <Panel />
      </div>
    </div>
  );
}