import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { insforge } from '../../lib/insforge';

export default function TripLoggerScreen() {
    const [isActive, setIsActive] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [distance, setDistance] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Simulate GPS pulse animation when trip is active
    useEffect(() => {
        if (isActive) {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            loop.start();

            // Simulate distance/time
            const timer = setInterval(() => {
                setElapsed((e) => e + 1);
                setDistance((d) => d + 0.08 + Math.random() * 0.05);
            }, 1000);

            return () => { loop.stop(); clearInterval(timer); };
        }
    }, [isActive]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const [recentTrips, setRecentTrips] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalTrips: 0, totalKm: 0, gpsVerifiedPct: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTrips() {
            try {
                // Fetch recent trips
                const { data: tripsRes, error } = await insforge.database
                    .from('trips')
                    .select('*')
                    .order('start_time', { ascending: false })
                    .limit(20);

                if (error) throw error;
                const tripsData = tripsRes || [];

                // Format for UI
                const formattedList = tripsData.slice(0, 4).map(t => ({
                    id: t.id,
                    route: { from: t.route_from, to: t.route_to },
                    distanceKm: parseFloat(t.distance_km) || 0,
                    durationMinutes: t.duration_minutes || 0,
                    vehiclePlate: t.vehicle_plate,
                    fare: parseFloat(t.fare) || 0,
                    gpsVerified: t.gps_verified,
                    status: t.status,
                    startLocation: t.start_lat ? { lat: t.start_lat, lng: t.start_lng } : null,
                    endLocation: t.end_lat ? { lat: t.end_lat, lng: t.end_lng } : null,
                }));
                setRecentTrips(formattedList);

                // Compute stats
                const totalTrips = tripsData.length;
                const totalKm = tripsData.reduce((sum, t) => sum + (parseFloat(t.distance_km) || 0), 0);
                const verifiedTrips = tripsData.filter(t => t.gps_verified).length;
                const gpsVerifiedPct = totalTrips > 0 ? Math.round((verifiedTrips / totalTrips) * 100) : 0;

                setStats({
                    totalTrips,
                    totalKm: parseFloat(totalKm.toFixed(1)),
                    gpsVerifiedPct
                });
            } catch (err) {
                console.error("Failed to load trips:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTrips();
    }, []);

    return (
        <ScreenWrapper title="Trip Logger" subtitle="GPS-Verified Trips">
            {/* Active Trip / Start Button */}
            <Card variant="highlighted" style={styles.activeCard}>
                {isActive ? (
                    <>
                        <View style={styles.activeHeader}>
                            <Animated.View style={[styles.gpsPulse, { transform: [{ scale: pulseAnim }] }]}>
                                <Ionicons name="navigate" size={24} color={Colors.primary} />
                            </Animated.View>
                            <View style={styles.activeInfo}>
                                <Text style={styles.activeTitle}>Trip in Progress</Text>
                                <Text style={styles.activeRoute}>Kingston → Spanish Town</Text>
                            </View>
                            <Badge label="GPS Active" variant="success" size="sm" />
                        </View>

                        <View style={styles.liveStats}>
                            <View style={styles.liveStat}>
                                <Text style={styles.liveValue}>{formatTime(elapsed)}</Text>
                                <Text style={styles.liveLabel}>Duration</Text>
                            </View>
                            <View style={styles.liveDivider} />
                            <View style={styles.liveStat}>
                                <Text style={styles.liveValue}>{distance.toFixed(1)} km</Text>
                                <Text style={styles.liveLabel}>Distance</Text>
                            </View>
                            <View style={styles.liveDivider} />
                            <View style={styles.liveStat}>
                                <Text style={styles.liveValue}>±5m</Text>
                                <Text style={styles.liveLabel}>Accuracy</Text>
                            </View>
                        </View>

                        <View style={styles.gpsCoords}>
                            <View style={styles.coordRow}>
                                <Ionicons name="location" size={14} color={Colors.success} />
                                <Text style={styles.coordText}>18.0179, -76.8099</Text>
                                <Text style={styles.coordLabel}>Start</Text>
                            </View>
                            <View style={styles.coordRow}>
                                <Ionicons name="radio-button-on" size={14} color={Colors.primary} />
                                <Text style={styles.coordText}>{(18.0179 - elapsed * 0.00003).toFixed(4)}, {(-76.8099 - elapsed * 0.0001).toFixed(4)}</Text>
                                <Text style={styles.coordLabel}>Current</Text>
                            </View>
                        </View>

                        <Button title="End Trip" variant="danger" fullWidth onPress={() => setIsActive(false)} />
                    </>
                ) : (
                    <View style={styles.startSection}>
                        <View style={styles.startIcon}>
                            <Ionicons name="navigate" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.startTitle}>Start a New Trip</Text>
                        <Text style={styles.startDesc}>GPS will verify your route, mileage, and duration automatically</Text>
                        <Button title="Start Trip" variant="primary" fullWidth onPress={() => { setIsActive(true); setElapsed(0); setDistance(0); }} />
                    </View>
                )}
            </Card>

            {/* Today's Summary */}
            <View style={styles.summaryRow}>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{stats.totalTrips}</Text>
                    <Text style={styles.summaryLabel}>Trips</Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{stats.totalKm} km</Text>
                    <Text style={styles.summaryLabel}>Total Distance</Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{stats.gpsVerifiedPct}%</Text>
                    <Text style={styles.summaryLabel}>GPS Verified</Text>
                </Card>
            </View>

            {/* Recent Trips */}
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            {recentTrips.map((trip) => (
                <Card key={trip.id} style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                        <View style={styles.tripIconWrap}>
                            <Ionicons
                                name={trip.gpsVerified ? 'checkmark-circle' : trip.status === 'disputed' ? 'alert-circle' : 'time'}
                                size={20}
                                color={trip.gpsVerified ? Colors.success : trip.status === 'disputed' ? Colors.error : Colors.warning}
                            />
                        </View>
                        <View style={styles.tripInfo}>
                            <Text style={styles.tripRoute}>{trip.route.from} → {trip.route.to}</Text>
                            <Text style={styles.tripMeta}>{trip.distanceKm} km • {trip.durationMinutes} min • {trip.vehiclePlate}</Text>
                        </View>
                        <View style={styles.tripRight}>
                            <Text style={styles.tripFare}>{formatCurrency(trip.fare)}</Text>
                            <Badge
                                label={trip.gpsVerified ? 'GPS ✓' : trip.status === 'disputed' ? 'Disputed' : 'Pending'}
                                variant={trip.gpsVerified ? 'success' : trip.status === 'disputed' ? 'error' : 'warning'}
                                size="sm"
                            />
                        </View>
                    </View>

                    {/* GPS Coordinates */}
                    {trip.startLocation && (
                        <View style={styles.tripGps}>
                            <View style={styles.miniCoord}>
                                <Ionicons name="location" size={10} color={Colors.success} />
                                <Text style={styles.miniCoordText}>{trip.startLocation.lat.toFixed(4)}, {trip.startLocation.lng.toFixed(4)}</Text>
                            </View>
                            {trip.endLocation && (
                                <>
                                    <Text style={styles.miniCoordArrow}>→</Text>
                                    <View style={styles.miniCoord}>
                                        <Ionicons name="flag" size={10} color={Colors.error} />
                                        <Text style={styles.miniCoordText}>{trip.endLocation.lat.toFixed(4)}, {trip.endLocation.lng.toFixed(4)}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                </Card>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    activeCard: { marginBottom: Spacing.xl },
    activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    gpsPulse: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeInfo: { flex: 1, gap: 2 },
    activeTitle: { ...Typography.bodyBold, color: Colors.textPrimary },
    activeRoute: { ...Typography.caption, color: Colors.textSecondary },
    liveStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    liveStat: { flex: 1, alignItems: 'center', gap: 2 },
    liveValue: { ...Typography.h3, color: Colors.primary },
    liveLabel: { ...Typography.small, color: Colors.textMuted },
    liveDivider: { width: 1, height: 30, backgroundColor: Colors.surfaceBorder },
    gpsCoords: {
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
    },
    coordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    coordText: { ...Typography.caption, color: Colors.textPrimary, fontFamily: 'monospace', flex: 1 },
    coordLabel: { ...Typography.small, color: Colors.textMuted },
    startSection: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
    startIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startTitle: { ...Typography.h3, color: Colors.textPrimary },
    startDesc: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.md },
    summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
    summaryCard: { flex: 1, alignItems: 'center', gap: 2 },
    summaryValue: { ...Typography.h4, color: Colors.textPrimary },
    summaryLabel: { ...Typography.small, color: Colors.textMuted },
    sectionTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    tripCard: { marginBottom: Spacing.md },
    tripHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    tripIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tripInfo: { flex: 1, gap: 2 },
    tripRoute: { ...Typography.bodyBold, color: Colors.textPrimary },
    tripMeta: { ...Typography.small, color: Colors.textMuted },
    tripRight: { alignItems: 'flex-end', gap: 4 },
    tripFare: { ...Typography.bodyBold, color: Colors.success },
    tripGps: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: Spacing.md,
        padding: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.sm,
    },
    miniCoord: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    miniCoordText: { ...Typography.small, color: Colors.textMuted, fontFamily: 'monospace', fontSize: 10 },
    miniCoordArrow: { ...Typography.small, color: Colors.textMuted },
});
