import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PostCardData } from "@/lib/types";
import {
  FileCheck2,
  FileText,
  Headphones,
  ImageIcon,
  Inbox,
  Lightbulb,
  MonitorPlay,
  PlusCircle,
} from "lucide-react";

const FORMATS = [
  { value: "all", label: "All" },
  { value: "blog", label: "Blogs" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Images" },
  { value: "doc", label: "Docs" },
] as const;

const FORMAT_META: Record<string, { icon: typeof FileText; label: string }> = {
  blog: { icon: FileText, label: "Blog" },
  video: { icon: MonitorPlay, label: "Video" },
  audio: { icon: Headphones, label: "Audio" },
  image: { icon: ImageIcon, label: "Images" },
  doc: { icon: FileCheck2, label: "Doc" },
};

export const metadata = { title: "Explore" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  const { format = "all" } = await searchParams;

  let posts: PostCardData[] | null = null;
  let dbError = false;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("id, format, title, description, media_url_2, views, created_at, author_id, profiles(username, avatar_url)")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(24);
    if (format !== "all") {
      query = query.eq("format", format);
    }
    const { data, error } = await query;
    if (error) throw error;
    posts = (data as unknown as PostCardData[]) ?? [];
  } catch {
    dbError = true;
    posts = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Explore posts</h1>
          <p className="mt-1 text-sm text-slate-500">
            What learners shared this week
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" />
          Share what you learned
        </Link>
      </div>

      {/* Format chips */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {FORMATS.map(({ value, label }) => {
          const active = format === value;
          return (
            <Link
              key={value}
              href={value === "all" ? "/explore" : `/explore?format=${value}`}
              className={
                active
                  ? "shrink-0 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white"
                  : "shrink-0 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* States */}
      {dbError ? (
        <SetupNotice />
      ) : posts && posts.length === 0 ? (
        <EmptyFeed format={format} />
      ) : (
        <>
          {posts && posts.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PostCard({ post }: { post: PostCardData }) {
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
            <img
              src={post.media_url_2}
              alt=""
              className="h-full w-full object-cover"
            />
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
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {post.description}
            </p>
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

function EmptyFeed({ format }: { format: string }) {
  return (
    <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <Inbox className="mb-4 h-10 w-10 text-slate-300" />
      <h2 className="text-lg font-semibold text-slate-900">
        Nothing here yet — be the first!
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {format === "all"
          ? "The feed is empty because no one has shared yet. Your notes could help someone tonight."
          : "No posts of this format yet. Got something to share in this format?"}
      </p>
      <Link
        href="/upload"
        className="mt-5 flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        <PlusCircle className="h-4 w-4" />
        Create the first post
      </Link>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mt-16 flex flex-col items-center rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
      <Lightbulb className="mb-3 h-8 w-8 text-amber-500" />
      <h2 className="text-lg font-semibold text-slate-900">
        Connect Supabase to bring the feed alive
      </h2>
      <div className="mt-3 max-w-lg text-left text-sm text-slate-600">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Create a free project at supabase.com</li>
          <li>
            Run <code className="rounded bg-white px-1">supabase/schema.sql</code> in
            the SQL editor
          </li>
          <li>
            Paste your project URL + anon key into <code className="rounded bg-white px-1">.env.local</code>
          </li>
          <li>Restart: <code className="rounded bg-white px-1">npm run dev</code></li>
        </ol>
      </div>
    </div>
  );
}
