export type PostFormat = "blog" | "video" | "audio" | "image" | "doc";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
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
  profiles: { username: string; avatar_url: string | null } | null;
}
