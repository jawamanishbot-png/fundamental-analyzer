export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2.5">
            <div className="skeleton h-7 w-20" />
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Price skeleton */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
        <div className="skeleton h-3 w-16 mb-3" />
        <div className="flex items-baseline gap-3">
          <div className="skeleton h-9 w-28" />
          <div className="skeleton h-5 w-16" />
        </div>
        <div className="skeleton h-2 w-full rounded-full mt-4" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4">
            <div className="skeleton h-3 w-20 mb-2" />
            <div className="skeleton h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
