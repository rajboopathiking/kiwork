export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Filter pills skeleton */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      {/* Grid of skeleton post cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-36 w-full bg-slate-100 dark:bg-slate-800/80" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-full rounded-md bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
