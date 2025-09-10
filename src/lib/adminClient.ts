import { supabase } from '@/integrations/supabase/client';
import { configureAdminHeaders, verifyAdminAccess } from '@/lib/adminAuth';

/**
 * Creates a Supabase client configured for admin operations
 * Automatically includes the x-admin-email header required by RLS policies
 */
export const createAdminClient = async () => {
  // Verify admin access first
  const hasAccess = await verifyAdminAccess();
  if (!hasAccess) {
    throw new Error('Acesso negado: usuário não é administrador');
  }

  // Get admin email for headers
  const adminEmail = await configureAdminHeaders();
  if (!adminEmail) {
    throw new Error('Não foi possível identificar o administrador');
  }

  // Create a new client instance with admin headers
  const adminClient = supabase;
  
  // Note: Since we can't modify headers directly on the client,
  // we'll need to make direct fetch requests for admin operations
  return {
    adminEmail,
    
    // Helper method for admin database operations
    adminOperation: async (operation: () => Promise<any>) => {
      try {
        // Set a global header that can be accessed by the operation
        (globalThis as any).__adminEmail = adminEmail;
        const result = await operation();
        return result;
      } catch (error) {
        console.error('Admin operation failed:', error);
        throw error;
      } finally {
        // Clean up
        delete (globalThis as any).__adminEmail;
      }
    },

    // Direct REST API call with admin headers
    restCall: async (endpoint: string, options: RequestInit = {}) => {
      const SUPABASE_URL = 'https://nutlcbnruabjsxecqpnd.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c';
      
      const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
      
      console.log(`Admin REST call: ${options.method || 'GET'} ${url}`);
      console.log('Admin email header:', adminEmail);
      console.log('Request body:', options.body);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          'x-admin-email': adminEmail,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Admin REST call failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          endpoint,
        });
        
        // Parse error message if possible
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      return response.json();
    },
  };
};

/**
 * Enhanced error handling for admin operations
 */
export const handleAdminError = (error: any) => {
  console.error('Admin operation error:', error);
  
  if (error.message?.includes('JWT')) {
    return 'Sessão expirada. Faça login novamente.';
  }
  
  if (error.message?.includes('RLS')) {
    return 'Acesso negado. Verifique suas permissões de administrador.';
  }
  
  if (error.message?.includes('PGRST301')) {
    return 'Permissão negada. Verifique se você tem acesso de administrador.';
  }
  
  if (error.message?.includes('23505')) {
    return 'Já existe um artista com este slug. Tente um nome diferente.';
  }
  
  return error.message || 'Erro inesperado. Tente novamente.';
};