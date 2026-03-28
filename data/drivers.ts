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
