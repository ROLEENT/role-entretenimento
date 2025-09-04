import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';

interface ChipsListProps {
  items: string[];
  hrefBase: string;
  max?: number;
  className?: string;
  chipClassName?: string;
}

export function ChipsList({ 
  items, 
  hrefBase, 
  max = 6, 
  className = "",
  chipClassName = "inline-flex items-center gap-1 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm min-h-[44px]"
}: ChipsListProps) {
  const [open, setOpen] = useState(false);
  const displayItems = open ? items : items.slice(0, max);

  if (!items || items.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {displayItems.map((item) => (
          <Link
            key={item}
            to={`${hrefBase}${encodeURIComponent(item)}`}
            className={chipClassName}
          >
            {item}
          </Link>
        ))}
      </div>
      {items.length > max && (
        <Button
          variant="ghost" 
          size="sm"
          className="text-sm mt-2 underline h-auto p-0" 
          onClick={() => setOpen(v => !v)}
        >
          {open ? "Ver menos" : "Ver todos"}
        </Button>
      )}
    </div>
  );
}