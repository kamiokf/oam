import type { RouteExperience, BackgroundCheck } from '../utils/matching';

export interface Driver {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    rating: number;
    totalTrips: number;
    experience: number; // years
    licenseType: string;
    licenseExpiry: string;
    status: 'active' | 'inactive' | 'pending';
    assignedVehicle?: string;
    assignedRoute?: { from: string; to: string };
    weeklyEarnings: number;
    joinedDate: string;
    verificationStatus: 'verified' | 'pending' | 'expired';
    documents: { name: string; status: 'verified' | 'pending' | 'expired' }[];
    routeHistory: RouteExperience[];
    backgroundCheck: BackgroundCheck;
}

export const mockDrivers: Driver[] = [
    {
        id: 'd1',
        name: 'Devon Smith',
        avatar: 'DS',
        phone: '+1 876 555 0101',
        rating: 4.8,
        totalTrips: 1250,
        experience: 5,
        licenseType: 'PPV',
        licenseExpiry: '2026-12-01',
        status: 'active',
        assignedVehicle: 'CF 1234',
        assignedRoute: { from: 'Kingston', to: 'Spanish Town' },
        weeklyEarnings: 42500,
        joinedDate: '2024-03-15',
        verificationStatus: 'verified',
        documents: [
            { name: 'Driver License', status: 'verified' },
            { name: 'PPV Badge', status: 'verified' },
            { name: 'Police Record', status: 'verified' },
        ],
        routeHistory: [
            { from: 'Kingston', to: 'Spanish Town', yearsOnRoute: 4, tripCount: 980 },
            { from: 'Kingston', to: 'Portmore', yearsOnRoute: 1, tripCount: 120 },
        ],
        backgroundCheck: {
            policeRecord: 'verified',
            licenseValidation: 'verified',
            references: 'verified',
            overallStatus: 'premium',
        },
    },
    {
        id: 'd2',
        name: 'Kemar Johnson',
        avatar: 'KJ',
        phone: '+1 876 555 0102',
        rating: 4.6,
        totalTrips: 980,
        experience: 7,
        licenseType: 'PPV',
        licenseExpiry: '2027-03-15',
        status: 'active',
        assignedVehicle: 'PD 5678',
        assignedRoute: { from: 'Kingston', to: 'Montego Bay' },
        weeklyEarnings: 75000,
        joinedDate: '2023-09-01',
        verificationStatus: 'verified',
        documents: [
            { name: 'Driver License', status: 'verified' },
            { name: 'PPV Badge', status: 'verified' },
            { name: 'Police Record', status: 'verified' },
        ],
        routeHistory: [
            { from: 'Kingston', to: 'Montego Bay', yearsOnRoute: 6, tripCount: 850 },
            { from: 'Kingston', to: 'Ocho Rios', yearsOnRoute: 3, tripCount: 320 },
        ],
        backgroundCheck: {
            policeRecord: 'verified',
            licenseValidation: 'verified',
            references: 'verified',
            overallStatus: 'premium',
        },
    },
    {
        id: 'd3',
        name: 'Tricia Murray',
        avatar: 'TM',
        phone: '+1 876 555 0103',
        rating: 4.9,
        totalTrips: 2100,
        experience: 10,
        licenseType: 'TLC',
        licenseExpiry: '2026-06-30',
        status: 'active',
        assignedVehicle: 'CF 3456',
        assignedRoute: { from: 'Spanish Town', to: 'Linstead' },
        weeklyEarnings: 32500,
        joinedDate: '2022-01-10',
        verificationStatus: 'verified',
        documents: [
            { name: 'Driver License', status: 'verified' },
            { name: 'TLC Badge', status: 'verified' },
            { name: 'Police Record', status: 'expired' },
        ],
        routeHistory: [
            { from: 'Spanish Town', to: 'Linstead', yearsOnRoute: 8, tripCount: 1800 },
            { from: 'Kingston', to: 'Spanish Town', yearsOnRoute: 2, tripCount: 280 },
        ],
        backgroundCheck: {
            policeRecord: 'expired',
            licenseValidation: 'verified',
            references: 'verified',
            overallStatus: 'standard',
        },
    },
    {
        id: 'd4',
        name: 'Omar Lewis',
        avatar: 'OL',
        phone: '+1 876 555 0104',
        rating: 4.2,
        totalTrips: 450,
        experience: 2,
        licenseType: 'TLC',
        licenseExpiry: '2026-09-15',
        status: 'inactive',
        weeklyEarnings: 0,
        joinedDate: '2025-06-20',
        verificationStatus: 'pending',
        documents: [
            { name: 'Driver License', status: 'verified' },
            { name: 'TLC Badge', status: 'pending' },
            { name: 'Police Record', status: 'verified' },
        ],
        routeHistory: [
            { from: 'Kingston', to: 'Portmore', yearsOnRoute: 1, tripCount: 200 },
        ],
        backgroundCheck: {
            policeRecord: 'verified',
            licenseValidation: 'pending',
            references: 'not_submitted',
            overallStatus: 'basic',
        },
    },
    {
        id: 'd5',
        name: 'Shanice Brown',
        avatar: 'SB',
        phone: '+1 876 555 0105',
        rating: 4.7,
        totalTrips: 1580,
        experience: 6,
        licenseType: 'PPV',
        licenseExpiry: '2027-01-10',
        status: 'active',
        weeklyEarnings: 52000,
        joinedDate: '2023-04-05',
        verificationStatus: 'verified',
        documents: [
            { name: 'Driver License', status: 'verified' },
            { name: 'PPV Badge', status: 'verified' },
            { name: 'Police Record', status: 'verified' },
        ],
        routeHistory: [
            { from: 'Montego Bay', to: 'Negril', yearsOnRoute: 4, tripCount: 900 },
            { from: 'Montego Bay', to: 'Ocho Rios', yearsOnRoute: 2, tripCount: 380 },
        ],
        backgroundCheck: {
            policeRecord: 'verified',
            licenseValidation: 'verified',
            references: 'pending',
            overallStatus: 'standard',
        },
    },
];
