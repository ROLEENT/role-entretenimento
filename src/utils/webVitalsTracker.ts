import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

interface WebVitalMetrics {
  [key: string]: {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    threshold: { good: number; poor: number };
  };
}

// Web Vitals thresholds per Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

let metrics: WebVitalMetrics = {};

const getRating = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

const processMetric = (metric: Metric) => {
  const rating = getRating(metric.name, metric.value);
  const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];
  
  metrics[metric.name] = {
    value: metric.value,
    rating,
    threshold
  };

  // Log to console for debugging
  console.log(`[Web Vitals] ${metric.name}: ${metric.value}ms (${rating})`);
  
  // Send to analytics if available
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: rating,
      custom_parameter_1: rating
    });
  }
};

// Initialize Web Vitals tracking
export const initWebVitalsTracking = () => {
  try {
    onCLS(processMetric);
    onFID(processMetric);
    onFCP(processMetric);
    onLCP(processMetric);
    onTTFB(processMetric);
    onINP(processMetric);
    
    console.log('[Web Vitals] Tracking initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize tracking:', error);
  }
};

// Get current metrics snapshot
export const getMetricsSnapshot = (): WebVitalMetrics => {
  return { ...metrics };
};

// Check if all critical metrics are within "good" thresholds
export const areMetricsHealthy = (): boolean => {
  const criticalMetrics = ['LCP', 'CLS', 'INP'];
  return criticalMetrics.every(metric => 
    metrics[metric]?.rating === 'good' || !metrics[metric]
  );
};

// Get performance score (0-100)
export const getPerformanceScore = (): number => {
  const metricNames = Object.keys(metrics);
  if (metricNames.length === 0) return 100;
  
  const scores = metricNames.map(name => {
    const metric = metrics[name];
    switch (metric.rating) {
      case 'good': return 100;
      case 'needs-improvement': return 75;
      case 'poor': return 25;
      default: return 100;
    }
  });
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

// Export metrics for external use
export { metrics };