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
