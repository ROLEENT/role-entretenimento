import { useEffect, useRef } from 'react';

export const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect if mobile device
    const isMobile = window.innerWidth < 768;
    
    // Mobile-optimized settings
    const observerOptions = {
      threshold: isMobile ? 0.05 : 0.1,
      rootMargin: isMobile ? '50px 0px 50px 0px' : '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      observerOptions
    );

    // Fallback timeout for mobile - don't interfere with initial scroll
    const fallbackTimeout = setTimeout(() => {
      if (ref.current && !ref.current.classList.contains('visible')) {
        // Don't change scroll position, just make visible
        ref.current.classList.add('visible');
      }
    }, isMobile ? 1000 : 2000);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(fallbackTimeout);
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return ref;
};