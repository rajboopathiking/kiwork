import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Bookmark, Compass } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PostCard, { type PostCardData } from "@/components/post-card";

export const metadata: Metadata = {
  title: "Saved Posts",
  description: "Posts you saved to study or reference later on KIWORK.",
};

export default async function SavesPage() {
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/saves");
  }

  let posts: PostCardData[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saves")
      .select(
        "created_at, posts(id, format, title, description, media_url_2, views, created_at, author_id, visibility, files, profiles!posts_author_id_fkey(username, avatar_url))"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading saves:", error);
    }

    posts = ((data ?? [])
      .map((r) => (r as unknown as { posts: PostCardData & { visibility: string } }).posts)
      .filter((p) => p && p.visibility === "public")) as PostCardData[];
  } catch (err) {
    console.error("SavesPage catch error:", err);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <Bookmark className="h-5 w-5 fill-amber-500" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Saved posts</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Posts you bookmarked to learn from later ({posts.length})
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <Bookmark className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No saved posts yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Tap the bookmark button on any post to save it here for quick reference when studying.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Compass className="h-4 w-4" />
            Explore posts
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
