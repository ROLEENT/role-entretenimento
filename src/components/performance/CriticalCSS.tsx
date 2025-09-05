import { useEffect } from 'react';

const criticalCSS = `
/* Critical above-the-fold styles */
.hero-section {
  background: var(--gradient-hero);
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-header {
  background: hsl(var(--background) / 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid hsl(var(--border));
  position: sticky;
  top: 0;
  z-index: 50;
}

.event-card {
  background: hsl(var(--card));
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  transition: var(--transition-smooth);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.highlight-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: calc(var(--radius) / 2);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.highlight-badge.vitrine {
  background: linear-gradient(135deg, hsl(45 100% 85%) 0%, hsl(45 100% 75%) 100%);
  color: hsl(45 100% 25%);
}

.highlight-badge.curatorial {
  background: linear-gradient(135deg, hsl(200 100% 85%) 0%, hsl(200 100% 75%) 100%);
  color: hsl(200 100% 25%);
}

.skeleton-loading {
  background: linear-gradient(90deg, 
    hsl(var(--muted)) 25%, 
    hsl(var(--muted) / 0.5) 50%, 
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Performance optimizations */
* {
  box-sizing: border-box;
}

img {
  max-width: 100%;
  height: auto;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export function CriticalCSS() {
  useEffect(() => {
    // Inject critical CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'critical-css';
    styleElement.textContent = criticalCSS;
    
    // Insert at the beginning of head for highest priority
    const firstChild = document.head.firstChild;
    if (firstChild) {
      document.head.insertBefore(styleElement, firstChild);
    } else {
      document.head.appendChild(styleElement);
    }

    // Cleanup function
    return () => {
      const existing = document.getElementById('critical-css');
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  return null;
}