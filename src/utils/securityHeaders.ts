// Security headers configuration for production
export const securityHeaders = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Necessário para Vite em dev, remover em prod
      "'unsafe-eval'", // Necessário para Vite em dev, remover em prod
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://connect.facebook.net",
      "https://pagead2.googlesyndication.com",
      "https://js.sentry-cdn.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Necessário para Tailwind
      "https://fonts.googleapis.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "https://nutlcbnruabjsxecqpnd.supabase.co",
      "https://images.unsplash.com",
      "https://roleentretenimento.com"
    ],
    'font-src': [
      "'self'",
      "data:",
      "https://fonts.gstatic.com"
    ],
    'connect-src': [
      "'self'",
      "https://nutlcbnruabjsxecqpnd.supabase.co",
      "https://www.google-analytics.com",
      "https://stats.g.doubleclick.net",
      "https://o4507234567890.ingest.sentry.io" // Sentry DSN
    ],
    'frame-src': [
      "'self'",
      "https://www.youtube.com",
      "https://player.vimeo.com"
    ],
    'media-src': [
      "'self'",
      "blob:",
      "data:",
      "https:"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': true
  },
  
  // Other security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
};

// Function to generate CSP string
export const generateCSPString = () => {
  const { csp } = securityHeaders;
  
  return Object.entries(csp)
    .map(([directive, sources]) => {
      if (typeof sources === 'boolean') {
        return sources ? directive : '';
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
};

// Function to apply CSP meta tag (for development)
export const applyCspMetaTag = () => {
  if (import.meta.env.MODE === 'development') {
    // Em desenvolvimento, CSP mais permissivo
    const devCsp = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;";
    
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content = devCsp;
    document.head.appendChild(metaTag);
  }
};

// Function to check if running in secure context
export const checkSecureContext = () => {
  if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') {
    console.warn('Site não está em contexto seguro. Algumas funcionalidades podem estar limitadas.');
  }
};

// Apply security configurations on app start
export const initSecurity = () => {
  applyCspMetaTag();
  checkSecureContext();
  
  // Disable right-click in production (opcional)
  if (import.meta.env.MODE === 'production') {
    document.addEventListener('contextmenu', (e) => {
      if (!import.meta.env.DEV) {
        e.preventDefault();
      }
    });
  }
  
  // Import and setup enhanced security
  import('@/utils/security/cspHeaders').then(({ setupSecurityProtections }) => {
    setupSecurityProtections();
  });
};
