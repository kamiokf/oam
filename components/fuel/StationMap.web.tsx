import React, { useEffect, useRef } from 'react';
import { Colors } from '../../constants/Colors';
import type { MapStation, StationMapProps } from './StationMap';

export type { MapStation, StationMapProps };

// Leaflet is loaded from CDN at runtime so the native bundle never sees it.
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

declare global {
    interface Window {
        L: any;
        __leafletLoading?: Promise<any>;
    }
}

function loadLeaflet(): Promise<any> {
    if (window.L) return Promise.resolve(window.L);
    if (window.__leafletLoading) return window.__leafletLoading;
    window.__leafletLoading = new Promise((resolve, reject) => {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = LEAFLET_CSS;
        document.head.appendChild(css);
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.onload = () => resolve(window.L);
        script.onerror = () => reject(new Error('Failed to load Leaflet'));
        document.head.appendChild(script);
    });
    return window.__leafletLoading;
}

export function StationMap({ stations, center, userLoc, onSelect, height = 320 }: StationMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const userMarkerRef = useRef<any>(null);
    const onSelectRef = useRef(onSelect);
    onSelectRef.current = onSelect;

    // Init map once
    useEffect(() => {
        let cancelled = false;
        loadLeaflet().then((L) => {
            if (cancelled || !containerRef.current || mapRef.current) return;
            const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
            map.setView([center.lat, center.lng], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);
            mapRef.current = map;
            renderMarkers(L, map);
            renderUser(L, map);
        }).catch(() => { /* map is progressive enhancement; the list still works */ });
        return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderMarkers = (L: any, map: any) => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = stations.map((s) => {
            const bg = s.cheapest ? Colors.primary : s.priceLabel ? Colors.surfaceLight : Colors.surface;
            const fg = s.cheapest ? '#000' : s.priceLabel ? Colors.textPrimary : Colors.textMuted;
            const label = s.priceLabel ?? '—';
            const icon = L.divIcon({
                className: '',
                html: `<div style="transform:translate(-50%,-100%);display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;">
                        <div style="background:${bg};color:${fg};border:1px solid ${Colors.surfaceBorder};border-radius:10px;padding:3px 8px;font:600 12px system-ui;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.45)">${label}</div>
                        <div style="width:2px;height:6px;background:${Colors.surfaceBorder}"></div>
                       </div>`,
                iconSize: [0, 0],
            });
            const marker = L.marker([s.lat, s.lng], { icon, title: s.name }).addTo(map);
            marker.on('click', () => onSelectRef.current(s.id));
            return marker;
        });
    };

    const renderUser = (L: any, map: any) => {
        if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
        if (!userLoc) return;
        const icon = L.divIcon({
            className: '',
            html: `<div style="transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:${Colors.info};border:3px solid #fff;box-shadow:0 0 8px ${Colors.info}"></div>`,
            iconSize: [0, 0],
        });
        userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], { icon, interactive: false }).addTo(map);
    };

    // Update markers when data changes
    useEffect(() => {
        if (!mapRef.current || !window.L) return;
        renderMarkers(window.L, mapRef.current);
        renderUser(window.L, mapRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stations, userLoc]);

    // Recenter when the center changes (e.g. geolocation resolves)
    useEffect(() => {
        if (mapRef.current) mapRef.current.setView([center.lat, center.lng], 12);
    }, [center.lat, center.lng]);

    return (
        <div
            ref={containerRef}
            style={{
                height,
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${Colors.surfaceBorder}`,
                background: Colors.surface,
            }}
        />
    );
}
