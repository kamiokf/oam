export interface DisputeEvidence {
    type: 'photo' | 'screenshot' | 'document' | 'text';
    label: string;
    date: string;
}

export interface DisputeTimelineEntry {
    date: string;
    action: string;
    description: string;
    actor: 'system' | 'reporter' | 'respondent' | 'admin';
}

export interface Dispute {
    id: string;
    filedBy: string;
    filedByName: string;
    filedByAvatar: string;
    filedByRole: 'driver' | 'owner';
    against: string;
    againstName: string;
    againstAvatar: string;
    againstRole: 'driver' | 'owner';
    type: 'no_show' | 'non_payment' | 'vehicle_condition' | 'contract_breach' | 'safety' | 'other';
    category: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'escalated' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    evidence: DisputeEvidence[];
    timeline: DisputeTimelineEntry[];
    resolution?: {
        outcome: 'refund' | 'warning' | 'suspension' | 'ban' | 'no_action' | 'mediation';
        description: string;
        date: string;
    };
    relatedTripId?: string;
    dateOpened: string;
    dateResolved?: string;
}

export const DISPUTE_TYPES = {
    no_show: { label: 'No-Show', icon: 'close-circle', color: '#EF4444', description: 'Driver or owner did not appear as scheduled' },
    non_payment: { label: 'Non-Payment', icon: 'cash', color: '#F59E0B', description: 'Payment was not made on time or at all' },
    vehicle_condition: { label: 'Vehicle Condition', icon: 'car', color: '#3B82F6', description: 'Vehicle was not in the agreed condition' },
    contract_breach: { label: 'Contract Breach', icon: 'document-text', color: '#8B5CF6', description: 'Terms of the agreement were violated' },
    safety: { label: 'Safety Concern', icon: 'warning', color: '#EF4444', description: 'Safety issue reported during trip or assignment' },
    other: { label: 'Other', icon: 'help-circle', color: '#666666', description: 'Other issues not covered above' },
};

export const mockDisputes: Dispute[] = [
    {
        id: 'disp-001',
        filedBy: 'o1',
        filedByName: 'Marcus Thompson',
        filedByAvatar: 'MT',
        filedByRole: 'owner',
        against: 'd4',
        againstName: 'Omar Lewis',
        againstAvatar: 'OL',
        againstRole: 'driver',
        type: 'no_show',
        category: 'No-Show',
        description: 'Driver did not show up for the Monday morning shift on the Kingston to Spanish Town route. No communication was received.',
        status: 'resolved',
        priority: 'high',
        evidence: [
            { type: 'screenshot', label: 'Schedule confirmation screenshot', date: '2026-02-24' },
            { type: 'text', label: 'Messages sent with no reply', date: '2026-02-24' },
        ],
        timeline: [
            { date: '2026-02-24T08:30:00', action: 'Dispute Filed', description: 'Marcus Thompson reported a no-show by Omar Lewis', actor: 'reporter' },
            { date: '2026-02-24T09:00:00', action: 'Under Review', description: 'Dispute assigned to resolution team', actor: 'system' },
            { date: '2026-02-24T14:00:00', action: 'Response Requested', description: 'Omar Lewis was asked to provide an explanation', actor: 'admin' },
            { date: '2026-02-25T10:00:00', action: 'Response Received', description: 'Driver cited a family emergency with no prior notice', actor: 'respondent' },
            { date: '2026-02-25T16:00:00', action: 'Resolved', description: 'Warning issued to driver. Reminder to communicate schedule changes.', actor: 'admin' },
        ],
        resolution: {
            outcome: 'warning',
            description: 'First-time warning issued. Driver must notify owner at least 2 hours before shift if unable to attend.',
            date: '2026-02-25',
        },
        dateOpened: '2026-02-24',
        dateResolved: '2026-02-25',
    },
    {
        id: 'disp-002',
        filedBy: 'd1',
        filedByName: 'Devon Smith',
        filedByAvatar: 'DS',
        filedByRole: 'driver',
        against: 'o2',
        againstName: 'Davina Brown',
        againstAvatar: 'DB',
        againstRole: 'owner',
        type: 'non_payment',
        category: 'Non-Payment',
        description: 'Weekly payment of J$42,500 was not received for the week of February 17-21. Payment was due on February 22.',
        status: 'under_review',
        priority: 'high',
        evidence: [
            { type: 'document', label: 'Signed payment agreement', date: '2026-02-10' },
            { type: 'screenshot', label: 'Bank statement (no deposit)', date: '2026-02-26' },
            { type: 'text', label: 'WhatsApp messages requesting payment', date: '2026-02-23' },
        ],
        timeline: [
            { date: '2026-02-26T11:00:00', action: 'Dispute Filed', description: 'Devon Smith reported non-payment by Davina Brown', actor: 'reporter' },
            { date: '2026-02-26T11:30:00', action: 'Under Review', description: 'Dispute flagged as high priority — payment issue', actor: 'system' },
            { date: '2026-02-26T14:00:00', action: 'Owner Notified', description: 'Davina Brown has been notified and asked to respond within 24 hours', actor: 'admin' },
        ],
        dateOpened: '2026-02-26',
    },
    {
        id: 'disp-003',
        filedBy: 'd3',
        filedByName: 'Tricia Murray',
        filedByAvatar: 'TM',
        filedByRole: 'driver',
        against: 'o3',
        againstName: 'Andrew Williams',
        againstAvatar: 'AW',
        againstRole: 'owner',
        type: 'vehicle_condition',
        category: 'Vehicle Condition',
        description: 'The Honda Fit (CF 3456) has worn brake pads and a cracked windshield. Reported twice but not fixed. Safety concern for passengers.',
        status: 'escalated',
        priority: 'urgent',
        evidence: [
            { type: 'photo', label: 'Photos of worn brake pads', date: '2026-02-20' },
            { type: 'photo', label: 'Photo of cracked windshield', date: '2026-02-20' },
            { type: 'text', label: 'Previous maintenance requests', date: '2026-02-10' },
        ],
        timeline: [
            { date: '2026-02-20T09:00:00', action: 'Dispute Filed', description: 'Tricia Murray reported vehicle safety concerns', actor: 'reporter' },
            { date: '2026-02-20T09:15:00', action: 'Urgent Flag', description: 'Automatically flagged as urgent — safety category', actor: 'system' },
            { date: '2026-02-20T10:00:00', action: 'Owner Notified', description: 'Andrew Williams given 48-hour deadline to respond', actor: 'admin' },
            { date: '2026-02-22T10:00:00', action: 'No Response', description: 'Owner did not respond within deadline', actor: 'system' },
            { date: '2026-02-22T12:00:00', action: 'Escalated', description: 'Dispute escalated to senior review. Vehicle temporarily flagged.', actor: 'admin' },
        ],
        dateOpened: '2026-02-20',
    },
    {
        id: 'disp-004',
        filedBy: 'o4',
        filedByName: 'Shereen Clarke',
        filedByAvatar: 'SC',
        filedByRole: 'owner',
        against: 'd5',
        againstName: 'Shanice Brown',
        againstAvatar: 'SB',
        againstRole: 'driver',
        type: 'contract_breach',
        category: 'Contract Breach',
        description: 'Driver operated on an unauthorized route (Kingston to Port Antonio) instead of the assigned Montego Bay to Negril route.',
        status: 'open',
        priority: 'medium',
        evidence: [
            { type: 'screenshot', label: 'GPS trip log showing wrong route', date: '2026-02-27' },
            { type: 'document', label: 'Original route assignment document', date: '2026-02-01' },
        ],
        timeline: [
            { date: '2026-02-27T16:00:00', action: 'Dispute Filed', description: 'Shereen Clarke reported unauthorized route operation', actor: 'reporter' },
        ],
        relatedTripId: 'trip-006',
        dateOpened: '2026-02-27',
    },
];
