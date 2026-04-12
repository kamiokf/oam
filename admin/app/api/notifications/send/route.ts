import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@insforge/sdk';
import { checkRateLimit } from '../../../../lib/ratelimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
        const rateLimit = checkRateLimit(ip, 'heavy');
        if (!rateLimit.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { rows } = await req.json();

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'No notification rows provided' }, { status: 400 });
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
            return NextResponse.json({ error: 'Missing database configuration' }, { status: 500 });
        }

        const db = createClient({ baseUrl: url, anonKey: key });

        const { error } = await db.database
            .from('notifications')
            .insert(rows);

        if (error) {
            const msg = typeof error === 'object' && error !== null
                ? (error as any).message || (error as any).details || JSON.stringify(error)
                : String(error);
            console.error('[notifications/send] Insert failed:', msg, 'Rows:', JSON.stringify(rows));
            return NextResponse.json({ error: msg }, { status: 500 });
        }

        console.log(`[notifications/send] Inserted ${rows.length} notification(s)`);
        return NextResponse.json({ count: rows.length });

    } catch (err: any) {
        console.error('[notifications/send] Unexpected error:', err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
