import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, StarRating } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { mockDrivers } from '../../data/drivers';

export default function DriversScreen() {
    const activeDrivers = mockDrivers.filter((d) => d.status === 'active');
    const pendingDrivers = mockDrivers.filter((d) => d.status === 'pending' || d.status === 'inactive');

    const statusConfig = {
        active: { variant: 'success' as const, label: 'Active' },
        inactive: { variant: 'neutral' as const, label: 'Inactive' },
        pending: { variant: 'warning' as const, label: 'Pending' },
    };

    return (
        <ScreenWrapper
            title="Drivers"
            subtitle={`${activeDrivers.length} active drivers`}
            headerRight={
                <TouchableOpacity style={styles.addBtn}>
                    <Ionicons name="person-add" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
            }
        >
            {/* Summary */}
            <View style={styles.summaryRow}>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{activeDrivers.length}</Text>
                    <Text style={styles.summaryLabel}>Active</Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{formatCurrency(activeDrivers.reduce((s, d) => s + d.weeklyEarnings, 0))}</Text>
                    <Text style={styles.summaryLabel}>Weekly Output</Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{(activeDrivers.reduce((s, d) => s + d.rating, 0) / activeDrivers.length).toFixed(1)}</Text>
                    <Text style={styles.summaryLabel}>Avg Rating</Text>
                </Card>
            </View>

            {/* Active Drivers */}
            <SectionHeader title="Active Drivers" style={styles.section} />
            {activeDrivers.map((driver) => (
                <Card key={driver.id} style={styles.driverCard}>
                    <View style={styles.driverHeader}>
                        <Avatar initials={driver.avatar} size={48} />
                        <View style={styles.driverInfo}>
                            <Text style={styles.driverName}>{driver.name}</Text>
                            <StarRating rating={driver.rating} size={12} />
                        </View>
                        <Badge label={statusConfig[driver.status].label} variant={statusConfig[driver.status].variant} />
                    </View>

                    <View style={styles.driverDetails}>
                        {driver.assignedVehicle && (
                            <View style={styles.detailItem}>
                                <Ionicons name="car" size={14} color={Colors.textMuted} />
                                <Text style={styles.detailText}>{driver.assignedVehicle}</Text>
                            </View>
                        )}
                        {driver.assignedRoute && (
                            <View style={styles.detailItem}>
                                <Ionicons name="navigate" size={14} color={Colors.textMuted} />
                                <Text style={styles.detailText}>{driver.assignedRoute.from} → {driver.assignedRoute.to}</Text>
                            </View>
                        )}
                        <View style={styles.detailItem}>
                            <Ionicons name="wallet" size={14} color={Colors.textMuted} />
                            <Text style={[styles.detailText, { color: Colors.success }]}>{formatCurrency(driver.weeklyEarnings)}/wk</Text>
                        </View>
                    </View>

                    <View style={styles.driverStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{driver.totalTrips.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Trips</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{driver.experience}yr</Text>
                            <Text style={styles.statLabel}>Experience</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{driver.licenseType}</Text>
                            <Text style={styles.statLabel}>License</Text>
                        </View>
                    </View>

                    {/* Document Status */}
                    <View style={styles.docsRow}>
                        {driver.documents.map((doc, i) => (
                            <View key={i} style={styles.docChip}>
                                <Ionicons
                                    name={doc.status === 'verified' ? 'checkmark-circle' : doc.status === 'pending' ? 'time' : 'alert-circle'}
                                    size={12}
                                    color={doc.status === 'verified' ? Colors.success : doc.status === 'pending' ? Colors.warning : Colors.error}
                                />
                                <Text style={styles.docChipText}>{doc.name}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
            ))}

            {/* Inactive/Pending */}
            {pendingDrivers.length > 0 && (
                <>
                    <SectionHeader title="Inactive / Pending" style={styles.section} />
                    {pendingDrivers.map((driver) => (
                        <Card key={driver.id} variant="outlined" style={styles.driverCard}>
                            <View style={styles.driverHeader}>
                                <Avatar initials={driver.avatar} size={44} bgColor={Colors.surfaceLight} color={Colors.textMuted} />
                                <View style={styles.driverInfo}>
                                    <Text style={styles.driverName}>{driver.name}</Text>
                                    <Text style={styles.driverSub}>{driver.licenseType} License • {driver.experience} years</Text>
                                </View>
                                <Badge label={statusConfig[driver.status].label} variant={statusConfig[driver.status].variant} />
                            </View>
                        </Card>
                    ))}
                </>
            )}
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
    summaryRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    summaryValue: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
        fontSize: 16,
    },
    summaryLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    section: {
        marginTop: Spacing.xl,
    },
    driverCard: {
        marginBottom: Spacing.lg,
    },
    driverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    driverInfo: {
        flex: 1,
        gap: 2,
    },
    driverName: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    driverSub: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    driverDetails: {
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    detailText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    driverStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    statValue: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    statLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.surfaceBorder,
    },
    docsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    docChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 3,
        paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.sm,
    },
    docChipText: {
        ...Typography.small,
        color: Colors.textSecondary,
    },
});
