import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from './skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  placeholder,
  blurDataURL,
  priority = false,
  sizes,
  width,
  height,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1,
  }) as { ref: React.RefObject<HTMLDivElement>; isIntersecting: boolean };

  const shouldLoad = priority || isIntersecting;
  
  const {
    src: imageSrc,
    isLoading,
    hasError,
    retry,
  } = useImagePreloader({
    src: shouldLoad ? src : '',
    placeholder: blurDataURL || placeholder,
  });

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div 
      ref={ref} 
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {(!shouldLoad || isLoading) && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {shouldLoad && (
        <>
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="text-2xl">📷</div>
                <button 
                  onClick={retry}
                  className="text-xs underline hover:no-underline"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={alt}
              sizes={sizes}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                'transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0',
                className
              )}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          )}
        </>
      )}
    </div>
  );
}