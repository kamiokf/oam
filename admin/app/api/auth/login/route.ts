import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '../../../../lib/ratelimit';
import { verifySync } from 'otplib';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
        const identifier = body.email ? `auth_${body.email}` : ip;
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

        // Validate env vars
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const totpSecret = process.env.TOTP_SECRET;

        if (!adminEmail || !adminPassword || !totpSecret) {
            console.error('Missing ADMIN_EMAIL, ADMIN_PASSWORD, or TOTP_SECRET env vars');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500, headers }
            );
        }

        // Validate credentials
        if (body.email !== adminEmail || body.password !== adminPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401, headers }
            );
        }

        // Validate TOTP code
        const totpCode = body.totpCode;
        if (!totpCode || typeof totpCode !== 'string' || totpCode.length !== 6) {
            return NextResponse.json(
                { error: 'Invalid 2FA code' },
                { status: 401, headers }
            );
        }

        const isValid = verifySync({ token: totpCode, secret: totpSecret });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid 2FA code. Please check your authenticator app.' },
                { status: 401, headers }
            );
        }

        return NextResponse.json(
            { message: 'Authentication successful', token: 'admin-session-token' },
            { status: 200, headers }
        );

    } catch (e) {
        console.error('Login error:', e);
        return NextResponse.json(
            { error: 'Bad request' },
            { status: 400 }
        );
    }
}
