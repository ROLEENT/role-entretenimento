import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter = ({ current, max, className }: CharacterCounterProps) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isAtLimit = current >= max;
  
  return (
    <div className={cn(
      "text-xs flex items-center gap-2",
      isAtLimit ? "text-destructive" : isNearLimit ? "text-orange-500" : "text-muted-foreground",
      className
    )}>
      <span>
        {current}/{max}
      </span>
      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-200",
            isAtLimit ? "bg-destructive" : isNearLimit ? "bg-orange-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};