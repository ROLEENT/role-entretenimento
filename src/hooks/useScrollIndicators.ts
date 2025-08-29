import { useState, useEffect, RefObject, useCallback } from 'react';

interface ScrollIndicators {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollToLeft: () => void;
  scrollToRight: () => void;
}

export const useScrollIndicators = (ref: RefObject<HTMLElement>): ScrollIndicators => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, [ref]);

  const scrollToLeft = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    
    const scrollAmount = element.clientWidth * 0.8;
    element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }, [ref]);

  const scrollToRight = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    
    const scrollAmount = element.clientWidth * 0.8;
    element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      checkScrollability();
    };

    const handleResize = () => {
      checkScrollability();
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial check
    checkScrollability();

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollability]);

  return {
    canScrollLeft,
    canScrollRight,
    scrollToLeft,
    scrollToRight,
  };
};