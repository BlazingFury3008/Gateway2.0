"use client";

import { UserObject } from "@/app/lib/definitions";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSection({ userData }: { userData: UserObject }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const router = useRouter()

  const wrapperRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!openDrawer) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      if (drawerRef.current?.contains(target)) return;
      if (wrapperRef.current?.contains(target)) return;

      setOpenDrawer(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDrawer(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDrawer]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        className="rounded-lg border border-[var(--border)] text-[var(--foreground)] px-4 py-2 max-h-15 min-h-15 hover:bg-[var(--border)] transition cursor-pointer flex items-center gap-2 min-w-45 max-w-45"
        onClick={() => setOpenDrawer((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={openDrawer}
      >
        <Image
          src={
            userData?.image_url?.trim()
              ? userData.image_url
              : `https://api.dicebear.com/7.x/identicon/png?seed=${userData?.username ?? "user"}`
          }
          alt={`${userData?.username ?? "User"} avatar`}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <span className="text-[var(--foreground)] text-ellipsis max-w-25 line-clamp-1">
          {userData.username}
        </span>
      </button>

      {openDrawer && (
        <div
          ref={drawerRef}
          role="menu"
          className="absolute top-16 right-0 w-45 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 shadow-lg z-50 space-y-3"
        >
          <button
            type="button"
            onClick={() => {
              router.push("/profile")
            }}
            className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded cursor-pointer"
            role="menuitem"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
                {
                  method: "POST",
                  credentials: "include",
                },
              );
              window.location.reload();
            }}
            className="w-full px-4 py-2 bg-[var(--danger)] text-white rounded cursor-pointer"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
