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
