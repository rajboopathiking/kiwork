"use client";

import { useState } from "react";
import { ColabIcon, GithubIcon } from "./brand-icons";
import {
  ExternalLink,
  Globe,
  BookOpen,
  Terminal,
  Check,
  Copy,
  Sparkles,
} from "lucide-react";

export interface DeveloperResourcesData {
  colab_url?: string;
  github_url?: string;
  demo_url?: string;
  docs_url?: string;
}

export default function DeveloperResources({
  resources,
}: {
  resources: DeveloperResourcesData;
  postTitle?: string;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { colab_url, github_url, demo_url, docs_url } = resources;

  const hasAny = Boolean(colab_url || github_url || demo_url || docs_url);
  if (!hasAny) return null;

  async function copyUrl(key: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="my-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-slate-500/5 to-transparent p-4 sm:p-5 dark:border-emerald-500/20 dark:from-emerald-950/20 dark:via-slate-900/40">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <Terminal className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Developer & Learning Hub
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-3 w-3" /> Hands-on Resources
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* Google Colab */}
        {colab_url && (
          <div className="group relative flex items-center justify-between gap-3 rounded-xl border border-amber-300/40 bg-white/80 p-3 shadow-2xs backdrop-blur-xs transition hover:border-amber-400 hover:shadow-md dark:border-amber-500/20 dark:bg-slate-900/80">
            <a
              href={colab_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50">
                <ColabIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                    Open in Google Colab
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Run interactive Python notebook
                </p>
              </div>
            </a>
            <button
              type="button"
              onClick={() => copyUrl("colab", colab_url)}
              title="Copy Colab link"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {copiedKey === "colab" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {/* GitHub Code */}
        {github_url && (
          <div className="group relative flex items-center justify-between gap-3 rounded-xl border border-slate-300/60 bg-white/80 p-3 shadow-2xs backdrop-blur-xs transition hover:border-slate-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80">
            <a
              href={github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <GithubIcon className="h-5 w-5 text-slate-900 dark:text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    GitHub Repository
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Inspect code & clone repository
                </p>
              </div>
            </a>
            <button
              type="button"
              onClick={() => copyUrl("github", github_url)}
              title="Copy GitHub link"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {copiedKey === "github" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Live Demo */}
        {demo_url && (
          <div className="group relative flex items-center justify-between gap-3 rounded-xl border border-emerald-300/50 bg-white/80 p-3 shadow-2xs backdrop-blur-xs transition hover:border-emerald-500 hover:shadow-md dark:border-emerald-500/20 dark:bg-slate-900/80">
            <a
              href={demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    Live Demo & App
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Try the interactive working project
                </p>
              </div>
            </a>
            <button
              type="button"
              onClick={() => copyUrl("demo", demo_url)}
              title="Copy Demo link"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {copiedKey === "demo" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Documentation / Paper */}
        {docs_url && (
          <div className="group relative flex items-center justify-between gap-3 rounded-xl border border-sky-300/50 bg-white/80 p-3 shadow-2xs backdrop-blur-xs transition hover:border-sky-500 hover:shadow-md dark:border-sky-500/20 dark:bg-slate-900/80">
            <a
              href={docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50">
                <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                    Docs & Reference
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Read documentation or research paper
                </p>
              </div>
            </a>
            <button
              type="button"
              onClick={() => copyUrl("docs", docs_url)}
              title="Copy Docs link"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {copiedKey === "docs" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
