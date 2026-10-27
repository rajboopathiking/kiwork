"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { humanFileSize } from "@/lib/media";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileText,
  Globe,
  Upload,
  Headphones,
  ImageIcon,
  Loader2,
  MonitorPlay,
  Terminal,
  X,
} from "lucide-react";
import RichTextEditor from "./rich-text-editor";
import { FORMAT_OPTIONS } from "@/lib/media";
import { parseVideoUrl } from "@/lib/media";
import { ColabIcon, GithubIcon } from "@/components/brand-icons";
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

  // developer productivity & learning resources
  const [colabUrl, setColabUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");

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
    const cfg = LIMITS[format === "blog" ? "image" : format!];
    const maxCount = cfg?.maxCount ?? 8;
    const maxSize = cfg?.max ?? 5 * 1024 * 1024;
    const next = Array.from(list).slice(0, maxCount);
    const bad = next.find((f) => f.size > maxSize);
    if (bad) {
      setError(`"${bad.name}" is too large (${humanFileSize(bad.size)}). Limit: ${humanFileSize(maxSize)}.`);
    }
    setFiles(next.filter((f) => f.size <= maxSize));
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
      let filesJson: unknown = null;
      let body: string | null = null;

      function cleanUrl(u: string): string {
        const trimmed = u.trim();
        if (!trimmed) return "";
        if (!/^https?:\/\//i.test(trimmed)) {
          return `https://${trimmed}`;
        }
        return trimmed;
      }

      const colabClean = cleanUrl(colabUrl);
      const githubClean = cleanUrl(githubUrl);
      const demoClean = cleanUrl(demoUrl);
      const docsClean = cleanUrl(docsUrl);

      const devResources: Record<string, string> = {};
      if (colabClean) devResources.colab_url = colabClean;
      if (githubClean) devResources.github_url = githubClean;
      if (demoClean) devResources.demo_url = demoClean;
      if (docsClean) devResources.docs_url = docsClean;

      const hasDevResources = Object.keys(devResources).length > 0;

      if (format === "video" && videoRef) {
        mediaUrl = videoRef.embedUrl;
        mediaUrl2 = videoRef.thumbnailUrl;
        if (hasDevResources) filesJson = devResources;
      } else if (format === "blog") {
        body = bodyHtml;
        const uploadedImages: string[] = [];
        if (files.length > 0) {
          for (const f of files) {
            const u = await uploadTo("images", f);
            if (u) uploadedImages.push(u);
          }
          if (uploadedImages.length > 0) {
            mediaUrl = uploadedImages[0];
            mediaUrl2 = uploadedImages[0];
          }
        }
        if (uploadedImages.length > 0) {
          filesJson = hasDevResources ? { images: uploadedImages, ...devResources } : { images: uploadedImages };
        } else if (hasDevResources) {
          filesJson = devResources;
        }
      } else if (format === "audio") {
        mediaUrl = await uploadTo("audios", files[0]);
        if (hasDevResources) filesJson = devResources;
      } else if (format === "doc") {
        mediaUrl = await uploadTo("docs", files[0]);
        if (hasDevResources) filesJson = devResources;
      } else if (format === "image") {
        const urls: string[] = [];
        for (const f of files) {
          const u = await uploadTo("images", f);
          if (u) urls.push(u);
        }
        if (urls.length === 0) throw new Error("Image upload failed.");
        mediaUrl = urls[0];
        mediaUrl2 = urls[0];
        filesJson = hasDevResources ? { images: urls, ...devResources } : urls;
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

          {format === "blog" && (
            <div className="space-y-4">
              <RichTextEditor onChange={setBodyHtml} />

              {/* Multi-combination: Attached Diagrams & Screenshots for Blogs */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                        Attach Architecture Diagrams &amp; Screenshots (Optional)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload system flowcharts, UI screenshots, or benchmark graphs (up to 8 images)
                      </p>
                    </div>
                  </div>
                  <label
                    htmlFor="blog-images-drop"
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Images ({files.length}/8)</span>
                    <input
                      id="blog-images-drop"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      multiple
                      className="sr-only"
                      onChange={(e) => acceptFiles(e.target.files)}
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {files.map((f, i) => (
                      <div key={f.name + i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                          {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                          className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {format !== "video" && format !== "blog" && (
            <label
              htmlFor="file-drop"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-900"
            >
              <Upload className="mb-3 h-8 w-8 text-emerald-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{LIMITS[format].label}</p>
              {files.length > 0 && format === "image" ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 w-full max-w-lg">
                  {files.map((f, i) => (
                    <div key={f.name + i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFiles(files.filter((_, idx) => idx !== i));
                        }}
                        className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : files.length > 0 && (
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

          {/* Developer & Learning Resources */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Terminal className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Developer & Learning Resources (Optional)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Attach interactive Google Colab notebooks, GitHub code, or live demos
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Google Colab */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <ColabIcon className="h-4 w-4" />
                  Google Colab Notebook URL
                </label>
                <input
                  type="url"
                  value={colabUrl}
                  onChange={(e) => setColabUrl(e.target.value)}
                  placeholder="https://colab.research.google.com/drive/..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* GitHub Repo */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <GithubIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Live Demo */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Live Demo / App URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://my-app.vercel.app or deployed project"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Docs / Research Paper */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Docs / Research Paper URL
                </label>
                <input
                  type="url"
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/... or documentation"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
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
