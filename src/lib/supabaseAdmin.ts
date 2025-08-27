import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nutlcbnruabjsxecqpnd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c";

// Create a Supabase client specifically for admin operations with automatic headers
export function createAdminSupabaseClient(adminEmail?: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  // Add request interceptor to automatically inject admin email header
  if (adminEmail) {
    const originalRequest = client.storage.from.bind(client.storage);
    client.storage.from = function(bucketId: string) {
      const bucket = originalRequest(bucketId);
      const originalUpload = bucket.upload.bind(bucket);
      
      bucket.upload = function(path: string, file: File | Blob, options: any = {}) {
        const headers = {
          ...options.headers,
          'x-admin-email': adminEmail
        };
        
        return originalUpload(path, file, { ...options, headers });
      };
      
      return bucket;
    };
  }

  return client;
}

// Get admin email from localStorage or session
export function getAdminEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try to get from admin-v2 session first (CORRETO!)
    const adminSession = localStorage.getItem('admin-v2-session');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      return session.email || null;
    }
    
    // Fallback to regular auth session
    const authData = localStorage.getItem('sb-nutlcbnruabjsxecqpnd-auth-token');
    if (authData) {
      const auth = JSON.parse(authData);
      return auth.user?.email || null;
    }
  } catch (error) {
    console.warn('Error getting admin email:', error);
  }
  
  return null;
}