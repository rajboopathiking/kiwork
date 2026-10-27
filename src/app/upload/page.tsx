import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Headphones,
  Hammer,
  ImageIcon,
  MonitorPlay,
  Presentation,
} from "lucide-react";

const FORMATS = [
  { icon: MonitorPlay, label: "Video", desc: "Paste a YouTube link", soon: false },
  { icon: FileText, label: "Blog post", desc: "Rich-text write-up", soon: false },
  { icon: ImageIcon, label: "Notes / Images", desc: "Photos & screenshots", soon: false },
  { icon: Headphones, label: "Audio", desc: "Voice notes & recordings", soon: false },
  { icon: Presentation, label: "Slides (PPTX)", desc: "Present what you learned", soon: false },
  { icon: FileCheck2, label: "PDF", desc: "Summaries & cheat-sheets", soon: false },
];

export const metadata = { title: "Share" };

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Hammer className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Share what you learned
        </h1>
        <p className="mt-2 text-slate-500">
          Pick your format — the upload wizard opens in Phase 2.
        </p>
      </div>

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

      <p className="mt-10 text-center text-sm text-slate-500">
        Ready to fill this? Next setup steps live in{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">SETUP_GUIDE.md</code>{" "}
        — then explore the{" "}
        <Link href="/explore" className="font-semibold text-emerald-700 hover:underline">
          empty feed
        </Link>{" "}
        that&apos;s waiting for your first post.
      </p>
    </div>
  );
}
