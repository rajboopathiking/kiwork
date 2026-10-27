import Link from "next/link";
import { BookOpen, LogIn, Lightbulb, PlusCircle, Search, Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

export default async function Navbar() {
  const { user, profile } = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-900 dark:text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Lightbulb className="h-4 w-4" />
          </span>
          <span className="text-lg tracking-tight">
            KI<span className="text-emerald-600">WORK</span>
          </span>
        </Link>

        <Link
          href="/explore"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400"
        >
          <BookOpen className="h-4 w-4" />
          <span>Explore</span>
        </Link>

        <form action="/search" className="ml-1 hidden flex-1 md:block">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              placeholder="Search posts & people…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <Link
            href="/search"
            className="text-slate-500 hover:text-emerald-700 dark:text-slate-400 md:hidden"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {user && profile ? (
            <>
              <Link
                href="/saves"
                className="hidden text-slate-500 hover:text-amber-600 sm:block dark:text-slate-400"
                title="Saved posts"
              >
                <Bookmark className="h-5 w-5" />
              </Link>
              <Link
                href="/upload"
                className="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:flex"
              >
                <PlusCircle className="h-4 w-4" />
                Share
              </Link>
              <Link
                href={`/@${profile.username}`}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-700 dark:text-slate-200"
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400"
              >
                <LogIn className="h-4 w-4" />
                <span>Log in</span>
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
