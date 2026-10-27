import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import PostCard, { type PostCardData } from "@/components/post-card";
import FollowButton from "@/components/follow-button";
import ShareRow from "@/components/share-row";
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { Globe, Pencil } from "lucide-react";

interface ProfileFull {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  } | null;
}

async function fetchProfile(username: string): Promise<ProfileFull | null> {
  try {
    const supabase = await createClient();
    const { data: p, error: pErr } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio, links")
      .eq("username", username)
      .single();
    if (pErr || !p) return null;
    return (p as unknown as ProfileFull) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw).replace(/^@/, "");
  if (!username) return { title: "Portfolio" };

  const profile = await fetchProfile(username);
  if (!profile) return { title: "Portfolio" };

  const name = profile.full_name ?? `@${profile.username}`;
  const title = `${name}'s Learning Portfolio`;
  const description =
    profile.bio ??
    `See what @${profile.username} learned and shared on KIWORK — video, audio, slides, notes & blogs.`;
  const ogImage = `/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(profile.username)}`;

  return {
    title: `${name} (@${profile.username})`,
    description,
    openGraph: {
      title: `${name} (@${profile.username}) · KIWORK`,
      description,
      images: [ogImage],
    },
    twitter: { images: [ogImage] },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw).replace(/^@/, "");
  if (!username) notFound();

  const { user: me } = await getCurrentUser();

  const profile = await fetchProfile(username);
  if (!profile) notFound();

  let posts: PostCardData[] = [];
  let stats = { posts: 0, helped: 0, followers: 0 };
  let following = false;

  try {
    const supabase = await createClient();
    const [postsData, postsCnt, helpedC, followersC, followRow] = await Promise.all([
      supabase
        .from("posts")
        .select("id, format, title, description, media_url_2, views, created_at, author_id, profiles!posts_author_id_fkey(username, avatar_url)")
        .eq("visibility", "public")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(60),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("visibility", "public")
        .eq("author_id", profile.id),
      supabase
        .from("helped")
        .select("posts!helped_post_id_fkey(author_id)", { count: "exact", head: true })
        .eq("posts.author_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      me
        ? supabase
            .from("follows")
            .select("follower_id")
            .eq("following_id", profile.id)
            .eq("follower_id", me.id)
            .maybeSingle()
        : Promise.resolve(null),
    ]);

    posts = (postsData.data as unknown as PostCardData[]) ?? [];
    stats = {
      posts: postsCnt?.count ?? posts.length,
      helped: helpedC?.count ?? 0,
      followers: followersC?.count ?? 0,
    };
    following = !!((followRow as unknown as { data: unknown })?.data);
  } catch {
    // Supabase query failed or env missing
  }

  const links = profile.links ?? {};
  const isSelf = me?.id === profile.id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800" />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-3xl font-bold text-white">
              {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
            </span>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {profile.full_name ?? profile.username}
            </h1>
            <p className="font-mono text-sm text-emerald-700 dark:text-emerald-400">@{profile.username} · kiwork</p>
            {profile.bio && <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {links.github && (
                <a href={links.github} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" title="GitHub">
                  <GithubIcon className="h-4 w-4" />
                </a>
              )}
              {links.linkedin && (
                <a href={links.linkedin} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 dark:text-slate-400 dark:hover:bg-sky-950/50 dark:hover:text-sky-400" title="LinkedIn">
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
              {links.instagram && (
                <a href={links.instagram} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-pink-50 hover:text-pink-600 dark:text-slate-400 dark:hover:bg-pink-950/50 dark:hover:text-pink-400" title="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {links.facebook && (
                <a href={links.facebook} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-400" title="Facebook">
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {links.twitter && (
                <a href={links.twitter} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" title="X / Twitter">
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {links.youtube && (
                <a href={links.youtube} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400" title="YouTube">
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              )}
              {links.website && (
                <a href={links.website} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400" title="Website / Portfolio">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSelf ? (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" /> Edit profile
              </Link>
            ) : (
              <FollowButton
                targetId={profile.id}
                initialFollowing={following}
                initialFollowers={stats.followers}
                signedIn={!!me}
                self={false}
              />
            )}
            <ShareRow
              title={`${profile.full_name ?? profile.username}'s Learning Portfolio`}
              path={`/@${profile.username}`}
            />
          </div>
        </div>

        {/* stats */}
        <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
          <Stat label="Shares" value={stats.posts} />
          <Stat label="Learners helped" value={stats.helped} highlight />
          <Stat label="Followers" value={stats.followers} />
        </div>
      </div>

      {/* posts */}
      <h2 className="mt-10 text-lg font-semibold text-slate-900 dark:text-white">
        What {isSelf ? "you" : "they"} learned & shared
      </h2>
      {posts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isSelf
              ? "Nothing shared yet — your first post becomes portfolio evidence."
              : "This learner hasn't shared publicly yet."}
          </p>
          {isSelf && (
            <Link
              href="/upload"
              className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Share what you learned
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={
        "rounded-2xl px-4 py-3 text-center " +
        (highlight
          ? "bg-emerald-600 text-white"
          : "bg-white ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700")
      }
    >
      <p className={"text-xl font-bold " + (highlight ? "text-white" : "text-slate-900 dark:text-white")}>{value}</p>
      <p className={"text-[11px] font-medium " + (highlight ? "text-emerald-100" : "text-slate-500 dark:text-slate-400")}>{label}</p>
    </div>
  );
}
