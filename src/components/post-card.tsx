import Link from "next/link";
import {
  FileCheck2,
  FileText,
  Headphones,
  ImageIcon,
  MonitorPlay,
} from "lucide-react";

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

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/post/${post.id}`} className="block">
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50">
          {post.media_url_2 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.media_url_2} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon className="h-9 w-9 text-emerald-300" />
          )}
        </div>
        <div className="p-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
          <h3 className="mt-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-emerald-700">
            {post.title}
          </h3>
          {post.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
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
