import { useEffect, useState } from 'react';
import { initWebVitalsTracking, getMetricsSnapshot, areMetricsHealthy, getPerformanceScore } from '@/utils/webVitalsTracker';
import { initPerformanceMonitoring } from '@/utils/performanceMonitor';
import { preloadCriticalResources, addResourceHints } from '@/utils/performanceHelpers';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

interface CoreWebVitalsDisplayProps {
  className?: string;
}

interface MetricData {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

export function CoreWebVitalsDisplay({ className }: CoreWebVitalsDisplayProps) {
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({});
  const [score, setScore] = useState(100);
  const [isHealthy, setIsHealthy] = useState(true);
  const { 
    metrics: perfMetrics, 
    config, 
    shouldReduceMotion, 
    shouldReduceData,
    maxImageQuality 
  } = usePerformanceOptimizations();

  useEffect(() => {
    // Initialize all performance monitoring
    initWebVitalsTracking();
    initPerformanceMonitoring();
    preloadCriticalResources();
    addResourceHints();

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      const currentMetrics = getMetricsSnapshot();
      setMetrics(currentMetrics);
      setScore(getPerformanceScore());
      setIsHealthy(areMetricsHealthy());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMetricStatus = (metricName: string) => {
    const metric = metrics[metricName];
    if (!metric) return 'unknown';
    return metric.rating;
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const formatMetricValue = (metricName: string, value: number) => {
    switch (metricName) {
      case 'CLS':
        return value.toFixed(3);
      case 'FCP':
      case 'LCP':
      case 'TTFB':
      case 'FID':
      case 'INP':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>
            Overall performance based on Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">{score}</div>
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <Badge variant={isHealthy ? 'default' : 'secondary'}>
                {isHealthy ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
          <Progress value={score} className="h-2" />
        </CardContent>
      </Card>

      {/* Core Web Vitals Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Real-time performance metrics affecting user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(metrics).map(([name, metric]) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{name}</span>
                  <Badge 
                    variant={metric.rating === 'good' ? 'default' : 'secondary'}
                    className={getMetricColor(metric.rating)}
                  >
                    {metric.rating}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {formatMetricValue(name, metric.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: ≤{formatMetricValue(name, metric.threshold.good)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Optimization Status
          </CardTitle>
          <CardDescription>
            Current performance optimizations applied
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Connection Type</span>
              <Badge variant="outline">{perfMetrics.connectionType || 'Unknown'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Device Memory</span>
              <Badge variant="outline">{perfMetrics.deviceMemory || 'Unknown'} GB</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Saver</span>
              <Badge variant={shouldReduceData ? 'default' : 'outline'}>
                {shouldReduceData ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reduced Motion</span>
              <Badge variant={shouldReduceMotion ? 'default' : 'outline'}>
                {shouldReduceMotion ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Image Quality</span>
              <Badge variant="outline">{maxImageQuality}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Lazy Loading</span>
              <Badge variant={config.enableLazyLoading ? 'default' : 'outline'}>
                {config.enableLazyLoading ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      {!isHealthy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(metrics).map(([name, metric]) => {
                if (metric.rating !== 'good') {
                  return (
                    <div key={name} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>{name}</strong>: {getPerformanceTip(name, metric.rating)}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getPerformanceTip(metricName: string, rating: string): string {
  const tips = {
    LCP: {
      'needs-improvement': 'Consider optimizing images, fonts, or server response time.',
      'poor': 'Critical: Review large images, third-party scripts, and server performance.'
    },
    FID: {
      'needs-improvement': 'Reduce JavaScript execution time and split large bundles.',
      'poor': 'Critical: Minimize main thread blocking and optimize JavaScript.'
    },
    CLS: {
      'needs-improvement': 'Set size attributes on images and avoid inserting content dynamically.',
      'poor': 'Critical: Fix layout shifts from images, fonts, or dynamic content.'
    },
    FCP: {
      'needs-improvement': 'Optimize critical resources and reduce render-blocking resources.',
      'poor': 'Critical: Review server response time and critical resource loading.'
    },
    TTFB: {
      'needs-improvement': 'Optimize server response time and use CDN.',
      'poor': 'Critical: Server performance issues detected.'
    },
    INP: {
      'needs-improvement': 'Optimize event handlers and reduce JavaScript execution time.',
      'poor': 'Critical: Significant interaction delays detected.'
    }
  };

  return tips[metricName as keyof typeof tips]?.[rating as 'needs-improvement' | 'poor'] || 
         'Review performance optimization opportunities.';
}

// Performance optimization wrapper component
export function PerformanceOptimizer({ children }: { children: React.ReactNode }) {
  const { config } = usePerformanceOptimizations();

  const { shouldReduceMotion: reduceMotion } = usePerformanceOptimizations();
  
  useEffect(() => {
    // Apply performance optimizations
    if (config.enableDataSaver) {
      document.documentElement.classList.add('data-saver');
    }
    
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    }
  }, [config, reduceMotion]);

  return <>{children}</>;
}