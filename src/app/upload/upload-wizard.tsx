"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { humanFileSize } from "@/lib/media";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  FileText,
  Upload,
  Headphones,
  ImageIcon,
  Loader2,
  MonitorPlay,
  X,
} from "lucide-react";
import RichTextEditor from "./rich-text-editor";
import { FORMAT_OPTIONS } from "@/lib/media";
import { parseVideoUrl } from "@/lib/media";
import type { PostFormat } from "@/lib/types";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

const LIMITS: Record<string, { accept: string; max: number; maxCount: number; label: string }> = {
  audio: { accept: "audio/mpeg,audio/ogg,audio/mp4,audio/x-m4a,audio/mp3", max: 10 * 1024 * 1024, maxCount: 1, label: "One audio file · mp3 / ogg / m4a · max 10 MB" },
  image: { accept: "image/png,image/jpeg,image/webp,image/gif", max: 5 * 1024 * 1024, maxCount: 8, label: "1–8 images · jpg / png / webp / gif · max 5 MB each" },
  doc: { accept: ".pdf,.pptx,.ppt,.docx,.doc", max: 20 * 1024 * 1024, maxCount: 1, label: "One file · pdf / pptx / docx · max 20 MB" },
};

export default function UploadWizard({
  author,
  topics,
}: {
  author: string;
  topics: Topic[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [format, setFormat] = useState<PostFormat | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  // content inputs
  const [videoUrl, setVideoUrl] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // details inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [visibility, setVisibility] = useState("public");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUid(data.user.id);
      else router.push("/login");
    });
  }, [supabase, router]);

  function pickFormat(f: PostFormat) {
    setFormat(f);
    setFiles([]);
    setVideoUrl("");
    setBodyHtml("");
    setError(null);
    setStep(2);
  }

  function acceptFiles(list: FileList | null) {
    if (!list) return;
    const cfg = LIMITS[format!];
    const next = Array.from(list).slice(0, cfg.maxCount);
    const bad = next.find((f) => f.size > cfg.max);
    if (bad) {
      setError(`"${bad.name}" is too large (${humanFileSize(bad.size)}). Limit: ${humanFileSize(cfg.max)}.`);
    }
    setFiles(next.filter((f) => f.size <= cfg.max));
    setError(null);
  }

  const videoRef = format === "video" ? parseVideoUrl(videoUrl) : null;
  const canContinue =
    step === 2 &&
    format != null &&
    (format === "video"
      ? !!videoRef
      : format === "blog"
        ? bodyHtml.trim().length > 20
        : format === "image"
          ? files.length > 0
          : files.length === 1);

  async function uploadTo(bucket: string, file: File): Promise<string | null> {
    if (!uid) return null;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${uid}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function publish() {
    if (!uid || !format || !title.trim()) {
      setError("Add a title before publishing.");
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      let mediaUrl: string | null = null;
      let mediaUrl2: string | null = null;
      let filesJson: string[] | null = null;
      let body: string | null = null;

      if (format === "video" && videoRef) {
        mediaUrl = videoRef.embedUrl;
        mediaUrl2 = videoRef.thumbnailUrl;
      } else if (format === "blog") {
        body = bodyHtml;
      } else if (format === "audio") {
        mediaUrl = await uploadTo("audios", files[0]);
      } else if (format === "doc") {
        mediaUrl = await uploadTo("docs", files[0]);
      } else if (format === "image") {
        const urls: string[] = [];
        for (const f of files) {
          const u = await uploadTo("images", f);
          if (u) urls.push(u);
        }
        if (urls.length === 0) throw new Error("Image upload failed.");
        filesJson = urls;
        mediaUrl = urls[0];
        mediaUrl2 = urls[0];
      }

      const { data: post, error: insErr } = await supabase
        .from("posts")
        .insert({
          author_id: uid,
          format,
          title: title.trim(),
          description: description.trim() || null,
          body,
          media_url: mediaUrl,
          media_url_2: mediaUrl2,
          files: filesJson ?? null,
          language,
          visibility,
        })
        .select("id")
        .single();
      if (insErr) {
        console.error("Supabase insert post error:", insErr);
        throw new Error(insErr.message || "Failed to create post");
      }

      if (selectedTopics.length > 0) {
        await supabase
          .from("post_topics")
          .insert(selectedTopics.map((topic_id) => ({ post_id: post.id, topic_id })));
      }

      router.push(`/post/${post.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing failed. Try again.");
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Share what you learned</h1>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          @{author}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold " +
                (step >= s ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300")
              }
            >
              {s}
            </span>
            <span className={"h-1 flex-1 rounded " + (step > s ? "bg-emerald-600" : s === step ? "bg-emerald-300" : "bg-slate-200")} />
          </div>
        ))}
      </div>

      {/* STEP 1 — format */}
      {step === 1 && (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FORMAT_OPTIONS.map(({ format: f, label, desc }) => {
            const Icon =
              f === "video" ? MonitorPlay : f === "audio" ? Headphones : f === "image" ? ImageIcon : f === "doc" ? FileCheck2 : FileText;
            return (
              <button
                key={f}
                onClick={() => pickFormat(f)}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-white">{label}</span>
                  <span className="mt-0.5 block text-sm text-slate-500">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 2 — content */}
      {step === 2 && format && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {FORMAT_OPTIONS.find((o) => o.format === format)?.label}
            </h2>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Change format
            </button>
          </div>

          {format === "video" && (
            <>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {videoUrl && !videoRef && (
                <p className="text-sm text-red-600">
                  That doesn&apos;t look like a YouTube or Vimeo link. Try the standard watch/share URL.
                </p>
              )}
              {videoRef && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  {videoRef.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={videoRef.thumbnailUrl} alt="" className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-900 text-sm text-slate-300">
                      Vimeo video — preview plays on the post page
                    </div>
                  )}
                  <p className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                    <MonitorPlay className="h-3.5 w-3.5 text-emerald-600" />
                    {videoRef.provider === "youtube" ? "YouTube" : "Vimeo"} · id {videoRef.id}
                  </p>
                </div>
              )}
            </>
          )}

          {format === "blog" && <RichTextEditor onChange={setBodyHtml} />}

          {format !== "video" && format !== "blog" && (
            <label
              htmlFor="file-drop"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-900"
            >
              <Upload className="mb-3 h-8 w-8 text-emerald-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{LIMITS[format].label}</p>
              {files.length > 0 && (
                <ul className="mt-3 w-full max-w-md space-y-1">
                  {files.map((f) => (
                    <li key={f.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs text-slate-600 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-slate-700">
                      <span className="truncate">{f.name}</span>
                      <span className="text-slate-400">{humanFileSize(f.size)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <input
                id="file-drop"
                type="file"
                accept={LIMITS[format].accept}
                multiple={format === "image"}
                className="sr-only"
                onChange={(e) => acceptFiles(e.target.files)}
              />
            </label>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-2">
            <button
              disabled={!canContinue}
              onClick={() => setStep(3)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — details */}
      {step === 3 && format && (
        <div className="mt-8 space-y-5">
          <h2 className="font-semibold text-slate-900">Post details</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. How recursion finally clicked for me"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Short description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="One line a learner read before clicking"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Topics</label>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => {
                const on = selectedTopics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setSelectedTopics((prev) =>
                        prev.includes(t.id) ? prev.filter((x) => x !== t.id) : prev.length < 4 ? [...prev, t.id] : prev
                      )
                    }
                    className={
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition " +
                      (on
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300")
                    }
                  >
                    {on && <X className="h-3 w-3" />}
                    {t.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Pick up to 4 so the right learners find it.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm outline-none focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm outline-none focus:border-emerald-500"
              >
                <option value="public">Public — community can see</option>
                <option value="private">Private — only me</option>
              </select>
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex cursor-pointer items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={publish}
              disabled={publishing || !title.trim()}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing…</span>
                </>
              ) : (
                "Publish post"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Only share content you have the right to share. Community guidelines coming in{" "}
            <Link href="/help" className="underline">Help</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
