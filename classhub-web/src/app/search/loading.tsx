export default function SearchLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-6">
      {/* Filters skeleton */}
      <div className="flex gap-3 flex-wrap">
        {[140, 100, 120, 110, 90].map((w, i) => (
          <div key={i} className="h-10 rounded-full bg-muted animate-pulse" style={{ width: w }} />
        ))}
      </div>
      {/* Cards grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
