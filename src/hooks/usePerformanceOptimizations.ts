import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  connectionType: string;
  deviceMemory: number;
  saveData: boolean;
  reduceMotion: boolean;
}

interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableReducedMotion: boolean;
  enableDataSaver: boolean;
  maxImageQuality: number;
  preloadCritical: boolean;
}

export function usePerformanceOptimizations() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    connectionType: '4g',
    deviceMemory: 8,
    saveData: false,
    reduceMotion: false,
  });

  const [config, setConfig] = useState<PerformanceConfig>({
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableReducedMotion: false,
    enableDataSaver: false,
    maxImageQuality: 85,
    preloadCritical: true,
  });

  // Detect performance metrics
  useEffect(() => {
    const updateMetrics = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const deviceMemory = (navigator as any).deviceMemory || 8;
      const saveData = connection?.saveData || false;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setMetrics({
        connectionType: connection?.effectiveType || '4g',
        deviceMemory,
        saveData,
        reduceMotion,
      });
    };

    updateMetrics();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateMetrics);
      return () => connection.removeEventListener('change', updateMetrics);
    }
  }, []);

  // Auto-adjust config based on metrics
  useEffect(() => {
    const newConfig: PerformanceConfig = {
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableReducedMotion: metrics.reduceMotion,
      enableDataSaver: metrics.saveData,
      maxImageQuality: 85,
      preloadCritical: true,
    };

    // Adjust for slow connections
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      newConfig.maxImageQuality = 60;
      newConfig.enableDataSaver = true;
      newConfig.preloadCritical = false;
    } else if (metrics.connectionType === '3g') {
      newConfig.maxImageQuality = 75;
    }

    // Adjust for low memory devices
    if (metrics.deviceMemory < 4) {
      newConfig.maxImageQuality = Math.min(newConfig.maxImageQuality, 70);
      newConfig.preloadCritical = false;
    }

    // Force data saver if explicitly enabled
    if (metrics.saveData) {
      newConfig.enableDataSaver = true;
      newConfig.maxImageQuality = Math.min(newConfig.maxImageQuality, 65);
    }

    setConfig(newConfig);
  }, [metrics]);

  // Preload critical resources
  const preloadResource = useCallback((url: string, type: 'image' | 'font' | 'script' | 'style') => {
    if (!config.preloadCritical) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }

    document.head.appendChild(link);
  }, [config.preloadCritical]);

  // Optimize image URL based on current config
  const optimizeImageUrl = useCallback((url: string, width?: number, height?: number) => {
    if (!config.enableImageOptimization || !url.includes('supabase.co/storage')) {
      return url;
    }

    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    
    params.set('quality', config.maxImageQuality.toString());
    
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    
    // Use WebP for better compression on supported browsers
    if ('WebP' in (window as any) || CSS.supports('(background-image: url("data:image/webp;base64,"))')) {
      params.set('format', 'webp');
    }

    return `${baseUrl}?${params.toString()}`;
  }, [config]);

  // Critical resource hints
  const addResourceHints = useCallback(() => {
    const hints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://nutlcbnruabjsxecqpnd.supabase.co' },
    ];

    hints.forEach(hint => {
      const existing = document.querySelector(`link[href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Initialize resource hints
  useEffect(() => {
    addResourceHints();
  }, [addResourceHints]);

  return {
    metrics,
    config,
    preloadResource,
    optimizeImageUrl,
    shouldReduceMotion: config.enableReducedMotion,
    shouldReduceData: config.enableDataSaver,
    maxImageQuality: config.maxImageQuality,
  };
}