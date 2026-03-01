import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatShortDate } from '../../utils/formatting';
import { weeklyEarningsData } from '../../data/earnings';
import { useRouter } from 'expo-router';
import { insforge } from '../../lib/insforge';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 80;
const chartHeight = 180;

function SimpleBarChart() {
    const data = weeklyEarningsData;
    const maxVal = Math.max(...data.values);
    const barWidth = (chartWidth - (data.labels.length - 1) * 8) / data.labels.length;

    return (
        <View style={chartStyles.container}>
            <Svg width={chartWidth} height={chartHeight + 30}>
                {data.values.map((val, i) => {
                    const barHeight = (val / maxVal) * chartHeight;
                    const x = i * (barWidth + 8);
                    const y = chartHeight - barHeight;
                    return (
                        <React.Fragment key={i}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx={6}
                                fill={i === data.values.length - 1 ? Colors.secondary : Colors.primary}
                                opacity={i === data.values.length - 1 ? 1 : 0.7}
                            />
                            <SvgText
                                x={x + barWidth / 2}
                                y={chartHeight + 18}
                                fontSize={10}
                                fill={Colors.textMuted}
                                textAnchor="middle"
                            >
                                {data.labels[i]}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
}

const chartStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
});

export default function EarningsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
    const [earnings, setEarnings] = useState<any[]>([]);
    const [summary, setSummary] = useState({ today: 0, thisMonth: 0, pendingPayments: 0 });
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        async function fetchEarnings() {
            try {
                const { data, error } = await insforge.database
                    .from('earnings')
                    .select('*')
                    .order('date', { ascending: false });

                if (error) throw error;
                const earningsData = data || [];

                const formatted = earningsData.map(e => ({
                    id: e.id,
                    date: e.date,
                    amount: parseFloat(e.amount) || 0,
                    route: { from: e.route_from, to: e.route_to },
                    vehiclePlate: e.vehicle_plate,
                    status: e.status,
                    trips: e.trips,
                }));

                const todayStr = new Date().toISOString().split('T')[0];
                let todayTotal = 0;
                let monthTotal = 0;
                let pendingTotal = 0;

                formatted.forEach(e => {
                    monthTotal += e.amount;
                    if (e.date === todayStr) todayTotal += e.amount;
                    if (e.status === 'pending' || e.status === 'processing') pendingTotal += e.amount;
                });

                setSummary({ today: todayTotal, thisMonth: monthTotal, pendingPayments: pendingTotal });
                setEarnings(formatted);
            } catch (err) {
                console.error("Failed to load earnings:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchEarnings();
    }, []);

    const tabs = [
        { id: 'week' as const, label: 'This Week' },
        { id: 'month' as const, label: 'This Month' },
    ];

    const statusConfig: Record<string, { variant: 'success' | 'warning' | 'info', label: string }> = {
        paid: { variant: 'success', label: 'Paid' },
        pending: { variant: 'warning', label: 'Pending' },
        processing: { variant: 'info', label: 'Processing' },
    };

    return (
        <ScreenWrapper
            title="Earnings"
            subtitle={isLoading ? "Loading..." : `Total: ${formatCurrency(summary.thisMonth)}`}
            headerRight={
                <TouchableOpacity style={{ padding: Spacing.sm }} onPress={() => router.push('/(driver)/log-earnings')}>
                    <Ionicons name="add-circle" size={26} color={Colors.primary} />
                </TouchableOpacity>
            }
        >
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
                <Card variant="highlighted" style={styles.summaryCard}>
                    <View style={styles.summaryIcon}>
                        <Ionicons name="today" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.summaryLabel}>Today</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(summary.today)}</Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <View style={[styles.summaryIcon, { backgroundColor: Colors.secondaryMuted }]}>
                        <Ionicons name="time" size={20} color={Colors.secondary} />
                    </View>
                    <Text style={styles.summaryLabel}>Pending</Text>
                    <Text style={[styles.summaryValue, { color: Colors.warning }]}>
                        {formatCurrency(summary.pendingPayments)}
                    </Text>
                </Card>
            </View>

            {/* Chart */}
            <SectionHeader title="Earnings Overview" style={styles.section} />
            <Card>
                <View style={styles.tabsRow}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <SimpleBarChart />
            </Card>

            {/* Earnings History */}
            <SectionHeader title="Earnings History" action="See All" style={styles.section} />
            {isLoading ? (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.body, color: Colors.textMuted }}>Loading earnings...</Text>
                </View>
            ) : earnings.map((entry) => (
                <Card key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryRow}>
                        <View style={styles.entryLeft}>
                            <Text style={styles.entryDate}>{formatShortDate(entry.date)}</Text>
                            <Text style={styles.entryRoute}>
                                {entry.route.from} → {entry.route.to}
                            </Text>
                            <View style={styles.entryMeta}>
                                <Ionicons name="car" size={12} color={Colors.textMuted} />
                                <Text style={styles.entryMetaText}>{entry.vehiclePlate}</Text>
                                <Text style={styles.entryMetaDot}>•</Text>
                                <Text style={styles.entryMetaText}>{entry.trips} trips</Text>
                            </View>
                        </View>
                        <View style={styles.entryRight}>
                            <Text style={styles.entryAmount}>{formatCurrency(entry.amount)}</Text>
                            <Badge
                                label={statusConfig[entry.status]?.label || entry.status}
                                variant={statusConfig[entry.status]?.variant || 'info'}
                                size="sm"
                            />
                        </View>
                    </View>
                </Card>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    summaryRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    summaryValue: {
        ...Typography.number,
        color: Colors.textPrimary,
    },
    section: {
        marginTop: Spacing.xl,
    },
    tabsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    tab: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
    },
    tabActive: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    tabTextActive: {
        color: '#fff',
    },
    entryCard: {
        marginBottom: Spacing.sm,
    },
    entryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    entryLeft: {
        flex: 1,
        gap: 3,
    },
    entryDate: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    entryRoute: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    entryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    entryMetaText: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    entryMetaDot: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    entryRight: {
        alignItems: 'flex-end',
        gap: Spacing.xs,
    },
    entryAmount: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
});
