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
    // Melhorar resolução de módulos
    rollupOptions: {
      output: {
        manualChunks: {
          // Garantir que APIs sejam bundled corretamente
          'api': ['src/api/eventsApi.ts']
        }
      }
    },
    // Garantir compatibilidade com dynamic imports
    target: 'es2020',
    sourcemap: mode === 'development'
  },
  optimizeDeps: {
    // Pré-construir dependências críticas
    include: ['@supabase/supabase-js', '@tanstack/react-query']
  }
}));
