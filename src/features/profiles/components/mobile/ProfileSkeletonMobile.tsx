import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeletonMobile() {
  return (
    <div className="md:hidden">
      {/* Cover skeleton */}
      <div className="relative">
        <Skeleton className="h-40 w-full" />
        
        {/* Avatar skeleton */}
        <div className="relative -mt-9 px-4">
          <Skeleton className="w-18 h-18 rounded-full" />
        </div>
      </div>

      {/* Profile info skeleton */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Actions skeleton */}
      <div className="px-4 py-3">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Chips skeleton */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-14" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="px-4 py-3 border-b">
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Content skeleton */}
      <div className="px-4 py-3 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}