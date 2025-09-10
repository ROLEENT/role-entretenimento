// Content Security Policy e Headers de Segurança
export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'media-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests'?: boolean;
}

// CSP para produção (mais restritivo)
const productionCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para alguns componentes
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
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
    "https://images.unsplash.com"
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
    "https://o4507234567890.ingest.sentry.io"
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
};

// CSP para desenvolvimento (mais permissivo)
const developmentCSP: CSPDirectives = {
  ...productionCSP,
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Necessário para HMR
    "https:",
    "http://localhost:*"
  ],
  'connect-src': [
    ...productionCSP['connect-src'],
    "ws:",
    "wss:",
    "http://localhost:*"
  ]
};

// Gerar string CSP
export const generateCSPString = (directives: CSPDirectives): string => {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (typeof sources === 'boolean') {
        return sources ? directive : '';
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
};

// Headers de segurança adicionais
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Removed applyCSP - CSP is now handled via HTTP headers only

// Verificar contexto seguro
export const checkSecureContext = () => {
  if (!window.isSecureContext && 
      location.protocol !== 'https:' && 
      location.hostname !== 'localhost') {
    console.warn('⚠️ Site não está em contexto seguro. Algumas funcionalidades podem estar limitadas.');
    return false;
  }
  return true;
};

// Configurar proteções contra ataques
export const setupSecurityProtections = () => {
  // Verificar contexto seguro
  checkSecureContext();
  
  // Desabilitar click direito em produção (opcional)
  if (import.meta.env.MODE === 'production') {
    document.addEventListener('contextmenu', (e) => {
      if (!import.meta.env.DEV) {
        e.preventDefault();
      }
    });
  }
  
  // Proteção contra console.log em produção
  if (import.meta.env.MODE === 'production') {
    const noop = () => {};
    Object.keys(console).forEach(key => {
      if (typeof console[key as keyof Console] === 'function') {
        (console as any)[key] = noop;
      }
    });
  }
};