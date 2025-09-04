import { useEffect, useRef } from 'react';

interface RenderInfo {
  component: string;
  props?: any;
  timestamp: number;
}

export function useRenderDebug(componentName: string, props?: any) {
  const renderCountRef = useRef(0);
  const lastPropsRef = useRef(props);
  
  renderCountRef.current += 1;

  useEffect(() => {
    const renderInfo: RenderInfo = {
      component: componentName,
      props: props ? Object.keys(props) : undefined,
      timestamp: Date.now(),
    };

    // Log only if props changed or this is first render
    const propsChanged = JSON.stringify(lastPropsRef.current) !== JSON.stringify(props);
    
    if (renderCountRef.current === 1 || propsChanged) {
      console.debug(`🔄 [${componentName}] Render #${renderCountRef.current}`, renderInfo);
      
      if (propsChanged && renderCountRef.current > 1) {
        console.debug(`   📝 Props changed:`, {
          previous: lastPropsRef.current,
          current: props
        });
      }
    }

    lastPropsRef.current = props;
  });

  // Log excessive re-renders
  useEffect(() => {
    if (renderCountRef.current > 10) {
      console.warn(`⚠️ [${componentName}] Excessive re-renders detected: ${renderCountRef.current}`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    componentName,
  };
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      if (renderTime > 16) { // More than 1 frame at 60fps
        console.warn(`⏱️ [${componentName}] Slow render: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}