"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, Share2, X } from "lucide-react";
import {
  WhatsAppIcon,
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
} from "@/components/brand-icons";

interface ShareMenuProps {
  title: string;
  path: string;
  label?: string;
  className?: string;
}

export default function ShareMenu({
  title,
  path,
  label = "Share",
  className,
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function getFullUrl() {
    if (typeof window !== "undefined" && window.location.origin) {
      return `${window.location.origin}${path}`;
    }
    return origin ? `${origin}${path}` : `https://kiwork-gzn7.vercel.app${path}`;
  }

  async function handleTrigger() {
    const fullUrl = getFullUrl();
    // Use native share on mobile devices if available
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title,
          text: `${title} — on KIWORK`,
          url: fullUrl,
        });
        return;
      } catch {
        // Fall back to menu if user cancelled or error
      }
    }
    setOpen((prev) => !prev);
  }

  async function handleCopy() {
    const fullUrl = getFullUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
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
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handlePlatformShare(platform: "whatsapp" | "linkedin" | "facebook" | "twitter") {
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
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleTrigger}
        className={
          className ??
          "flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        }
      >
        <Share2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl backdrop-blur-md transition dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Share this {label.toLowerCase().includes("portfolio") ? "portfolio" : "post"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
            >
              <span className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-slate-500" />
                <span>Copy page link</span>
              </span>
              {copied ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {/* Social Share actions */}
            <button
              type="button"
              onClick={() => handlePlatformShare("whatsapp")}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-600" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlatformShare("linkedin")}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 dark:text-slate-200 dark:hover:bg-sky-950/40 dark:hover:text-sky-400"
            >
              <LinkedinIcon className="h-4 w-4 text-sky-600" />
              <span>Share on LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlatformShare("twitter")}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <TwitterIcon className="h-4 w-4 text-slate-800 dark:text-slate-200" />
              <span>Share on X</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlatformShare("facebook")}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
            >
              <FacebookIcon className="h-4 w-4 text-blue-600" />
              <span>Share on Facebook</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
