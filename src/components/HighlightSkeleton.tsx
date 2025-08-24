import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const HighlightSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-64" />
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
      </CardContent>
    </Card>
  );
};

export default HighlightSkeleton;