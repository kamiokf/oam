export interface Job {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerRating: number;
    ownerAvatar: string;
    vehicleType: string;
    vehiclePlate: string;
    route: { from: string; to: string };
    dailyPay: number;
    schedule: string;
    requirements: string[];
    description: string;
    postedDate: string;
    status: 'open' | 'filled' | 'closed';
    applicants: number;
    isSmartMatch?: boolean;
    matchScore?: number;
}

export const mockJobs: Job[] = [
    {
        id: 'j1',
        ownerId: 'o1',
        ownerName: 'Marcus Thompson',
        ownerRating: 4.8,
        ownerAvatar: 'MT',
        vehicleType: 'Toyota Hiace',
        vehiclePlate: 'CF 1234',
        route: { from: 'Kingston', to: 'Spanish Town' },
        dailyPay: 8500,
        schedule: 'Monday - Friday, 6:00 AM - 6:00 PM',
        requirements: ['Valid PPV License', '3+ years experience', 'Clean driving record'],
        description: 'Looking for a reliable driver for the Kingston to Spanish Town route. Vehicle is well-maintained and fully insured.',
        postedDate: '2026-02-25',
        status: 'open',
        applicants: 3,
        isSmartMatch: true,
        matchScore: 95,
    },
    {
        id: 'j2',
        ownerId: 'o2',
        ownerName: 'Davina Brown',
        ownerRating: 4.6,
        ownerAvatar: 'DB',
        vehicleType: 'Toyota Coaster',
        vehiclePlate: 'PD 5678',
        route: { from: 'Kingston', to: 'Montego Bay' },
        dailyPay: 15000,
        schedule: 'Daily, 5:00 AM - 7:00 PM',
        requirements: ['Valid PPV License', '5+ years experience', 'Coaster experience required'],
        description: 'Experienced coaster driver needed for the Kingston to Montego Bay express route. Competitive daily pay with bonuses.',
        postedDate: '2026-02-24',
        status: 'open',
        applicants: 7,
        isSmartMatch: true,
        matchScore: 88,
    },
    {
        id: 'j3',
        ownerId: 'o3',
        ownerName: 'Andrew Williams',
        ownerRating: 4.3,
        ownerAvatar: 'AW',
        vehicleType: 'Nissan Caravan',
        vehiclePlate: 'JM 9012',
        route: { from: 'Kingston', to: 'Portmore' },
        dailyPay: 7000,
        schedule: 'Monday - Saturday, 6:30 AM - 5:00 PM',
        requirements: ['Valid PPV License', '1+ years experience'],
        description: 'Driver needed for the busy Kingston to Portmore route. Great opportunity for new drivers.',
        postedDate: '2026-02-23',
        status: 'open',
        applicants: 12,
        matchScore: 72,
    },
    {
        id: 'j4',
        ownerId: 'o1',
        ownerName: 'Marcus Thompson',
        ownerRating: 4.8,
        ownerAvatar: 'MT',
        vehicleType: 'Honda Fit',
        vehiclePlate: 'CF 3456',
        route: { from: 'Spanish Town', to: 'Linstead' },
        dailyPay: 6500,
        schedule: 'Monday - Friday, 7:00 AM - 4:00 PM',
        requirements: ['Valid PPV License', '2+ years experience'],
        description: 'Seeking a dependable driver for the Spanish Town to Linstead corridor. Flexible schedule available.',
        postedDate: '2026-02-22',
        status: 'open',
        applicants: 5,
        matchScore: 65,
    },
    {
        id: 'j5',
        ownerId: 'o4',
        ownerName: 'Shereen Clarke',
        ownerRating: 4.9,
        ownerAvatar: 'SC',
        vehicleType: 'Toyota Hiace',
        vehiclePlate: 'KN 7890',
        route: { from: 'Montego Bay', to: 'Negril' },
        dailyPay: 9500,
        schedule: 'Daily, 6:00 AM - 8:00 PM',
        requirements: ['Valid PPV License', '3+ years experience', 'Tourism experience preferred'],
        description: 'Premium route from Montego Bay to Negril. Must be professional and courteous with tourists.',
        postedDate: '2026-02-21',
        status: 'open',
        applicants: 8,
        isSmartMatch: true,
        matchScore: 91,
    },
    {
        id: 'j6',
        ownerId: 'o5',
        ownerName: 'Ricardo Henry',
        ownerRating: 4.5,
        ownerAvatar: 'RH',
        vehicleType: 'Toyota Coaster',
        vehiclePlate: 'ST 2345',
        route: { from: 'Kingston', to: 'Ocho Rios' },
        dailyPay: 12000,
        schedule: 'Monday - Saturday, 5:30 AM - 6:00 PM',
        requirements: ['Valid PPV License', '5+ years experience', 'Coaster certification'],
        description: 'Join our team driving the popular Kingston to Ocho Rios route. Performance bonuses available.',
        postedDate: '2026-02-20',
        status: 'open',
        applicants: 6,
        matchScore: 78,
    },
];
