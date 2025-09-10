import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Configure CSP header to avoid warning about frame-ancestors in meta tags
      'Content-Security-Policy': "frame-ancestors 'self' https://roleentretenimento.com https://vercel.live;"
    },
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
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-select'
          ],
          // API and data
          'api-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
          // Utilities
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          // Performance monitoring
          'monitoring': ['@sentry/react', 'web-vitals']
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
    // Asset size limits
    assetsInlineLimit: 4096,
    // CSS code splitting
    cssCodeSplit: true,
  },
  optimizeDeps: {
    // Pre-bundle critical dependencies
    include: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    // Exclude dev dependencies
    exclude: ['@vite/client', '@vite/env'],
  },
  // Performance hints
  esbuild: {
    // Remove console.log in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
