import { NextResponse } from 'next/server';
import { generateURI } from 'otplib';
import QRCode from 'qrcode';

export async function GET() {
    try {
        const totpSecret = process.env.TOTP_SECRET;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!totpSecret || !adminEmail) {
            return NextResponse.json(
                { error: 'TOTP not configured' },
                { status: 500 }
            );
        }

        // Generate the otpauth URI for authenticator apps
        const uri = generateURI({
            secret: totpSecret,
            issuer: "One'N'Move Admin",
            label: adminEmail,
        });

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(uri, {
            width: 280,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return NextResponse.json({
            qrCode: qrDataUrl,
            secret: totpSecret,
            uri,
        });

    } catch (e) {
        console.error('2FA setup error:', e);
        return NextResponse.json(
            { error: 'Failed to generate 2FA setup' },
            { status: 500 }
        );
    }
}
