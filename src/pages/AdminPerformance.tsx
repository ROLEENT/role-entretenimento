import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Activity, AlertTriangle, Clock, Cpu, HardDrive, Wifi } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceMetric {
  metric_name: string;
  avg_value: number;
  p75_value: number;
  p95_value: number;
  count: number;
}

interface JSError {
  error_message: string;
  count: number;
  last_occurred: string;
  affected_pages: string[];
}

interface StorageInfo {
  quota: number;
  usage: number;
  usageDetails?: Record<string, number>;
}

export default function AdminPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [errors, setErrors] = useState<JSError[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [swStatus, setSwStatus] = useState<string>('unknown');

  useEffect(() => {
    loadPerformanceData();
    checkServiceWorkerStatus();
    checkStorageQuota();
  }, []);

  const loadPerformanceData = async () => {
    try {
      const [metricsResult, errorsResult] = await Promise.all([
        supabase.rpc('get_performance_summary', { days_back: 7 }),
        supabase.rpc('get_top_errors', { days_back: 7, limit_count: 20 })
      ]);

      if (metricsResult.data) setMetrics(metricsResult.data);
      if (errorsResult.data) setErrors(errorsResult.data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkServiceWorkerStatus = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          if (registration.active) {
            setSwStatus('active');
          } else if (registration.installing) {
            setSwStatus('installing');
          } else if (registration.waiting) {
            setSwStatus('waiting');
          } else {
            setSwStatus('registered');
          }
        } else {
          setSwStatus('not-registered');
        }
      });
    } else {
      setSwStatus('not-supported');
    }
  };

  const checkStorageQuota = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const usageDetails = (estimate as any).usageDetails || {};
        
        setStorageInfo({
          quota,
          usage,
          usageDetails
        });
      } catch (error) {
        console.error('Error checking storage quota:', error);
      }
    }
  };

  const getMetricColor = (metricName: string, value: number) => {
    switch (metricName) {
      case 'LCP':
        return value <= 2500 ? 'default' : value <= 4000 ? 'secondary' : 'destructive';
      case 'FID':
        return value <= 100 ? 'default' : value <= 300 ? 'secondary' : 'destructive';
      case 'CLS':
        return value <= 0.1 ? 'default' : value <= 0.25 ? 'secondary' : 'destructive';
      case 'TTFB':
        return value <= 800 ? 'default' : value <= 1800 ? 'secondary' : 'destructive';
      default:
        return 'default';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSwStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'installing': return 'secondary';
      case 'waiting': return 'secondary';
      case 'registered': return 'default';
      case 'not-registered': return 'destructive';
      case 'not-supported': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <Button onClick={loadPerformanceData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.metric_name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.metric_name}
              </CardTitle>
              {metric.metric_name === 'LCP' && <Clock className="h-4 w-4 text-muted-foreground" />}
              {metric.metric_name === 'CLS' && <Activity className="h-4 w-4 text-muted-foreground" />}
              {metric.metric_name === 'TTFB' && <Wifi className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.avg_value}{metric.metric_name === 'CLS' ? '' : 'ms'}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant={getMetricColor(metric.metric_name, metric.p75_value)}>
                  P75: {metric.p75_value}{metric.metric_name === 'CLS' ? '' : 'ms'}
                </Badge>
                <Badge variant={getMetricColor(metric.metric_name, metric.p95_value)}>
                  P95: {metric.p95_value}{metric.metric_name === 'CLS' ? '' : 'ms'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.count} measurements
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={getSwStatusColor(swStatus)}>
                {swStatus.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Controls caching and offline functionality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Quota</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {storageInfo ? (
              <>
                <div className="text-2xl font-bold">
                  {Math.round((storageInfo.usage / storageInfo.quota) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
                </p>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(storageInfo.usage / storageInfo.quota) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Not available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">JavaScript Errors</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Top JavaScript Errors (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No JavaScript errors found in the last 7 days.
                </div>
              ) : (
                <div className="space-y-4">
                  {errors.map((error, index) => (
                    <div key={index} className="border-l-4 border-destructive pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{error.error_message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last occurred: {format(new Date(error.last_occurred), 'MMM dd, HH:mm')}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="destructive">{error.count} occurrences</Badge>
                            <Badge variant="outline">{error.affected_pages.length} pages</Badge>
                          </div>
                        </div>
                      </div>
                      {error.affected_pages.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Affected pages:</p>
                          <div className="text-xs text-muted-foreground">
                            {error.affected_pages.slice(0, 3).join(', ')}
                            {error.affected_pages.length > 3 && ` +${error.affected_pages.length - 3} more`}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.metric_name} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{metric.metric_name}</p>
                      <p className="text-xs text-muted-foreground">{metric.count} samples</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average</p>
                      <p className="font-medium">{metric.avg_value}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">75th Percentile</p>
                      <p className="font-medium">{metric.p75_value}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">95th Percentile</p>
                      <p className="font-medium">{metric.p95_value}ms</p>
                    </div>
                    <div>
                      <Badge variant={getMetricColor(metric.metric_name, metric.p95_value)}>
                        {metric.p95_value <= 2500 ? 'Good' : metric.p95_value <= 4000 ? 'Needs Improvement' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}