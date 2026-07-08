import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { haversineKm } from '../../utils/geo';
import type * as MapLibreTypes from '@maplibre/maplibre-react-native';

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

// MapLibre is a native module: dev clients built before it was added would
// crash on import, so require lazily and fall back to the ranked list.
// The web build never reaches this file (StationMap.web.tsx wins there).
let ML: typeof MapLibreTypes | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ML = require('@maplibre/maplibre-react-native');
} catch {
    ML = null;
}

// Free OSM raster tiles — matches the web map, no API key required.
const OSM_STYLE = {
    version: 8 as const,
    sources: {
        osm: {
            type: 'raster' as const,
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
        },
    },
    layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

// Native view annotations are heavier than web divIcons — cap how many render.
const MAX_MARKERS = 80;

export function StationMap({ stations, center, userLoc, onSelect, height = 320 }: StationMapProps) {
    const visible = useMemo(() => {
        return [...stations]
            .sort((a, b) => haversineKm(center, a) - haversineKm(center, b))
            .slice(0, MAX_MARKERS);
    }, [stations, center]);

    if (!ML) return null; // old dev client without the native module — list-only

    const { Map, Camera, Marker } = ML;

    return (
        <View style={[styles.wrap, { height }]}>
            <Map mapStyle={OSM_STYLE as any} style={styles.map}>
                <Camera zoom={12} center={[center.lng, center.lat]} />
                {visible.map((s) => (
                    <Marker key={s.id} id={s.id} lngLat={[s.lng, s.lat]} anchor="bottom" onPress={() => onSelect(s.id)}>
                        <View style={styles.pillWrap}>
                            <View style={[
                                styles.pill,
                                s.cheapest && styles.pillCheapest,
                                !s.priceLabel && styles.pillEmpty,
                            ]}>
                                <Text style={[
                                    styles.pillText,
                                    s.cheapest && styles.pillTextCheapest,
                                    !s.priceLabel && styles.pillTextEmpty,
                                ]}>
                                    {s.priceLabel ?? '—'}
                                </Text>
                            </View>
                            <View style={styles.pillStem} />
                        </View>
                    </Marker>
                ))}
                {userLoc && (
                    <Marker id="user-location" lngLat={[userLoc.lng, userLoc.lat]}>
                        <View style={styles.userDot} />
                    </Marker>
                )}
            </Map>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        backgroundColor: Colors.surface,
    },
    map: { flex: 1 },
    pillWrap: { alignItems: 'center' },
    pill: {
        backgroundColor: Colors.surfaceLight,
        borderColor: Colors.surfaceBorder,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    pillCheapest: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    pillEmpty: { backgroundColor: Colors.surface },
    pillText: { ...Typography.captionBold, color: Colors.textPrimary, fontSize: 11 },
    pillTextCheapest: { color: '#000' },
    pillTextEmpty: { color: Colors.textMuted },
    pillStem: { width: 2, height: 6, backgroundColor: Colors.surfaceBorder },
    userDot: {
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: Colors.info,
        borderWidth: 3, borderColor: '#fff',
        shadowColor: Colors.info, shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
});
