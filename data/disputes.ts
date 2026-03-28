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
