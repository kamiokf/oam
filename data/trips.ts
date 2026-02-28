export interface GPSCoord {
    lat: number;
    lng: number;
    accuracy: number; // meters
    timestamp: string;
}

export interface Trip {
    id: string;
    driverId: string;
    driverName: string;
    vehicleId: string;
    vehiclePlate: string;
    route: { from: string; to: string };
    startLocation: GPSCoord;
    endLocation: GPSCoord | null;
    distanceKm: number;
    startTime: string;
    endTime: string | null;
    durationMinutes: number | null;
    fare: number;
    status: 'active' | 'completed' | 'disputed';
    gpsVerified: boolean;
    waypoints: GPSCoord[]; // breadcrumb trail
    fuelEstimate: number; // JMD
    notes?: string;
}

// Realistic Kingston-area GPS coordinates
const GPS = {
    kingston: { lat: 18.0179, lng: -76.8099 },
    spanishTown: { lat: 18.0117, lng: -76.9560 },
    portmore: { lat: 17.9581, lng: -76.8801 },
    montegoBay: { lat: 18.4762, lng: -77.8939 },
    ochoRios: { lat: 18.4040, lng: -77.1050 },
    negril: { lat: 18.2683, lng: -78.3473 },
    linstead: { lat: 18.1424, lng: -77.0320 },
    mandevilleLat: 18.0410,
    mandevilleLng: -77.5042,
};

export const mockTrips: Trip[] = [
    {
        id: 'trip-001',
        driverId: 'd1',
        driverName: 'Devon Smith',
        vehicleId: 'v1',
        vehiclePlate: 'CF 1234',
        route: { from: 'Kingston', to: 'Spanish Town' },
        startLocation: { lat: GPS.kingston.lat, lng: GPS.kingston.lng, accuracy: 5, timestamp: '2026-02-28T06:02:14' },
        endLocation: { lat: GPS.spanishTown.lat, lng: GPS.spanishTown.lng, accuracy: 8, timestamp: '2026-02-28T06:48:30' },
        distanceKm: 22.4,
        startTime: '2026-02-28T06:02:14',
        endTime: '2026-02-28T06:48:30',
        durationMinutes: 46,
        fare: 4250,
        status: 'completed',
        gpsVerified: true,
        waypoints: [
            { lat: 18.0179, lng: -76.8099, accuracy: 5, timestamp: '2026-02-28T06:02:14' },
            { lat: 18.0165, lng: -76.8450, accuracy: 6, timestamp: '2026-02-28T06:15:00' },
            { lat: 18.0140, lng: -76.8900, accuracy: 7, timestamp: '2026-02-28T06:30:00' },
            { lat: 18.0117, lng: -76.9560, accuracy: 8, timestamp: '2026-02-28T06:48:30' },
        ],
        fuelEstimate: 850,
    },
    {
        id: 'trip-002',
        driverId: 'd1',
        driverName: 'Devon Smith',
        vehicleId: 'v1',
        vehiclePlate: 'CF 1234',
        route: { from: 'Spanish Town', to: 'Kingston' },
        startLocation: { lat: GPS.spanishTown.lat, lng: GPS.spanishTown.lng, accuracy: 4, timestamp: '2026-02-28T07:15:00' },
        endLocation: { lat: GPS.kingston.lat, lng: GPS.kingston.lng, accuracy: 6, timestamp: '2026-02-28T08:05:20' },
        distanceKm: 23.1,
        startTime: '2026-02-28T07:15:00',
        endTime: '2026-02-28T08:05:20',
        durationMinutes: 50,
        fare: 4250,
        status: 'completed',
        gpsVerified: true,
        waypoints: [
            { lat: 18.0117, lng: -76.9560, accuracy: 4, timestamp: '2026-02-28T07:15:00' },
            { lat: 18.0130, lng: -76.9100, accuracy: 5, timestamp: '2026-02-28T07:30:00' },
            { lat: 18.0155, lng: -76.8600, accuracy: 6, timestamp: '2026-02-28T07:50:00' },
            { lat: 18.0179, lng: -76.8099, accuracy: 6, timestamp: '2026-02-28T08:05:20' },
        ],
        fuelEstimate: 880,
    },
    {
        id: 'trip-003',
        driverId: 'd2',
        driverName: 'Kemar Johnson',
        vehicleId: 'v2',
        vehiclePlate: 'PD 5678',
        route: { from: 'Kingston', to: 'Montego Bay' },
        startLocation: { lat: GPS.kingston.lat, lng: GPS.kingston.lng, accuracy: 3, timestamp: '2026-02-28T05:35:00' },
        endLocation: { lat: GPS.montegoBay.lat, lng: GPS.montegoBay.lng, accuracy: 10, timestamp: '2026-02-28T09:15:00' },
        distanceKm: 186.5,
        startTime: '2026-02-28T05:35:00',
        endTime: '2026-02-28T09:15:00',
        durationMinutes: 220,
        fare: 15000,
        status: 'completed',
        gpsVerified: true,
        waypoints: [
            { lat: 18.0179, lng: -76.8099, accuracy: 3, timestamp: '2026-02-28T05:35:00' },
            { lat: 18.0410, lng: -77.5042, accuracy: 15, timestamp: '2026-02-28T07:30:00' },
            { lat: 18.4762, lng: -77.8939, accuracy: 10, timestamp: '2026-02-28T09:15:00' },
        ],
        fuelEstimate: 7200,
    },
    {
        id: 'trip-004',
        driverId: 'd1',
        driverName: 'Devon Smith',
        vehicleId: 'v1',
        vehiclePlate: 'CF 1234',
        route: { from: 'Kingston', to: 'Spanish Town' },
        startLocation: { lat: GPS.kingston.lat, lng: GPS.kingston.lng, accuracy: 5, timestamp: '2026-02-27T06:10:00' },
        endLocation: { lat: GPS.spanishTown.lat, lng: GPS.spanishTown.lng, accuracy: 7, timestamp: '2026-02-27T06:55:00' },
        distanceKm: 21.8,
        startTime: '2026-02-27T06:10:00',
        endTime: '2026-02-27T06:55:00',
        durationMinutes: 45,
        fare: 4250,
        status: 'completed',
        gpsVerified: true,
        waypoints: [],
        fuelEstimate: 830,
    },
    {
        id: 'trip-005',
        driverId: 'd3',
        driverName: 'Tricia Murray',
        vehicleId: 'v3',
        vehiclePlate: 'CF 3456',
        route: { from: 'Spanish Town', to: 'Linstead' },
        startLocation: { lat: GPS.spanishTown.lat, lng: GPS.spanishTown.lng, accuracy: 6, timestamp: '2026-02-28T07:00:00' },
        endLocation: null,
        distanceKm: 12.3,
        startTime: '2026-02-28T07:00:00',
        endTime: null,
        durationMinutes: null,
        fare: 0,
        status: 'active',
        gpsVerified: false,
        waypoints: [
            { lat: 18.0117, lng: -76.9560, accuracy: 6, timestamp: '2026-02-28T07:00:00' },
            { lat: 18.0550, lng: -76.9800, accuracy: 8, timestamp: '2026-02-28T07:15:00' },
        ],
        fuelEstimate: 0,
        notes: 'Running slightly behind schedule',
    },
    {
        id: 'trip-006',
        driverId: 'd1',
        driverName: 'Devon Smith',
        vehicleId: 'v1',
        vehiclePlate: 'CF 1234',
        route: { from: 'Spanish Town', to: 'Kingston' },
        startLocation: { lat: GPS.spanishTown.lat, lng: GPS.spanishTown.lng, accuracy: 12, timestamp: '2026-02-26T14:30:00' },
        endLocation: { lat: 18.0150, lng: -76.8200, accuracy: 50, timestamp: '2026-02-26T15:25:00' },
        distanceKm: 20.5,
        startTime: '2026-02-26T14:30:00',
        endTime: '2026-02-26T15:25:00',
        durationMinutes: 55,
        fare: 4250,
        status: 'disputed',
        gpsVerified: false,
        waypoints: [],
        fuelEstimate: 800,
        notes: 'GPS signal lost mid-route — low accuracy endpoint',
    },
];

// Aggregate stats helper
export const getTripStats = (trips: Trip[], driverId?: string) => {
    const filtered = driverId ? trips.filter((t) => t.driverId === driverId) : trips;
    const completed = filtered.filter((t) => t.status === 'completed');
    return {
        totalTrips: completed.length,
        totalKm: Math.round(completed.reduce((s, t) => s + t.distanceKm, 0) * 10) / 10,
        totalFare: completed.reduce((s, t) => s + t.fare, 0),
        totalFuel: completed.reduce((s, t) => s + t.fuelEstimate, 0),
        avgDuration: completed.length ? Math.round(completed.reduce((s, t) => s + (t.durationMinutes || 0), 0) / completed.length) : 0,
        gpsVerifiedPct: completed.length ? Math.round((completed.filter((t) => t.gpsVerified).length / completed.length) * 100) : 0,
    };
};
