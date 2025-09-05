import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

// WebP/AVIF support detection
const supportedFormats = {
  webp: false,
  avif: false,
};

// Check WebP support
const webpImage = new Image();
webpImage.onload = webpImage.onerror = () => {
  supportedFormats.webp = webpImage.height === 2;
};
webpImage.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

// Check AVIF support
const avifImage = new Image();
avifImage.onload = avifImage.onerror = () => {
  supportedFormats.avif = avifImage.height === 2;
};
avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABoAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';

export function EnhancedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '100vw',
  quality = 75,
  onLoad,
  onError,
}: EnhancedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Generate optimized src based on format support
  const optimizedSrc = useMemo(() => {
    if (!src) return src;
    
    // Check if it's a Supabase URL that supports transformations
    if (src.includes('supabase.co/storage')) {
      const baseUrl = src.split('?')[0];
      const params = new URLSearchParams();
      
      // Add quality parameter
      params.set('quality', quality.toString());
      
      // Add format based on support
      if (supportedFormats.avif) {
        params.set('format', 'avif');
      } else if (supportedFormats.webp) {
        params.set('format', 'webp');
      }
      
      // Add dimensions if provided
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      
      return `${baseUrl}?${params.toString()}`;
    }
    
    return src;
  }, [src, quality, width, height]);

  // Generate srcSet for responsive images
  const srcSet = useMemo(() => {
    if (!src || !src.includes('supabase.co/storage')) return undefined;
    
    const baseUrl = src.split('?')[0];
    const widths = [640, 750, 828, 1080, 1200, 1920, 2048];
    
    return widths
      .map((w) => {
        const params = new URLSearchParams();
        params.set('width', w.toString());
        params.set('quality', quality.toString());
        
        if (supportedFormats.avif) {
          params.set('format', 'avif');
        } else if (supportedFormats.webp) {
          params.set('format', 'webp');
        }
        
        return `${baseUrl}?${params.toString()} ${w}w`;
      })
      .join(', ');
  }, [src, quality]);

  // Blur placeholder data URL
  const placeholderSrc = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgLz4KPC9zdmc+';
    }
    return undefined;
  }, [blurDataURL, placeholder]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !placeholderSrc && (
        <div className="absolute inset-0 w-full h-full bg-muted animate-pulse" />
      )}

      {/* Main image */}
      {(priority || isInView) && !isError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Error fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-2xl">📷</div>
            <p className="text-sm">Imagem não encontrada</p>
          </div>
        </div>
      )}
    </div>
  );
}