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

// Initialize security (CSP, context checks)
initSecurity();

// Initialize performance optimizations
preloadCriticalResources();
addResourceHints();
optimizeForMobile();

// Initialize performance monitoring
initPerformanceMonitoring();

// Register service worker for caching (skip for admin routes)
// SW temporariamente desabilitado para debugging
// if (!window.location.pathname.startsWith('/admin')) {
//   registerServiceWorker();
// }

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <CriticalCSS />
    <ResourceOptimizer />
    <App />
  </HelmetProvider>
);
