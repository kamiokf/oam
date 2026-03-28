import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatting';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useData } from '../../context/DataContext';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 80;

function RevenueChart({ labels, values }: { labels: string[]; values: number[] }) {
    const maxVal = Math.max(...values, 1);
    const barWidth = (chartWidth - (labels.length - 1) * 8) / labels.length;

    return (
        <Svg width={chartWidth} height={200}>
            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
                <Line
                    key={i}
                    x1={0}
                    y1={i * 45 + 10}
                    x2={chartWidth}
                    y2={i * 45 + 10}
                    stroke={Colors.surfaceBorder}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                />
            ))}
            {values.map((val, i) => {
                const barHeight = (val / maxVal) * 150;
                const x = i * (barWidth + 8);
                const y = 160 - barHeight;
                const isHighest = val === Math.max(...values);
                return (
                    <React.Fragment key={i}>
                        <Rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={6}
                            fill={isHighest ? Colors.secondary : Colors.primary}
                            opacity={isHighest ? 1 : 0.7}
                        />
                        <SvgText x={x + barWidth / 2} y={185} fontSize={10} fill={Colors.textMuted} textAnchor="middle">
                            {labels[i]}
                        </SvgText>
                    </React.Fragment>
                );
            })}
        </Svg>
    );
}

export default function AnalyticsScreen() {
    const [period, setPeriod] = useState<'week' | 'month'>('week');
    const { vehicles, earnings } = useData();

    const revenueData = useMemo(() => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const labels: string[] = [];
        const values: number[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            labels.push(dayNames[d.getDay()]);
            const dayTotal = earnings
                .filter(e => e.date === dateStr)
                .reduce((sum, e) => sum + Number(e.amount), 0);
            values.push(dayTotal);
        }
        return { labels, values };
    }, [earnings]);

    const vehiclePerformance = useMemo(() => {
        return vehicles.map(v => {
            const vEarnings = earnings.filter(e => e.vehiclePlate === v.plate);
            const totalRevenue = vEarnings.reduce((sum, e) => sum + Number(e.amount), 0);
            const totalTrips = vEarnings.reduce((sum, e) => sum + (e.trips || 0), 0);
            const daysLogged = vEarnings.length || 1;
            const daysActive = vEarnings.filter(e => Number(e.amount) > 0).length;
            const utilization = Math.min(Math.round((daysActive / Math.max(daysLogged, 7)) * 100), 100);
            return {
                name: `${v.make} ${v.model} (${v.plate})`,
                revenue: v.dailyRevenue || Math.round(totalRevenue / daysLogged),
                utilization: utilization || (v.status === 'active' ? 75 : 0),
                trips: Math.round(totalTrips / daysLogged),
            };
        });
    }, [vehicles, earnings]);

    const totalRevenue = revenueData.values.reduce((s, v) => s + v, 0);
    const avgDaily = Math.round(totalRevenue / 7);

    return (
        <ScreenWrapper title="Fleet Analytics" subtitle="Revenue & performance insights">
            {/* KPI Cards */}
            <View style={styles.kpiRow}>
                <Card variant="highlighted" style={styles.kpiCard}>
                    <Ionicons name="trending-up" size={20} color={Colors.primary} />
                    <Text style={styles.kpiLabel}>Weekly Revenue</Text>
                    <Text style={styles.kpiValue}>{formatCurrency(totalRevenue)}</Text>
                    <Text style={styles.kpiChange}>↑ 12% vs last week</Text>
                </Card>
                <Card style={styles.kpiCard}>
                    <Ionicons name="calendar" size={20} color={Colors.secondary} />
                    <Text style={styles.kpiLabel}>Avg Daily</Text>
                    <Text style={styles.kpiValue}>{formatCurrency(avgDaily)}</Text>
                    <Text style={styles.kpiChange}>↑ 5% vs last week</Text>
                </Card>
            </View>

            {/* Revenue Chart */}
            <SectionHeader title="Revenue Trend" style={styles.section} />
            <Card>
                <View style={styles.periodTabs}>
                    {(['week', 'month'] as const).map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodTab, period === p && styles.periodTabActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>
                                {p === 'week' ? 'This Week' : 'This Month'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.chartContainer}>
                    <RevenueChart labels={revenueData.labels} values={revenueData.values} />
                </View>
            </Card>

            {/* Vehicle Performance */}
            <SectionHeader title="Vehicle Performance" style={styles.section} />
            {vehiclePerformance.map((v, i) => (
                <Card key={i} style={styles.perfCard}>
                    <View style={styles.perfHeader}>
                        <View style={styles.perfIcon}>
                            <Ionicons name="car" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.perfName}>{v.name}</Text>
                    </View>
                    <View style={styles.perfMetrics}>
                        <View style={styles.perfMetric}>
                            <Text style={styles.perfMetricValue}>{formatCurrency(v.revenue)}</Text>
                            <Text style={styles.perfMetricLabel}>Revenue/day</Text>
                        </View>
                        <View style={styles.perfMetric}>
                            <Text style={styles.perfMetricValue}>{v.utilization}%</Text>
                            <Text style={styles.perfMetricLabel}>Utilization</Text>
                        </View>
                        <View style={styles.perfMetric}>
                            <Text style={styles.perfMetricValue}>{v.trips}</Text>
                            <Text style={styles.perfMetricLabel}>Trips/day</Text>
                        </View>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, { width: `${v.utilization}%` }]} />
                    </View>
                </Card>
            ))}

            {/* Financial Summary */}
            <SectionHeader title="Financial Summary" style={styles.section} />
            <Card>
                {[
                    { label: 'Gross Revenue', value: formatCurrency(totalRevenue), color: Colors.textPrimary },
                    { label: 'Driver Payments', value: `-${formatCurrency(Math.round(totalRevenue * 0.55))}`, color: Colors.error },
                    { label: 'Fuel Costs', value: `-${formatCurrency(Math.round(totalRevenue * 0.15))}`, color: Colors.error },
                    { label: 'Maintenance', value: `-${formatCurrency(Math.round(totalRevenue * 0.05))}`, color: Colors.error },
                    { label: 'Net Profit', value: formatCurrency(Math.round(totalRevenue * 0.25)), color: Colors.success, bold: true },
                ].map((row, i) => (
                    <View key={i} style={[styles.finRow, i === 4 && styles.finRowLast]}>
                        <Text style={[styles.finLabel, row.bold && styles.finBold]}>{row.label}</Text>
                        <Text style={[styles.finValue, { color: row.color }, row.bold && styles.finBold]}>{row.value}</Text>
                    </View>
                ))}
            </Card>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    kpiRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    kpiCard: {
        flex: 1,
        gap: Spacing.xs,
    },
    kpiLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    kpiValue: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    kpiChange: {
        ...Typography.small,
        color: Colors.success,
        fontWeight: '600',
    },
    section: {
        marginTop: Spacing.xl,
    },
    periodTabs: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    periodTab: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
    },
    periodTabActive: {
        backgroundColor: Colors.primary,
    },
    periodTabText: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    periodTabTextActive: {
        color: '#fff',
    },
    chartContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    perfCard: {
        marginBottom: Spacing.md,
    },
    perfHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    perfIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    perfName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
        flex: 1,
    },
    perfMetrics: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
    },
    perfMetric: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    perfMetricValue: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    perfMetricLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    progressTrack: {
        height: 6,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    finRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    finRowLast: {
        borderBottomWidth: 0,
        borderTopWidth: 2,
        borderTopColor: Colors.surfaceBorder,
        marginTop: Spacing.sm,
        paddingTop: Spacing.lg,
    },
    finLabel: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    finValue: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    finBold: {
        fontWeight: '800',
        fontSize: 16,
    },
});
