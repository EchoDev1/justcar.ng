/**
 * Enhanced Skeleton Card with Glassmorphic Shimmer Effect
 * Used while loading car cards
 */

'use client'

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      {/* Image Skeleton with Shimmer Wave */}
      <div className="skeleton-image" />

      {/* Title Skeleton */}
      <div className="skeleton-title" />

      {/* Text Skeletons */}
      <div className="skeleton-text long" />
      <div className="skeleton-text medium" />
      <div className="skeleton-text short" />

      {/* Button Skeleton */}
      <div className="skeleton-button" />
    </div>
  )
}

// Grid wrapper for multiple skeletons
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
