import { useState, useEffect } from 'react';

export function useCurationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const openDrawer = () => {
    setIsOpen(true);
    setIsAnimating(true);
    
    // Permitir animação de entrada
    setTimeout(() => setIsAnimating(false), 300);
  };

  const closeDrawer = () => {
    setIsAnimating(true);
    
    // Animação de saída antes de fechar
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 200);
  };

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      if (isOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  return {
    isOpen,
    isAnimating,
    openDrawer,
    closeDrawer,
    setIsOpen
  };
}