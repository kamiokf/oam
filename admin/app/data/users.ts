export type UserRole = 'driver' | 'owner' | 'dual';
export type UserStatus = 'active' | 'suspended' | 'deactivated' | 'banned';
export type VerificationTier = 'registered' | 'verified' | 'fully_verified';

export interface UserDocument {
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    uploadDate: string;
    expiryDate?: string;
    reviewedBy?: string;
    reviewDate?: string;
    rejectionReason?: string;
}

export interface UserNote {
    id: string;
    adminId: string;
    adminName: string;
    note: string;
    createdAt: string;
}

export interface StatusChange {
    from: UserStatus;
    to: UserStatus;
    reason: string;
    changedBy: string;
    changedAt: string;
}

export interface PlatformUser {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    email?: string;
    trn: string;
    parish: string;
    role: UserRole;
    status: UserStatus;
    verificationTier: VerificationTier;
    rating: number;
    registeredDate: string;
    lastActive: string;
    documents: UserDocument[];
    notes: UserNote[];
    statusHistory: StatusChange[];

    // Driver-specific
    licenceClass?: string;
    licenceExpiry?: string;
    tlcNumber?: string;
    totalTrips?: number;
    experience?: number;

    // Owner-specific
    businessName?: string;
    routeLicenceNumber?: string;
    numberOfVehicles?: number;
    primaryRoutes?: string[];
}
