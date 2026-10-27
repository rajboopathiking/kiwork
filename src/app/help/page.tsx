import Link from "next/link";
import { HeartHandshake, Lightbulb, ShieldCheck, Flag } from "lucide-react";

export const metadata = {
  title: "How it works & Community Guidelines",
  description: "Learn how KIWORK works and our community standards for sharing knowledge.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
        <Lightbulb className="h-5 w-5" />
      </span>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">How KIWORK works</h1>

      <div className="mt-8 space-y-6 text-slate-600 dark:text-slate-300">
        <p>
          <strong className="text-slate-900 dark:text-white">The idea:</strong> whenever you
          study something new — a concept, a tool, a chapter — you share what
          you learned in whatever format is easiest for you. Someone studying
          the same topic finds your post and gets unstuck. When they learn the
          next thing, they share too. That&apos;s how a helping community grows.
        </p>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <HeartHandshake className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Community Ways
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>Tap <strong>&quot;Helped me&quot;</strong> on any post that rescued you.</li>
            <li>Ask questions and offer kind answers in the comments.</li>
            <li>Follow people whose learning paths inspire you.</li>
            <li>Bookmark/save posts to review later in your <strong>Saved</strong> feed.</li>
            <li>Share your public learning portfolio with friends or recruiters.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">Formats you can post</h2>
          <p className="mt-2 text-sm">
            Video (YouTube &amp; Vimeo embed links), Audio notes, Image slides &amp; handwritten summaries,
            Interactive Blog articles, PPTX decks, and PDF study sheets. Pick whichever fits how you learn best!
          </p>
        </div>

        <div id="guidelines" className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <h2 className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-200">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Community Guidelines
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900 dark:text-emerald-300">
            <li>
              <strong>1. Be kind &amp; encouraging:</strong> Everyone is at a different stage in their learning journey. Beginners and experts alike are welcome.
            </li>
            <li>
              <strong>2. Credit your sources:</strong> If you learned from an article, YouTube video, or book, mention it in your description or notes.
            </li>
            <li>
              <strong>3. No spam or clickbait:</strong> Share authentic summaries and knowledge, not promotional ads, low-effort links, or deceptive titles.
            </li>
            <li>
              <strong>4. Keep it safe and constructive:</strong> Harassment, hate speech, plagiarism, or inappropriate content is strictly prohibited.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Flag className="h-5 w-5 text-rose-500" />
            Reporting Content
          </h2>
          <p className="mt-2 text-sm">
            Notice something that violates our community standards? Click the <strong>Report</strong> flag at the bottom of any post to flag it for moderation.
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/signup"
          className="inline-flex rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Join free
        </Link>
        <Link
          href="/explore"
          className="inline-flex rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Explore posts
        </Link>
      </div>
    </div>
  );
}
