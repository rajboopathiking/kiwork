"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send, Trash2 } from "lucide-react";

export interface CommentData {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { username: string; full_name: string | null; avatar_url: string | null } | null;
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: {
  postId: string;
  initialComments: CommentData[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [comments] = useState(initialComments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: currentUserId,
        body,
      });
      if (error) throw error;
      setText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment.");
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    setSending(true);
    try {
      await supabase.from("comments").delete().eq("id", id);
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        Comments
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {comments.length}
        </span>
      </h2>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder={
            currentUserId
              ? "Ask a doubt or say thanks…"
              : "Log in to join the conversation"
          }
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={sending || (!currentUserId && true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {!currentUserId && <span>Log in</span>}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
          >
            <div className="flex items-center gap-2">
              {c.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                  {(c.profiles?.full_name ?? c.profiles?.username ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
              <Link
                href={`/@${c.profiles?.username ?? ""}`}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                @{c.profiles?.username ?? "unknown"}
              </Link>
              <span className="text-xs text-slate-400">
                {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
              {c.author_id === currentUserId && (
                <button
                  onClick={() => remove(c.id)}
                  disabled={sending}
                  title="Delete comment"
                  className="ml-auto text-slate-300 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-2 pl-8 text-sm leading-6 text-slate-700">{c.body}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
            No comments yet — be the one who helps first.
          </li>
        )}
      </ul>
    </section>
  );
}
