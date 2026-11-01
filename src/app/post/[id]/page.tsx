import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { parseVideoUrl } from "@/lib/media";
import EngagementBar from "@/components/engagement-bar";
import CommentSection, { type CommentData } from "@/components/comment-section";
import FollowButton from "@/components/follow-button";
import ShareMenu from "@/components/share-menu";
import ReportButton from "@/components/report-button";
import ImageCarousel from "@/components/image-carousel";
import BlogContent from "@/components/blog-content";
import DeveloperResources, { type DeveloperResourcesData } from "@/components/developer-resources";
import {
  ArrowLeft,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  Headphones,
  ImageIcon,
  Lock,
  MonitorPlay,
  Pencil,
} from "lucide-react";

interface PostFull {
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
  views: number;
  created_at: string;
  author_id: string;
  profiles: { id: string; username: string; full_name: string | null; avatar_url: string | null } | null;
  post_topics: { topics: { id: string; name: string; slug: string }[] } | null;
}

function parsePostFiles(raw: unknown): { images: string[]; devResources: DeveloperResourcesData; videoUrl?: string } {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  if (Array.isArray(parsed)) {
    return {
      images: parsed.filter((item): item is string => typeof item === "string"),
      devResources: {},
    };
  }

  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    const images = Array.isArray(record.images)
      ? record.images.filter((item): item is string => typeof item === "string")
      : [];
    const devResources: DeveloperResourcesData = {
      colab_url: typeof record.colab_url === "string" && record.colab_url.trim() ? record.colab_url.trim() : undefined,
      github_url: typeof record.github_url === "string" && record.github_url.trim() ? record.github_url.trim() : undefined,
      demo_url: typeof record.demo_url === "string" && record.demo_url.trim() ? record.demo_url.trim() : undefined,
      docs_url: typeof record.docs_url === "string" && record.docs_url.trim() ? record.docs_url.trim() : undefined,
    };
    const videoUrl =
      typeof record.video_url === "string" && record.video_url.trim()
        ? record.video_url.trim()
        : undefined;
    return { images, devResources, videoUrl };
  }

  return { images: [], devResources: {} };
}

const fetchPost = cache(async (id: string): Promise<PostFull | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, format, title, description, body, media_url, media_url_2, files, language, visibility, views, created_at, author_id, profiles!posts_author_id_fkey(id, username, full_name, avatar_url), post_topics(topics(id, name, slug))"
      )
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return (data as unknown as PostFull) ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post || post.visibility !== "public") return { title: "Post" };

  const title = post.title;
  const author = post.profiles?.username ?? "learner";
  const ogImage =
    post.media_url_2 ??
    `/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;

  return {
    title: post.title,
    description: post.description ?? `Shared by @${author} on KIWORK`,
    openGraph: {
      title: `${post.title} · KIWORK`,
      description: post.description ?? `Shared by @${author} on KIWORK`,
      images: [ogImage],
    },
    twitter: { images: [ogImage] },
  };
}

const FORMAT_META: Record<string, { icon: typeof FileText; label: string }> = {
  blog: { icon: FileText, label: "Blog" },
  video: { icon: MonitorPlay, label: "Video" },
  audio: { icon: Headphones, label: "Audio" },
  image: { icon: ImageIcon, label: "Images" },
  doc: { icon: FileCheck2, label: "Doc" },
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user: me } = await getCurrentUser();

  const post = await fetchPost(id);

  if (!post) notFound();

  // non-blocking background view increment
  createClient()
    .then((sb) => sb.rpc("increment_views", { p_post_id: id }))
    .catch(() => {});

  const meta = FORMAT_META[post.format] ?? FORMAT_META.blog;
  const Icon = meta.icon;
  const date = new Date(post.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const author = post.profiles;
  const topics = post.post_topics?.topics ?? [];
  const { images, devResources, videoUrl: extraVideoUrl } = parsePostFiles(post.files);
  const activeVideoUrl =
    post.format === "video" && post.media_url ? post.media_url : extraVideoUrl;
  const activeImages =
    images.length > 0
      ? images
      : post.format === "image" && post.media_url
      ? [post.media_url]
      : [];

  // engagement state (server-computed, client toggles the rest)
  let engagement = { likes: 0, helpedCount: 0, liked: false, helped: false, saved: false };
  let comments: CommentData[] = [];
  let followers = 0;
  let followingAuthor = false;
  try {
    const supabase = await createClient();
    const results = await Promise.allSettled([
      supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", id),
      supabase.from("helped").select("*", { count: "exact", head: true }).eq("post_id", id),
      me ? supabase.from("saves").select("user_id").eq("post_id", id).eq("user_id", me.id).maybeSingle() : Promise.resolve(null),
      me ? supabase.from("likes").select("user_id").eq("post_id", id).eq("user_id", me.id).maybeSingle() : Promise.resolve(null),
      me ? supabase.from("helped").select("user_id").eq("post_id", id).eq("user_id", me.id).maybeSingle() : Promise.resolve(null),
      supabase
        .from("comments")
        .select("id, body, created_at, author_id, profiles(username, full_name, avatar_url)")
        .eq("post_id", id)
        .order("created_at", { ascending: true }),
      author
        ? supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", author.id)
        : Promise.resolve(null),
      author && me
        ? supabase.from("follows").select("follower_id").eq("following_id", author.id).eq("follower_id", me.id).maybeSingle()
        : Promise.resolve(null),
    ]);

    const likesC = results[0].status === "fulfilled" ? results[0].value : null;
    const helpedC = results[1].status === "fulfilled" ? results[1].value : null;
    const saveRow = results[2].status === "fulfilled" ? results[2].value : null;
    const likeRow = results[3].status === "fulfilled" ? results[3].value : null;
    const helpRow = results[4].status === "fulfilled" ? results[4].value : null;
    const commentsRows = results[5].status === "fulfilled" ? results[5].value : null;
    const followersC = results[6].status === "fulfilled" ? results[6].value : null;
    const followRow = results[7].status === "fulfilled" ? results[7].value : null;

    engagement = {
      likes: likesC?.count ?? 0,
      helpedCount: helpedC?.count ?? 0,
      liked: !!((likeRow as unknown as { data: unknown })?.data),
      helped: !!((helpRow as unknown as { data: unknown })?.data),
      saved: !!((saveRow as unknown as { data: unknown })?.data),
    };
    comments = (commentsRows?.data as unknown as CommentData[]) ?? [];
    followers = followersC?.count ?? 0;
    followingAuthor = !!((followRow as unknown as { data: unknown })?.data);
  } catch (err) {
    console.error("Post engagement load error:", err);
  }

  const isAuthor = me?.id === post.author_id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* breadcrumb & edit action */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to explore
        </Link>

        {isAuthor && (
          <Link
            href={`/post/${post.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit post</span>
          </Link>
        )}
      </div>

      {/* Author Controls Banner */}
      {isAuthor && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500/20 dark:bg-emerald-950/40 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Pencil className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                You published this post
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update content, attached diagrams, Google Colab notebook, GitHub repo, or post settings.
              </p>
            </div>
          </div>
          <Link
            href={`/post/${post.id}/edit`}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Post</span>
          </Link>
        </div>
      )}

      {/* header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          <Icon className="h-3 w-3" /> {meta.label}
        </span>
        {topics.map((t) => (
          <Link
            key={t.id}
            href={`/topic/${t.slug}`}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-400"
          >
            {t.name}
          </Link>
        ))}
      </div>

      <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{post.title}</h1>

      {post.description && (
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{post.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {author && (
          <Link href={`/@${author.username}`} className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-700">
            {author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                {(author.full_name ?? author.username).charAt(0).toUpperCase()}
              </span>
            )}
            @{author.username}
          </Link>
        )}
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {post.views + 1} learners reached
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          title={post.visibility === "private" ? "Private post (only author can see)" : "Public post (shared with community)"}
        >
          {post.visibility === "private" ? (
            <>
              <Lock className="h-3 w-3 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">Private</span>
            </>
          ) : (
            <>
              <Globe className="h-3 w-3 text-emerald-500" />
              <span>Public</span>
            </>
          )}
        </span>
        {post.language !== "en" && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase dark:bg-slate-800 dark:text-slate-300">{post.language}</span>
        )}
      </div>

      <hr className="my-6 border-slate-200" />

      {/* Developer productivity & learning resources */}
      <DeveloperResources resources={devResources} postTitle={post.title} />

      {/* content per format & multi-combination support */}
      <div className="space-y-6">
        {/* Video Player (Primary video post or attached video walkthrough) */}
        {activeVideoUrl && (
          <div>
            <VideoBlock url={activeVideoUrl} />
          </div>
        )}

        {/* Audio Player */}
        {post.format === "audio" && post.media_url && (
          <div>
            <AudioBlock url={post.media_url} />
          </div>
        )}

        {/* Document Viewer */}
        {post.format === "doc" && post.media_url && (
          <DocBlock url={post.media_url} title={post.title} />
        )}

        {/* Architecture Diagrams & Screenshots Carousel */}
        {activeImages.length > 0 && (
          <div>
            {(activeVideoUrl || post.body) && (
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>Architecture Diagrams &amp; Screenshots ({activeImages.length})</span>
              </div>
            )}
            <ImageCarousel urls={activeImages} title={post.title} />
          </div>
        )}

        {/* Rich Text Article & Code Walkthrough */}
        {post.body && (
          <div className="mt-4">
            <BlogContent html={post.body} />
          </div>
        )}
      </div>

      {/* community actions */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <EngagementBar
          postId={post.id}
          initial={engagement}
          signedIn={!!me}
          currentUserId={me?.id ?? null}
        />
        <ShareMenu title={post.title} path={`/post/${post.id}`} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        {isAuthor ? (
          <Link
            href={`/post/${post.id}/edit`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit this post
          </Link>
        ) : (
          <ReportButton postId={post.id} postTitle={post.title} signedIn={!!me} />
        )}
        {author && (
          <FollowButton
            targetId={author.id}
            initialFollowing={followingAuthor}
            initialFollowers={followers}
            signedIn={!!me}
            self={isAuthor}
          />
        )}
      </div>

      <CommentSection postId={post.id} initialComments={comments} currentUserId={me?.id ?? null} />
    </div>
  );
}

function VideoBlock({ url }: { url: string }) {
  const ref = parseVideoUrl(url);
  if (!url) return <Notice text="This post has no video link." />;
  if (ref) {
    const ytIdx = ref.embedUrl.indexOf("?");
    const base = ref.embedUrl;
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={ytIdx === -1 ? base + "?rel=0" : base + "&rel=0"}
          title="Video player"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <Notice text="This video link couldn't be parsed." />;
}

function AudioBlock({ url }: { url: string }) {
  if (!url) return <Notice text="This post has no audio file." />;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
        <Headphones className="h-5 w-5 text-emerald-600" />
        Listen to this recording
      </div>
      <audio controls className="w-full" src={url} />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Open / download audio ↗
      </a>
    </div>
  );
}


function DocBlock({ url, title }: { url: string; title: string }) {
  if (!url) return <Notice text="This post has no document file." />;
  const isPdf = url.toLowerCase().endsWith(".pdf");
  const encoded = encodeURIComponent(url);

  return (
    <div>
      {isPdf ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <iframe src={`${url}#page=1`} title={title} className="h-[520px] w-full bg-white" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <FileCheck2 className="h-10 w-10 text-emerald-600" />
          <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500">
            Slides / Word document — download to view, or preview inline:
          </p>
          <div className="flex gap-3">
            <a
              href={`https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Preview here ↗
            </a>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-700">
      {text}
    </div>
  );
}
