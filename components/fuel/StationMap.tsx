// Native fallback: no map library in the current dev client build, so native
// users get the ranked list only. The web build resolves StationMap.web.tsx
// (Leaflet) instead via Metro platform extensions.
export interface MapStation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    priceLabel: string | null;
    cheapest: boolean;
}

export interface StationMapProps {
    stations: MapStation[];
    center: { lat: number; lng: number };
    userLoc: { lat: number; lng: number } | null;
    onSelect: (stationId: string) => void;
    height?: number;
}

export function StationMap(_props: StationMapProps) {
    return null;
}
