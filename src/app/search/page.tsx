import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostCard, { type PostCardData } from "@/components/post-card";
import { Search, Users } from "lucide-react";

export const metadata = { title: "Search" };

interface Person {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const query = q.trim();
  const hasQuery = query.length > 0;

  let posts: PostCardData[] = [];
  let people: Person[] = [];
  let ok = true;

  if (hasQuery) {
    try {
      const supabase = await createClient();
      const types = type === "all" ? ["posts", "people"] : type === "people" ? ["people"] : ["posts"];
      const jobs: Promise<{ posts?: PostCardData[]; people?: Person[] }>[] = [];
      if (types.includes("posts")) {
        jobs.push(
          (async () => {
            const { data } = await supabase
              .from("posts")
              .select("id, format, title, description, media_url_2, views, created_at, author_id, profiles!posts_author_id_fkey(username, avatar_url)")
              .eq("visibility", "public")
              .textSearch("search", query, { type: "websearch" })
              .order("created_at", { ascending: false })
              .limit(24);
            return { posts: (data as unknown as PostCardData[]) ?? [] };
          })()
        );
      }
      if (types.includes("people")) {
        jobs.push(
          (async () => {
            const { data } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url, bio")
              .ilike("username", `%${query}%`)
              .limit(8);
            return { people: (data as unknown as Person[]) ?? [] };
          })()
        );
      }
      const results = await Promise.all(jobs);
      posts = results.flatMap((r) => r.posts ?? []);
      people = results.flatMap((r) => r.people ?? []);
    } catch {
      ok = false;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
        {hasQuery ? `Search: “${query}”` : "Search KIWORK"}
      </h1>

      {/* type switch */}
      {hasQuery && (
        <div className="mt-3 flex gap-2">
          {[
            { key: "all", label: "Everything" },
            { key: "posts", label: "Posts" },
            { key: "people", label: "People" },
          ].map(({ key, label }) => (
            <Link
              key={key}
              href={`/search?q=${encodeURIComponent(query)}&type=${key}`}
              className={
                type === key
                  ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              }
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {!hasQuery && (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <Search className="mb-3 h-10 w-10 text-slate-300" />
          <p className="max-w-md text-sm text-slate-500">
            Type a search above (in the browser URL:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 dark:bg-slate-800">/search?q=recursion</code>) —
            or paste the search box once it&apos;s in the navbar (coming next build).
          </p>
        </div>
      )}

      {hasQuery && !ok && (
        <p className="mt-8 text-sm text-red-600">Search failed — check Supabase connection.</p>
      )}

      {hasQuery && ok && (
        <div className="mt-6 space-y-8">
          {type !== "posts" && people.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Users className="h-4 w-4" /> People
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {people.map((s) => (
                  <Link
                    key={s.id}
                    href={`/@${s.username}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
                  >
                    {s.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.avatar_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                        {(s.full_name ?? s.username).charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{s.full_name ?? s.username}</p>
                      <p className="truncate font-mono text-xs text-emerald-700">@{s.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-500">
                Posts ({posts.length})
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
              No posts matched. Try fewer words.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
