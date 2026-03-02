import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { getTripStats, Trip } from '../../data/trips';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../context/AuthContext';

export default function TripReportsScreen() {
    const { user } = useAuth();
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        async function fetchTrips() {
            try {
                // In a real app, we'd filter trips to only vehicles owned by this user
                const { data, error } = await insforge.database
                    .from('trips')
                    .select('*, driver:driver_id(name)')
                    .order('start_time', { ascending: false });

                if (error) throw error;

                const mapped: Trip[] = (data || []).map(t => {
                    const driverObj = Array.isArray(t.driver) ? t.driver[0] : t.driver;
                    return {
                        id: t.id,
                        driverId: t.driver_id,
                        driverName: driverObj?.name || 'Unknown',
                        vehicleId: t.vehicle_id || '',
                        vehiclePlate: t.vehicle_plate,
                        route: { from: t.route_from, to: t.route_to },
                        startLocation: { lat: t.start_lat, lng: t.start_lng, accuracy: 0, timestamp: t.start_time },
                        endLocation: t.end_time ? { lat: t.end_lat, lng: t.end_lng, accuracy: 0, timestamp: t.end_time } : null,
                        distanceKm: Number(t.distance_km),
                        startTime: t.start_time,
                        endTime: t.end_time,
                        durationMinutes: t.duration_minutes,
                        fare: Number(t.fare),
                        status: t.status as 'active' | 'completed' | 'disputed',
                        gpsVerified: t.gps_verified || false,
                        waypoints: t.waypoints || [],
                        fuelEstimate: Number(t.fuel_estimate),
                        notes: t.notes,
                    };
                });

                setTrips(mapped);
            } catch (err) {
                console.error("Failed to fetch trips for reports:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTrips();
    }, [user?.id]);

    const allStats = getTripStats(trips);

    // Group trips by vehicle
    const vehicleGroups = trips.reduce<Record<string, Trip[]>>((acc, trip) => {
        if (!acc[trip.vehiclePlate]) acc[trip.vehiclePlate] = [];
        acc[trip.vehiclePlate].push(trip);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <ScreenWrapper title="Trip Reports" subtitle="GPS-verified mileage & route data">
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.body, color: Colors.textMuted }}>Loading reports...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper title="Trip Reports" subtitle="GPS-verified mileage & route data">
            {/* Period Selector */}
            <View style={styles.periodRow}>
                {(['today', 'week', 'month'] as const).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodTab, period === p && styles.periodTabActive]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* KPI Cards */}
            <View style={styles.kpiGrid}>
                <Card style={styles.kpiCard}>
                    <Ionicons name="speedometer" size={20} color={Colors.primary} />
                    <Text style={styles.kpiValue}>{allStats.totalKm} km</Text>
                    <Text style={styles.kpiLabel}>Total Distance</Text>
                </Card>
                <Card style={styles.kpiCard}>
                    <Ionicons name="car" size={20} color={Colors.info} />
                    <Text style={styles.kpiValue}>{allStats.totalTrips}</Text>
                    <Text style={styles.kpiLabel}>Completed Trips</Text>
                </Card>
                <Card style={styles.kpiCard}>
                    <Ionicons name="cash" size={20} color={Colors.success} />
                    <Text style={styles.kpiValue}>{formatCurrency(allStats.totalFare)}</Text>
                    <Text style={styles.kpiLabel}>Total Fares</Text>
                </Card>
                <Card style={styles.kpiCard}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
                    <Text style={styles.kpiValue}>{allStats.gpsVerifiedPct}%</Text>
                    <Text style={styles.kpiLabel}>GPS Verified</Text>
                </Card>
            </View>

            {/* Per-Vehicle Breakdown */}
            <SectionHeader title="Vehicle Breakdown" style={styles.section} />
            {Object.entries(vehicleGroups).map(([plate, trips]) => {
                const vStats = getTripStats(trips);
                const completed = trips.filter((t) => t.status === 'completed');
                return (
                    <Card key={plate} style={styles.vehicleCard}>
                        <View style={styles.vehicleHeader}>
                            <View style={styles.vehicleIcon}>
                                <Ionicons name="car" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehiclePlate}>{plate}</Text>
                                <Text style={styles.vehicleMeta}>{vStats.totalTrips} trips • {vStats.totalKm} km</Text>
                            </View>
                            <Text style={styles.vehicleRevenue}>{formatCurrency(vStats.totalFare)}</Text>
                        </View>

                        <View style={styles.vehicleMetrics}>
                            <View style={styles.metric}>
                                <Text style={styles.metricValue}>{vStats.avgDuration} min</Text>
                                <Text style={styles.metricLabel}>Avg Trip</Text>
                            </View>
                            <View style={styles.metricDivider} />
                            <View style={styles.metric}>
                                <Text style={styles.metricValue}>{formatCurrency(vStats.totalFuel)}</Text>
                                <Text style={styles.metricLabel}>Est. Fuel</Text>
                            </View>
                            <View style={styles.metricDivider} />
                            <View style={styles.metric}>
                                <Text style={styles.metricValue}>{vStats.gpsVerifiedPct}%</Text>
                                <Text style={styles.metricLabel}>Verified</Text>
                            </View>
                        </View>
                    </Card>
                );
            })}

            {/* Trip Log */}
            <SectionHeader title="Trip Log" style={styles.section} />
            {trips.filter((t) => t.status === 'completed').map((trip) => (
                <View key={trip.id} style={styles.logRow}>
                    <View style={styles.logLeft}>
                        <Text style={styles.logRoute}>{trip.route.from} → {trip.route.to}</Text>
                        <Text style={styles.logMeta}>{trip.driverName} • {trip.vehiclePlate} • {trip.distanceKm} km</Text>
                    </View>
                    <View style={styles.logRight}>
                        <Text style={styles.logFare}>{formatCurrency(trip.fare)}</Text>
                        <Badge
                            label={trip.gpsVerified ? '✓ GPS' : '⚠ Unverified'}
                            variant={trip.gpsVerified ? 'success' : 'warning'}
                            size="sm"
                        />
                    </View>
                </View>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    periodRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    periodTab: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
    },
    periodTabActive: { backgroundColor: Colors.primary },
    periodText: { ...Typography.captionBold, color: Colors.textMuted },
    periodTextActive: { color: Colors.textInverse },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    kpiCard: { width: '48%', flexGrow: 1, gap: Spacing.xs },
    kpiValue: { ...Typography.h3, color: Colors.textPrimary },
    kpiLabel: { ...Typography.small, color: Colors.textMuted },
    section: { marginTop: Spacing.xl },
    vehicleCard: { marginBottom: Spacing.md },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    vehicleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vehicleInfo: { flex: 1, gap: 2 },
    vehiclePlate: { ...Typography.bodyBold, color: Colors.textPrimary },
    vehicleMeta: { ...Typography.small, color: Colors.textMuted },
    vehicleRevenue: { ...Typography.h4, color: Colors.success },
    vehicleMetrics: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    metric: { flex: 1, alignItems: 'center', gap: 2 },
    metricValue: { ...Typography.bodyBold, color: Colors.textPrimary },
    metricLabel: { ...Typography.small, color: Colors.textMuted },
    metricDivider: { width: 1, height: 24, backgroundColor: Colors.surfaceBorder },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    logLeft: { flex: 1, gap: 2 },
    logRoute: { ...Typography.bodyBold, color: Colors.textPrimary },
    logMeta: { ...Typography.small, color: Colors.textMuted },
    logRight: { alignItems: 'flex-end', gap: 4 },
    logFare: { ...Typography.bodyBold, color: Colors.success },
});
