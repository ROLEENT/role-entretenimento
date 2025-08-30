// Performance optimization utilities

// Image lazy loading with intersection observer
export const createImageObserver = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        observer.unobserve(img);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  return imageObserver;
};

// Component lazy loading
export const createComponentObserver = (callback: () => void) => {
  const componentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback();
        componentObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  return componentObserver;
};

// Cache management
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key: string) {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const cache = new SimpleCache();

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Temporarily disabled to prevent preload warnings
  // const criticalImages = [
  //   '/banner-home.png',
  //   '/role-logo.png'
  // ];

  // const criticalCSS = [
  //   '/index.css'
  // ];

  // // Preload images
  // criticalImages.forEach(src => {
  //   const link = document.createElement('link');
  //   link.rel = 'preload';
  //   link.as = 'image';
  //   link.href = src;
  //   document.head.appendChild(link);
  // });

  // // Preload CSS
  // criticalCSS.forEach(href => {
  //   const link = document.createElement('link');
  //   link.rel = 'preload';
  //   link.as = 'style';
  //   link.href = href;
  //   document.head.appendChild(link);
  // });

  // Preconnect to external domains
  const externalDomains = [
    'https://nutlcbnruabjsxecqpnd.supabase.co'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Simple error fallback component generator
export const createErrorFallback = (message: string = 'Erro ao carregar componente') => {
  return message;
};

// Resource hints
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    '//nutlcbnruabjsxecqpnd.supabase.co',
    '//fonts.googleapis.com',
    '//fonts.gstatic.com'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};