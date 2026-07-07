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
