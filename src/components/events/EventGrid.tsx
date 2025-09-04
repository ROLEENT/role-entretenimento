import { motion } from "framer-motion";
import { EventCardV3 } from "./EventCardV3";
import { cn } from "@/lib/utils";

interface EventGridProps {
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
    highlight_type?: 'none' | 'curatorial' | 'vitrine';
    is_sponsored?: boolean;
    age_rating?: string;
    genres?: string[];
    slug?: string;
    ticket_url?: string;
    lineup?: Array<{ name: string; is_headliner?: boolean }>;
  }>;
  variant?: 'default' | 'compact' | 'grid' | 'featured';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  onEventClick?: (event: any) => void;
  loading?: boolean;
}

const gridColumns = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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

export function EventGrid({ 
  events, 
  variant = 'default',
  columns = 3, 
  className,
  onEventClick,
  loading = false
}: EventGridProps) {
  // Separate events by highlight type for better organization
  const prioritizedEvents = [...events].sort((a, b) => {
    const priorityOrder = { vitrine: 3, destaque: 2, none: 1 };
    const aPriority = priorityOrder[a.highlight_type || 'none'];
    const bPriority = priorityOrder[b.highlight_type || 'none'];
    return bPriority - aPriority;
  });

  if (loading) {
    return (
      <div className={cn(
        "grid gap-6",
        gridColumns[columns],
        className
      )}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse"
          >
            <div className="bg-muted rounded-lg h-64 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum evento encontrado</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        "grid gap-6",
        gridColumns[columns],
        className
      )}
    >
      {prioritizedEvents.map((event, index) => (
        <motion.div
          key={event.id}
          variants={item}
          layout
        >
          <EventCardV3
            event={event}
            variant={variant}
            onClick={() => onEventClick?.(event)}
            className={cn(
              // Featured events get special treatment
              event.highlight_type === 'vitrine' && variant !== 'compact' && "md:col-span-2 lg:col-span-1",
              // Add staggered animation delay
              "animate-fade-in"
            )}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}