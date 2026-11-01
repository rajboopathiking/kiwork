import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { type PostCardData } from "@/components/post-card";
import ProfilePostsView from "@/components/profile-posts-view";
import FollowButton from "@/components/follow-button";
import ShareMenu from "@/components/share-menu";
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { Bookmark, ExternalLink, Globe, Lock, Pencil } from "lucide-react";

interface CustomLink {
  key: string;
  url: string;
}

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
    custom?: CustomLink[];
  } | null;
}

const fetchProfile = cache(async (username: string): Promise<ProfileFull | null> => {
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
});

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

function isPlaceholderSocial(raw?: string): boolean {
  if (!raw || typeof raw !== "string") return true;
  const val = raw.trim().toLowerCase();
  if (!val || val === "null" || val === "undefined") return true;

  if (
    val === "username" ||
    val === "@username" ||
    val === "@channel" ||
    val === "channel" ||
    val.endsWith("/username") ||
    val.endsWith("/username/") ||
    val.endsWith("/@channel") ||
    val.endsWith("/@channel/") ||
    val.includes("yourportfolio.com") ||
    val.includes("example.com") ||
    val.includes("myportfolio.com") ||
    val === "https://github.com" ||
    val === "https://github.com/" ||
    val === "https://linkedin.com" ||
    val === "https://linkedin.com/" ||
    val === "https://linkedin.com/in" ||
    val === "https://linkedin.com/in/" ||
    val === "https://instagram.com" ||
    val === "https://instagram.com/" ||
    val === "https://facebook.com" ||
    val === "https://facebook.com/" ||
    val === "https://x.com" ||
    val === "https://x.com/" ||
    val === "https://twitter.com" ||
    val === "https://twitter.com/" ||
    val === "https://youtube.com" ||
    val === "https://youtube.com/"
  ) {
    return true;
  }
  return false;
}

function normalizeSocialUrl(val?: string, defaultHost?: string): string | null {
  if (isPlaceholderSocial(val)) return null;
  const trimmed = val!.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (defaultHost && !trimmed.includes(".")) {
    return `https://${defaultHost}/${trimmed.replace(/^@/, "")}`;
  }
  return `https://${trimmed.replace(/^@/, "")}`;
}

export default async function PortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string; category?: string }>;
}) {
  const { username: raw } = await params;
  const { tab = "posts", category = "all" } = await searchParams;
  const username = decodeURIComponent(raw).replace(/^@/, "");
  if (!username) notFound();

  const { user: me } = await getCurrentUser();

  const profile = await fetchProfile(username);
  if (!profile) notFound();

  let posts: PostCardData[] = [];
  let savedPosts: PostCardData[] = [];
  let stats = { posts: 0, helped: 0, followers: 0 };
  let following = false;
  const isSelf = me?.id === profile.id;

  try {
    const supabase = await createClient();
    const results = await Promise.allSettled([
      // For author viewing their own profile: fetch both public and private posts with topics.
      // For visitors: fetch only public posts with topics.
      isSelf
        ? supabase
            .from("posts")
            .select("id, format, title, description, media_url_2, views, created_at, author_id, visibility, files, profiles!posts_author_id_fkey(username, avatar_url), post_topics(topics(id, name, slug))")
            .eq("author_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(100)
        : supabase
            .from("posts")
            .select("id, format, title, description, media_url_2, views, created_at, author_id, visibility, files, profiles!posts_author_id_fkey(username, avatar_url), post_topics(topics(id, name, slug))")
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
        .select("posts!inner(author_id)", { count: "exact", head: true })
        .eq("posts.author_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      isSelf
        ? Promise.resolve(null)
        : me
          ? supabase
              .from("follows")
              .select("follower_id")
              .eq("following_id", profile.id)
              .eq("follower_id", me.id)
              .maybeSingle()
          : Promise.resolve(null),
      isSelf
        ? supabase
            .from("saves")
            .select("posts(id, format, title, description, media_url_2, views, created_at, author_id, visibility, files, profiles!posts_author_id_fkey(username, avatar_url), post_topics(topics(id, name, slug)))")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
        : Promise.resolve(null),
    ]);

    const postsData = results[0].status === "fulfilled" ? results[0].value : null;
    const postsCnt = results[1].status === "fulfilled" ? results[1].value : null;
    const helpedC = results[2].status === "fulfilled" ? results[2].value : null;
    const followersC = results[3].status === "fulfilled" ? results[3].value : null;
    const followRow = results[4].status === "fulfilled" ? results[4].value : null;
    const savesData = results[5].status === "fulfilled" ? results[5].value : null;

    posts = (postsData?.data as unknown as PostCardData[]) ?? [];
    stats = {
      posts: postsCnt?.count ?? (isSelf ? posts.filter((p) => p.visibility !== "private").length : posts.length),
      helped: helpedC?.count ?? 0,
      followers: followersC?.count ?? 0,
    };
    following = !!((followRow as unknown as { data: unknown })?.data);

    if (savesData?.data) {
      savedPosts = (savesData.data as any[])
        .map((r) => r.posts)
        .filter((p): p is PostCardData => Boolean(p && p.id));
    }
  } catch (err) {
    console.error("Profile page data fetch error:", err);
  }

  function authorIsMe(targetId: string, myId?: string) {
    return Boolean(myId && targetId === myId);
  }

  const links = profile.links ?? {};
  const customLinks = Array.isArray(links.custom)
    ? links.custom.filter(
        (c) =>
          c &&
          typeof c.key === "string" &&
          c.key.trim() &&
          typeof c.url === "string" &&
          !isPlaceholderSocial(c.url)
      )
    : [];

  const publicPosts = isSelf ? posts.filter((p) => p.visibility !== "private") : posts;
  const privatePosts = isSelf ? posts.filter((p) => p.visibility === "private") : [];

  const isSavedTab = tab === "saved" && isSelf;
  const isPrivateTab = tab === "private" && isSelf;

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

            {/* Social accounts & Custom links */}
            {(() => {
              const socialItems = [
                { key: "github", href: normalizeSocialUrl(links.github, "github.com"), icon: GithubIcon, label: "GitHub", hover: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" },
                { key: "linkedin", href: normalizeSocialUrl(links.linkedin, "linkedin.com/in"), icon: LinkedinIcon, label: "LinkedIn", hover: "hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50 dark:hover:text-sky-400" },
                { key: "instagram", href: normalizeSocialUrl(links.instagram, "instagram.com"), icon: InstagramIcon, label: "Instagram", hover: "hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/50 dark:hover:text-pink-400" },
                { key: "facebook", href: normalizeSocialUrl(links.facebook, "facebook.com"), icon: FacebookIcon, label: "Facebook", hover: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400" },
                { key: "twitter", href: normalizeSocialUrl(links.twitter, "x.com"), icon: TwitterIcon, label: "X / Twitter", hover: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" },
                { key: "youtube", href: normalizeSocialUrl(links.youtube, "youtube.com"), icon: YoutubeIcon, label: "YouTube", hover: "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400" },
                { key: "website", href: normalizeSocialUrl(links.website), icon: Globe, label: "Website", hover: "hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400" },
              ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

              if (socialItems.length === 0 && customLinks.length === 0) return null;

              return (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {socialItems.map(({ key, href, icon: Icon, label, hover }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition ${hover} dark:text-slate-400`}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}

                  {/* Custom portfolio and developer links */}
                  {customLinks.map((cl, i) => (
                    <a
                      key={i}
                      href={normalizeSocialUrl(cl.url) ?? cl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-500 hover:text-emerald-700 hover:shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
                    >
                      <Globe className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{cl.key}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSelf ? (
              <>
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" /> Edit profile
                </Link>

                {/* Private Files & Posts Shortcut */}
                <Link
                  href={`/@${profile.username}?tab=private`}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isPrivateTab
                      ? "border-amber-600 bg-amber-500 text-white shadow-xs"
                      : "border-slate-300 text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                  title="View your private files and posts"
                >
                  <Lock className={`h-4 w-4 ${isPrivateTab ? "text-white" : "text-amber-500"}`} />
                  <span>Private</span>
                  {privatePosts.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isPrivateTab
                          ? "bg-white text-amber-900"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {privatePosts.length}
                    </span>
                  )}
                </Link>

                {/* Saved Posts Icon / Shortcut */}
                <Link
                  href={`/@${profile.username}?tab=saved`}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isSavedTab
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-slate-300 text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                  title="View your saved posts"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Saved</span>
                  {savedPosts.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isSavedTab
                          ? "bg-white text-emerald-800"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {savedPosts.length}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <FollowButton
                targetId={profile.id}
                initialFollowing={following}
                initialFollowers={stats.followers}
                signedIn={!!me}
                self={false}
              />
            )}
            <ShareMenu
              title={`${profile.full_name ?? profile.username}'s Learning Portfolio`}
              path={`/@${profile.username}`}
              label="Share"
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

      <ProfilePostsView
        username={profile.username}
        isSelf={isSelf}
        initialTab={tab}
        initialCategory={category}
        publicPosts={publicPosts}
        privatePosts={privatePosts}
        savedPosts={savedPosts}
      />
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
