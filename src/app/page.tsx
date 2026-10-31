import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileText,
  Headphones,
  HeartHandshake,
  ImageIcon,
  Lightbulb,
  LogIn,
  MonitorPlay,
  PlusCircle,
  Presentation,
  UserPlus,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";

const FORMATS = [
  { icon: MonitorPlay, label: "Video", desc: "Paste a YouTube link of your explainer" },
  { icon: Headphones, label: "Audio", desc: "Recorded voice notes & podcasts" },
  { icon: ImageIcon, label: "Images", desc: "Handwritten notes, screenshots, drawings" },
  { icon: FileText, label: "Blog", desc: "Rich-text write-ups of what you learned" },
  { icon: Presentation, label: "Slides", desc: "PPTX you made for your class or team" },
  { icon: FileCheck2, label: "PDF", desc: "Notes, cheat-sheets, summaries" },
];

const STEPS = [
  {
    icon: Lightbulb,
    title: "1. Study anything",
    desc: "A concept, a tool, a chapter, a course — whatever you're learning right now.",
  },
  {
    icon: BookOpen,
    title: "2. Share it your way",
    desc: "Write a blog, record audio, upload notes or slides, or just paste a YouTube video you made.",
  },
  {
    icon: HeartHandshake,
    title: "3. Build a helping community",
    desc: "Someone stuck on the same topic finds your post — and when they learn it, they share too.",
  },
];

export default async function Home() {
  const { user, profile } = await getCurrentUser();

  return (
    <div>
      {/* Minimal Top Bar for Landing Page (No repetitive navbar branding) */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:py-5">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Explore Community</span>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          {user && profile ? (
            <UserMenu profile={profile} />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with prominent KIWORK branding */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-6 text-center sm:pb-16 sm:pt-14">
        {/* Prominent KIWORK Brand in Hero */}
        <div className="mx-auto mb-4 flex items-center justify-center gap-2.5 sm:gap-3.5">
          <span className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8" />
          </span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            KI<span className="text-emerald-600 dark:text-emerald-400">WORK</span>
          </span>
        </div>

        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          <Lightbulb className="h-3.5 w-3.5" />
          A free, friendly community for self-learners
        </p>

        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Learn it. <span className="text-emerald-600 dark:text-emerald-400">Share it.</span> Help
          others learn it.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
          When you study something new, post what you learned — as{" "}
          <strong>video, audio, notes, slides or a blog</strong>. Someone out
          there is studying the same thing and needs exactly what you just
          figured out.
        </p>

        {/* Action Buttons: Responsive to login session */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user && profile ? (
            <>
              <Link
                href="/upload"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
              >
                <PlusCircle className="h-4 w-4" />
                Start sharing what you learned
              </Link>
              <Link
                href={`/@${profile.username}`}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
              >
                <span>Your Portfolio (@{profile.username})</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup?next=/upload"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                Start sharing — Sign up free
              </Link>
              <Link
                href="/login?next=/upload"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
              >
                <LogIn className="h-4 w-4" />
                Log in to share
              </Link>
            </>
          )}

          <Link
            href="/explore"
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-transparent px-5 py-3 font-semibold text-slate-600 transition hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 sm:w-auto"
          >
            Browse posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Any format */}
      <section className="border-y border-slate-100 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Share knowledge in ANY format
          </h2>
          <p className="mt-2 text-center text-slate-500 dark:text-slate-400">
            No more forcing your notes into one rigid template.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FORMATS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-slate-900 dark:text-white">{label}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          How KIWORK works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community CTA Section: Responsive to login session */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Every learner becomes a teacher
          </h2>

          {user && profile ? (
            <>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                Your portfolio is live at{" "}
                <strong className="font-mono text-emerald-400">@{profile.username}</strong>{" "}
                showing everything you&apos;ve learned and shared — one link you can send
                to recruiters, classmates, or friends.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={`/@${profile.username}`}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-400"
                >
                  View your portfolio (@{profile.username})
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  <PlusCircle className="h-4 w-4" />
                  Share what you learned
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                Your portfolio at{" "}
                <strong className="font-mono text-emerald-400">@yourname</strong>{" "}
                shows everything you&apos;ve learned and shared — one link you can send
                to recruiters, classmates, or friends.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-400"
                >
                  <UserPlus className="h-4 w-4" />
                  Claim your portfolio — Sign up free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Already claimed? Log in
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
