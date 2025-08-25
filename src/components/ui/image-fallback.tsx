import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import cityPlaceholder from "@/assets/city-placeholder.jpg";

interface ImageFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  showIcon?: boolean;
}

export const ImageFallback = ({ 
  src, 
  alt, 
  className = "", 
  fallback = cityPlaceholder,
  showIcon = true 
}: ImageFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        {showIcon ? (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        ) : (
          <img 
            src={fallback} 
            alt={alt}
            className={className}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-muted animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};