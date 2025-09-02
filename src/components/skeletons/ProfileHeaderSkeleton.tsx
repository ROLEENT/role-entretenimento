import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="relative">
      {/* Cover Image Skeleton */}
      <Skeleton className="h-48 md:h-64 w-full rounded-none" />
      
      <div className="container mx-auto px-3 md:px-0">
        <div className="relative -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar Skeleton */}
            <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background" />
            
            <div className="flex-1 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Name & Info */}
                <div className="space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="hidden md:flex gap-3">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}