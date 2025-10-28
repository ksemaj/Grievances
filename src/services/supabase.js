import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Initialize and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Environment variable exports for components that need them
export const getDiscordUserId = () => {
  const userId = import.meta.env.VITE_DISCORD_USER_ID;
  if (!userId) {
    console.warn('VITE_DISCORD_USER_ID not set. Discord notifications will not work.');
  }
  return userId;
};

export const getAccessPassword = () => {
  const password = import.meta.env.VITE_ACCESS_PASSWORD;
  if (!password) {
    throw new Error('VITE_ACCESS_PASSWORD not configured. Please set it in your .env.local file.');
  }
  return password;
};
