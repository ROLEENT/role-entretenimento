import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <div className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Skeleton */}
      <div className="aspect-video relative overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date and City */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Artist/Venue */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventCardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}