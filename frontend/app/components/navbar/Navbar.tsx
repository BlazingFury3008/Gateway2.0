"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthWindow from "./AuthButton";
import { FaMoon, FaSun } from "react-icons/fa";

type NavItem = { Label: string; link: string };

const NAV_ITEMS: NavItem[] = [
  { Label: "Forums", link: "/forums" },
  { Label: "Characters", link: "/characters" },
  { Label: "News", link: "/news" },
  { Label: "Events", link: "/events" },
  { Label: "Contact", link: "/contact" },
  { Label: "Wikis", link: "/wiki" },
];

type NavbarProps = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  function navigate(href: string) {
    setDrawerOpen(false);
    router.push(href);
  }

  return (
    <header className="bg-[var(--navbar)] text-[var(--foreground)] border-b border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Logo */}
        <div
          className="text-xl md:text-2xl font-bold cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          Gateway
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.Label}
              onClick={() => navigate(item.link)}
              className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
              type="button"
            >
              {item.Label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] transition"
            type="button"
            aria-label="Toggle theme"
          >
            {darkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
          </button>

          <AuthWindow />
        </div>
      </div>
    </header>
  );
}