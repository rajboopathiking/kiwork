import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import EditPostForm from "./edit-post-form";

export const metadata: Metadata = {
  title: "Edit Post · KIWORK",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user: me, profile } = await getCurrentUser();

  if (!me) {
    redirect(`/login?redirect=/post/${id}/edit`);
  }

  const supabase = await createClient();

  const [postRes, topicsRes, postTopicsRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, format, title, description, body, media_url, media_url_2, files, language, visibility, author_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("topics").select("id, name, slug").order("name"),
    supabase.from("post_topics").select("topic_id").eq("post_id", id),
  ]);

  const post = postRes.data;
  if (!post) notFound();

  // Only the author can edit their post
  if (post.author_id !== me.id) {
    redirect(`/post/${id}`);
  }

  const topics = topicsRes.data ?? [];
  const initialTopicIds = (postTopicsRes.data ?? []).map((pt: { topic_id: string }) => pt.topic_id);

  return (
    <EditPostForm
      post={post}
      topics={topics}
      initialTopicIds={initialTopicIds}
      authorUsername={profile?.username ?? "user"}
    />
  );
}
