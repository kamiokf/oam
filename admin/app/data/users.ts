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

export const mockUsers: PlatformUser[] = [
    {
        id: 'd1',
        name: 'Devon Smith',
        avatar: 'DS',
        phone: '+1 876 555 0101',
        email: 'devon.smith@email.com',
        trn: '123-456-789',
        parish: 'Kingston',
        role: 'driver',
        status: 'active',
        verificationTier: 'fully_verified',
        rating: 4.8,
        registeredDate: '2024-03-15',
        lastActive: '2026-02-28',
        licenceClass: 'Class 3',
        licenceExpiry: '2026-12-01',
        tlcNumber: 'TLC-KGN-1234',
        totalTrips: 1250,
        experience: 5,
        documents: [
            { id: 'doc-1', type: 'Driver Licence', status: 'approved', uploadDate: '2024-03-15', expiryDate: '2026-12-01', reviewedBy: 'Natasha Campbell', reviewDate: '2024-03-16' },
            { id: 'doc-2', type: 'PPV Badge', status: 'approved', uploadDate: '2024-03-15', reviewedBy: 'Natasha Campbell', reviewDate: '2024-03-16' },
            { id: 'doc-3', type: 'Police Record', status: 'approved', uploadDate: '2024-03-15', expiryDate: '2026-09-15', reviewedBy: 'Natasha Campbell', reviewDate: '2024-03-16' },
        ],
        notes: [
            { id: 'n1', adminId: 'admin-2', adminName: 'Natasha Campbell', note: 'Excellent driver — top rated on Kingston-Spanish Town route.', createdAt: '2025-06-10' },
        ],
        statusHistory: [],
    },
    {
        id: 'd2',
        name: 'Kemar Johnson',
        avatar: 'KJ',
        phone: '+1 876 555 0102',
        trn: '234-567-890',
        parish: 'St. Andrew',
        role: 'driver',
        status: 'active',
        verificationTier: 'fully_verified',
        rating: 4.6,
        registeredDate: '2023-09-01',
        lastActive: '2026-02-27',
        licenceClass: 'Class 3',
        licenceExpiry: '2027-03-15',
        tlcNumber: 'TLC-KGN-5678',
        totalTrips: 980,
        experience: 7,
        documents: [
            { id: 'doc-4', type: 'Driver Licence', status: 'approved', uploadDate: '2023-09-01', expiryDate: '2027-03-15', reviewedBy: 'Patrick Reid', reviewDate: '2023-09-02' },
            { id: 'doc-5', type: 'PPV Badge', status: 'approved', uploadDate: '2023-09-01', reviewedBy: 'Patrick Reid', reviewDate: '2023-09-02' },
            { id: 'doc-6', type: 'Police Record', status: 'approved', uploadDate: '2024-01-10', expiryDate: '2027-01-10', reviewedBy: 'Natasha Campbell', reviewDate: '2024-01-11' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'd3',
        name: 'Tricia Murray',
        avatar: 'TM',
        phone: '+1 876 555 0103',
        trn: '345-678-901',
        parish: 'St. Catherine',
        role: 'driver',
        status: 'active',
        verificationTier: 'verified',
        rating: 4.9,
        registeredDate: '2022-01-10',
        lastActive: '2026-02-28',
        licenceClass: 'Class 2',
        licenceExpiry: '2026-06-30',
        tlcNumber: 'TLC-SPC-3456',
        totalTrips: 2100,
        experience: 10,
        documents: [
            { id: 'doc-7', type: 'Driver Licence', status: 'approved', uploadDate: '2022-01-10', expiryDate: '2026-06-30', reviewedBy: 'Patrick Reid', reviewDate: '2022-01-11' },
            { id: 'doc-8', type: 'PPV Badge', status: 'approved', uploadDate: '2022-01-10', reviewedBy: 'Patrick Reid', reviewDate: '2022-01-11' },
            { id: 'doc-9', type: 'Police Record', status: 'expired', uploadDate: '2022-01-10', expiryDate: '2025-01-10' },
        ],
        notes: [
            { id: 'n2', adminId: 'admin-3', adminName: 'Andre Morgan', note: 'Called about expired police record. Said she will upload renewal by next Friday.', createdAt: '2026-02-27' },
        ],
        statusHistory: [],
    },
    {
        id: 'd4',
        name: 'Omar Lewis',
        avatar: 'OL',
        phone: '+1 876 555 0104',
        trn: '456-789-012',
        parish: 'Kingston',
        role: 'driver',
        status: 'suspended',
        verificationTier: 'registered',
        rating: 4.2,
        registeredDate: '2025-06-20',
        lastActive: '2026-02-20',
        licenceClass: 'Class 2',
        licenceExpiry: '2026-09-15',
        totalTrips: 450,
        experience: 2,
        documents: [
            { id: 'doc-10', type: 'Driver Licence', status: 'approved', uploadDate: '2025-06-20', expiryDate: '2026-09-15', reviewedBy: 'Natasha Campbell', reviewDate: '2025-06-21' },
            { id: 'doc-11', type: 'PPV Badge', status: 'pending', uploadDate: '2025-06-20' },
            { id: 'doc-12', type: 'Police Record', status: 'rejected', uploadDate: '2025-06-20', rejectionReason: 'Document is blurry or unreadable', reviewedBy: 'Natasha Campbell', reviewDate: '2025-06-21' },
        ],
        notes: [
            { id: 'n3', adminId: 'admin-1', adminName: 'Patrick Reid', note: 'Suspended pending document re-upload. No-show dispute also filed against.', createdAt: '2026-02-28' },
        ],
        statusHistory: [
            { from: 'active', to: 'suspended', reason: 'Pending document verification — police record rejected', changedBy: 'Patrick Reid', changedAt: '2026-02-28' },
        ],
    },
    {
        id: 'd5',
        name: 'Shanice Brown',
        avatar: 'SB',
        phone: '+1 876 555 0105',
        trn: '567-890-123',
        parish: 'St. James',
        role: 'driver',
        status: 'active',
        verificationTier: 'verified',
        rating: 4.7,
        registeredDate: '2023-04-05',
        lastActive: '2026-02-28',
        licenceClass: 'Class 3',
        licenceExpiry: '2027-01-10',
        tlcNumber: 'TLC-MBY-7890',
        totalTrips: 1580,
        experience: 6,
        documents: [
            { id: 'doc-13', type: 'Driver Licence', status: 'approved', uploadDate: '2023-04-05', expiryDate: '2027-01-10', reviewedBy: 'Patrick Reid', reviewDate: '2023-04-06' },
            { id: 'doc-14', type: 'PPV Badge', status: 'approved', uploadDate: '2023-04-05', reviewedBy: 'Patrick Reid', reviewDate: '2023-04-06' },
            { id: 'doc-15', type: 'Police Record', status: 'approved', uploadDate: '2024-04-10', expiryDate: '2027-04-10', reviewedBy: 'Natasha Campbell', reviewDate: '2024-04-11' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'o1',
        name: 'Marcus Thompson',
        avatar: 'MT',
        phone: '+1 876 555 0201',
        email: 'marcus.t@email.com',
        trn: '678-901-234',
        parish: 'Kingston',
        role: 'owner',
        status: 'active',
        verificationTier: 'fully_verified',
        rating: 4.8,
        registeredDate: '2023-01-15',
        lastActive: '2026-02-28',
        businessName: 'Thompson Transport Ltd',
        routeLicenceNumber: 'RL-KGN-001',
        numberOfVehicles: 4,
        primaryRoutes: ['Kingston – Spanish Town', 'Spanish Town – Linstead'],
        documents: [
            { id: 'doc-16', type: 'Route Licence', status: 'approved', uploadDate: '2023-01-15', expiryDate: '2027-01-15', reviewedBy: 'Patrick Reid', reviewDate: '2023-01-16' },
            { id: 'doc-17', type: 'Vehicle Fitness Certificate', status: 'approved', uploadDate: '2024-08-01', expiryDate: '2026-08-15', reviewedBy: 'Natasha Campbell', reviewDate: '2024-08-02' },
            { id: 'doc-18', type: 'Insurance Certificate', status: 'approved', uploadDate: '2024-06-15', expiryDate: '2026-06-30', reviewedBy: 'Natasha Campbell', reviewDate: '2024-06-16' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'o2',
        name: 'Davina Brown',
        avatar: 'DB',
        phone: '+1 876 555 0202',
        trn: '789-012-345',
        parish: 'St. Andrew',
        role: 'owner',
        status: 'active',
        verificationTier: 'verified',
        rating: 4.6,
        registeredDate: '2023-06-01',
        lastActive: '2026-02-26',
        businessName: 'Brown\'s Coaches',
        routeLicenceNumber: 'RL-KGN-045',
        numberOfVehicles: 2,
        primaryRoutes: ['Kingston – Montego Bay'],
        documents: [
            { id: 'doc-19', type: 'Route Licence', status: 'approved', uploadDate: '2023-06-01', expiryDate: '2026-06-01', reviewedBy: 'Patrick Reid', reviewDate: '2023-06-02' },
            { id: 'doc-20', type: 'Vehicle Fitness Certificate', status: 'approved', uploadDate: '2024-05-01', expiryDate: '2026-05-20', reviewedBy: 'Natasha Campbell', reviewDate: '2024-05-02' },
            { id: 'doc-21', type: 'Insurance Certificate', status: 'pending', uploadDate: '2026-02-20' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'o3',
        name: 'Andrew Williams',
        avatar: 'AW',
        phone: '+1 876 555 0203',
        trn: '890-123-456',
        parish: 'St. Catherine',
        role: 'owner',
        status: 'active',
        verificationTier: 'registered',
        rating: 4.3,
        registeredDate: '2024-11-01',
        lastActive: '2026-02-22',
        businessName: 'Williams Auto',
        routeLicenceNumber: 'RL-SPC-012',
        numberOfVehicles: 1,
        primaryRoutes: ['Kingston – Portmore'],
        documents: [
            { id: 'doc-22', type: 'Route Licence', status: 'pending', uploadDate: '2024-11-01' },
            { id: 'doc-23', type: 'Vehicle Fitness Certificate', status: 'expired', uploadDate: '2024-11-01', expiryDate: '2025-09-01' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'o4',
        name: 'Shereen Clarke',
        avatar: 'SC',
        phone: '+1 876 555 0204',
        trn: '901-234-567',
        parish: 'St. James',
        role: 'owner',
        status: 'active',
        verificationTier: 'fully_verified',
        rating: 4.9,
        registeredDate: '2022-08-20',
        lastActive: '2026-02-28',
        businessName: 'Clarke Premium Transport',
        routeLicenceNumber: 'RL-MBY-089',
        numberOfVehicles: 3,
        primaryRoutes: ['Montego Bay – Negril', 'Montego Bay – Ocho Rios'],
        documents: [
            { id: 'doc-24', type: 'Route Licence', status: 'approved', uploadDate: '2022-08-20', expiryDate: '2027-08-20', reviewedBy: 'Patrick Reid', reviewDate: '2022-08-21' },
            { id: 'doc-25', type: 'Vehicle Fitness Certificate', status: 'approved', uploadDate: '2025-06-01', expiryDate: '2027-06-01', reviewedBy: 'Natasha Campbell', reviewDate: '2025-06-02' },
            { id: 'doc-26', type: 'Insurance Certificate', status: 'approved', uploadDate: '2025-06-01', expiryDate: '2027-06-01', reviewedBy: 'Natasha Campbell', reviewDate: '2025-06-02' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'dual-1',
        name: 'Ricardo Henry',
        avatar: 'RH',
        phone: '+1 876 555 0301',
        trn: '012-345-678',
        parish: 'St. Ann',
        role: 'dual',
        status: 'active',
        verificationTier: 'verified',
        rating: 4.5,
        registeredDate: '2024-01-15',
        lastActive: '2026-02-27',
        licenceClass: 'Class 3',
        licenceExpiry: '2027-06-01',
        tlcNumber: 'TLC-ORI-2345',
        totalTrips: 620,
        experience: 4,
        businessName: 'Henry\'s Rides',
        routeLicenceNumber: 'RL-ORI-034',
        numberOfVehicles: 1,
        primaryRoutes: ['Kingston – Ocho Rios'],
        documents: [
            { id: 'doc-27', type: 'Driver Licence', status: 'approved', uploadDate: '2024-01-15', expiryDate: '2027-06-01', reviewedBy: 'Patrick Reid', reviewDate: '2024-01-16' },
            { id: 'doc-28', type: 'PPV Badge', status: 'approved', uploadDate: '2024-01-15', reviewedBy: 'Patrick Reid', reviewDate: '2024-01-16' },
            { id: 'doc-29', type: 'Route Licence', status: 'approved', uploadDate: '2024-01-15', expiryDate: '2027-01-15', reviewedBy: 'Patrick Reid', reviewDate: '2024-01-16' },
            { id: 'doc-30', type: 'Police Record', status: 'pending', uploadDate: '2026-02-20' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'd6',
        name: 'Michelle Grant',
        avatar: 'MG',
        phone: '+1 876 555 0106',
        trn: '111-222-333',
        parish: 'Clarendon',
        role: 'driver',
        status: 'active',
        verificationTier: 'registered',
        rating: 0,
        registeredDate: '2026-02-25',
        lastActive: '2026-02-28',
        licenceClass: 'Class 2',
        licenceExpiry: '2028-02-01',
        experience: 1,
        documents: [
            { id: 'doc-31', type: 'Driver Licence', status: 'pending', uploadDate: '2026-02-26' },
            { id: 'doc-32', type: 'ID Photo', status: 'pending', uploadDate: '2026-02-26' },
            { id: 'doc-33', type: 'Selfie', status: 'pending', uploadDate: '2026-02-26' },
        ],
        notes: [],
        statusHistory: [],
    },
    {
        id: 'd7',
        name: 'Jason Palmer',
        avatar: 'JP',
        phone: '+1 876 555 0107',
        trn: '222-333-444',
        parish: 'Portland',
        role: 'driver',
        status: 'active',
        verificationTier: 'registered',
        rating: 0,
        registeredDate: '2026-02-27',
        lastActive: '2026-02-28',
        licenceClass: 'Class 3',
        licenceExpiry: '2027-11-15',
        experience: 3,
        documents: [
            { id: 'doc-34', type: 'Driver Licence', status: 'pending', uploadDate: '2026-02-27' },
            { id: 'doc-35', type: 'PPV Badge', status: 'pending', uploadDate: '2026-02-27' },
        ],
        notes: [],
        statusHistory: [],
    },
];

// Registration trend data for charts (last 30 days)
export const registrationTrend = [
    { date: 'Jan 30', drivers: 2, owners: 1 },
    { date: 'Feb 01', drivers: 3, owners: 0 },
    { date: 'Feb 03', drivers: 1, owners: 2 },
    { date: 'Feb 05', drivers: 4, owners: 1 },
    { date: 'Feb 07', drivers: 2, owners: 0 },
    { date: 'Feb 09', drivers: 3, owners: 1 },
    { date: 'Feb 11', drivers: 1, owners: 3 },
    { date: 'Feb 13', drivers: 5, owners: 2 },
    { date: 'Feb 15', drivers: 2, owners: 1 },
    { date: 'Feb 17', drivers: 3, owners: 0 },
    { date: 'Feb 19', drivers: 4, owners: 2 },
    { date: 'Feb 21', drivers: 2, owners: 1 },
    { date: 'Feb 23', drivers: 6, owners: 3 },
    { date: 'Feb 25', drivers: 3, owners: 1 },
    { date: 'Feb 27', drivers: 2, owners: 0 },
    { date: 'Feb 28', drivers: 1, owners: 1 },
];

export const verificationFunnel = [
    { tier: 'Registered', drivers: 4, owners: 2 },
    { tier: 'Verified', drivers: 3, owners: 2 },
    { tier: 'Fully Verified', drivers: 2, owners: 2 },
];
