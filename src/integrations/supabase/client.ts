import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Create a dummy client that won't throw errors when not configured
const createSupabaseClient = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  // Return a placeholder client with valid dummy URL to prevent initialization errors
  // Auth operations will be blocked by isSupabaseConfigured() checks
  return createClient('https://placeholder.supabase.co', 'placeholder-key');
};

export const supabase = createSupabaseClient();
