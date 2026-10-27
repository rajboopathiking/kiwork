import Link from "next/link";
import { BookOpen, PlusCircle, LogIn, Lightbulb } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const { user, profile } = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Lightbulb className="h-4 w-4" />
          </span>
          <span className="text-lg tracking-tight">
            KI<span className="text-emerald-600">WORK</span>
          </span>
        </Link>

        <Link
          href="/explore"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
        >
          <BookOpen className="h-4 w-4" />
          <span>Explore</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user && profile ? (
            <>
              <Link
                href="/upload"
                className="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:flex"
              >
                <PlusCircle className="h-4 w-4" />
                Share
              </Link>
              <Link
                href={`/@${profile.username}`}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-700"
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
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
