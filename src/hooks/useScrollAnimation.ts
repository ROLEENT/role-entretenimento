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

    // Fallback timeout for mobile
    const fallbackTimeout = setTimeout(() => {
      if (ref.current && !ref.current.classList.contains('visible')) {
        console.log('🔧 Mobile fallback: Force showing element');
        ref.current.classList.add('visible');
      }
    }, isMobile ? 1500 : 3000);

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