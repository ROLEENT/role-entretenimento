export interface SkeletonGridProps {
  count?: number;
  className?: string;
}

export default function SkeletonGrid({ count = 6, className }: SkeletonGridProps) {
  return (
    <section
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ''}`}
      style={{ contentVisibility: "auto" }}
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando eventos..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-muted" />
          <div className="p-4 grid gap-3">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        </div>
      ))}
    </section>
  );
}