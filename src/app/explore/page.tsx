import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostCard, { type PostCardData } from "@/components/post-card";
import { Inbox, Lightbulb, PlusCircle } from "lucide-react";

const FORMATS = [
  { value: "all", label: "All Formats" },
  { value: "blog", label: "Blogs" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Images & Notes" },
  { value: "doc", label: "Docs & Slides" },
] as const;

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
      .select(
        "id, format, title, description, media_url_2, views, created_at, author_id, visibility, files, profiles!posts_author_id_fkey(username, avatar_url)"
      )
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(60);

    if (format !== "all") {
      query = query.eq("format", format);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Explore fetch error:", error);
      dbError = true;
    } else {
      posts = (data as unknown as PostCardData[]) ?? [];
    }
  } catch {
    dbError = true;
    posts = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-3.5 sm:px-4 py-6 sm:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Explore posts
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            What learners studied and shared this week
          </p>
        </div>
        <Link
          href="/upload"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Share what you learned</span>
        </Link>
      </div>

      {/* Format chips with smooth horizontal swipe on mobile */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FORMATS.map(({ value, label }) => {
          const active = format === value;
          return (
            <Link
              key={value}
              href={value === "all" ? "/explore" : `/explore?format=${value}`}
              className={
                active
                  ? "shrink-0 rounded-full bg-slate-900 px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-xs dark:bg-emerald-600"
                  : "shrink-0 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
            <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

function EmptyFeed({ format }: { format: string }) {
  return (
    <div className="mt-12 sm:mt-16 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 sm:py-16 text-center dark:border-slate-700 dark:bg-slate-900">
      <Inbox className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Nothing here yet — be the first!
      </h2>
      <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        {format === "all"
          ? "The feed is empty because no one has shared yet. Your notes could help someone tonight."
          : "No posts in this format yet. Got something you studied to share?"}
      </p>
      <Link
        href="/upload"
        className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
      >
        Upload now
      </Link>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mt-12 sm:mt-16 flex flex-col items-center rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
      <Lightbulb className="mb-3 h-8 w-8 text-amber-500" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Connect Supabase to bring the feed alive
      </h2>
      <div className="mt-3 max-w-lg text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Create a free project at supabase.com</li>
          <li>
            Run <code className="rounded bg-white px-1 dark:bg-slate-800">supabase/schema.sql</code> in the SQL editor
          </li>
          <li>
            Paste your project URL + anon key into <code className="rounded bg-white px-1 dark:bg-slate-800">.env.local</code>
          </li>
          <li>Restart: <code className="rounded bg-white px-1 dark:bg-slate-800">npm run dev</code></li>
        </ol>
      </div>
    </div>
  );
}
