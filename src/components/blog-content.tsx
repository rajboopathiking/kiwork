"use client";

import { useEffect, useRef } from "react";

export default function BlogContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const preBlocks = containerRef.current.querySelectorAll("pre");

    preBlocks.forEach((pre) => {
      // Don't inject twice
      if (pre.querySelector(".code-copy-btn")) return;

      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "code-copy-btn absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-slate-800/90 px-2 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-xs transition hover:bg-slate-700 hover:text-white border border-white/10 cursor-pointer select-none shadow-sm";
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;

      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const codeEl = pre.querySelector("code");
        // Clone and remove the button text if accidentally captured
        const textToCopy = (codeEl ? codeEl.innerText : pre.innerText).replace(/Copy|Copied!/g, "").trim();

        try {
          await navigator.clipboard.writeText(textToCopy);
          btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span class="text-emerald-400">Copied!</span>`;
          setTimeout(() => {
            btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;
          }, 2000);
        } catch {
          // fallback
        }
      });

      pre.appendChild(btn);
    });
  }, [html]);

  return (
    <article
      ref={containerRef}
      className="prose prose-slate prose-headings:font-semibold prose-a:text-emerald-700 max-w-none dark:prose-invert dark:prose-a:text-emerald-400"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
