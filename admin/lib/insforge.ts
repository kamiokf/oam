import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!insforgeUrl || !insforgeAnonKey) {
    console.warn("Missing InsForge environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
});
