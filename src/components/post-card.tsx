import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Globe,
  Headphones,
  ImageIcon,
  Lock,
  MonitorPlay,
} from "lucide-react";
import { ColabIcon, GithubIcon } from "./brand-icons";

export const FORMAT_META: Record<string, { icon: typeof FileText; label: string }> = {
  blog: { icon: FileText, label: "Blog" },
  video: { icon: MonitorPlay, label: "Video" },
  audio: { icon: Headphones, label: "Audio" },
  image: { icon: ImageIcon, label: "Images" },
  doc: { icon: FileCheck2, label: "Doc" },
};

export interface PostCardData {
  id: string;
  format: string;
  title: string;
  description: string | null;
  media_url_2: string | null;
  views: number;
  created_at: string;
  author_id: string;
  visibility?: string;
  files?: unknown;
  profiles: { username: string; avatar_url: string | null } | null;
}

export default function PostCard({ post }: { post: PostCardData }) {
  const meta = FORMAT_META[post.format] ?? FORMAT_META.blog;
  const Icon = meta.icon;
  const authorName = post.profiles?.username ?? "unknown";
  const date = new Date(post.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const isPrivate = post.visibility === "private";

  let hasColab = false;
  let hasGithub = false;
  let hasDemo = false;

  if (post.files) {
    let f: any = post.files;
    if (typeof f === "string") {
      try {
        f = JSON.parse(f);
      } catch {
        f = null;
      }
    }
    if (f && typeof f === "object" && !Array.isArray(f)) {
      hasColab = Boolean(f.colab_url);
      hasGithub = Boolean(f.github_url);
      hasDemo = Boolean(f.demo_url);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <Link href={`/post/${post.id}`} className="block">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-slate-800 dark:to-slate-800/40">
          {post.media_url_2 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.media_url_2}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <Icon className="h-9 w-9 text-emerald-300/60" />
          )}

          {/* Visibility badge positioned on preview */}
          <div className="absolute right-2 top-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                isPrivate
                  ? "bg-amber-900/80 text-amber-200 border border-amber-700/50"
                  : "bg-slate-900/60 text-slate-100 border border-white/10"
              }`}
              title={isPrivate ? "Private post" : "Public post"}
            >
              {isPrivate ? (
                <>
                  <Lock className="h-2.5 w-2.5 text-amber-400" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe className="h-2.5 w-2.5 text-emerald-400" />
                  <span>Public</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            {hasColab && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                <ColabIcon className="h-3 w-3" /> Colab
              </span>
            )}
            {hasGithub && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <GithubIcon className="h-3 w-3" /> Code
              </span>
            )}
            {hasDemo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Globe className="h-2.5 w-2.5" /> Demo
              </span>
            )}
          </div>

          <h3 className="mt-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
            {post.title}
          </h3>

          {post.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {post.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>@{authorName}</span>
            <span>·</span>
            <span>{date}</span>
            <span>·</span>
            <span>{post.views} views</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
