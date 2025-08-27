import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nutlcbnruabjsxecqpnd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c";

// Create a Supabase client specifically for admin operations with automatic headers - VERSÃO APRIMORADA
export function createAdminSupabaseClient(adminEmail?: string) {
  console.log('[CREATE ADMIN CLIENT] Creating client with admin email:', adminEmail);
  
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  // Add request interceptor to automatically inject admin email header em TODAS as operações storage
  if (adminEmail) {
    console.log('[CREATE ADMIN CLIENT] Adding admin email header interceptor');
    
    const originalStorageFrom = client.storage.from.bind(client.storage);
    client.storage.from = function(bucketId: string) {
      console.log('[STORAGE FROM] Accessing bucket:', bucketId, 'with admin email:', adminEmail);
      
      const bucket = originalStorageFrom(bucketId);
      
      // Intercept ALL storage operations, not just upload
      const operations = ['upload', 'update', 'move', 'copy', 'remove', 'list', 'download'];
      
      operations.forEach(operation => {
        if (typeof bucket[operation] === 'function') {
          const originalOperation = bucket[operation].bind(bucket);
          
          bucket[operation] = function(...args: any[]) {
            console.log(`[STORAGE ${operation.toUpperCase()}] Adding admin header to ${operation} operation`);
            
            // Para operações que aceitam options como último parâmetro
            if (args.length > 0) {
              const lastArgIndex = args.length - 1;
              const lastArg = args[lastArgIndex];
              
              // Se o último argumento é um objeto de options ou se não existe, adicionar headers
              if (typeof lastArg === 'object' && lastArg !== null) {
                args[lastArgIndex] = {
                  ...lastArg,
                  headers: {
                    ...lastArg.headers,
                    'x-admin-email': adminEmail
                  }
                };
              } else {
                // Adicionar options com headers como novo último argumento
                args.push({
                  headers: {
                    'x-admin-email': adminEmail
                  }
                });
              }
            }
            
            console.log(`[STORAGE ${operation.toUpperCase()}] Final args:`, args);
            return originalOperation(...args);
          };
        }
      });
      
      return bucket;
    };
  } else {
    console.warn('[CREATE ADMIN CLIENT] No admin email provided - operations may fail');
  }

  return client;
}

// Get admin email from localStorage or session - VERSÃO APRIMORADA
export function getAdminEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log('[GET ADMIN EMAIL] Iniciando busca por email do admin...');
    
    // Try to get from admin-v2 session first (MÉTODO PRIMÁRIO)
    const adminSession = localStorage.getItem('admin-v2-session');
    console.log('[GET ADMIN EMAIL] Admin session raw:', adminSession);
    
    if (adminSession) {
      const session = JSON.parse(adminSession);
      console.log('[GET ADMIN EMAIL] Admin session parsed:', session);
      
      // Check if session is not expired (24h)
      const isExpired = Date.now() - (session.timestamp || 0) > 24 * 60 * 60 * 1000;
      if (isExpired) {
        console.warn('[GET ADMIN EMAIL] Admin session expired, removing...');
        localStorage.removeItem('admin-v2-session');
      } else if (session.email) {
        console.log('[GET ADMIN EMAIL] Email encontrado no admin session:', session.email);
        return session.email;
      } else if (session.user?.email) {
        console.log('[GET ADMIN EMAIL] Email encontrado no admin session user:', session.user.email);
        return session.user.email;
      }
    }
    
    // Fallback 1: Try to get from regular Supabase auth session
    const authData = localStorage.getItem('sb-nutlcbnruabjsxecqpnd-auth-token');
    console.log('[GET ADMIN EMAIL] Supabase auth data exists:', !!authData);
    
    if (authData) {
      const auth = JSON.parse(authData);
      console.log('[GET ADMIN EMAIL] Auth data user email:', auth.user?.email);
      if (auth.user?.email) {
        return auth.user.email;
      }
    }
    
    // Fallback 2: Try multiple localStorage keys
    const possibleKeys = [
      'supabase.auth.token',
      'sb-nutlcbnruabjsxecqpnd-auth-token',
      'admin-auth',
      'admin-session'
    ];
    
    for (const key of possibleKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.user?.email) {
            console.log(`[GET ADMIN EMAIL] Email encontrado em ${key}:`, parsed.user.email);
            return parsed.user.email;
          }
        }
      } catch (err) {
        // Silent fail for each key
      }
    }
    
    console.warn('[GET ADMIN EMAIL] Nenhum email encontrado em nenhuma fonte');
    
  } catch (error) {
    console.error('[GET ADMIN EMAIL] Error getting admin email:', error);
  }
  
  return null;
}