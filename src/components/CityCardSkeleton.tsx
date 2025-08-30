interface CityCardSkeletonProps {
  className?: string;
}

export default function CityCardSkeleton({ className }: CityCardSkeletonProps) {
  return (
    <article className={className}>
      <div className="relative block rounded-2xl border border-border bg-card p-6">
        {/* Fixed height container to prevent layout shift */}
        <div className="h-32 flex flex-col justify-between">
          <div>
            {/* City name skeleton */}
            <div className="w-40 h-6 bg-muted animate-pulse rounded mb-2" />
            {/* Event count skeleton */}
            <div className="w-32 h-4 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Action text skeleton */}
          <div className="w-24 h-4 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </article>
  );
}