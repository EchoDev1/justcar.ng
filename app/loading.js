/**
 * Homepage Loading State
 * Instant feedback while homepage loads
 */

export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[600px] bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4"></div>
          <div className="h-6 bg-white/20 rounded w-64 mx-auto mb-8"></div>
          <div className="h-12 bg-white/30 rounded-full w-48 mx-auto"></div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
