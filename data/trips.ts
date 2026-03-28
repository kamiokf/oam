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
