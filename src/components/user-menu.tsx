"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Bookmark,
  PlusCircle,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import type { Profile } from "@/lib/auth";

export default function UserMenu({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu on path change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close menu on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const initial = (profile.full_name ?? profile.username).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full p-0.5 transition hover:ring-2 hover:ring-emerald-500/30 focus:outline-none"
        title="Account & profile"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
            {initial}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100 z-50 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* User info banner */}
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {profile.full_name ?? profile.username}
            </p>
            <p className="truncate font-mono text-xs text-emerald-600 dark:text-emerald-400">
              @{profile.username}
            </p>
          </div>

          {/* Navigation links */}
          <div className="py-1">
            <Link
              href={`/@${profile.username}`}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              role="menuitem"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Your Portfolio</span>
            </Link>

            <Link
              href="/saves"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              role="menuitem"
            >
              <Bookmark className="h-4 w-4 text-slate-400" />
              <span>Saved Posts</span>
            </Link>

            <Link
              href="/upload"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:hidden"
              role="menuitem"
            >
              <PlusCircle className="h-4 w-4 text-emerald-600" />
              <span>Share What You Learned</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              role="menuitem"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Edit Profile</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
