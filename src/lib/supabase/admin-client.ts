import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nutlcbnruabjsxecqpnd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c';

// Create admin-aware Supabase client
export const createAdminClient = (adminEmail?: string): SupabaseClient => {
  const headers: Record<string, string> = {
    'X-Client-Info': 'lovable-dashboard'
  };

  if (adminEmail) {
    headers['x-admin-email'] = adminEmail;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers
    }
  });
};

// Default client for non-admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable-dashboard'
    }
  }
});