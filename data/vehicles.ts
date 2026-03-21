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

export const mockVehicles: Vehicle[] = [
    {
        id: 'v1',
        ownerId: 'owner1',
        make: 'Toyota',
        model: 'Hiace',
        year: 2022,
        plate: 'CF 1234',
        type: 'Minibus',
        status: 'active',
        assignedDriver: 'd1',
        assignedDriverName: 'Devon Smith',
        dailyRevenue: 18500,
        fitnessExpiry: '2026-08-15',
        insuranceExpiry: '2026-06-30',
        route: { from: 'Kingston', to: 'Spanish Town' },
    },
    {
        id: 'v2',
        ownerId: 'owner1',
        make: 'Toyota',
        model: 'Coaster',
        year: 2021,
        plate: 'PD 5678',
        type: 'Bus',
        status: 'active',
        assignedDriver: 'd2',
        assignedDriverName: 'Kemar Johnson',
        dailyRevenue: 32000,
        fitnessExpiry: '2026-05-20',
        insuranceExpiry: '2026-04-10',
        route: { from: 'Kingston', to: 'Montego Bay' },
    },
    {
        id: 'v3',
        ownerId: 'owner1',
        make: 'Nissan',
        model: 'Caravan',
        year: 2023,
        plate: 'JM 9012',
        type: 'Minibus',
        status: 'maintenance',
        dailyRevenue: 0,
        fitnessExpiry: '2026-09-01',
        insuranceExpiry: '2026-07-15',
        route: { from: 'Kingston', to: 'Portmore' },
    },
    {
        id: 'v4',
        ownerId: 'owner1',
        make: 'Honda',
        model: 'Fit',
        year: 2024,
        plate: 'CF 3456',
        type: 'Car',
        status: 'active',
        assignedDriver: 'd3',
        assignedDriverName: 'Tricia Murray',
        dailyRevenue: 12000,
        fitnessExpiry: '2026-11-30',
        insuranceExpiry: '2026-10-15',
        route: { from: 'Spanish Town', to: 'Linstead' },
    },
    {
        id: 'v5',
        ownerId: 'owner1',
        make: 'Toyota',
        model: 'Hiace',
        year: 2020,
        plate: 'KN 7890',
        type: 'Minibus',
        status: 'inactive',
        dailyRevenue: 0,
        fitnessExpiry: '2026-03-01',
        insuranceExpiry: '2026-03-15',
    },
];
