import { createClient } from "@supabase/supabase-js";

// Lovable doesn't support VITE_* env vars, so we use the actual values
// These are public/publishable keys, so it's safe to include them in the codebase
const url = "https://nutlcbnruabjsxecqpnd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c";

// debug seguro
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // não loga a chave, só a presença
  console.log("[DEBUG] SUPABASE_URL?", !!url, "SUPABASE_ANON_KEY?", !!key);
}

export const supabase = createClient(url, key);
export const supabaseReady = !!url && !!key;