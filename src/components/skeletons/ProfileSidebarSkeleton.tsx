import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Stats Card */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-6 w-8 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Similar Profiles */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}