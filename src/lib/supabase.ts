import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wogprdohptvfnmdanutd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_diKkRMGUriFi0iC7g05cWA_5UtiOouA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

