import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { preloadCriticalResources, registerServiceWorker } from "@/utils/serviceWorker";
import { addResourceHints, optimizeForMobile } from "@/utils/performanceHelpers";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";
import { initSecurity } from "@/utils/securityHeaders";
import { CriticalCSS } from "./components/performance/CriticalCSS";
import { ResourceOptimizer } from "./components/performance/ResourceOptimizer";
import { ImageOptimizer } from "./components/performance/ImageOptimizer";
import { CriticalResourcesOptimizer } from "./components/performance/CriticalResourcesOptimizer";
import { LCPOptimizer } from "./components/performance/LCPOptimizer";
import { CacheOptimizer } from "./components/performance/CacheOptimizer";
import { PerformanceMonitor } from "./components/performance/PerformanceMonitor";

// Initialize security (CSP, context checks)
initSecurity();

// Initialize performance optimizations
preloadCriticalResources();
addResourceHints();
optimizeForMobile();

// Initialize performance monitoring
initPerformanceMonitoring();

// Register service worker for caching - re-enabled for performance
if (!window.location.pathname.startsWith('/admin')) {
  // Delay SW registration to not block initial load
  setTimeout(() => {
    registerServiceWorker();
  }, 1000);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <CriticalCSS />
    <CriticalResourcesOptimizer />
    <LCPOptimizer />
    <CacheOptimizer />
    <PerformanceMonitor />
    <ResourceOptimizer />
    <ImageOptimizer>
      <App />
    </ImageOptimizer>
  </HelmetProvider>
);
