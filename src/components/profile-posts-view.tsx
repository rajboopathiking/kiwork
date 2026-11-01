"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, LayoutGrid, Lock, PlusCircle, Tag } from "lucide-react";
import PostCard, { type PostCardData } from "@/components/post-card";

interface ProfilePostsViewProps {
  username: string;
  isSelf: boolean;
  initialTab?: string;
  initialCategory?: string;
  publicPosts: PostCardData[];
  privatePosts: PostCardData[];
  savedPosts: PostCardData[];
}

export default function ProfilePostsView({
  username,
  isSelf,
  initialTab = "posts",
  initialCategory = "all",
  publicPosts,
  privatePosts,
  savedPosts,
}: ProfilePostsViewProps) {
  const [tab, setTab] = useState<string>(initialTab);
  const [category, setCategory] = useState<string>(initialCategory);
  const [, startTransition] = useTransition();

  const isSavedTab = tab === "saved" && isSelf;
  const isPrivateTab = tab === "private" && isSelf;
  const currentTabPosts = isSavedTab ? savedPosts : isPrivateTab ? privatePosts : publicPosts;

  // Extract all categories / topics present in the current tab's posts
  const userCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string; count: number }>();
    for (const p of currentTabPosts) {
      if (Array.isArray(p.post_topics)) {
        for (const pt of p.post_topics) {
          if (pt?.topics) {
            const t = pt.topics;
            const curr = map.get(t.slug);
            if (curr) {
              curr.count++;
            } else {
              map.set(t.slug, { ...t, count: 1 });
            }
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [currentTabPosts]);

  // Filter posts based on active category
  const displayedPosts = useMemo(() => {
    if (category === "all") return currentTabPosts;
    return currentTabPosts.filter(
      (p) =>
        Array.isArray(p.post_topics) &&
        p.post_topics.some((pt) => pt?.topics?.slug === category)
    );
  }, [category, currentTabPosts]);

  function switchTab(newTab: string) {
    startTransition(() => {
      setTab(newTab);
      setCategory("all");
      const url =
        newTab === "posts"
          ? `/@${username}`
          : `/@${username}?tab=${newTab}`;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", url);
      }
    });
  }

  function switchCategory(newCat: string) {
    startTransition(() => {
      setCategory(newCat);
      const params = new URLSearchParams();
      if (tab !== "posts") params.set("tab", tab);
      if (newCat !== "all") params.set("category", newCat);
      const query = params.toString();
      const url = `/@${username}${query ? `?${query}` : ""}`;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", url);
      }
    });
  }

  return (
    <div>
      {/* Tabs navigation for published vs private vs saved */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => switchTab("posts")}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            !isSavedTab && !isPrivateTab
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Published ({publicPosts.length})</span>
        </button>

        {isSelf && (
          <button
            type="button"
            onClick={() => switchTab("private")}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              isPrivateTab
                ? "bg-amber-600 text-white shadow-2xs dark:bg-amber-500"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Lock className={`h-4 w-4 ${isPrivateTab ? "text-white" : "text-amber-500"}`} />
            <span>Private Files &amp; Posts ({privatePosts.length})</span>
          </button>
        )}

        {isSelf && (
          <button
            type="button"
            onClick={() => switchTab("saved")}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              isSavedTab
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Bookmark className="h-4 w-4 text-emerald-500" />
            <span>Saved Posts ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Posts Section */}
      <div className="mt-4">
        {/* Category & Topic Filter Bar for Organizing */}
        {userCategories.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Categories:
            </span>
            <button
              type="button"
              onClick={() => switchCategory("all")}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === "all"
                  ? "bg-slate-900 text-white dark:bg-emerald-600 shadow-2xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All Topics ({currentTabPosts.length})
            </button>
            {userCategories.map((cat) => {
              const active = category === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => switchCategory(cat.slug)}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <Tag className="h-3 w-3 opacity-60" />
                  <span>{cat.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? "bg-white/20 text-white font-bold"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {displayedPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            {category !== "all" ? (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No posts tagged with this category in this tab.
                </p>
                <button
                  type="button"
                  onClick={() => switchCategory("all")}
                  className="mt-4 inline-flex cursor-pointer rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  View all categories
                </button>
              </div>
            ) : isPrivateTab ? (
              <div className="py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  No private files or posts yet
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  When sharing what you learned (documents, images, audio, video, or notes), select{" "}
                  <strong>Private — only me</strong> to keep your drafts, study files, and notes completely private to you.
                </p>
                <Link
                  href="/upload"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Upload a private file / post</span>
                </Link>
              </div>
            ) : isSavedTab ? (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You haven&apos;t saved any posts yet. Click the bookmark icon on any post in Explore to save it here.
                </p>
                <Link
                  href="/explore"
                  className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Explore Posts to Save
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isSelf
                    ? "Nothing shared publicly yet — your first post becomes portfolio evidence."
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
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                canEdit={!isSavedTab && isSelf}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
