export interface EarningEntry {
    id: string;
    date: string;
    amount: number;
    route: { from: string; to: string };
    vehiclePlate: string;
    status: 'paid' | 'pending' | 'processing';
    trips: number;
}

export const mockEarnings: EarningEntry[] = [
    { id: 'e1', date: '2026-02-27', amount: 8500, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'pending', trips: 6 },
    { id: 'e2', date: '2026-02-26', amount: 9200, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'processing', trips: 7 },
    { id: 'e3', date: '2026-02-25', amount: 7800, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'paid', trips: 5 },
    { id: 'e4', date: '2026-02-24', amount: 8100, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'paid', trips: 6 },
    { id: 'e5', date: '2026-02-23', amount: 9500, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'paid', trips: 8 },
    { id: 'e6', date: '2026-02-22', amount: 6200, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'paid', trips: 4 },
    { id: 'e7', date: '2026-02-21', amount: 8800, route: { from: 'Kingston', to: 'Spanish Town' }, vehiclePlate: 'CF 1234', status: 'paid', trips: 6 },
];

export const weeklyEarningsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [8800, 6200, 9500, 8100, 7800, 9200, 8500],
};

export const monthlyEarningsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [42500, 48200, 51000, 58100],
};

export const earningsSummary = {
    today: 8500,
    thisWeek: 58100,
    thisMonth: 199800,
    pendingPayments: 17700,
    totalTrips: 42,
};
