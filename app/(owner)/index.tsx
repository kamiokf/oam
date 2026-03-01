import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { RoleSwitcher } from '../../components/layout/RoleSwitcher';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { useData } from '../../context/DataContext';

export default function FleetDashboard() {
    const router = useRouter();
    const { vehicles, drivers } = useData();
    const activeVehicles = vehicles.filter((v) => v.status === 'active');
    const totalRevenue = activeVehicles.reduce((sum, v) => sum + v.dailyRevenue, 0);
    const activeDriverCount = drivers.filter((d) => d.status === 'active').length;

    const stats = [
        { icon: 'car' as const, label: 'Total Vehicles', value: `${vehicles.length}`, color: Colors.primary },
        { icon: 'checkmark-circle' as const, label: 'Active', value: `${activeVehicles.length}`, color: Colors.success },
        { icon: 'people' as const, label: 'Drivers', value: `${activeDriverCount}`, color: Colors.info },
        { icon: 'cash' as const, label: 'Daily Revenue', value: formatCurrency(totalRevenue), color: Colors.secondary },
    ];

    const expiringDocs = vehicles.filter((v) => {
        const fitness = new Date(v.fitnessExpiry);
        const insurance = new Date(v.insuranceExpiry);
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        return fitness <= thirtyDays || insurance <= thirtyDays;
    });

    return (
        <ScreenWrapper title="Fleet Dashboard" subtitle="Good evening, Alex" headerRight={<RoleSwitcher />}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <Card key={i} style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                            <Ionicons name={stat.icon} size={20} color={stat.color} />
                        </View>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                    </Card>
                ))}
            </View>

            {/* Compliance Alerts */}
            {expiringDocs.length > 0 && (
                <>
                    <SectionHeader title="Compliance Alerts" style={styles.section} />
                    <Card variant="highlighted" style={[styles.alertCard, { borderColor: Colors.warning, backgroundColor: Colors.warningMuted }] as any}>
                        <View style={styles.alertRow}>
                            <Ionicons name="warning" size={24} color={Colors.warning} />
                            <View style={styles.alertText}>
                                <Text style={styles.alertTitle}>{expiringDocs.length} Document(s) Expiring Soon</Text>
                                <Text style={styles.alertDesc}>Review and renew vehicle fitness and insurance documents</Text>
                            </View>
                        </View>
                    </Card>
                </>
            )}

            {/* Active Vehicles */}
            <SectionHeader title="Active Vehicles" action="View All" style={styles.section} />
            {activeVehicles.map((vehicle) => (
                <Card key={vehicle.id} style={styles.vehicleCard}>
                    <View style={styles.vehicleHeader}>
                        <View style={styles.vehicleIconWrap}>
                            <Ionicons name="car" size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.vehicleInfo}>
                            <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model} ({vehicle.year})</Text>
                            <Text style={styles.vehiclePlate}>{vehicle.plate} • {vehicle.type}</Text>
                        </View>
                        <Badge label="Active" variant="success" size="sm" />
                    </View>
                    <View style={styles.vehicleDetails}>
                        <View style={styles.vehicleDetailItem}>
                            <Ionicons name="person" size={14} color={Colors.textMuted} />
                            <Text style={styles.vehicleDetailText}>{vehicle.assignedDriverName || 'Unassigned'}</Text>
                        </View>
                        {vehicle.route && (
                            <View style={styles.vehicleDetailItem}>
                                <Ionicons name="navigate" size={14} color={Colors.textMuted} />
                                <Text style={styles.vehicleDetailText}>{vehicle.route.from} → {vehicle.route.to}</Text>
                            </View>
                        )}
                        <View style={styles.vehicleDetailItem}>
                            <Ionicons name="cash" size={14} color={Colors.textMuted} />
                            <Text style={[styles.vehicleDetailText, { color: Colors.success }]}>
                                {formatCurrency(vehicle.dailyRevenue)}/day
                            </Text>
                        </View>
                    </View>
                </Card>
            ))}

            {/* Quick Actions */}
            <SectionHeader title="Quick Actions" style={styles.section} />
            <View style={styles.quickActionsRow}>
                {[
                    { icon: 'add-circle' as const, label: 'Add Vehicle', color: Colors.primary, route: '/(owner)/add-vehicle' as const },
                    { icon: 'person-add' as const, label: 'Recruit Driver', color: Colors.secondary, route: '/(owner)/add-driver' as const },
                    { icon: 'document' as const, label: 'Post Job', color: Colors.info, route: '/(owner)/post-job' as const },
                    { icon: 'analytics' as const, label: 'Reports', color: Colors.accent, route: '/(owner)/analytics' as const },
                ].map((action, i) => (
                    <TouchableOpacity key={i} style={styles.quickAction} activeOpacity={0.7} onPress={() => router.push(action.route)}>
                        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                            <Ionicons name={action.icon} size={22} color={action.color} />
                        </View>
                        <Text style={styles.quickActionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    statCard: {
        width: '48%',
        flexGrow: 1,
        gap: Spacing.sm,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    statValue: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    section: {
        marginTop: Spacing.xl,
    },
    alertCard: {
        borderWidth: 1.5,
    },
    alertRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    alertText: {
        flex: 1,
        gap: 2,
    },
    alertTitle: {
        ...Typography.bodyBold,
        color: Colors.warning,
    },
    alertDesc: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    vehicleCard: {
        marginBottom: Spacing.md,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    vehicleIconWrap: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vehicleInfo: {
        flex: 1,
        gap: 2,
    },
    vehicleName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    vehiclePlate: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    vehicleDetails: {
        gap: Spacing.sm,
    },
    vehicleDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    vehicleDetailText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickAction: {
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        ...Typography.small,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
