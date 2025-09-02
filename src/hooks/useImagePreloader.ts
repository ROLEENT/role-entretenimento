import { useState, useEffect, useCallback } from 'react';

interface UseImagePreloaderProps {
  src: string;
  placeholder?: string;
}

export function useImagePreloader({ src, placeholder }: UseImagePreloaderProps) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadImage = useCallback(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    const image = new Image();
    
    image.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    image.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    image.src = src;
  }, [src]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const retry = useCallback(() => {
    setHasError(false);
    loadImage();
  }, [loadImage]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    retry,
  };
}