// SMS Fallback for Jamaica's spotty data coverage
// Critical alerts get SMS backup when push delivery fails

export type AlertCategory = 'job_match' | 'application_update' | 'document_expiry' | 'payment' | 'dispute' | 'referral';
export type DeliveryMethod = 'push' | 'sms' | 'both';

export interface SMSAlert {
    id: string;
    category: AlertCategory;
    phone: string;
    message: string;
    sentVia: DeliveryMethod;
    pushDelivered: boolean;
    smsSent: boolean;
    timestamp: string;
}

// SMS messages must be ≤160 characters
export const formatSMSAlert = (category: AlertCategory, details: Record<string, string>): string => {
    const templates: Record<AlertCategory, (d: Record<string, string>) => string> = {
        job_match: (d) => `One'N'Move: New job match! ${d.route || 'Route available'} - ${d.pay || 'Competitive pay'}. Open app to apply.`,
        application_update: (d) => `One'N'Move: Your application for ${d.route || 'a position'} was ${d.status || 'updated'}. Check app for details.`,
        document_expiry: (d) => `One'N'Move: Your ${d.document || 'document'} expires in ${d.days || '?'} days. Renew now to stay active.`,
        payment: (d) => `One'N'Move: ${d.type === 'received' ? 'Payment received' : 'Payment due'}: ${d.amount || 'J$0'}. Check app for details.`,
        dispute: (d) => `One'N'Move: Dispute update — ${d.status || 'Status changed'}. Open app to respond within 24hrs.`,
        referral: (d) => `One'N'Move: ${d.name || 'Someone'} joined using your referral! ${d.bonus || 'Bonus'} pending. Check app.`,
    };

    const msg = templates[category](details);
    return msg.length > 160 ? msg.substring(0, 157) + '...' : msg;
};

// Determine if SMS fallback should trigger
export const shouldFallbackToSMS = (
    category: AlertCategory,
    pushDelivered: boolean,
    networkQuality: 'good' | 'fair' | 'poor' | 'offline',
    userSMSEnabled: boolean
): DeliveryMethod => {
    // Critical categories always get SMS if push fails
    const criticalCategories: AlertCategory[] = ['job_match', 'application_update', 'document_expiry', 'dispute'];

    if (!userSMSEnabled) return 'push';

    if (networkQuality === 'offline' || networkQuality === 'poor') {
        return criticalCategories.includes(category) ? 'sms' : 'push';
    }

    if (!pushDelivered && criticalCategories.includes(category)) {
        return 'both'; // retry with both
    }

    return 'push';
};

// Mock SMS alert history
export const mockSMSAlerts: SMSAlert[] = [
    {
        id: 'sms-001',
        category: 'job_match',
        phone: '+1 876 555 0101',
        message: "One'N'Move: New job match! Kingston → Ocho Rios - J$12,000/day. Open app to apply.",
        sentVia: 'both',
        pushDelivered: false,
        smsSent: true,
        timestamp: '2026-02-28T06:00:00',
    },
    {
        id: 'sms-002',
        category: 'application_update',
        phone: '+1 876 555 0101',
        message: "One'N'Move: Your application for Kingston → Spanish Town was accepted. Check app for details.",
        sentVia: 'push',
        pushDelivered: true,
        smsSent: false,
        timestamp: '2026-02-27T14:00:00',
    },
    {
        id: 'sms-003',
        category: 'document_expiry',
        phone: '+1 876 555 0103',
        message: "One'N'Move: Your Police Record expires in 15 days. Renew now to stay active.",
        sentVia: 'sms',
        pushDelivered: false,
        smsSent: true,
        timestamp: '2026-02-26T09:00:00',
    },
    {
        id: 'sms-004',
        category: 'payment',
        phone: '+1 876 555 0101',
        message: "One'N'Move: Payment received: J$42,500. Check app for details.",
        sentVia: 'push',
        pushDelivered: true,
        smsSent: false,
        timestamp: '2026-02-25T10:00:00',
    },
    {
        id: 'sms-005',
        category: 'dispute',
        phone: '+1 876 555 0104',
        message: "One'N'Move: Dispute update — Warning issued. Open app to respond within 24hrs.",
        sentVia: 'both',
        pushDelivered: false,
        smsSent: true,
        timestamp: '2026-02-25T16:30:00',
    },
];
