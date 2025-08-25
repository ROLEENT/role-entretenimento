import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
  readonly?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className,
  showValue = false,
  readonly = false
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (!interactive || readonly) return;
    onRatingChange?.(starRating);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground',
              interactive && !readonly && 'cursor-pointer hover:text-yellow-400'
            )}
            onClick={() => handleStarClick(star)}
          />
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarRatingDisplayProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRatingDisplay({ 
  rating, 
  totalReviews,
  size = 'md',
  className 
}: StarRatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StarRating rating={rating} size={size} readonly />
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)}
        {totalReviews !== undefined && (
          <span className="ml-1">({totalReviews})</span>
        )}
      </span>
    </div>
  );
}