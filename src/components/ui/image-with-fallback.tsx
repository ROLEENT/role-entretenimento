import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import cityPlaceholder from "@/assets/city-placeholder.jpg";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  showIconFallback?: boolean;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const ImageWithFallback = ({ 
  src, 
  alt, 
  className = "", 
  fallback = cityPlaceholder,
  showIconFallback = false,
  aspectRatio = 'auto'
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Check for invalid src values
  const shouldShowFallback = !src || src === '' || src === 'undefined' || src === 'null' || hasError;

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video', 
    auto: ''
  };

  if (shouldShowFallback) {
    if (showIconFallback) {
      return (
        <div className={cn(
          "bg-muted flex items-center justify-center",
          aspectClasses[aspectRatio],
          className
        )}>
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      );
    }
    return (
      <img 
        src={fallback} 
        alt={alt}
        className={cn(aspectClasses[aspectRatio], className)}
      />
    );
  }

  return (
    <div className={cn("relative", aspectClasses[aspectRatio])}>
      {isLoading && (
        <div className={cn(
          "absolute inset-0 bg-muted animate-pulse",
          aspectClasses[aspectRatio]
        )} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? 'opacity-0' : 'opacity-100',
          aspectClasses[aspectRatio],
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};