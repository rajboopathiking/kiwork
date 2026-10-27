"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { parseVideoUrl } from "@/lib/media";
import RichTextEditor from "@/app/upload/rich-text-editor";
import { ColabIcon, GithubIcon } from "@/components/brand-icons";
import {
  ArrowLeft,
  BookOpen,
  Globe,
  Loader2,
  MonitorPlay,
  Save,
  Terminal,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface EditPostFormProps {
  post: {
    id: string;
    format: string;
    title: string;
    description: string | null;
    body: string | null;
    media_url: string | null;
    media_url_2: string | null;
    files: unknown;
    language: string;
    visibility: string;
    author_id: string;
  };
  topics: Topic[];
  initialTopicIds: string[];
  authorUsername: string;
}

export default function EditPostForm({
  post,
  topics,
  initialTopicIds,
  authorUsername,
}: EditPostFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // extract existing images & developer resources
  const { existingImages, existingResources } = useMemo(() => {
    let raw: unknown = post.files;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = null;
      }
    }
    let images: string[] = [];
    const resources: Record<string, string> = {};

    if (Array.isArray(raw)) {
      images = raw.filter((item): item is string => typeof item === "string");
    } else if (raw && typeof raw === "object") {
      const record = raw as Record<string, unknown>;
      if (Array.isArray(record.images)) {
        images = record.images.filter((item): item is string => typeof item === "string");
      }
      if (typeof record.colab_url === "string") resources.colab_url = record.colab_url;
      if (typeof record.github_url === "string") resources.github_url = record.github_url;
      if (typeof record.demo_url === "string") resources.demo_url = record.demo_url;
      if (typeof record.docs_url === "string") resources.docs_url = record.docs_url;
    }
    return { existingImages: images, existingResources: resources };
  }, [post.files]);

  // form state
  const [title, setTitle] = useState(post.title ?? "");
  const [description, setDescription] = useState(post.description ?? "");
  const [bodyHtml, setBodyHtml] = useState(post.body ?? "");
  const [videoUrl, setVideoUrl] = useState(post.media_url ?? "");
  const [language, setLanguage] = useState(post.language ?? "en");
  const [visibility, setVisibility] = useState(post.visibility ?? "public");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopicIds);

  // developer resources
  const [colabUrl, setColabUrl] = useState(existingResources.colab_url ?? "");
  const [githubUrl, setGithubUrl] = useState(existingResources.github_url ?? "");
  const [demoUrl, setDemoUrl] = useState(existingResources.demo_url ?? "");
  const [docsUrl, setDocsUrl] = useState(existingResources.docs_url ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = post.format === "video" ? parseVideoUrl(videoUrl) : null;

  function cleanUrl(u: string): string {
    const trimmed = u.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
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

      let updatedFiles: unknown = null;
      if (existingImages.length > 0) {
        updatedFiles = hasDevResources ? { images: existingImages, ...devResources } : existingImages;
      } else if (hasDevResources) {
        updatedFiles = devResources;
      }

      let updatedMediaUrl = post.media_url;
      let updatedMediaUrl2 = post.media_url_2;
      let updatedBody = post.body;

      if (post.format === "blog") {
        updatedBody = bodyHtml;
      } else if (post.format === "video") {
        if (videoRef) {
          updatedMediaUrl = videoRef.embedUrl;
          updatedMediaUrl2 = videoRef.thumbnailUrl;
        } else {
          updatedMediaUrl = videoUrl.trim() || null;
        }
      }

      // update post record
      const { error: updateErr } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          body: updatedBody,
          media_url: updatedMediaUrl,
          media_url_2: updatedMediaUrl2,
          files: updatedFiles,
          language,
          visibility,
        })
        .eq("id", post.id);

      if (updateErr) throw updateErr;

      // sync post_topics
      await supabase.from("post_topics").delete().eq("post_id", post.id);
      if (selectedTopics.length > 0) {
        await supabase
          .from("post_topics")
          .insert(selectedTopics.map((topic_id) => ({ post_id: post.id, topic_id })));
      }

      router.push(`/post/${post.id}`);
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save changes. Try again.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await supabase.from("post_topics").delete().eq("post_id", post.id);
      await supabase.from("comments").delete().eq("post_id", post.id);
      await supabase.from("likes").delete().eq("post_id", post.id);
      await supabase.from("helped").delete().eq("post_id", post.id);
      await supabase.from("saves").delete().eq("post_id", post.id);

      const { error: delErr } = await supabase.from("posts").delete().eq("id", post.id);
      if (delErr) throw delErr;

      router.push(`/@${authorUsername}`);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete post. Try again.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Top navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/post/${post.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & Return to Post
        </Link>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Format: {post.format}
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Post</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your content, developer learning resources, or post settings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                Title *
              </label>
              <span className="text-xs text-slate-400">{title.length}/120</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Deep Dive into LangGraph Agents"
            />
          </div>

          {/* Short description */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                Short Description
              </label>
              <span className="text-xs text-slate-400">{description.length}/300</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="A brief overview of what learners will get out of this"
            />
          </div>

          {/* Format content */}
          {post.format === "blog" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Blog Article Content
              </label>
              <RichTextEditor
                onChange={setBodyHtml}
                initialContent={post.body ?? ""}
              />
            </div>
          )}

          {post.format === "video" && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Video Link (YouTube / Vimeo)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {videoRef && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                    <MonitorPlay className="h-3.5 w-3.5 text-emerald-600" />
                    Video recognized ({videoRef.provider}) · id: {videoRef.id}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Developer Productivity & Learning Hub */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-4.5 dark:border-emerald-500/20 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                <Terminal className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Developer & Learning Hub (Colab · Code · Demo)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide learners with direct access to interactive notebooks, repositories, and live demos
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Colab */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <ColabIcon className="h-4 w-4" /> Google Colab Notebook
                </label>
                <input
                  type="url"
                  value={colabUrl}
                  onChange={(e) => setColabUrl(e.target.value)}
                  placeholder="https://colab.research.google.com/drive/..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <GithubIcon className="h-4 w-4 text-slate-900 dark:text-white" /> GitHub Repository
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Demo */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Live Demo / Project
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://my-project.vercel.app"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Docs */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Reference Paper / Docs
                </label>
                <input
                  type="url"
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/... or docs link"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-900 dark:text-slate-200">
              Topics ({selectedTopics.length}/4)
            </label>
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
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer " +
                      (on
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "border border-slate-300 bg-white text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")
                    }
                  >
                    {on && <X className="h-3 w-3" />}
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language & Visibility */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="public">Public — visible to everyone</option>
                <option value="private">Private — only visible to me</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60"
            >
              <Trash2 className="h-4 w-4" /> Delete Post
            </button>

            <div className="flex items-center gap-3">
              <Link
                href={`/post/${post.id}`}
                className="cursor-pointer rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving changes…</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Delete this post permanently?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              &quot;{post.title}&quot; and all of its comments, likes, and resources will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Nevermind
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  "Yes, delete post"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
