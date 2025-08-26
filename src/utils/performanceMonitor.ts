import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

// Generate a unique session ID for this page load
const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface PerformanceData {
  sessionId: string;
  metricName: string;
  metricValue: number;
  unit: string;
  pageUrl: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
}

const getConnectionInfo = () => {
  const nav = navigator as any;
  return {
    connectionType: nav.connection?.effectiveType || 'unknown',
    deviceMemory: nav.deviceMemory || undefined
  };
};

const sendMetricToSupabase = async (metric: Metric) => {
  try {
    const { connectionType, deviceMemory } = getConnectionInfo();
    
    const performanceData: PerformanceData = {
      sessionId,
      metricName: metric.name,
      metricValue: metric.value,
      unit: metric.name === 'CLS' ? 'score' : 'ms',
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      connectionType,
      deviceMemory
    };

    await supabase.from('perf_metrics').insert({
      session_id: performanceData.sessionId,
      metric_name: performanceData.metricName,
      metric_value: performanceData.metricValue,
      unit: performanceData.unit,
      page_url: performanceData.pageUrl,
      user_agent: performanceData.userAgent,
      connection_type: performanceData.connectionType,
      device_memory: performanceData.deviceMemory
    });

    console.log(`Performance metric sent: ${metric.name} = ${metric.value}${performanceData.unit}`);
  } catch (error) {
    console.error('Error sending performance metric:', error);
  }
};

// Track JavaScript errors
const trackJSErrors = () => {
  const originalErrorHandler = window.onerror;
  
  window.onerror = (message, source, line, column, error) => {
    sendJSErrorToSupabase({
      message: message?.toString() || 'Unknown error',
      source: source || '',
      line: line || 0,
      column: column || 0,
      stack: error?.stack || ''
    });

    // Call original handler if it exists
    if (originalErrorHandler) {
      originalErrorHandler(message, source, line, column, error);
    }
  };

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    sendJSErrorToSupabase({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      source: window.location.href,
      line: 0,
      column: 0,
      stack: event.reason?.stack || ''
    });
  });
};

const sendJSErrorToSupabase = async (errorInfo: {
  message: string;
  source: string;
  line: number;
  column: number;
  stack: string;
}) => {
  try {
    await supabase.from('js_errors').insert({
      session_id: sessionId,
      error_message: errorInfo.message,
      error_stack: errorInfo.stack,
      page_url: window.location.href,
      line_number: errorInfo.line,
      column_number: errorInfo.column,
      user_agent: navigator.userAgent
    });

    console.log('JS Error tracked:', errorInfo.message);
  } catch (error) {
    console.error('Error sending JS error data:', error);
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Track Core Web Vitals
  onCLS(sendMetricToSupabase);
  onFID(sendMetricToSupabase);
  onFCP(sendMetricToSupabase);
  onLCP(sendMetricToSupabase);
  onTTFB(sendMetricToSupabase);

  // Track JavaScript errors
  trackJSErrors();

  console.log('Performance monitoring initialized');
};

// Export session ID for debugging
export { sessionId };