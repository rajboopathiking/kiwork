import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard, { type PostCardData } from "@/components/post-card";
import { ArrowLeft, Tag } from "lucide-react";

export const metadata = { title: "Topic" };

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let topic: { id: string; name: string; slug: string } | null = null;
  let posts: PostCardData[] = [];
  try {
    const supabase = await createClient();
    const { data: t } = await supabase
      .from("topics")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();
    if (!t) notFound();
    topic = t;

    const { data } = await supabase
      .from("post_topics")
      .select("posts!post_topics_post_id_fkey(id, format, title, description, media_url_2, views, created_at, author_id, visibility, profiles!posts_author_id_fkey(username, avatar_url))")
      .eq("topic_id", topic.id)
      .limit(60);
    posts = ((data ?? [])
      .map((r) => (r as unknown as { posts: PostCardData & { visibility: string } }).posts)
      .filter((p) => p && p.visibility === "public")) as PostCardData[];
  } catch {
    notFound();
  }

  if (!topic) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/explore" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Back to explore
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Tag className="h-4 w-4" />
        </span>
        {topic.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {posts.length} public post{posts.length === 1 ? "" : "s"} tagged &quot;{topic.name}&quot;
      </p>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm text-slate-500">No posts in this topic yet.</p>
          <Link
            href="/upload"
            className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
