import { useState, useCallback } from 'react';

export function useCurationDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    setIsOpen
  };
}