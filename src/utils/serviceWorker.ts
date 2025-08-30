// Service Worker utilities for caching and offline support

export const registerServiceWorker = async () => {
  // Service Worker temporariamente desabilitado
  console.log('SW registration disabled for debugging');
  return;

  // Skip service worker registration for admin routes
  if (window.location.pathname.startsWith('/admin')) {
    console.log('SW registration skipped for admin routes');
    return;
  }

  // Service Worker temporarily disabled for debugging
  if (false && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Force update if there's an existing SW
      if (registration && navigator.serviceWorker.controller) {
        registration.update();
      }
      
      // Update SW when page gains focus
      window.addEventListener('focus', () => {
        registration.update();
      });
      
      // Listen for updates with error handling
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; please refresh
                showUpdateAvailableNotification();
              }
            }
          });
        }
      });

      // Handle update errors gracefully
      try {
        await registration.update();
      } catch (updateError) {
        // Ignore 404 errors from service worker updates
        if (updateError instanceof TypeError && updateError.message.includes('Not found')) {
          console.warn('SW update failed (404), ignoring:', updateError.message);
        } else {
          console.warn('SW update failed:', updateError);
        }
      }
      
      return registration;
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
    }
  }
};

const showUpdateAvailableNotification = () => {
  // This could be integrated with your toast system
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Nova versão disponível', {
      body: 'Uma nova versão do ROLÊ está disponível. Atualize a página para obter a versão mais recente.',
      icon: '/role-logo.png'
    });
  }
};

// Cache management
export const clearCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/role-logo.png',
    '/banner-home.png',
    '/manifest.json'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.png') ? 'image' : 'fetch';
    document.head.appendChild(link);
  });
};

// Network status detection
export const getNetworkStatus = () => {
  if ('navigator' in window && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Adaptive loading based on network
export const shouldReduceData = () => {
  const networkStatus = getNetworkStatus();
  if (!networkStatus) return false;
  
  return (
    networkStatus.saveData ||
    networkStatus.effectiveType === 'slow-2g' ||
    networkStatus.effectiveType === '2g' ||
    (networkStatus.effectiveType === '3g' && networkStatus.downlink < 1)
  );
};