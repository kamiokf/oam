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
