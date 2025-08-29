import { useEffect, RefObject } from 'react';

export const useHorizontalWheel = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      // Ignore when Shift is pressed (allows native behavior)
      if (e.shiftKey) return;
      
      // Only prevent default if we're actually going to scroll horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        element.scrollLeft += e.deltaY;
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [ref]);
};