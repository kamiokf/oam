import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, getDaysUntil, getExpiryStatus } from '../../utils/formatting';
import { useData } from '../../context/DataContext';
import { useRouter } from 'expo-router';

export default function VehiclesScreen() {
    const { vehicles } = useData();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All', count: vehicles.length },
        { id: 'active', label: 'Active', count: vehicles.filter((v) => v.status === 'active').length },
        { id: 'maintenance', label: 'Maintenance', count: vehicles.filter((v) => v.status === 'maintenance').length },
        { id: 'inactive', label: 'Inactive', count: vehicles.filter((v) => v.status === 'inactive').length },
    ];

    const statusConfig = {
        active: { variant: 'success' as const, label: 'Active' },
        maintenance: { variant: 'warning' as const, label: 'Maintenance' },
        inactive: { variant: 'neutral' as const, label: 'Inactive' },
    };

    const filteredVehicles = activeFilter === 'all'
        ? vehicles
        : vehicles.filter((v) => v.status === activeFilter);

    return (
        <ScreenWrapper
            title="Vehicles"
            subtitle={`${vehicles.length} vehicles in fleet`}
            headerRight={
                <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(owner)/add-vehicle')}>
                    <Ionicons name="add" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            }
        >
            {/* Filter Tabs */}
            <View style={styles.filtersRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.id}
                        style={[styles.filterTab, activeFilter === f.id && styles.filterTabActive]}
                        onPress={() => setActiveFilter(f.id)}
                    >
                        <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                            {f.label}
                        </Text>
                        <View style={[styles.filterCount, activeFilter === f.id && styles.filterCountActive]}>
                            <Text style={[styles.filterCountText, activeFilter === f.id && styles.filterCountTextActive]}>
                                {f.count}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Vehicle Cards */}
            {filteredVehicles.map((vehicle) => {
                const fitnessStatus = getExpiryStatus(vehicle.fitnessExpiry);
                const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry);
                const fitnessDays = getDaysUntil(vehicle.fitnessExpiry);
                const insuranceDays = getDaysUntil(vehicle.insuranceExpiry);

                return (
                    <Card key={vehicle.id} style={styles.vehicleCard}>
                        {/* Header */}
                        <View style={styles.vehicleHeader}>
                            <View style={[styles.vehicleIcon, { backgroundColor: vehicle.status === 'active' ? Colors.primaryMuted : Colors.surfaceLight }]}>
                                <Ionicons name="car" size={28} color={vehicle.status === 'active' ? Colors.primary : Colors.textMuted} />
                            </View>
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
                                <Text style={styles.vehicleMeta}>{vehicle.year} • {vehicle.plate} • {vehicle.type}</Text>
                            </View>
                            <Badge label={statusConfig[vehicle.status].label} variant={statusConfig[vehicle.status].variant} />
                        </View>

                        {/* Details */}
                        {vehicle.status === 'active' && (
                            <View style={styles.activeDetails}>
                                <View style={styles.detailRow}>
                                    <Ionicons name="person" size={16} color={Colors.textMuted} />
                                    <Text style={styles.detailLabel}>Driver</Text>
                                    <Text style={styles.detailValue}>{vehicle.assignedDriverName}</Text>
                                </View>
                                {vehicle.route && (
                                    <View style={styles.detailRow}>
                                        <Ionicons name="navigate" size={16} color={Colors.textMuted} />
                                        <Text style={styles.detailLabel}>Route</Text>
                                        <Text style={styles.detailValue}>{vehicle.route.from} → {vehicle.route.to}</Text>
                                    </View>
                                )}
                                <View style={styles.detailRow}>
                                    <Ionicons name="cash" size={16} color={Colors.textMuted} />
                                    <Text style={styles.detailLabel}>Revenue</Text>
                                    <Text style={[styles.detailValue, { color: Colors.success }]}>{formatCurrency(vehicle.dailyRevenue)}/day</Text>
                                </View>
                            </View>
                        )}

                        {/* Documents */}
                        <View style={styles.docsRow}>
                            <View style={[styles.docItem, fitnessStatus !== 'ok' && styles.docItemWarning]}>
                                <Ionicons
                                    name="document-text"
                                    size={14}
                                    color={fitnessStatus === 'ok' ? Colors.success : fitnessStatus === 'warning' ? Colors.warning : Colors.error}
                                />
                                <Text style={styles.docText}>
                                    Fitness: {fitnessDays > 0 ? `${fitnessDays}d` : 'Expired'}
                                </Text>
                            </View>
                            <View style={[styles.docItem, insuranceStatus !== 'ok' && styles.docItemWarning]}>
                                <Ionicons
                                    name="shield-checkmark"
                                    size={14}
                                    color={insuranceStatus === 'ok' ? Colors.success : insuranceStatus === 'warning' ? Colors.warning : Colors.error}
                                />
                                <Text style={styles.docText}>
                                    Insurance: {insuranceDays > 0 ? `${insuranceDays}d` : 'Expired'}
                                </Text>
                            </View>
                        </View>
                    </Card>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtersRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
    },
    filterTabActive: {
        backgroundColor: Colors.primaryMuted,
    },
    filterText: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    filterTextActive: {
        color: Colors.primaryLight,
    },
    filterCount: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBorder,
    },
    filterCountActive: {
        backgroundColor: Colors.primary,
    },
    filterCountText: {
        ...Typography.small,
        color: Colors.textMuted,
        fontWeight: '700',
    },
    filterCountTextActive: {
        color: '#fff',
    },
    vehicleCard: {
        marginBottom: Spacing.lg,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    vehicleIcon: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vehicleInfo: {
        flex: 1,
        gap: 2,
    },
    vehicleName: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    vehicleMeta: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    activeDetails: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    detailLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        width: 60,
    },
    detailValue: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
        flex: 1,
    },
    docsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    docItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.successMuted,
    },
    docItemWarning: {
        backgroundColor: Colors.warningMuted,
    },
    docText: {
        ...Typography.small,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
});
