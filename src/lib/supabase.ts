import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' &&
    import.meta.env.VITE_SUPABASE_URL !== 'YOUR_SUPABASE_URL';

// Safely create client
let client;
try {
    client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
    console.warn('Supabase client creation failed (likely due to missing/invalid config)', e);
    // Create a mock/placeholder client to prevent app crash
    client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
