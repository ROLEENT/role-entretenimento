import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nutlcbnruabjsxecqpnd.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side client with service role key for administrative operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable-dashboard-server'
    }
  }
});

// Browser client fallback for environments where server client isn't available
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c';

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});