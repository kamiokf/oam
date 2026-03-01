export interface DisputeEvidence {
    type: 'photo' | 'screenshot' | 'document' | 'text';
    label: string;
    date: string;
}

export interface DisputeMessage {
    id: string;
    senderType: 'user' | 'admin';
    senderId: string;
    senderName: string;
    message: string;
    createdAt: string;
}

export interface DisputeTimelineEntry {
    date: string;
    action: string;
    description: string;
    actor: 'system' | 'reporter' | 'respondent' | 'admin';
}

export interface Dispute {
    id: string;
    referenceNumber: string;
    filedBy: string;
    filedByName: string;
    filedByAvatar: string;
    filedByRole: 'driver' | 'owner';
    filedAgainst: string;
    filedAgainstName: string;
    filedAgainstAvatar: string;
    filedAgainstRole: 'driver' | 'owner';
    category: 'payment' | 'no_show' | 'vehicle_condition' | 'behavior' | 'document_fraud' | 'rating' | 'contract_violation' | 'other';
    description: string;
    status: 'open' | 'under_review' | 'awaiting_response' | 'resolved' | 'escalated' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assignedTo: string | null;
    assignedToName: string | null;
    evidence: DisputeEvidence[];
    timeline: DisputeTimelineEntry[];
    messages: DisputeMessage[];
    resolutionType?: string;
    resolutionNotes?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    appealFiled: boolean;
    relatedJobId?: string;
    createdAt: string;
    updatedAt: string;
}

export const DISPUTE_CATEGORIES = {
    payment: { label: 'Payment Dispute', color: '#F59E0B' },
    no_show: { label: 'No-Show', color: '#EF4444' },
    vehicle_condition: { label: 'Vehicle Condition', color: '#3B82F6' },
    behavior: { label: 'Behavior / Conduct', color: '#8B5CF6' },
    document_fraud: { label: 'Document Fraud', color: '#DC2626' },
    rating: { label: 'Rating Dispute', color: '#F97316' },
    contract_violation: { label: 'Contract Violation', color: '#6D28D9' },
    other: { label: 'Other', color: '#71717A' },
};

export const RESOLUTION_TYPES = [
    { value: 'no_action', label: 'Resolved — No Action' },
    { value: 'warning_issued', label: 'Resolved — Warning Issued' },
    { value: 'user_suspended', label: 'Resolved — User Suspended' },
    { value: 'user_banned', label: 'Resolved — User Banned' },
    { value: 'review_removed', label: 'Resolved — Review Removed' },
    { value: 'compensation_recommended', label: 'Resolved — Compensation Recommended' },
];

export const mockDisputes: Dispute[] = [
    {
        id: 'disp-001',
        referenceNumber: 'DSP-2026-001',
        filedBy: 'o1',
        filedByName: 'Marcus Thompson',
        filedByAvatar: 'MT',
        filedByRole: 'owner',
        filedAgainst: 'd4',
        filedAgainstName: 'Omar Lewis',
        filedAgainstAvatar: 'OL',
        filedAgainstRole: 'driver',
        category: 'no_show',
        description: 'Driver did not show up for the Monday morning shift on the Kingston to Spanish Town route. No communication was received.',
        status: 'resolved',
        priority: 'high',
        assignedTo: 'admin-1',
        assignedToName: 'Patrick Reid',
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
        messages: [
            { id: 'msg-1', senderType: 'user', senderId: 'o1', senderName: 'Marcus Thompson', message: 'My driver Omar did not show up this morning. No call, no text. I had passengers waiting.', createdAt: '2026-02-24T08:30:00' },
            { id: 'msg-2', senderType: 'admin', senderId: 'admin-1', senderName: 'Patrick Reid', message: 'We have contacted Omar and requested an explanation. He has 72 hours to respond.', createdAt: '2026-02-24T14:00:00' },
            { id: 'msg-3', senderType: 'user', senderId: 'd4', senderName: 'Omar Lewis', message: 'I apologize. I had a family emergency and my phone died. I should have contacted Marcus.', createdAt: '2026-02-25T10:00:00' },
        ],
        resolutionType: 'warning_issued',
        resolutionNotes: 'First-time warning issued. Driver must notify owner at least 2 hours before shift if unable to attend.',
        resolvedBy: 'admin-1',
        resolvedAt: '2026-02-25T16:00:00',
        appealFiled: false,
        createdAt: '2026-02-24T08:30:00',
        updatedAt: '2026-02-25T16:00:00',
    },
    {
        id: 'disp-002',
        referenceNumber: 'DSP-2026-002',
        filedBy: 'd1',
        filedByName: 'Devon Smith',
        filedByAvatar: 'DS',
        filedByRole: 'driver',
        filedAgainst: 'o2',
        filedAgainstName: 'Davina Brown',
        filedAgainstAvatar: 'DB',
        filedAgainstRole: 'owner',
        category: 'payment',
        description: 'Weekly payment of J$42,500 was not received for the week of February 17-21. Payment was due on February 22.',
        status: 'under_review',
        priority: 'high',
        assignedTo: 'admin-2',
        assignedToName: 'Natasha Campbell',
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
        messages: [
            { id: 'msg-4', senderType: 'user', senderId: 'd1', senderName: 'Devon Smith', message: 'I have not received my weekly payment of J$42,500 due on Feb 22. I have attached proof.', createdAt: '2026-02-26T11:00:00' },
            { id: 'msg-5', senderType: 'admin', senderId: 'admin-2', senderName: 'Natasha Campbell', message: 'We are reviewing your case and have contacted the owner. We will update you shortly.', createdAt: '2026-02-26T14:00:00' },
        ],
        appealFiled: false,
        createdAt: '2026-02-26T11:00:00',
        updatedAt: '2026-02-26T14:00:00',
    },
    {
        id: 'disp-003',
        referenceNumber: 'DSP-2026-003',
        filedBy: 'd3',
        filedByName: 'Tricia Murray',
        filedByAvatar: 'TM',
        filedByRole: 'driver',
        filedAgainst: 'o3',
        filedAgainstName: 'Andrew Williams',
        filedAgainstAvatar: 'AW',
        filedAgainstRole: 'owner',
        category: 'vehicle_condition',
        description: 'The Honda Fit (CF 3456) has worn brake pads and a cracked windshield. Reported twice but not fixed. Safety concern for passengers.',
        status: 'escalated',
        priority: 'high',
        assignedTo: 'admin-1',
        assignedToName: 'Patrick Reid',
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
        messages: [
            { id: 'msg-6', senderType: 'user', senderId: 'd3', senderName: 'Tricia Murray', message: 'The brake pads on the Honda Fit are completely worn. I reported this two weeks ago and nothing has been done.', createdAt: '2026-02-20T09:00:00' },
            { id: 'msg-7', senderType: 'admin', senderId: 'admin-2', senderName: 'Natasha Campbell', message: 'This is a serious safety concern. We have flagged the vehicle and contacted the owner.', createdAt: '2026-02-20T10:00:00' },
        ],
        appealFiled: false,
        createdAt: '2026-02-20T09:00:00',
        updatedAt: '2026-02-22T12:00:00',
    },
    {
        id: 'disp-004',
        referenceNumber: 'DSP-2026-004',
        filedBy: 'o4',
        filedByName: 'Shereen Clarke',
        filedByAvatar: 'SC',
        filedByRole: 'owner',
        filedAgainst: 'd5',
        filedAgainstName: 'Shanice Brown',
        filedAgainstAvatar: 'SB',
        filedAgainstRole: 'driver',
        category: 'contract_violation',
        description: 'Driver operated on an unauthorized route (Kingston to Port Antonio) instead of the assigned Montego Bay to Negril route.',
        status: 'open',
        priority: 'medium',
        assignedTo: null,
        assignedToName: null,
        evidence: [
            { type: 'screenshot', label: 'GPS trip log showing wrong route', date: '2026-02-27' },
            { type: 'document', label: 'Original route assignment document', date: '2026-02-01' },
        ],
        timeline: [
            { date: '2026-02-27T16:00:00', action: 'Dispute Filed', description: 'Shereen Clarke reported unauthorized route operation', actor: 'reporter' },
        ],
        messages: [
            { id: 'msg-8', senderType: 'user', senderId: 'o4', senderName: 'Shereen Clarke', message: 'My driver Shanice operated on the Kingston-Port Antonio route yesterday without authorization. She was assigned MoBay-Negril.', createdAt: '2026-02-27T16:00:00' },
        ],
        appealFiled: false,
        relatedJobId: 'j5',
        createdAt: '2026-02-27T16:00:00',
        updatedAt: '2026-02-27T16:00:00',
    },
];
