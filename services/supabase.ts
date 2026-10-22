import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

// Only defined when isMockMode is false. Services that use this must only be
// instantiated after checking isMockMode (done in App.tsx).
export const supabase = isMockMode ? null : createClient(supabaseUrl, supabaseAnonKey);
