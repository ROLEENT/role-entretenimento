import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { preloadCriticalResources, registerServiceWorker } from "@/utils/serviceWorker";
import { addResourceHints, optimizeForMobile } from "@/utils/performanceHelpers";
import { initPerformanceMonitoring } from "./utils/performanceMonitor";

// Initialize performance optimizations
preloadCriticalResources();
addResourceHints();
optimizeForMobile();

// Initialize performance monitoring
initPerformanceMonitoring();

// Register service worker for caching (skip for admin routes)
if (!window.location.pathname.startsWith('/admin')) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(<App />);
