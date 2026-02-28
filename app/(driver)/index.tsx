import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { RoleSwitcher } from '../../components/layout/RoleSwitcher';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import { earningsSummary } from '../../data/earnings';
import { mockJobs } from '../../data/jobs';

export default function DriverDashboard() {
    const quickActions = [
        { icon: 'add-circle' as const, label: 'Log Earnings', color: Colors.primary },
        { icon: 'briefcase' as const, label: 'Browse Jobs', color: Colors.secondary },
        { icon: 'calendar' as const, label: 'Schedule', color: Colors.info },
        { icon: 'document-text' as const, label: 'Documents', color: Colors.accent },
    ];

    const smartJobs = mockJobs.filter((j) => j.isSmartMatch).slice(0, 3);

    return (
        <ScreenWrapper
            title="Dashboard"
            subtitle="Good evening, Alex"
            headerRight={<RoleSwitcher />}
        >
            {/* Earnings Summary */}
            <Card variant="highlighted" style={styles.earningsCard}>
                <View style={styles.earningsHeader}>
                    <Text style={styles.earningsLabel}>Today's Earnings</Text>
                    <Badge label="Active" variant="success" size="sm" />
                </View>
                <Text style={styles.earningsAmount}>{formatCurrency(earningsSummary.today)}</Text>
                <View style={styles.earningsRow}>
                    <View style={styles.earningsStat}>
                        <Text style={styles.earningsStatLabel}>This Week</Text>
                        <Text style={styles.earningsStatValue}>{formatCurrency(earningsSummary.thisWeek)}</Text>
                    </View>
                    <View style={styles.earningsDivider} />
                    <View style={styles.earningsStat}>
                        <Text style={styles.earningsStatLabel}>This Month</Text>
                        <Text style={styles.earningsStatValue}>{formatCurrency(earningsSummary.thisMonth)}</Text>
                    </View>
                    <View style={styles.earningsDivider} />
                    <View style={styles.earningsStat}>
                        <Text style={styles.earningsStatLabel}>Pending</Text>
                        <Text style={[styles.earningsStatValue, { color: Colors.warning }]}>
                            {formatCurrency(earningsSummary.pendingPayments)}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Quick Actions */}
            <SectionHeader title="Quick Actions" style={styles.section} />
            <View style={styles.quickActions}>
                {quickActions.map((action, i) => (
                    <TouchableOpacity key={i} style={styles.quickAction} activeOpacity={0.7}>
                        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                            <Ionicons name={action.icon} size={24} color={action.color} />
                        </View>
                        <Text style={styles.quickActionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Smart Matches */}
            <SectionHeader title="Recommended Jobs" action="View All" style={styles.section} />
            {smartJobs.map((job) => (
                <Card key={job.id} style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                        <Avatar initials={job.ownerAvatar} size={40} />
                        <View style={styles.jobInfo}>
                            <Text style={styles.jobOwner}>{job.ownerName}</Text>
                            <Text style={styles.jobRoute}>
                                {job.route.from} → {job.route.to}
                            </Text>
                        </View>
                        <Badge label={`${job.matchScore}% Match`} variant="success" size="sm" />
                    </View>
                    <View style={styles.jobMeta}>
                        <View style={styles.jobMetaItem}>
                            <Ionicons name="car" size={14} color={Colors.textMuted} />
                            <Text style={styles.jobMetaText}>{job.vehicleType}</Text>
                        </View>
                        <View style={styles.jobMetaItem}>
                            <Ionicons name="cash" size={14} color={Colors.textMuted} />
                            <Text style={styles.jobMetaText}>{formatCurrency(job.dailyPay)}/day</Text>
                        </View>
                        <View style={styles.jobMetaItem}>
                            <Ionicons name="people" size={14} color={Colors.textMuted} />
                            <Text style={styles.jobMetaText}>{job.applicants} applicants</Text>
                        </View>
                    </View>
                </Card>
            ))}

            {/* Recent Activity */}
            <SectionHeader title="Recent Activity" style={styles.section} />
            {[
                { icon: 'checkmark-circle' as const, text: 'Earnings logged — J$8,500', time: '2h ago', color: Colors.success },
                { icon: 'document' as const, text: 'Application submitted — Kingston → Montego Bay', time: '1d ago', color: Colors.info },
                { icon: 'star' as const, text: 'New review received — 5 stars', time: '2d ago', color: Colors.secondary },
            ].map((item, i) => (
                <View key={i} style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: `${item.color}20` }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View style={styles.activityText}>
                        <Text style={styles.activityLabel}>{item.text}</Text>
                        <Text style={styles.activityTime}>{item.time}</Text>
                    </View>
                </View>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    earningsCard: {
        marginBottom: Spacing.xl,
    },
    earningsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    earningsLabel: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    earningsAmount: {
        ...Typography.numberLarge,
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
    },
    earningsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    earningsStat: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    earningsStatLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    earningsStatValue: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    earningsDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.surfaceBorder,
    },
    section: {
        marginTop: Spacing.xl,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.md,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        ...Typography.small,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    jobCard: {
        marginBottom: Spacing.md,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    jobInfo: {
        flex: 1,
        gap: 2,
    },
    jobOwner: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    jobRoute: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    jobMeta: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    jobMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    jobMetaText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityText: {
        flex: 1,
        gap: 2,
    },
    activityLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    activityTime: {
        ...Typography.small,
        color: Colors.textMuted,
    },
});
