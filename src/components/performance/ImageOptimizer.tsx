import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';
import { useEffect, useCallback } from 'react';

interface ImageOptimizerProps {
  children: React.ReactNode;
}

export function ImageOptimizer({ children }: ImageOptimizerProps) {
  const { config, optimizeImageUrl } = usePerformanceOptimizations();

  // Otimizar imagens já carregadas
  const optimizeExistingImages = useCallback(() => {
    const images = document.querySelectorAll('img[src]') as NodeListOf<HTMLImageElement>;
    
    images.forEach(img => {
      if (img.dataset.optimized) return;
      
      const originalSrc = img.src;
      const rect = img.getBoundingClientRect();
      
      // Calcular tamanho otimizado baseado no viewport
      const devicePixelRatio = window.devicePixelRatio || 1;
      const targetWidth = Math.round(rect.width * devicePixelRatio);
      const targetHeight = Math.round(rect.height * devicePixelRatio);
      
      if (targetWidth > 0 && targetHeight > 0) {
        const optimizedSrc = optimizeImageUrl(originalSrc, targetWidth, targetHeight);
        
        if (optimizedSrc !== originalSrc) {
          // Preload da imagem otimizada
          const preloadImg = new Image();
          preloadImg.onload = () => {
            img.src = optimizedSrc;
            img.dataset.optimized = 'true';
          };
          preloadImg.src = optimizedSrc;
        } else {
          img.dataset.optimized = 'true';
        }
      }
    });
  }, [optimizeImageUrl]);

  // Observer para novas imagens
  useEffect(() => {
    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const images = element.querySelectorAll ? element.querySelectorAll('img') : [];
            
            if (element.tagName === 'IMG') {
              setTimeout(optimizeExistingImages, 100);
            } else if (images.length > 0) {
              setTimeout(optimizeExistingImages, 100);
            }
          }
        });
      });
    });

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Otimizar imagens existentes na montagem
    optimizeExistingImages();

    // Re-otimizar em redimensionamento
    const handleResize = () => {
      if (window.imageOptimizeTimeout) {
        clearTimeout(window.imageOptimizeTimeout);
      }
      window.imageOptimizeTimeout = window.setTimeout(optimizeExistingImages, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      imageObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [optimizeExistingImages]);

  return <>{children}</>;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    imageOptimizeTimeout: number;
  }
}