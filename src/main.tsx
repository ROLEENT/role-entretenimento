import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { preloadCriticalResources, registerServiceWorker } from "@/utils/serviceWorker";
import { addResourceHints, optimizeForMobile } from "@/utils/performanceHelpers";

// Initialize performance optimizations
preloadCriticalResources();
addResourceHints();
optimizeForMobile();

// Register service worker for caching
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
