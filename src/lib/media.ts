import type { PostFormat } from "./types";

export interface VideoRef {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  thumbnailUrl: string | null;
}

/** Accepts YouTube / Vimeo URLs of every common shape and returns a clean embed ref. */
export function parseVideoUrl(raw: string): VideoRef | null {
  const url = raw.trim();
  if (!url) return null;

  let m: RegExpMatchArray | null;

  // youtube: watch?v=, youtu.be/, /shorts/, /embed/, /live/
  m =
    url.match(/(?:youtube\.com\/watch\?[^#]*v=|youtu\.be\/|youtube\.com\/(?:shorts|embed|live)\/)([a-zA-Z0-9_-]{11})/) ??
    null;
  if (m) {
    const id = m[1];
    return {
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // vimeo: vimeo.com/123456789
  m = url.match(/vimeo\.com\/(\d{6,12})/);
  if (m) {
    const id = m[1];
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: null,
    };
  }

  return null;
}

export function isYouTubeUrl(raw: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(raw.trim());
}

export function formatYouTubeThumbnail(ref: VideoRef): string | null {
  return ref.provider === "youtube" ? `https://i.ytimg.com/vi/${ref.id}/hqdefault.jpg` : null;
}

export const FORMAT_LABEL: Record<string, string> = {
  blog: "Blog",
  video: "Video",
  audio: "Audio",
  image: "Images",
  doc: "Doc",
};

export const FORMAT_OPTIONS: {
  format: PostFormat;
  label: string;
  desc: string;
}[] = [
  { format: "blog", label: "Blog post", desc: "Rich-text write-up of what you learned" },
  { format: "video", label: "Video", desc: "Paste a YouTube / Vimeo link — no uploads" },
  { format: "audio", label: "Audio", desc: "Voice notes & recordings (mp3/ogg/m4a)" },
  { format: "image", label: "Notes / Images", desc: "Photos, screenshots, handwritten notes" },
  { format: "doc", label: "Doc (PDF/PPTX)", desc: "Slides & summaries for download/preview" },
];

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "hi", label: "Hindi" },
  { value: "other", label: "Other" },
];

export function humanFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
