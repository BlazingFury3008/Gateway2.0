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
    <header className="bg-navbar border-b border-(--border) text-foreground">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Gateway
        </div>
        <nav className="hidden md:flex space-x-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.Label}
              onClick={() => navigate(item.link)}
              className="hover:text-primary cursor-pointer"
            >
              {item.Label}
            </a>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-(--border) bg-background hover:bg-(--border) transition"
          >
            {darkMode ? (
              <FaSun className="text-sm"  />
            ) : (
              <FaMoon className="text-sm" />
            )}
          </button>
          <AuthWindow />
        </div>
      </div>
    </header>
  );
}
