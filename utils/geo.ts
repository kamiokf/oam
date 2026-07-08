export interface LatLng {
    lat: number;
    lng: number;
}

// Great-circle distance in km
export const haversineKm = (a: LatLng, b: LatLng): number => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

export const formatDistance = (km: number): string =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

// Kingston fallback when geolocation is unavailable/denied
export const DEFAULT_CENTER: LatLng = { lat: 18.0179, lng: -76.8099 };

export const timeAgo = (dateStr: string): string => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
};
