import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries - keep together for better caching
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Critical UI components - smaller chunks for faster loading
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          
          // API and data handling
          if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
            return 'api-vendor';
          }
          
          // Performance monitoring - separate to avoid blocking
          if (id.includes('@sentry') || id.includes('web-vitals')) {
            return 'monitoring';
          }
          
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          
          // Motion libraries - separate for performance
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          
          // Admin components - lazy loaded
          if (id.includes('/admin/') || id.includes('admin-')) {
            return 'admin';
          }
          
          // Large node_modules libraries
          if (id.includes('node_modules') && id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          
          // Keep other node_modules together but smaller
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk sizes
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `${facadeModuleId}-[hash].js`;
        },
        // Asset optimization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Modern build target
    target: 'es2020',
    sourcemap: mode === 'development',
    // Use esbuild for minification (faster and included by default)
    minify: mode === 'production' ? 'esbuild' : false,
    // Asset size limits - inline smaller assets for fewer requests
    assetsInlineLimit: 8192,
    // CSS code splitting
    cssCodeSplit: true,
  },
  optimizeDeps: {
    // Pre-bundle critical dependencies for faster dev and production
    include: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react',
      'react-dom',
      'react-router-dom',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast'
    ],
    // Exclude heavy libraries from pre-bundling
    exclude: ['@vite/client', '@vite/env', 'framer-motion'],
  },
  // Performance hints
  esbuild: {
    // Remove console.log in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
