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
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../context/AuthContext';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Monday-based week containing today
const getCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
};

export default function ScheduleScreen() {
    const { user } = useAuth();
    const week = React.useMemo(getCurrentWeek, []);
    const todayKey = toDateKey(new Date());
    const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const [selectedDay, setSelectedDay] = useState(todayKey);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        async function fetchSchedule() {
            if (!user) return;
            try {
                const { data, error } = await insforge.database
                    .from('schedules')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: true });

                if (error) throw error;
                setSchedule(data || []);
            } catch (err) {
                console.error("Failed to fetch schedule:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSchedule();
    }, [user?.id]);

    const scheduleDateKey = (s: any) => String(s.date).slice(0, 10);
    const totalHours = schedule.reduce((sum, s) => sum + (s.status !== 'upcoming' ? s.hours : 0), 0);
    const workedDays = schedule.filter((s) => s.status !== 'upcoming').length;

    if (isLoading) {
        return (
            <ScreenWrapper title="Schedule" subtitle={monthLabel}>
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.body, color: Colors.textMuted }}>Loading schedule...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper title="Schedule" subtitle={monthLabel}>
            {/* Calendar Strip */}
            <Card style={styles.calendarCard}>
                <View style={styles.calendarStrip}>
                    {weekDays.map((day, i) => {
                        const dateKey = toDateKey(week[i]);
                        const isSelected = dateKey === selectedDay;
                        const isToday = dateKey === todayKey;
                        const daySchedule = schedule.find((s) => scheduleDateKey(s) === dateKey);

                        return (
                            <TouchableOpacity
                                key={i}
                                style={[styles.dayCol, isSelected && styles.dayColSelected]}
                                onPress={() => setSelectedDay(dateKey)}
                            >
                                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                                    {day}
                                </Text>
                                <View style={[styles.dateCircle, isSelected && styles.dateCircleSelected, isToday && !isSelected && styles.dateCircleToday]}>
                                    <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                                        {week[i].getDate()}
                                    </Text>
                                </View>
                                {daySchedule && (
                                    <View
                                        style={[
                                            styles.dotIndicator,
                                            daySchedule.status === 'completed' && styles.dotCompleted,
                                            daySchedule.status === 'active' && styles.dotActive,
                                            daySchedule.status === 'upcoming' && styles.dotUpcoming,
                                        ]}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Card>

            {/* Hours Summary */}
            <View style={styles.hoursSummary}>
                <Card style={styles.hoursCard}>
                    <View style={styles.hoursIconWrap}>
                        <Ionicons name="time" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.hoursLabel}>This Week</Text>
                    <Text style={styles.hoursValue}>{totalHours}h</Text>
                </Card>
                <Card style={styles.hoursCard}>
                    <View style={[styles.hoursIconWrap, { backgroundColor: Colors.secondaryMuted }]}>
                        <Ionicons name="trending-up" size={20} color={Colors.secondary} />
                    </View>
                    <Text style={styles.hoursLabel}>Avg/Day</Text>
                    <Text style={styles.hoursValue}>{workedDays ? (totalHours / workedDays).toFixed(1) : '0.0'}h</Text>
                </Card>
                <Card style={styles.hoursCard}>
                    <View style={[styles.hoursIconWrap, { backgroundColor: Colors.successMuted }]}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    </View>
                    <Text style={styles.hoursLabel}>Days</Text>
                    <Text style={styles.hoursValue}>{schedule.filter((s) => s.status !== 'upcoming').length}</Text>
                </Card>
            </View>

            {/* Daily Schedule */}
            <SectionHeader title="Today's Schedule" style={styles.section} />
            {schedule
                .filter((s) => scheduleDateKey(s) === selectedDay)
                .map((shift) => (
                    <Card key={shift.id} variant={shift.status === 'active' ? 'highlighted' : 'default'} style={styles.shiftCard}>
                        <View style={styles.shiftHeader}>
                            <View style={styles.shiftTimeCol}>
                                <Text style={styles.shiftTime}>{shift.start_time || shift.start}</Text>
                                <View style={styles.timeLine}>
                                    <View style={[styles.timeLineDot, { backgroundColor: Colors.primary }]} />
                                    <View style={styles.timeLineBar} />
                                    <View style={[styles.timeLineDot, { backgroundColor: Colors.accent }]} />
                                </View>
                                <Text style={styles.shiftTime}>{shift.end_time || shift.end}</Text>
                            </View>
                            <View style={styles.shiftInfo}>
                                <Text style={styles.shiftRoute}>{shift.route}</Text>
                                <View style={styles.shiftMeta}>
                                    <Ionicons name="car" size={14} color={Colors.textMuted} />
                                    <Text style={styles.shiftMetaText}>{shift.vehicle}</Text>
                                </View>
                                <View style={styles.shiftMeta}>
                                    <Ionicons name="time" size={14} color={Colors.textMuted} />
                                    <Text style={styles.shiftMetaText}>{shift.hours} hours</Text>
                                </View>
                            </View>
                            <Badge
                                label={shift.status === 'active' ? 'Active' : shift.status === 'completed' ? 'Done' : 'Upcoming'}
                                variant={shift.status === 'active' ? 'success' : shift.status === 'completed' ? 'neutral' : 'info'}
                                size="sm"
                            />
                        </View>
                    </Card>
                ))}

            {/* All shifts this week */}
            <SectionHeader title="This Week" style={styles.section} />
            {schedule.map((shift) => (
                <TouchableOpacity key={shift.id} style={styles.weekShift} onPress={() => setSelectedDay(scheduleDateKey(shift))}>
                    <View style={[styles.weekDayBadge, scheduleDateKey(shift) === selectedDay && styles.weekDayBadgeActive]}>
                        <Text style={[styles.weekDayText, scheduleDateKey(shift) === selectedDay && styles.weekDayTextActive]}>
                            {shift.day || new Date(scheduleDateKey(shift) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                    </View>
                    <View style={styles.weekShiftInfo}>
                        <Text style={styles.weekShiftRoute}>{shift.route}</Text>
                        <Text style={styles.weekShiftTime}>{shift.start_time || shift.start} - {shift.end_time || shift.end}</Text>
                    </View>
                    <Badge
                        label={shift.status === 'completed' ? 'Done' : shift.status === 'active' ? 'Now' : 'Soon'}
                        variant={shift.status === 'completed' ? 'neutral' : shift.status === 'active' ? 'success' : 'info'}
                        size="sm"
                    />
                </TouchableOpacity>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    calendarCard: {
        marginBottom: Spacing.lg,
    },
    calendarStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayCol: {
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.lg,
    },
    dayColSelected: {
        backgroundColor: Colors.primaryMuted,
    },
    dayLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    dayLabelSelected: {
        color: Colors.primaryLight,
    },
    dateCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateCircleSelected: {
        backgroundColor: Colors.primary,
    },
    dateCircleToday: {
        borderWidth: 1.5,
        borderColor: Colors.secondary,
    },
    dateText: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    dateTextSelected: {
        color: '#fff',
    },
    dotIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    dotCompleted: {
        backgroundColor: Colors.success,
    },
    dotActive: {
        backgroundColor: Colors.secondary,
    },
    dotUpcoming: {
        backgroundColor: Colors.info,
    },
    hoursSummary: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    hoursCard: {
        flex: 1,
        alignItems: 'center',
        gap: Spacing.xs,
    },
    hoursIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hoursLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    hoursValue: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    section: {
        marginTop: Spacing.xl,
    },
    shiftCard: {
        marginBottom: Spacing.md,
    },
    shiftHeader: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    shiftTimeCol: {
        alignItems: 'center',
        gap: 2,
    },
    shiftTime: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    timeLine: {
        alignItems: 'center',
        gap: 2,
        paddingVertical: 2,
    },
    timeLineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    timeLineBar: {
        width: 2,
        height: 20,
        backgroundColor: Colors.surfaceBorder,
    },
    shiftInfo: {
        flex: 1,
        gap: Spacing.xs,
    },
    shiftRoute: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    shiftMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    shiftMetaText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    weekShift: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    weekDayBadge: {
        width: 40,
        height: 32,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekDayBadgeActive: {
        backgroundColor: Colors.primary,
    },
    weekDayText: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    weekDayTextActive: {
        color: '#fff',
    },
    weekShiftInfo: {
        flex: 1,
        gap: 2,
    },
    weekShiftRoute: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    weekShiftTime: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
});
