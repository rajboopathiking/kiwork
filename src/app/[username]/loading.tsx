export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-pulse">
      {/* Header profile skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2.5">
            <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-9 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700" />
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-8 flex gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="h-9 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-28 rounded-full bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Grid of skeleton post cards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
