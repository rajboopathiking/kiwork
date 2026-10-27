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
  MonitorPlay,
  Presentation,
  UserPlus,
} from "lucide-react";

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

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:pt-24">
        <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <Lightbulb className="h-3.5 w-3.5" />
          A free, friendly community for self-learners
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Learn it. <span className="text-emerald-600">Share it.</span> Help
          others learn it.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          When you study something new, post what you learned — as{" "}
          <strong>video, audio, notes, slides or a blog</strong>. Someone out
          there is studying the same thing and needs exactly what you just
          figured out.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" />
            Start sharing — free
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-full border border-slate-300 px-7 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Browse posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Any format */}
      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Share knowledge in ANY format
          </h2>
          <p className="mt-2 text-center text-slate-500">
            No more forcing your notes into one rigid template.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FORMATS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-slate-900">{label}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          How KIWORK works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Every learner becomes a teacher
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Your portfolio at <strong className="font-mono">@yourname</strong>{" "}
            shows everything you&apos;ve learned and shared — one link you can send
            to recruiters, classmates, or friends.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-400"
          >
            Claim your portfolio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
