"use client";

import { useMemo, useState } from "react";
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
}

export default function EngagementBar({ postId, initial, signedIn }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [likes, setLikes] = useState(initial.likes);
  const [helpedCount, setHelpedCount] = useState(initial.helpedCount);
  const [liked, setLiked] = useState(initial.liked);
  const [helped, setHelped] = useState(initial.helped);
  const [saved, setSaved] = useState(initial.saved);
  const [busy, setBusy] = useState(false);

  function requireAuth() {
    if (!signedIn) {
      router.push("/login");
      return true;
    }
    return false;
  }

  async function toggle(
    table: "likes" | "helped" | "saves",
    on: boolean,
    bump: (v: (prev: number) => number) => void
  ) {
    if (requireAuth() || busy) return;
    setBusy(true);
    try {
      if (on) {
        const { error } = await supabase.from(table).delete().eq("post_id", postId);
        if (!error) bump((v) => Math.max(0, v - 1));
      } else {
        const { error } = await supabase.from(table).insert({ post_id: postId });
        if (!error) bump((v) => v + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  const chip =
    "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const off = "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600";
  const onHeart = "border-rose-300 bg-rose-50 text-rose-600";
  const onHelp = "border-emerald-500 bg-emerald-50 text-emerald-700";
  const onSave = "border-amber-300 bg-amber-50 text-amber-700";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`${chip} ${liked ? onHeart : off}`}
        disabled={busy}
        onClick={async () => {
          setLiked(!liked);
          await toggle("likes", liked, setLikes);
        }}
      >
        <Heart className={"h-4 w-4 " + (liked ? "fill-rose-500 text-rose-500" : "")} />
        {likes} like{likes === 1 ? "" : "s"}
      </button>

      <button
        className={`${chip} ${helped ? onHelp : off}`}
        disabled={busy}
        onClick={async () => {
          setHelped(!helped);
          await toggle("helped", helped, setHelpedCount);
        }}
      >
        <CheckCircle2 className="h-4 w-4" />
        {helped ? "This helped you · " : "Helped me · "}
        {helpedCount}
      </button>

      <button
        className={`${chip} ${saved ? onSave : off}`}
        disabled={busy}
        onClick={async () => {
          setSaved(!saved);
          await toggle("saves", saved, () => {});
        }}
      >
        <Bookmark className={"h-4 w-4 " + (saved ? "fill-amber-500 text-amber-500" : "")} />
        {saved ? "Saved" : "Save for later"}
      </button>
    </div>
  );
}
