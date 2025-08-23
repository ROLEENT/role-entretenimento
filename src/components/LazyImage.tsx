import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import cityPlaceholder from "@/assets/city-placeholder.jpg";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onError?: () => void;
}

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  fallback = cityPlaceholder,
  onError,
  ...props 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {isInView && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;