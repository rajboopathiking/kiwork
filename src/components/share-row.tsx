"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";
import {
  WhatsAppIcon,
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
} from "@/components/brand-icons";

export default function ShareRow({
  title,
  path,
}: {
  title: string;
  path: string; // e.g. /post/xxx or /@name
}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  function getFullUrl() {
    if (typeof window !== "undefined" && window.location.origin) {
      return `${window.location.origin}${path}`;
    }
    return origin ? `${origin}${path}` : `https://kiwork-gzn7.vercel.app${path}`;
  }

  async function handleCopy() {
    const fullUrl = getFullUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback for older mobile webviews
        const el = document.createElement("textarea");
        el.value = fullUrl;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Clipboard copy failed, fallback triggered:", e);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleShare(platform: "whatsapp" | "linkedin" | "facebook" | "twitter") {
    const fullUrl = getFullUrl();
    const shareText = `${title} — on KIWORK`;
    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + fullUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    }
  }

  const btn =
    "flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      <button
        onClick={handleCopy}
        className={`${btn} ${copied ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : ""}`}
        title="Copy share link"
        type="button"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-150" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        <span>{copied ? "Copied!" : "Copy link"}</span>
      </button>

      <button
        onClick={() => handleShare("whatsapp")}
        className={btn}
        title="Share to WhatsApp"
        type="button"
      >
        <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      <button
        onClick={() => handleShare("linkedin")}
        className={btn}
        title="Share to LinkedIn"
        type="button"
      >
        <LinkedinIcon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
        <span className="hidden sm:inline">LinkedIn</span>
      </button>

      <button
        onClick={() => handleShare("facebook")}
        className={btn}
        title="Share to Facebook"
        type="button"
      >
        <FacebookIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">Facebook</span>
      </button>

      <button
        onClick={() => handleShare("twitter")}
        className={btn}
        title="Share on X"
        type="button"
      >
        <TwitterIcon className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" />
        <span className="hidden sm:inline">X</span>
      </button>
    </div>
  );
}
