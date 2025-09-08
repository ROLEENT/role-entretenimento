import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { supabase } from '@/lib/supabase/client';

interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  url: string;
  timestamp: number;
}

export function PerformanceMonitor() {
  useEffect(() => {
    const sendAlert = async (alert: PerformanceAlert) => {
      try {
        await supabase
          .from('performance_alerts')
          .insert({
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            url: alert.url,
            timestamp: new Date(alert.timestamp).toISOString(),
            user_agent: navigator.userAgent
          });
      } catch (error) {
        console.warn('Failed to send performance alert:', error);
      }
    };

    // Monitor LCP and alert if > 2.5s
    onLCP((metric) => {
      if (metric.value > 2500) {
        sendAlert({
          metric: 'LCP',
          value: metric.value,
          threshold: 2500,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });

    // Monitor TTFB and alert if > 400ms
    onTTFB((metric) => {
      if (metric.value > 400) {
        sendAlert({
          metric: 'TTFB',
          value: metric.value,
          threshold: 400,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });

    // Monitor FCP and alert if > 1.2s
    onFCP((metric) => {
      if (metric.value > 1200) {
        sendAlert({
          metric: 'FCP',
          value: metric.value,
          threshold: 1200,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });

    // Monitor CLS and alert if > 0.1
    onCLS((metric) => {
      if (metric.value > 0.1) {
        sendAlert({
          metric: 'CLS',
          value: metric.value,
          threshold: 0.1,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });

    // Monitor FID and alert if > 100ms
    onFID((metric) => {
      if (metric.value > 100) {
        sendAlert({
          metric: 'FID',
          value: metric.value,
          threshold: 100,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    });

  }, []);

  return null;
}