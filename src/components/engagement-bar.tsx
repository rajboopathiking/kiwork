"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, CheckCircle2, Heart } from "lucide-react";

interface Props {
  postId: string;
  initial: {
    likes: number;
    helpedCount: number;
    liked: boolean;
    helped: boolean;
    saved: boolean;
  };
  signedIn: boolean;
  currentUserId?: string | null;
}

export default function EngagementBar({
  postId,
  initial,
  signedIn,
  currentUserId,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [likes, setLikes] = useState(initial.likes);
  const [helpedCount, setHelpedCount] = useState(initial.helpedCount);
  const [liked, setLiked] = useState(initial.liked);
  const [helped, setHelped] = useState(initial.helped);
  const [saved, setSaved] = useState(initial.saved);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLikes(initial.likes);
    setHelpedCount(initial.helpedCount);
    setLiked(initial.liked);
    setHelped(initial.helped);
    setSaved(initial.saved);
  }, [initial.likes, initial.helpedCount, initial.liked, initial.helped, initial.saved]);

  function requireAuth(): boolean {
    if (!signedIn) {
      router.push(`/login?next=/post/${postId}`);
      return true;
    }
    return false;
  }

  async function resolveUserId(): Promise<string | null> {
    if (currentUserId) return currentUserId;
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    } catch {
      return null;
    }
  }

  async function toggle(
    table: "likes" | "helped" | "saves",
    on: boolean,
    bump: (v: (prev: number) => number) => void,
    revert: () => void
  ) {
    if (requireAuth() || busy) return;
    setBusy(true);

    try {
      const uid = await resolveUserId();
      let success = false;

      // 1. Try direct Supabase client with user_id
      if (uid) {
        if (on) {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("post_id", postId)
            .eq("user_id", uid);
          if (!error) {
            success = true;
          }
        } else {
          const { error } = await supabase
            .from(table)
            .insert({ post_id: postId, user_id: uid });
          if (!error || error.code === "23505") {
            success = true;
          }
        }
      }

      // 2. If direct client didn't succeed, use server endpoint
      if (!success) {
        const res = await fetch("/api/post/engage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, target: table, on }),
        });

        if (res.ok) {
          success = true;
        } else {
          console.error(`Engagement API returned ${res.status} for ${table}`);
        }
      }

      if (success) {
        bump((v) => (on ? Math.max(0, v - 1) : v + 1));
      } else {
        revert();
      }
    } catch (err) {
      console.error(`Error toggling ${table}:`, err);
      revert();
    } finally {
      setBusy(false);
    }
  }

  const chip =
    "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition active:scale-95 disabled:opacity-50 select-none shadow-2xs";
  const off =
    "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-750";
  const onHeart =
    "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-300";
  const onHelp =
    "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  const onSave =
    "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Like Button */}
      <button
        type="button"
        className={`${chip} ${liked ? onHeart : off}`}
        disabled={busy}
        onClick={async () => {
          const currentlyLiked = liked;
          setLiked(!currentlyLiked);
          await toggle(
            "likes",
            currentlyLiked,
            setLikes,
            () => setLiked(currentlyLiked)
          );
        }}
        title={liked ? "Unlike this post" : "Like this post"}
      >
        <Heart className={"h-4 w-4 " + (liked ? "fill-rose-500 text-rose-500" : "")} />
        <span>{likes}</span>
        <span>like{likes === 1 ? "" : "s"}</span>
      </button>

      {/* Helped Me Learn Button */}
      <button
        type="button"
        className={`${chip} ${helped ? onHelp : off}`}
        disabled={busy}
        onClick={async () => {
          const currentlyHelped = helped;
          setHelped(!currentlyHelped);
          await toggle(
            "helped",
            currentlyHelped,
            setHelpedCount,
            () => setHelped(currentlyHelped)
          );
        }}
        title={helped ? "Remove helped mark" : "Mark as helped me learn"}
      >
        <CheckCircle2
          className={"h-4 w-4 " + (helped ? "text-emerald-600 dark:text-emerald-400" : "")}
        />
        <span>Helped me learn</span>
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
          {helpedCount}
        </span>
      </button>

      {/* Save For Later Button */}
      <button
        type="button"
        className={`${chip} ${saved ? onSave : off}`}
        disabled={busy}
        onClick={async () => {
          const currentlySaved = saved;
          setSaved(!currentlySaved);
          await toggle(
            "saves",
            currentlySaved,
            () => {},
            () => setSaved(currentlySaved)
          );
        }}
        title={saved ? "Remove from saved" : "Save for later"}
      >
        <Bookmark className={"h-4 w-4 " + (saved ? "fill-amber-500 text-amber-500" : "")} />
        <span>{saved ? "Saved" : "Save for later"}</span>
      </button>
    </div>
  );
}
