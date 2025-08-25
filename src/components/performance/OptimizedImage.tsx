import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createImageObserver } from '@/utils/performanceHelpers';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  loading = 'lazy',
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(priority ? src : '');
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive src for different sizes
  const generateResponsiveSrc = (originalSrc: string, width?: number) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    // If it's a Supabase storage URL, we can add transformation parameters
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      if (width) {
        url.searchParams.set('width', width.toString());
        url.searchParams.set('quality', quality.toString());
      }
      return url.toString();
    }
    
    return originalSrc;
  };

  useEffect(() => {
    if (priority || loading === 'eager') {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    if (!imgRef.current) return;

    const observer = createImageObserver();
    
    const img = imgRef.current;
    img.dataset.src = src;
    
    // Add to observer
    observer.observe(img);

    // Manual intersection check for immediate loading if already in view
    const rect = img.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInView) {
      setImageSrc(src);
      setIsLoading(false);
    }

    return () => {
      if (img) observer.unobserve(img);
    };
  }, [src, priority, loading]);

  const handleLoad = () => {
    setIsLoading(false);
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
    }
  };

  // Generate srcSet for responsive images
  const srcSet = imageSrc ? [
    `${generateResponsiveSrc(imageSrc, 320)} 320w`,
    `${generateResponsiveSrc(imageSrc, 640)} 640w`,
    `${generateResponsiveSrc(imageSrc, 1024)} 1024w`,
    `${generateResponsiveSrc(imageSrc, 1920)} 1920w`
  ].join(', ') : undefined;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Blur */}
      {isLoading && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse" />
      )}
      
      {/* Blur data URL background */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-all duration-500',
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
          className
        )}
        loading={loading}
        decoding="async"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}