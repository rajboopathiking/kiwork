"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AtSign, Globe, ImagePlus, Link2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/brand-icons";

interface CustomLink {
  key: string;
  url: string;
}

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
    custom?: CustomLink[];
  } | null;
}

function isPlaceholderSocial(raw?: string): boolean {
  if (!raw || typeof raw !== "string") return true;
  const val = raw.trim().toLowerCase();
  if (!val || val === "null" || val === "undefined") return true;

  if (
    val === "username" ||
    val === "@username" ||
    val === "@channel" ||
    val === "channel" ||
    val.endsWith("/username") ||
    val.endsWith("/username/") ||
    val.endsWith("/@channel") ||
    val.endsWith("/@channel/") ||
    val.includes("yourportfolio.com") ||
    val.includes("example.com") ||
    val.includes("myportfolio.com") ||
    val === "https://github.com" ||
    val === "https://github.com/" ||
    val === "https://linkedin.com" ||
    val === "https://linkedin.com/" ||
    val === "https://linkedin.com/in" ||
    val === "https://linkedin.com/in/" ||
    val === "https://instagram.com" ||
    val === "https://instagram.com/" ||
    val === "https://facebook.com" ||
    val === "https://facebook.com/" ||
    val === "https://x.com" ||
    val === "https://x.com/" ||
    val === "https://twitter.com" ||
    val === "https://twitter.com/" ||
    val === "https://youtube.com" ||
    val === "https://youtube.com/"
  ) {
    return true;
  }
  return false;
}

function cleanInitial(raw?: string): string {
  if (isPlaceholderSocial(raw)) return "";
  return raw!.trim();
}

export default function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [github, setGithub] = useState(cleanInitial(profile.links?.github));
  const [linkedin, setLinkedin] = useState(cleanInitial(profile.links?.linkedin));
  const [twitter, setTwitter] = useState(cleanInitial(profile.links?.twitter));
  const [instagram, setInstagram] = useState(cleanInitial(profile.links?.instagram));
  const [facebook, setFacebook] = useState(cleanInitial(profile.links?.facebook));
  const [youtube, setYoutube] = useState(cleanInitial(profile.links?.youtube));
  const [website, setWebsite] = useState(cleanInitial(profile.links?.website));

  const [customLinks, setCustomLinks] = useState<CustomLink[]>(
    Array.isArray(profile.links?.custom)
      ? profile.links.custom.filter(
          (c) =>
            c &&
            typeof c.key === "string" &&
            c.key.trim() &&
            typeof c.url === "string" &&
            !isPlaceholderSocial(c.url)
        )
      : []
  );

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function cleanUrlInput(val: string): string {
    const trimmed = val.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function addCustomLink() {
    setCustomLinks((prev) => [...prev, { key: "", url: "" }]);
  }

  function updateCustomLink(idx: number, field: "key" | "url", val: string) {
    setCustomLinks((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  }

  function removeCustomLink(idx: number) {
    setCustomLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  const input =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
  const label = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const uname = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
      setError("Username: 3–20 chars, lowercase letters, numbers, _");
      return;
    }
    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        if (avatarFile.size > 2 * 1024 * 1024) throw new Error("Avatar must be under 2 MB");
        const ext = avatarFile.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
        const path = `${profile.id}/avatar-${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: false });
        if (upErr) throw upErr;
        avatar_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      const cleanedCustom = customLinks
        .map((c) => ({ key: c.key.trim(), url: cleanUrlInput(c.url) }))
        .filter((c) => c.key && c.url && !isPlaceholderSocial(c.url));

      const linksPayload: Record<string, unknown> = {};
      if (github.trim() && !isPlaceholderSocial(github)) linksPayload.github = cleanUrlInput(github);
      if (linkedin.trim() && !isPlaceholderSocial(linkedin)) linksPayload.linkedin = cleanUrlInput(linkedin);
      if (twitter.trim() && !isPlaceholderSocial(twitter)) linksPayload.twitter = cleanUrlInput(twitter);
      if (instagram.trim() && !isPlaceholderSocial(instagram)) linksPayload.instagram = cleanUrlInput(instagram);
      if (facebook.trim() && !isPlaceholderSocial(facebook)) linksPayload.facebook = cleanUrlInput(facebook);
      if (youtube.trim() && !isPlaceholderSocial(youtube)) linksPayload.youtube = cleanUrlInput(youtube);
      if (website.trim() && !isPlaceholderSocial(website)) linksPayload.website = cleanUrlInput(website);
      if (cleanedCustom.length > 0) linksPayload.custom = cleanedCustom;

      const { error: upErr2 } = await supabase
        .from("profiles")
        .update({
          username: uname,
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          avatar_url,
          links: linksPayload,
        })
        .eq("id", profile.id);
      if (upErr2) throw upErr2;

      setDone(true);
      router.push(`/@${uname}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  function onAvatarPick(f: FileList | null) {
    const file = f?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be under 2 MB.");
      return;
    }
    setError(null);
    setAvatarFile(file);
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:py-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Edit profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This is what learners and recruiters see at{" "}
          <Link href={`/@${username}`} className="font-mono text-emerald-700 hover:underline dark:text-emerald-400">
            /@{username}
          </Link>
        </p>
      </div>

      {/* avatar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {avatarFile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={URL.createObjectURL(avatarFile)} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-500" />
        ) : profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-3xl font-bold text-white">
            {(fullName || username).charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <label
            htmlFor="avatar-input"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ImagePlus className="h-4 w-4" /> Change avatar photo
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={(e) => onAvatarPick(e.target.files)}
            className="hidden"
          />
          <p className="mt-1 text-xs text-slate-400">PNG or JPG up to 2 MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="pf-name">Full name</label>
          <input
            id="pf-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Boopathi Raj"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="pf-username">Username (Portfolio URL)</label>
          <div className="relative">
            <AtSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              id="pf-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "_"))}
              maxLength={20}
              className={input + " pl-9 font-mono"}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="pf-bio">About you / Bio</label>
        <textarea
          id="pf-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={180}
          rows={3}
          placeholder="What topics are you studying or passionate about right now?"
          className={input}
        />
        <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/180</p>
      </div>

      {/* Social Accounts Section */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Social &amp; Portfolio Links</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add your social accounts so visitors and recruiters can connect with you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="pf-github">
              <GithubIcon className="h-3.5 w-3.5" /> GitHub URL
            </label>
            <input
              id="pf-github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="pf-linkedin">
              <LinkedinIcon className="h-3.5 w-3.5 text-sky-600" /> LinkedIn URL
            </label>
            <input
              id="pf-linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="pf-instagram">
              <InstagramIcon className="h-3.5 w-3.5 text-pink-600" /> Instagram Profile
            </label>
            <input
              id="pf-instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/username"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="pf-facebook">
              <FacebookIcon className="h-3.5 w-3.5 text-blue-600" /> Facebook Profile
            </label>
            <input
              id="pf-facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/username"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="pf-twitter">
              <TwitterIcon className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" /> X / Twitter
            </label>
            <input
              id="pf-twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/username"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="pf-youtube">
              <YoutubeIcon className="h-3.5 w-3.5 text-rose-600" /> YouTube Channel
            </label>
            <input
              id="pf-youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/@channel"
              className={input}
            />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="pf-website">
            <Globe className="h-3.5 w-3.5 text-emerald-600" /> Personal Website / Custom Portfolio
          </label>
          <input
            id="pf-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourportfolio.com"
            className={input}
          />
        </div>

        {/* Custom Key-Value Links */}
        <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Custom Portfolio &amp; Profile Links
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add links to LeetCode, Hugging Face, Kaggle, Substack, Medium, or custom URLs. Only links with a valid URL will be shown to visitors.
              </p>
            </div>
            <button
              type="button"
              onClick={addCustomLink}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <Plus className="h-3.5 w-3.5" /> Add Link
            </button>
          </div>

          {/* Quick preset suggestion chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Quick add:</span>
            {[
              { label: "Google Colab", key: "Google Colab" },
              { label: "LeetCode", key: "LeetCode" },
              { label: "Hugging Face", key: "Hugging Face" },
              { label: "Kaggle", key: "Kaggle" },
              { label: "Medium", key: "Medium" },
            ].map((preset) => {
              const alreadyAdded = customLinks.some((c) => c.key.toLowerCase() === preset.key.toLowerCase());
              if (alreadyAdded) return null;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setCustomLinks((prev) => [...prev, { key: preset.key, url: "" }])}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Plus className="h-3 w-3" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {customLinks.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {customLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-1/3 min-w-[120px]">
                    <input
                      type="text"
                      value={link.key}
                      onChange={(e) => updateCustomLink(idx, "key", e.target.value)}
                      placeholder="e.g. LeetCode"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateCustomLink(idx, "url", e.target.value)}
                      placeholder="https://leetcode.com/u/..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomLink(idx)}
                    title="Remove custom link"
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950/70 dark:text-red-300">{error}</p>}
      {done && <p className="rounded-xl bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">Profile saved successfully!</p>}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Link
          href={`/@${username}`}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving changes…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
