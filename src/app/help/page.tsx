import Link from "next/link";
import { HeartHandshake, Lightbulb } from "lucide-react";

export const metadata = { title: "How it works" };

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
        <Lightbulb className="h-5 w-5" />
      </span>
      <h1 className="text-3xl font-bold text-slate-900">How KIWORK works</h1>

      <div className="mt-8 space-y-6 text-slate-600">
        <p>
          <strong className="text-slate-900">The idea:</strong> whenever you
          study something new — a concept, a tool, a chapter — you share what
          you learned in whatever format is easiest for you. Someone studying
          the same topic finds your post and gets unstuck. When they learn the
          next thing, they share too. That's how a helping community grows.
        </p>
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <HeartHandshake className="h-5 w-5 text-emerald-600" />
            Community ways
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>Tap <strong>"Helped me"</strong> on any post that rescued you.</li>
            <li>Ask questions in comments — the author gets notified (soon).</li>
            <li>Follow people whose learning paths you like.</li>
            <li>Save posts to study later.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Formats you can post</h2>
          <p className="mt-2 text-sm">
            Video (YouTube link), Audio, Images/notes, Blog, PPTX slides, PDF
            docs — pick whichever fits how you learn.
          </p>
        </div>
      </div>

      <Link
        href="/signup"
        className="mt-10 inline-flex rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Join free
      </Link>
    </div>
  );
}
