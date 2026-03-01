export type AlertCategory = 'announcement' | 'compliance' | 'safety' | 'opportunity' | 'account' | 'promotion' | 'emergency';
export type AlertPriority = 'normal' | 'high' | 'emergency';
export type AlertStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';

export interface Alert {
    id: string;
    title: string;
    bodyRich: string;
    bodyPlain: string;
    category: AlertCategory;
    priority: AlertPriority;
    ctaLabel?: string;
    ctaDestination?: string;
    targetingSummary: string;
    channels: string[];
    status: AlertStatus;
    recipientCount: number;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    sentAt?: string;
    deliveryStats?: {
        delivered: number;
        read: number;
        clicked: number;
        failed: number;
    };
}

export interface AlertTemplate {
    id: string;
    name: string;
    titleTemplate: string;
    bodyTemplate: string;
    category: AlertCategory;
    ctaLabel?: string;
    ctaDestination?: string;
    variables: string[];
}

export const mockAlerts: Alert[] = [
    {
        id: 'alert-1',
        title: 'Document Expiry Warning',
        bodyRich: '<p>Your Police Record is set to expire within 30 days. Please upload a renewed document to maintain your verified status.</p>',
        bodyPlain: 'Your Police Record is set to expire within 30 days. Please upload a renewed document.',
        category: 'compliance',
        priority: 'normal',
        ctaLabel: 'Upload Document',
        ctaDestination: '/profile/documents',
        targetingSummary: 'Drivers with expiring police records (23 users)',
        channels: ['push', 'in_app', 'sms'],
        status: 'sent',
        recipientCount: 23,
        createdBy: 'admin-1',
        createdByName: 'Patrick Reid',
        createdAt: '2026-02-26T08:00:00',
        sentAt: '2026-02-26T08:00:00',
        deliveryStats: { delivered: 22, read: 18, clicked: 12, failed: 1 },
    },
    {
        id: 'alert-2',
        title: 'Welcome to One\'N\'Move!',
        bodyRich: '<p>Welcome aboard! Complete your verification to start finding driving opportunities or posting job listings.</p>',
        bodyPlain: 'Welcome to One\'N\'Move! Complete your verification to get started.',
        category: 'account',
        priority: 'normal',
        ctaLabel: 'Complete Verification',
        ctaDestination: '/profile/verification',
        targetingSummary: 'New registrations this week (8 users)',
        channels: ['push', 'in_app'],
        status: 'sent',
        recipientCount: 8,
        createdBy: 'admin-2',
        createdByName: 'Natasha Campbell',
        createdAt: '2026-02-24T10:00:00',
        sentAt: '2026-02-24T10:00:00',
        deliveryStats: { delivered: 8, read: 6, clicked: 4, failed: 0 },
    },
    {
        id: 'alert-3',
        title: 'Route Alert: Kingston – Spanish Town',
        bodyRich: '<p>Road construction on Mandela Highway may cause delays. Please allow extra travel time and plan accordingly.</p>',
        bodyPlain: 'Road construction on Mandela Highway. Expect delays on Kingston-Spanish Town route.',
        category: 'safety',
        priority: 'high',
        targetingSummary: 'All users on Kingston-Spanish Town route (45 users)',
        channels: ['push', 'in_app'],
        status: 'sent',
        recipientCount: 45,
        createdBy: 'admin-1',
        createdByName: 'Patrick Reid',
        createdAt: '2026-02-27T07:30:00',
        sentAt: '2026-02-27T07:31:00',
        deliveryStats: { delivered: 43, read: 38, clicked: 0, failed: 2 },
    },
    {
        id: 'alert-4',
        title: 'Drivers Needed: Montego Bay – Negril',
        bodyRich: '<p>High demand for drivers on the Montego Bay to Negril route. 3 open positions available with competitive daily pay.</p>',
        bodyPlain: 'Drivers needed on MoBay-Negril! 3 positions available. Apply now.',
        category: 'opportunity',
        priority: 'normal',
        ctaLabel: 'View Jobs',
        ctaDestination: '/jobs?route=mobay-negril',
        targetingSummary: 'All drivers in St. James & Westmoreland (31 users)',
        channels: ['push', 'in_app'],
        status: 'sent',
        recipientCount: 31,
        createdBy: 'admin-2',
        createdByName: 'Natasha Campbell',
        createdAt: '2026-02-25T09:00:00',
        sentAt: '2026-02-25T09:00:00',
        deliveryStats: { delivered: 30, read: 24, clicked: 15, failed: 1 },
    },
    {
        id: 'alert-5',
        title: 'Platform Update: New Dispute System',
        bodyRich: '<p>We\'ve launched a new dispute resolution system. You can now file and track disputes directly in the app.</p>',
        bodyPlain: 'New: File and track disputes directly in the One\'N\'Move app.',
        category: 'announcement',
        priority: 'normal',
        ctaLabel: 'Learn More',
        ctaDestination: '/help/disputes',
        targetingSummary: 'All users (142 users)',
        channels: ['push', 'in_app', 'sms'],
        status: 'sent',
        recipientCount: 142,
        createdBy: 'admin-1',
        createdByName: 'Patrick Reid',
        createdAt: '2026-02-20T12:00:00',
        sentAt: '2026-02-20T12:01:00',
        deliveryStats: { delivered: 138, read: 95, clicked: 42, failed: 4 },
    },
];

export const alertTemplates: AlertTemplate[] = [
    {
        id: 'tpl-1',
        name: 'Document Expiry Warning',
        titleTemplate: 'Your {document_type} expires in {days} days',
        bodyTemplate: 'Your {document_type} is set to expire on {expiry_date}. Please upload a renewed document to maintain your verified status.',
        category: 'compliance',
        ctaLabel: 'Upload Document',
        ctaDestination: '/profile/documents',
        variables: ['document_type', 'days', 'expiry_date'],
    },
    {
        id: 'tpl-2',
        name: 'Verification Reminder',
        titleTemplate: 'Complete your verification to unlock jobs',
        bodyTemplate: 'You\'re almost there! Complete your profile verification to start {action}. You still need to upload: {missing_documents}.',
        category: 'compliance',
        ctaLabel: 'Complete Verification',
        ctaDestination: '/profile/verification',
        variables: ['action', 'missing_documents'],
    },
    {
        id: 'tpl-3',
        name: 'Account Suspension Notice',
        titleTemplate: 'Your account has been suspended',
        bodyTemplate: 'Your account has been temporarily suspended. Reason: {reason}. If you believe this is an error, please contact support.',
        category: 'account',
        ctaLabel: 'Contact Support',
        ctaDestination: '/support',
        variables: ['reason'],
    },
    {
        id: 'tpl-4',
        name: 'Route Disruption',
        titleTemplate: 'Route alert: {route_name}',
        bodyTemplate: 'There is a {disruption_type} affecting the {route_name} route. {details}. Expected resolution: {time_estimate}.',
        category: 'safety',
        variables: ['route_name', 'disruption_type', 'details', 'time_estimate'],
    },
    {
        id: 'tpl-5',
        name: 'High Demand Alert',
        titleTemplate: 'Drivers needed on {route_name}',
        bodyTemplate: 'There\'s high demand for drivers on the {route_name} route. {positions} open positions available. Apply now.',
        category: 'opportunity',
        ctaLabel: 'View Jobs',
        ctaDestination: '/jobs',
        variables: ['route_name', 'positions'],
    },
    {
        id: 'tpl-6',
        name: 'Emergency Safety Alert',
        titleTemplate: 'Safety Alert: {description}',
        bodyTemplate: '{details}. Please take the following precautions: {precautions}. Contact emergency services if needed: 119 (Police), 110 (Fire/Ambulance).',
        category: 'emergency',
        variables: ['description', 'details', 'precautions'],
    },
];
