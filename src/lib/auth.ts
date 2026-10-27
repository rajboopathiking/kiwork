import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  links: { github?: string; linkedin?: string; website?: string } | null;
}

export interface PostCardData {
  id: string;
  format: string;
  title: string;
  description: string | null;
  media_url_2: string | null;
  views: number;
  created_at: string;
  author_id: string;
  profiles: Pick<Profile, "username" | "avatar_url"> | null;
}

/** Returns the logged-in user + profile, or nulls when unauthenticated (or env not wired yet). */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio, links")
      .eq("id", user.id)
      .single();

    return { user, profile: (profile as Profile) ?? null };
  } catch {
    return { user: null, profile: null };
  }
}
