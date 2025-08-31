export default function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200" />
          <div className="p-4 grid gap-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </section>
  );
}