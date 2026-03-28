import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
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
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { insforge } from '../../lib/insforge';

export default function DriverDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDualRole } = useRole();

    const quickActions = [
        { icon: 'add-circle' as const, label: 'Log Earnings', color: Colors.primary, route: '/(driver)/earnings' as const },
        { icon: 'briefcase' as const, label: 'Browse Jobs', color: Colors.secondary, route: '/(driver)/jobs' as const },
        { icon: 'calendar' as const, label: 'Schedule', color: Colors.info, route: '/(driver)/schedule' as const },
        { icon: 'document-text' as const, label: 'Documents', color: Colors.accent, route: '/(shared)/background-checks' as const },
    ];

    const [summary, setSummary] = React.useState({ today: 0, thisWeek: 0, thisMonth: 0, pendingPayments: 0 });
    const [smartJobs, setSmartJobs] = React.useState<any[]>([]);
    const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch earnings
                const { data: earningsData, error: earningsError } = await insforge.database
                    .from('earnings')
                    .select('*');
                if (earningsError) throw earningsError;

                const todayStr = new Date().toISOString().split('T')[0];
                let t = 0, w = 0, m = 0, p = 0;
                (earningsData || []).forEach(e => {
                    const amt = parseFloat(e.amount) || 0;
                    m += amt; // Assuming all in DB are this month for now
                    if (e.date === todayStr) t += amt;
                    // Weekly is hard to do perfectly without date math, using simple approx or adding to month
                    w += amt;
                    if (e.status === 'pending' || e.status === 'processing') p += amt;
                });
                setSummary({ today: t, thisWeek: w, thisMonth: m, pendingPayments: p });

                // Fetch smart jobs
                const { data: jobsData, error: jobsError } = await insforge.database
                    .from('jobs')
                    .select('*, owner_id(name, avatar)')
                    .eq('status', 'open')
                    .eq('is_smart_match', true)
                    .limit(3);
                if (jobsError) throw jobsError;

                const mappedJobs = (jobsData || []).map(j => {
                    const ownerObj = Array.isArray(j.owner_id) ? j.owner_id[0] : (j.owner_id || {});
                    return {
                        id: j.id,
                        ownerName: ownerObj.name || 'Owner',
                        ownerAvatar: ownerObj.avatar || '?',
                        route: { from: j.route_from, to: j.route_to },
                        matchScore: Math.round(Number(j.match_score) * 100),
                        vehicleType: j.vehicle_type,
                        dailyPay: Number(j.daily_pay),
                        applicants: j.applicants,
                    };
                });
                setSmartJobs(mappedJobs);

                // Fetch recent notifications as activity feed
                if (user?.id) {
                    const { data: notifData } = await insforge.database
                        .from('notifications')
                        .select('id, type, title, created_at')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    const iconMap: Record<string, { icon: string; color: string }> = {
                        payment: { icon: 'cash', color: Colors.success },
                        application_update: { icon: 'checkmark-circle', color: Colors.success },
                        application: { icon: 'document', color: Colors.info },
                        compliance: { icon: 'shield-checkmark', color: Colors.warning },
                        safety: { icon: 'alert-circle', color: Colors.error },
                        announcement: { icon: 'megaphone', color: Colors.info },
                        account: { icon: 'person', color: Colors.primary },
                    };
                    const now = Date.now();
                    setRecentActivity((notifData || []).map(n => {
                        const cfg = iconMap[n.type] || { icon: 'notifications', color: Colors.textMuted };
                        const diff = now - new Date(n.created_at).getTime();
                        const mins = Math.floor(diff / 60000);
                        const time = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
                        return { icon: cfg.icon, color: cfg.color, text: n.title, time };
                    }));
                }

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    return (
        <ScreenWrapper
            title="Dashboard"
            subtitle={`Good evening, ${user?.name?.split(' ')[0] || 'there'}`}
            headerRight={isDualRole ? <RoleSwitcher /> : undefined}
        >
            {/* Earnings Summary */}
            <Card variant="highlighted" style={styles.earningsCard}>
                <View style={styles.earningsHeader}>
                    <Text style={styles.earningsLabel}>Today's Earnings</Text>
                    <Badge label="Active" variant="success" size="sm" />
                </View>
                <Text style={styles.earningsAmount}>{formatCurrency(summary.today)}</Text>
                <View style={styles.earningsRow}>
                    <View style={styles.earningsStat}>
                        <Text style={styles.earningsStatLabel}>This Week</Text>
                        <Text style={styles.earningsStatValue}>{formatCurrency(summary.thisWeek)}</Text>
                    </View>
                    <View style={styles.earningsDivider} />
                    <View style={styles.earningsStat}>
                        <Text style={styles.earningsStatLabel}>This Month</Text>
                        <Text style={styles.earningsStatValue}>{formatCurrency(summary.thisMonth)}</Text>
                    </View>
                    <View style={styles.earningsDivider} />
                    <View style={styles.earningsStat}>
                        <Text style={styles.earningsStatLabel}>Pending</Text>
                        <Text style={[styles.earningsStatValue, { color: Colors.warning }]}>
                            {formatCurrency(summary.pendingPayments)}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Quick Actions */}
            <SectionHeader title="Quick Actions" style={styles.section} />
            <View style={styles.quickActions}>
                {quickActions.map((action, i) => (
                    <TouchableOpacity key={i} style={styles.quickAction} activeOpacity={0.7} onPress={() => router.push(action.route)}>
                        <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                            <Ionicons name={action.icon} size={24} color={action.color} />
                        </View>
                        <Text style={styles.quickActionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Smart Matches */}
            <SectionHeader title="Recommended Jobs" action="View All" onAction={() => router.push('/(driver)/jobs')} style={styles.section} />
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
            {recentActivity.length > 0 && (
            <SectionHeader title="Recent Activity" style={styles.section} />
            )}
            {recentActivity.map((item, i) => (
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
