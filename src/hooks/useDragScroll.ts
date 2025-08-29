import { useEffect, RefObject, useCallback, useRef } from 'react';

export const useDragScroll = (ref: RefObject<HTMLElement>) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    const element = ref.current;
    if (!element) return;

    isDragging.current = true;
    startX.current = e.pageX - element.offsetLeft;
    scrollLeft.current = element.scrollLeft;
    element.style.cursor = 'grabbing';
    element.setPointerCapture(e.pointerId);
  }, [ref]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    
    const element = ref.current;
    if (!element) return;

    e.preventDefault();
    const x = e.pageX - element.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll speed multiplier
    element.scrollLeft = scrollLeft.current - walk;
  }, [ref]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    const element = ref.current;
    if (!element) return;

    isDragging.current = false;
    element.style.cursor = 'grab';
    element.releasePointerCapture(e.pointerId);
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointerleave', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);
};