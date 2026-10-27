"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Layers,
} from "lucide-react";

export default function ImageCarousel({
  urls,
  title = "Post image",
}: {
  urls: string[];
  title?: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = urls.length;

  const next = useCallback(() => {
    setIndex((curr) => (curr + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setIndex((curr) => (curr - 1 + total) % total);
  }, [total]);

  const goTo = (i: number) => {
    if (i >= 0 && i < total) {
      setIndex(i);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape" && lightbox) setLightbox(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, lightbox]);

  // Touch swipe support for mobile
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      next(); // Swiped left -> next
    } else if (diff < -45) {
      prev(); // Swiped right -> prev
    }
    touchStartX.current = null;
  }

  if (total === 0) {
    return null;
  }

  // Single Image View
  if (total === 1) {
    return (
      <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 dark:border-slate-800 dark:bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[0]}
          alt={title}
          onClick={() => setLightbox(true)}
          className="mx-auto max-h-[640px] w-auto cursor-zoom-in object-contain rounded-2xl"
          loading="lazy"
        />
        <button
          onClick={() => setLightbox(true)}
          type="button"
          title="View fullscreen"
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {lightbox && (
          <LightboxModal
            url={urls[0]}
            title={title}
            onClose={() => setLightbox(false)}
          />
        )}
      </div>
    );
  }

  // Multi-Image Carousel View
  return (
    <div className="space-y-3">
      {/* Main Carousel Frame */}
      <div
        className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <div className="flex h-[320px] sm:h-[480px] md:h-[560px] w-full items-center justify-center p-2 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={urls[index]}
            src={urls[index]}
            alt={`${title} - ${index + 1} of ${total}`}
            onClick={() => setLightbox(true)}
            className="max-h-full max-w-full cursor-zoom-in object-contain select-none transition duration-200 animate-in fade-in zoom-in-95"
            loading="lazy"
          />
        </div>

        {/* Slide Counter Badge */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <Layers className="h-3 w-3 text-emerald-400" />
          <span>
            {index + 1} / {total}
          </span>
        </div>

        {/* Action Controls (Top Right) */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <button
            onClick={() => setLightbox(true)}
            type="button"
            title="Expand fullscreen"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <a
            href={urls[index]}
            target="_blank"
            rel="noreferrer"
            title="Open original image"
            className="hidden sm:flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={prev}
          type="button"
          aria-label="Previous image"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={next}
          type="button"
          aria-label="Next image"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Mobile Dot Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md sm:hidden">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              type="button"
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === index ? "w-4 bg-emerald-400" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Strip (Desktop & Tablet) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {urls.map((u, i) => (
          <button
            key={u + i}
            onClick={() => goTo(i)}
            type="button"
            className={`group relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition ${
              i === index
                ? "border-emerald-500 ring-2 ring-emerald-500/40"
                : "border-slate-200 opacity-60 hover:opacity-100 dark:border-slate-800"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u}
              alt={`Thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute bottom-0.5 right-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white backdrop-blur-xs">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {lightbox && (
        <LightboxModal
          url={urls[index]}
          title={`${title} (${index + 1} of ${total})`}
          total={total}
          index={index}
          onPrev={prev}
          onNext={next}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}

function LightboxModal({
  url,
  title,
  total,
  index,
  onPrev,
  onNext,
  onClose,
}: {
  url: string;
  title: string;
  total?: number;
  index?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-6 backdrop-blur-md animate-in fade-in duration-150"
    >
      {/* Top Header */}
      <div className="absolute left-4 top-4 z-50 flex items-center gap-3 text-white">
        <span className="text-sm font-semibold truncate max-w-[240px] sm:max-w-md">
          {title}
        </span>
      </div>

      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          title="Open original image"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
        <button
          onClick={onClose}
          type="button"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          title="Close (Esc)"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Prev / Next controls in lightbox */}
      {total && total > 1 && onPrev && onNext && (
        <>
          <button
            onClick={onPrev}
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
            title="Previous (←)"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={onNext}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
            title="Next (→)"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Centered Large Image */}
      <div className="relative max-h-full max-w-full overflow-hidden p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain select-none shadow-2xl"
        />
      </div>
    </div>
  );
}
