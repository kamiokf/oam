import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '../../../../lib/ratelimit';

export async function GET(req: NextRequest) {
    // For public routes, we rate limit based on IP address
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';

    // Apply the 'public' tier limits (e.g., 100 requests per minute)
    const rateLimit = await checkRateLimit(ip, 'public');

    const headers = new Headers({
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset.toString(),
    });

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers }
        );
    }

    // Mock successful public data fetch
    return NextResponse.json(
        {
            message: 'Successfully fetched public jobs',
            data: [
                { id: 'job-1', route: 'Kingston to Ocho Rios', price: 15000 },
                { id: 'job-2', route: 'Montego Bay Airport Transfer', price: 8000 }
            ]
        },
        { status: 200, headers }
    );
}
