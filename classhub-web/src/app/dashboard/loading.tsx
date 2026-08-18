export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Nav skeleton */}
      <div className="border-b border-border/40 bg-card/60 h-14 sticky top-16 z-30">
        <div className="container max-w-6xl mx-auto px-4 h-full flex items-center gap-3">
          {[80, 100, 80, 120, 70].map((w, i) => (
            <div key={i} className="h-8 rounded-full bg-muted animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="w-full h-52 bg-muted/40 animate-pulse" />

      {/* Cards skeleton */}
      <div className="container max-w-6xl mx-auto px-4 mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted animate-pulse mt-8" />
      </div>
    </div>
  );
}
