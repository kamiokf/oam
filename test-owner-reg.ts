import { createClient } from '@insforge/sdk';


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const insforge = createClient({
    baseUrl: supabaseUrl,
    anonKey: supabaseKey,
});

async function main() {
    const dbData = {
        name: 'Test Owner',
        phone: '+1 876 555 1234',
        avatar: 'TO',
        role: 'owner',
        status: 'active',
        verification_tier: 'registered',
        trn: `TRN${Date.now()}`.slice(0, 9),
        parish: 'Kingston',
        business_name: 'Test Business',
        route_licence_number: 'RL-1234',
        licence_class: null,
        tlc_number: null,
        primary_routes: ['Half Way Tree to Down Town'],
        experience: 0,
        number_of_vehicles: 1,
    };

    const response = await insforge.database.from('users').insert(dbData).select('*').single();

    if (response.error) {
        console.error('ERROR:', response.error);
    } else {
        console.log('SUCCESS:', response.data);
    }
}

main().catch(console.error);
