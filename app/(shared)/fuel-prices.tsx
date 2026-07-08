import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../context/AuthContext';
import { StationMap } from '../../components/fuel/StationMap';
import { haversineKm, formatDistance, timeAgo, DEFAULT_CENTER, LatLng } from '../../utils/geo';
import { showAlert } from '../../utils/alert';

const FUEL_GRADES = [
    { key: 'e10_87', label: '87' },
    { key: 'e10_90', label: '90' },
    { key: 'diesel', label: 'Diesel' },
    { key: 'ulsd', label: 'ULSD' },
] as const;
type FuelGrade = (typeof FUEL_GRADES)[number]['key'];

interface Station {
    id: string;
    name: string;
    brand: string | null;
    address: string | null;
    parish: string | null;
    lat: number;
    lng: number;
}

interface PriceReport {
    id: string;
    station_id: string;
    fuel_grade: string;
    price: number;
    reporter_name: string | null;
    created_at: string;
}

// latest report per station+grade
type LatestPrices = Record<string, Partial<Record<FuelGrade, PriceReport>>>;

export default function FuelPricesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [stations, setStations] = useState<Station[]>([]);
    const [latest, setLatest] = useState<LatestPrices>({});
    const [grade, setGrade] = useState<FuelGrade>('e10_87');
    const [userLoc, setUserLoc] = useState<LatLng | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Station | null>(null);
    const [reportGrade, setReportGrade] = useState<FuelGrade>('e10_87');
    const [reportPrice, setReportPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [stRes, rpRes] = await Promise.all([
                insforge.database.from('gas_stations').select('*'),
                insforge.database.from('fuel_price_reports').select('*').order('created_at', { ascending: false }).limit(2000),
            ]);
            if (stRes.error) throw stRes.error;
            if (rpRes.error) throw rpRes.error;
            setStations((stRes.data || []).map((s: any) => ({ ...s, lat: Number(s.lat), lng: Number(s.lng) })));
            const map: LatestPrices = {};
            for (const r of (rpRes.data || []) as PriceReport[]) {
                const g = r.fuel_grade as FuelGrade;
                if (!map[r.station_id]) map[r.station_id] = {};
                // Reports are ordered newest-first, so first one wins
                if (!map[r.station_id][g]) map[r.station_id][g] = { ...r, price: Number(r.price) };
            }
            setLatest(map);
        } catch (err) {
            console.error('Failed to fetch fuel prices:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Geolocate (web); native falls back to Kingston until expo-location ships
    useEffect(() => {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => { /* denied — keep Kingston default */ },
                { timeout: 8000, maximumAge: 300000 }
            );
        }
    }, []);

    const center = userLoc || DEFAULT_CENTER;

    const ranked = useMemo(() => {
        const rows = stations.map((s) => {
            const report = latest[s.id]?.[grade];
            return {
                station: s,
                price: report ? report.price : null,
                report: report || null,
                distanceKm: haversineKm(center, s),
            };
        });
        rows.sort((a, b) => {
            if (a.price !== null && b.price !== null) return a.price - b.price || a.distanceKm - b.distanceKm;
            if (a.price !== null) return -1;
            if (b.price !== null) return 1;
            return a.distanceKm - b.distanceKm;
        });
        return rows;
    }, [stations, latest, grade, center]);

    const cheapestId = ranked.length && ranked[0].price !== null ? ranked[0].station.id : null;

    const mapStations = useMemo(() => ranked.map(({ station, price }) => ({
        id: station.id,
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        priceLabel: price !== null ? `J$${price.toFixed(1)}` : null,
        cheapest: station.id === cheapestId,
    })), [ranked, cheapestId]);

    const openStation = (id: string) => {
        const st = stations.find((s) => s.id === id);
        if (!st) return;
        setSelected(st);
        setReportGrade(grade);
        setReportPrice('');
    };

    const submitReport = async () => {
        if (!selected) return;
        const price = parseFloat(reportPrice);
        if (!price || price < 50 || price > 1000) {
            showAlert('Invalid price', 'Enter the pump price per litre in J$ (e.g. 198.9).');
            return;
        }
        setSubmitting(true);
        try {
            const { data, error } = await insforge.database.from('fuel_price_reports').insert({
                station_id: selected.id,
                fuel_grade: reportGrade,
                price,
                reported_by: user?.id || null,
                reporter_name: user?.name || 'Anonymous',
            }).select('*').single();
            if (error) throw error;
            const rep = { ...(data as PriceReport), price: Number((data as any).price) };
            setLatest((prev) => ({ ...prev, [selected.id]: { ...prev[selected.id], [reportGrade]: rep } }));
            setReportPrice('');
            showAlert('Price updated', `Thanks! ${selected.name} now shows J$${price.toFixed(1)}/L for ${FUEL_GRADES.find(g => g.key === reportGrade)?.label}.`);
        } catch (err: any) {
            console.error('Failed to submit price report:', err);
            showAlert('Error', err?.message || 'Could not submit the price. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <ScreenWrapper title="Fuel Prices" subtitle="Find the cheapest fuel nearby">
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading stations…</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            title="Fuel Prices"
            subtitle="Find the cheapest fuel nearby"
            headerRight={
                <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
            }
        >
            {/* Grade selector */}
            <View style={styles.gradeRow}>
                {FUEL_GRADES.map((g) => (
                    <TouchableOpacity
                        key={g.key}
                        style={[styles.gradeChip, grade === g.key && styles.gradeChipActive]}
                        onPress={() => setGrade(g.key)}
                    >
                        <Text style={[styles.gradeText, grade === g.key && styles.gradeTextActive]}>{g.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Map (web only — native shows the list) */}
            <StationMap stations={mapStations} center={center} userLoc={userLoc} onSelect={openStation} />

            {!userLoc && (
                <Text style={styles.locationHint}>
                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} /> Using Kingston — allow location access for nearby results
                </Text>
            )}

            {/* Ranked list */}
            <SectionHeader title={`Cheapest ${FUEL_GRADES.find(g => g.key === grade)?.label} Near You`} style={styles.section} />
            {ranked.every((r) => r.price === null) && (
                <Card style={styles.emptyCard}>
                    <Ionicons name="pricetag-outline" size={22} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>
                        No prices reported yet for this grade. Be the first — tap a station and add today's pump price.
                    </Text>
                </Card>
            )}
            {ranked.slice(0, 15).map(({ station, price, report, distanceKm }, i) => (
                <TouchableOpacity key={station.id} onPress={() => openStation(station.id)} activeOpacity={0.8}>
                    <Card style={StyleSheet.flatten([styles.stationCard, station.id === cheapestId && styles.cheapestCard])}>
                        <View style={styles.stationRow}>
                            <View style={[styles.rankBubble, station.id === cheapestId && styles.rankBubbleBest]}>
                                <Text style={[styles.rankText, station.id === cheapestId && styles.rankTextBest]}>{i + 1}</Text>
                            </View>
                            <View style={styles.stationInfo}>
                                <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
                                <Text style={styles.stationMeta} numberOfLines={1}>
                                    {[station.brand, formatDistance(distanceKm), report ? `${timeAgo(report.created_at)}${report.reporter_name ? ` by ${report.reporter_name}` : ''}` : null]
                                        .filter(Boolean).join(' • ')}
                                </Text>
                            </View>
                            <View style={styles.priceCol}>
                                {price !== null ? (
                                    <>
                                        <Text style={[styles.priceText, station.id === cheapestId && styles.priceTextBest]}>J${price.toFixed(1)}</Text>
                                        <Text style={styles.priceUnit}>per litre</Text>
                                    </>
                                ) : (
                                    <Text style={styles.noPrice}>No price</Text>
                                )}
                            </View>
                        </View>
                    </Card>
                </TouchableOpacity>
            ))}

            {/* Station detail + price report modal */}
            <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle} numberOfLines={1}>{selected?.name}</Text>
                                <Text style={styles.modalSub} numberOfLines={1}>
                                    {[selected?.brand, selected?.address || selected?.parish].filter(Boolean).join(' • ') || 'Gas station'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalClose}>
                                <Ionicons name="close" size={22} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flexGrow: 0 }}>
                            {/* Current prices */}
                            {FUEL_GRADES.map((g) => {
                                const rep = selected ? latest[selected.id]?.[g.key] : undefined;
                                return (
                                    <View key={g.key} style={styles.gradeLine}>
                                        <Text style={styles.gradeLineLabel}>{g.label}</Text>
                                        {rep ? (
                                            <View style={styles.gradeLineRight}>
                                                <Text style={styles.gradeLinePrice}>J${Number(rep.price).toFixed(1)}</Text>
                                                <Text style={styles.gradeLineMeta}>{timeAgo(rep.created_at)}{rep.reporter_name ? ` • ${rep.reporter_name}` : ''}</Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.gradeLineEmpty}>Not reported</Text>
                                        )}
                                    </View>
                                );
                            })}

                            {/* Report form */}
                            <SectionHeader title="Update a Price" style={{ marginTop: Spacing.lg }} />
                            <View style={styles.gradeRow}>
                                {FUEL_GRADES.map((g) => (
                                    <TouchableOpacity
                                        key={g.key}
                                        style={[styles.gradeChip, reportGrade === g.key && styles.gradeChipActive]}
                                        onPress={() => setReportGrade(g.key)}
                                    >
                                        <Text style={[styles.gradeText, reportGrade === g.key && styles.gradeTextActive]}>{g.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.priceInputRow}>
                                <Text style={styles.priceInputPrefix}>J$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="198.9"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="decimal-pad"
                                    value={reportPrice}
                                    onChangeText={setReportPrice}
                                />
                                <Text style={styles.priceInputSuffix}>/ litre</Text>
                            </View>
                            <Button
                                title="Submit Price"
                                onPress={submitReport}
                                size="lg"
                                fullWidth
                                loading={submitting}
                                disabled={!reportPrice}
                            />
                            <Text style={styles.crowdNote}>
                                Prices are crowdsourced by the community — your name and time are shown with your report.
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    loadingWrap: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
    loadingText: { ...Typography.body, color: Colors.textMuted },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    gradeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    gradeChip: {
        paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight,
        borderWidth: 1, borderColor: Colors.surfaceBorder,
    },
    gradeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    gradeText: { ...Typography.bodyBold, color: Colors.textSecondary },
    gradeTextActive: { color: '#000' },
    locationHint: { ...Typography.small, color: Colors.textMuted, marginTop: Spacing.sm },
    section: { marginTop: Spacing.xl },
    emptyCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
    emptyText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
    stationCard: { marginBottom: Spacing.sm },
    cheapestCard: { borderColor: Colors.primary, borderWidth: 1 },
    stationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    rankBubble: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceLight,
        alignItems: 'center', justifyContent: 'center',
    },
    rankBubbleBest: { backgroundColor: Colors.primary },
    rankText: { ...Typography.captionBold, color: Colors.textSecondary },
    rankTextBest: { color: '#000' },
    stationInfo: { flex: 1, gap: 2 },
    stationName: { ...Typography.bodyBold, color: Colors.textPrimary },
    stationMeta: { ...Typography.caption, color: Colors.textMuted },
    priceCol: { alignItems: 'flex-end' },
    priceText: { ...Typography.h4, color: Colors.textPrimary },
    priceTextBest: { color: Colors.primaryLight },
    priceUnit: { ...Typography.small, color: Colors.textMuted },
    noPrice: { ...Typography.caption, color: Colors.textMuted },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius['2xl'],
        borderTopRightRadius: BorderRadius['2xl'], padding: Spacing.xl, maxHeight: '85%',
        maxWidth: 1024, width: '100%', alignSelf: 'center',
    },
    modalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.lg },
    modalTitle: { ...Typography.h3, color: Colors.textPrimary },
    modalSub: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
    modalClose: {
        padding: Spacing.xs, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full,
    },
    gradeLine: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
    },
    gradeLineLabel: { ...Typography.bodyBold, color: Colors.textPrimary },
    gradeLineRight: { alignItems: 'flex-end' },
    gradeLinePrice: { ...Typography.bodyBold, color: Colors.primaryLight },
    gradeLineMeta: { ...Typography.small, color: Colors.textMuted },
    gradeLineEmpty: { ...Typography.caption, color: Colors.textMuted },
    priceInputRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.surfaceBorder,
        paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    },
    priceInputPrefix: { ...Typography.bodyBold, color: Colors.textSecondary },
    priceInput: { flex: 1, paddingVertical: Spacing.md + 2, color: Colors.textPrimary, ...Typography.body },
    priceInputSuffix: { ...Typography.caption, color: Colors.textMuted },
    crowdNote: { ...Typography.small, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg },
});
