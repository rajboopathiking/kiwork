"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  targetId,
  initialFollowing,
  initialFollowers,
  signedIn,
  self,
  className,
}: {
  targetId: string;
  initialFollowing: boolean;
  initialFollowers: number;
  signedIn: boolean;
  self: boolean;
  className?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);

  if (self) return null;

  async function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      if (following) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("following_id", targetId);
        if (!error) {
          setFollowing(false);
          setFollowers((c) => Math.max(0, c - 1));
        }
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ following_id: targetId });
        if (!error) {
          setFollowing(true);
          setFollowers((c) => c + 1);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        className ??
        "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-50 " +
          (following
            ? "border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            : "bg-emerald-600 text-white hover:bg-emerald-700")
      }
    >
      {following ? "Following" : "Follow"}
      <span className={following ? "text-xs font-normal text-slate-400 dark:text-slate-500" : "text-xs font-normal text-emerald-100"}>
        · {followers}
      </span>
    </button>
  );
}
