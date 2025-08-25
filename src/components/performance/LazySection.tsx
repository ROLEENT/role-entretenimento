import { ReactNode, useEffect, useRef, useState } from 'react';
import { createComponentObserver } from '@/utils/performanceHelpers';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

export function LazySection({ 
  children, 
  className, 
  threshold = 0.1, 
  rootMargin = '100px',
  fallback 
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = createComponentObserver(() => {
      setIsVisible(true);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <div className="min-h-[200px] animate-pulse bg-muted/50 rounded" />)}
    </div>
  );
}