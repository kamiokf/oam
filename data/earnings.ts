export interface EarningEntry {
    id: string;
    date: string;
    amount: number;
    route: { from: string; to: string };
    vehiclePlate: string;
    status: 'paid' | 'pending' | 'processing';
    trips: number;
}

