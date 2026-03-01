'use client';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const STATUS_MAP: Record<string, { className: string; label: string }> = {
    // User statuses
    active: { className: 'badge-success badge-dot', label: 'Active' },
    suspended: { className: 'badge-warning badge-dot', label: 'Suspended' },
    deactivated: { className: 'badge-neutral badge-dot', label: 'Deactivated' },
    banned: { className: 'badge-error badge-dot', label: 'Banned' },

    // Verification tiers
    registered: { className: 'badge-neutral', label: 'Registered' },
    verified: { className: 'badge-info', label: 'Verified' },
    fully_verified: { className: 'badge-success', label: 'Fully Verified' },

    // Document statuses
    pending: { className: 'badge-warning', label: 'Pending' },
    approved: { className: 'badge-success', label: 'Approved' },
    rejected: { className: 'badge-error', label: 'Rejected' },
    expired: { className: 'badge-error badge-dot', label: 'Expired' },
    flagged: { className: 'badge-purple', label: 'Flagged' },
    reupload_requested: { className: 'badge-warning', label: 'Re-upload' },

    // Dispute statuses
    open: { className: 'badge-info badge-dot', label: 'Open' },
    under_review: { className: 'badge-warning badge-dot', label: 'Under Review' },
    awaiting_response: { className: 'badge-purple badge-dot', label: 'Awaiting Response' },
    resolved: { className: 'badge-success badge-dot', label: 'Resolved' },
    escalated: { className: 'badge-error badge-dot', label: 'Escalated' },
    closed: { className: 'badge-neutral badge-dot', label: 'Closed' },

    // Alert statuses
    draft: { className: 'badge-neutral', label: 'Draft' },
    scheduled: { className: 'badge-info', label: 'Scheduled' },
    sending: { className: 'badge-warning', label: 'Sending' },
    sent: { className: 'badge-success', label: 'Sent' },
    cancelled: { className: 'badge-neutral', label: 'Cancelled' },
    failed: { className: 'badge-error', label: 'Failed' },

    // Priorities
    low: { className: 'badge-info', label: 'Low' },
    medium: { className: 'badge-warning', label: 'Medium' },
    high: { className: 'badge-error', label: 'High' },
    urgent: { className: 'badge-error', label: 'Urgent' },

    // Roles
    driver: { className: 'badge-primary', label: 'Driver' },
    owner: { className: 'badge-purple', label: 'Owner' },
    dual: { className: 'badge-info', label: 'Dual' },

    // Alert priorities
    normal: { className: 'badge-info', label: 'Normal' },
    emergency: { className: 'badge-error', label: 'Emergency' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const config = STATUS_MAP[status] || { className: 'badge-neutral', label: status };

    return (
        <span
            className={`badge ${config.className}`}
            style={size === 'sm' ? { fontSize: '0.65rem', padding: '2px 7px' } : undefined}
        >
            {config.label}
        </span>
    );
}
