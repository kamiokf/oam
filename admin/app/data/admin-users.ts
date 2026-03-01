export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    role: 'super_admin' | 'moderator' | 'support_agent';
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
    avatar: string;
}

export interface AuditLogEntry {
    id: string;
    adminUserId: string;
    adminName: string;
    actionType: string;
    targetType: string;
    targetId: string;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export const mockAdminUsers: AdminUser[] = [
    {
        id: 'admin-1',
        email: 'admin@onenMove.jm',
        fullName: 'Patrick Reid',
        role: 'super_admin',
        isActive: true,
        lastLogin: '2026-02-28T22:00:00',
        createdAt: '2025-01-01',
        avatar: 'PR',
    },
    {
        id: 'admin-2',
        email: 'mod@onenMove.jm',
        fullName: 'Natasha Campbell',
        role: 'moderator',
        isActive: true,
        lastLogin: '2026-02-28T18:30:00',
        createdAt: '2025-03-15',
        avatar: 'NC',
    },
    {
        id: 'admin-3',
        email: 'support@onenMove.jm',
        fullName: 'Andre Morgan',
        role: 'support_agent',
        isActive: true,
        lastLogin: '2026-02-28T16:00:00',
        createdAt: '2025-06-01',
        avatar: 'AM',
    },
];

export const mockAuditLog: AuditLogEntry[] = [
    {
        id: 'audit-1',
        adminUserId: 'admin-1',
        adminName: 'Patrick Reid',
        actionType: 'user_suspended',
        targetType: 'user',
        targetId: 'd4',
        details: 'Suspended Omar Lewis — Pending document verification',
        ipAddress: '192.168.1.100',
        createdAt: '2026-02-28T14:30:00',
    },
    {
        id: 'audit-2',
        adminUserId: 'admin-2',
        adminName: 'Natasha Campbell',
        actionType: 'document_approved',
        targetType: 'document',
        targetId: 'doc-3',
        details: 'Approved Driver Licence for Devon Smith',
        ipAddress: '192.168.1.101',
        createdAt: '2026-02-28T11:15:00',
    },
    {
        id: 'audit-3',
        adminUserId: 'admin-2',
        adminName: 'Natasha Campbell',
        actionType: 'document_rejected',
        targetType: 'document',
        targetId: 'doc-7',
        details: 'Rejected Police Record for Omar Lewis — Document expired',
        ipAddress: '192.168.1.101',
        createdAt: '2026-02-28T10:45:00',
    },
    {
        id: 'audit-4',
        adminUserId: 'admin-1',
        adminName: 'Patrick Reid',
        actionType: 'dispute_resolved',
        targetType: 'dispute',
        targetId: 'disp-001',
        details: 'Resolved dispute DSP-2026-001 — Warning issued',
        ipAddress: '192.168.1.100',
        createdAt: '2026-02-25T16:00:00',
    },
    {
        id: 'audit-5',
        adminUserId: 'admin-3',
        adminName: 'Andre Morgan',
        actionType: 'note_added',
        targetType: 'user',
        targetId: 'd3',
        details: 'Added note to Tricia Murray\'s profile about licence renewal',
        ipAddress: '192.168.1.102',
        createdAt: '2026-02-27T09:00:00',
    },
    {
        id: 'audit-6',
        adminUserId: 'admin-1',
        adminName: 'Patrick Reid',
        actionType: 'alert_sent',
        targetType: 'alert',
        targetId: 'alert-1',
        details: 'Sent compliance alert to 23 drivers with expiring documents',
        ipAddress: '192.168.1.100',
        createdAt: '2026-02-26T08:00:00',
    },
];

// Credentials for mock login
export const ADMIN_CREDENTIALS = [
    { email: 'admin@onenMove.jm', password: 'Admin@12345!', role: 'super_admin' as const },
    { email: 'mod@onenMove.jm', password: 'Mod@12345!', role: 'moderator' as const },
    { email: 'support@onenMove.jm', password: 'Support@12345!', role: 'support_agent' as const },
];

// Role permissions
export const ROLE_PERMISSIONS = {
    super_admin: {
        label: 'Super Admin',
        viewFullProfile: true,
        editUserDetails: true,
        overrideVerification: true,
        suspendUser: true,
        reactivateUser: true,
        banUser: true,
        deleteUser: true,
        addNote: true,
        sendAlert: true,
        viewAuditLog: true,
        manageAdmins: true,
        accessFinancials: true,
        manageSettings: true,
    },
    moderator: {
        label: 'Moderator',
        viewFullProfile: true,
        editUserDetails: true,
        overrideVerification: true,
        suspendUser: true,
        reactivateUser: true,
        banUser: false,
        deleteUser: false,
        addNote: true,
        sendAlert: true,
        viewAuditLog: true, // own actions only
        manageAdmins: false,
        accessFinancials: false,
        manageSettings: false,
    },
    support_agent: {
        label: 'Support Agent',
        viewFullProfile: true,
        editUserDetails: false,
        overrideVerification: false,
        suspendUser: false,
        reactivateUser: false,
        banUser: false,
        deleteUser: false,
        addNote: true,
        sendAlert: true,
        viewAuditLog: false,
        manageAdmins: false,
        accessFinancials: false,
        manageSettings: false,
    },
} as const;
