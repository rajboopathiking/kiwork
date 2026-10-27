"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";

export default function ShareRow({
  title,
  path,
}: {
  title: string;
  path: string; // e.g. /post/xxx or /@name (relative; host is current origin)
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const text = encodeURIComponent(`${title} — via KIWORK`);
  const link = encodeURIComponent(origin ? `${origin}${path}` : "");

  async function copy() {
    try {
      const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — user can still copy the visible link
    }
  }

  const btn =
    "flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={copy} className={btn} title="Copy link" type="button">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={`https://wa.me/?text=${text}%20${link}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
        title="Share on WhatsApp"
      >
        <WhatsAppGlyph className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${link}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
        title="Share on LinkedIn"
      >
        <LinkedinGlyph className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
        LinkedIn
      </a>
    </div>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9a9.75 9.75 0 0 0 1.32 4.92L2.05 22l5.3-1.34a9.93 9.93 0 0 0 4.69 1.19h.01a9.9 9.9 0 0 0 9.94-9.89A9.82 9.82 0 0 0 19.2 4.8 9.93 9.93 0 0 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 5.78 2.4 8.04 8.04 0 0 1 2.4 5.77 8.1 8.1 0 0 1-8.14 8.08 8.2 8.2 0 0 1-3.9-.98l-.28-.16-3.15.8.84-3.07-.18-.3a7.99 7.99 0 0 1-1.24-4.29 8.1 8.1 0 0 1 8.13-8.06Zm3.66 8.72c-.2-.1-1.33-.66-1.54-.73-.2-.08-.35-.12-.5.1-.15.2-.58.73-.71.88-.13.15-.26.17-.46.06a6.63 6.63 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.34-1.67c-.14-.24-.01-.37.11-.49.1-.1.24-.27.36-.4.1-.13.14-.22.2-.37.07-.15.03-.28-.02-.4-.06-.11-.5-1.24-.69-1.7-.18-.44-.37-.37-.5-.38h-.43c-.15 0-.4.06-.6.28-.21.22-.8.78-.79 1.9.02 1.13.83 2.22.95 2.37.12.16 1.64 2.5 3.97 3.5.56.25 1 .4 1.34.5.56.18 1.07.16 1.47.1.45-.07 1.38-.57 1.57-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.17-.46-.29Z" />
    </svg>
  );
}

function LinkedinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45Z" />
    </svg>
  );
}
