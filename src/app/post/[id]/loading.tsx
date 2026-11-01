export default function PostLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 animate-pulse">
      {/* Top back button skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Main post card skeleton */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {/* Title and metadata */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60" />
            <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-9 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-1/2 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        </div>

        {/* Author row */}
        <div className="mt-6 flex items-center gap-3 border-y border-slate-100 py-4 dark:border-slate-800">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>

        {/* Media / Content area skeleton */}
        <div className="mt-6 h-64 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/80" />

        {/* Content paragraphs */}
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-4 w-4/6 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
