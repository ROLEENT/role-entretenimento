import { useState, useEffect } from 'react';

interface CounterAnimationProps {
  target: number;
  duration?: number;
  isLoading?: boolean;
}

export const CounterAnimation = ({ target, duration = 1500, isLoading }: CounterAnimationProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (isLoading || target === 0) {
      setCurrent(0);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.floor(easeOutCubic * target);
      
      setCurrent(newValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCounter);
      }
    };

    animationFrame = requestAnimationFrame(updateCounter);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration, isLoading]);

  if (isLoading) {
    return <span className="animate-pulse bg-muted rounded w-8 h-5 inline-block" />;
  }

  return <span className="tabular-nums">{current}</span>;
};