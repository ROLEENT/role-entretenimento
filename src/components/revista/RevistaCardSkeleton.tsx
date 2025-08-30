import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function RevistaCardSkeleton() {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Image skeleton */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Skeleton className="w-full h-full" />
        </div>
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Badge skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          {/* Title skeleton */}
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          
          {/* Summary skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Meta info skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}