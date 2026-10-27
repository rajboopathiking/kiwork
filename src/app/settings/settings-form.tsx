"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AtSign, Globe, ImagePlus, Loader2, Save } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  links: { github?: string; linkedin?: string; website?: string } | null;
}

export default function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [github, setGithub] = useState(profile.links?.github ?? "");
  const [linkedin, setLinkedin] = useState(profile.links?.linkedin ?? "");
  const [website, setWebsite] = useState(profile.links?.website ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
  const label = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200";

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

      const { error: upErr2 } = await supabase
        .from("profiles")
        .update({
          username: uname,
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          avatar_url,
          links: {
            ...(github.trim() ? { github: github.trim() } : {}),
            ...(linkedin.trim() ? { linkedin: linkedin.trim() } : {}),
            ...(website.trim() ? { website: website.trim() } : {}),
          },
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
    <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-5 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit profile</h1>
      <p className="-mt-3 text-sm text-slate-500 dark:text-slate-400">
        This is what the community sees at <Link href={`/@${username}`} className="font-mono text-emerald-700 hover:underline">/@{username}</Link>
      </p>

      {/* avatar */}
      <div className="flex items-center gap-4">
        {avatarFile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={URL.createObjectURL(avatarFile)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        ) : profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
            {(fullName || username).charAt(0).toUpperCase()}
          </span>
        )}
        <label
          htmlFor="avatar-input"
          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <ImagePlus className="h-4 w-4" />
          {avatarFile ? "Change photo" : "Upload photo"}
        </label>
        <input
          id="avatar-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => onAvatarPick(e.target.files)}
        />
        <p className="text-xs text-slate-400 dark:text-slate-500">PNG/JPG · under 2 MB</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="full_name">Full name</label>
          <input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={60} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="pf-username">Username (your portfolio URL)</label>
          <div className="relative">
            <AtSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input id="pf-username" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "_"))} maxLength={20} className={input + " pl-8 font-mono"} />
          </div>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="pf-bio">Bio</label>
        <textarea id="pf-bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={2} placeholder="What are you learning right now?" className={input} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="pf-github">
            <GithubIcon className="inline h-3.5 w-3.5" /> GitHub URL
          </label>
          <input id="pf-github" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/…" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="pf-linkedin">
            <LinkedinIcon className="inline h-3.5 w-3.5" /> LinkedIn URL
          </label>
          <input id="pf-linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="pf-website">
            <Globe className="inline h-3.5 w-3.5" /> Website
          </label>
          <input id="pf-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={input} />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>}
      {done && <p className="rounded-lg bg-emerald-950 px-3 py-2 text-sm text-emerald-300">Saved!</p>}

      <div className="flex justify-end gap-3">
        <Link href={`/@${username}`} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </div>
    </form>
  );
}
