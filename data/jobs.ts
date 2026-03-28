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
