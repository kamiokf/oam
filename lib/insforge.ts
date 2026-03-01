import { createClient } from '@insforge/sdk';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const insforge = createClient({
    baseUrl: supabaseUrl,
    anonKey: supabaseKey,
});
