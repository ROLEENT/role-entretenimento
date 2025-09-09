import { motion } from "framer-motion";
import { AdminEventCardV3 } from "./AdminEventCardV3";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminEventGridProps {
  events: Array<{
    id: string;
    title: string;
    subtitle?: string;
    summary?: string;
    city?: string;
    location_name?: string;
    date_start?: string;
    date_end?: string;
    doors_open_utc?: string;
    image_url?: string;
    cover_url?: string;
    price_min?: number;
    price_max?: number;
    currency?: string;
    highlight_type?: 'none' | 'curatorial' | 'vitrine' | 'editorial' | 'sponsored';
    is_sponsored?: boolean;
    age_rating?: string;
    genres?: string[];
    slug?: string;
    ticket_url?: string;
    status?: string;
    lineup?: Array<{ name: string; is_headliner?: boolean }>;
  }>;
  variant?: 'default' | 'compact' | 'grid' | 'featured';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  onEventClick?: (event: any) => void;
  onEventEdit?: (eventId: string) => void;
  onEventDelete?: (eventId: string) => void;
  onEventView?: (eventId: string) => void;
  loading?: boolean;
  deletingEventIds?: string[];
}

const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function LoadingSkeleton({ columns = 1 }: { columns?: 1 | 2 | 3 | 4 }) {
  const skeletonCount = columns === 1 ? 5 : columns * 2;
  
  return (
    <div className={cn("grid gap-4", gridColumns[columns])}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="flex gap-4 p-4 border rounded-lg">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminEventGrid({
  events,
  variant = 'compact',
  columns = 1,
  className,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventView,
  loading = false,
  deletingEventIds = []
}: AdminEventGridProps) {
  
  if (loading) {
    return <LoadingSkeleton columns={columns} />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum evento encontrado</p>
      </div>
    );
  }

  // Sort events by highlight type for prioritization
  const prioritizedEvents = [...events].sort((a, b) => {
    const priorityOrder = ['vitrine', 'curatorial', 'none'];
    const aPriority = priorityOrder.indexOf(a.highlight_type || 'none');
    const bPriority = priorityOrder.indexOf(b.highlight_type || 'none');
    return aPriority - bPriority;
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("grid gap-4", gridColumns[columns], className)}
    >
      {prioritizedEvents.map((event) => (
        <motion.div key={event.id} variants={item}>
          <AdminEventCardV3
            event={event}
            variant={variant}
            onClick={onEventClick ? () => onEventClick(event) : undefined}
            onEdit={onEventEdit}
            onDelete={onEventDelete}
            onView={onEventView}
            isDeleting={deletingEventIds.includes(event.id)}
            className={cn(
              event.highlight_type === 'vitrine' && 'ring-2 ring-yellow-500/20',
              event.highlight_type === 'curatorial' && 'ring-2 ring-primary/20'
            )}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}