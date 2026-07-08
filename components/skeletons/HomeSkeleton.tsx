/**
 * Lightweight loading placeholder shown while the (lazy-loaded) home
 * experience hydrates. Mirrors the hero layout to avoid a layout shift.
 */
export function HomeSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center" aria-hidden="true">
        <div className="h-32 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="mt-10 h-7 w-64 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-3 h-4 w-44 animate-pulse rounded bg-white/5" />
        <div className="mt-8 flex gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-white/5"
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading Omen…</span>
    </div>
  );
}
