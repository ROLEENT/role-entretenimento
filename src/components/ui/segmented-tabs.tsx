import { cn } from '@/lib/utils';

interface SegmentedTabsProps {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedTabs({ items, value, onChange, className }: SegmentedTabsProps) {
  return (
    <div className={cn(
      'inline-flex rounded-full border p-1 bg-card shadow-sm',
      className
    )}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'h-9 px-4 rounded-full text-sm transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            value === item.value
              ? 'bg-foreground text-background'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}