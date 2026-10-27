import Link from "next/link";
import { Lightbulb } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            KI<span className="-ml-2 text-emerald-600">WORK</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Learn it. Share it. Help others learn it.
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/explore" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            Explore
          </Link>
          <Link href="/upload" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            Share
          </Link>
          <Link href="/help" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            How it works
          </Link>
          <Link href="/help#guidelines" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            Guidelines
          </Link>
        </nav>
      </div>
      <p className="pb-6 text-center text-xs text-slate-400">
        Built as a free, friendly community prototype · Students & self-learners
      </p>
    </footer>
  );
}
