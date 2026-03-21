import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '../../../../lib/ratelimit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // For auth routes, limit by email if provided, otherwise fallback to IP
        // This helps prevent brute force attacks against a single user account
        const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
        const identifier = body.email ? `auth_${body.email}` : ip;

        // Apply the strict 'auth' tier limits (e.g., 5 requests per 5 minutes)
        const rateLimit = await checkRateLimit(identifier, 'auth');

        const headers = new Headers({
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again in 5 minutes.' },
                { status: 429, headers }
            );
        }

        // Validate credentials against environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('ADMIN_EMAIL or ADMIN_PASSWORD environment variables not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500, headers }
            );
        }

        if (body.email === adminEmail && body.password === adminPassword) {
            return NextResponse.json(
                { message: 'Authentication successful', token: 'admin-session-token' },
                { status: 200, headers }
            );
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401, headers }
        );

    } catch (e) {
        return NextResponse.json(
            { error: 'Bad request' },
            { status: 400 }
        );
    }
}
