export interface Vehicle {
    id: string;
    ownerId: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    type: string;
    status: 'active' | 'maintenance' | 'inactive' | 'pending_verification' | 'suspended';
    assignedDriver?: string;
    assignedDriverName?: string;
    dailyRevenue: number;
    fitnessExpiry: string;
    insuranceExpiry: string;
    registrationExpiry?: string;
    image?: string;
    route?: { from: string; to: string };
}
