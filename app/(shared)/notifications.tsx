import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { insforge } from '../../lib/insforge';
import { useAuth } from '../../context/AuthContext';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

const typeIcons: Record<string, { icon: string; color: string }> = {
    payment: { icon: 'cash', color: Colors.success },
    application_update: { icon: 'checkmark-circle', color: Colors.success },
    alert: { icon: 'megaphone', color: Colors.info },
    system: { icon: 'settings', color: Colors.primary },
    referral: { icon: 'gift', color: Colors.secondary },
    dispute: { icon: 'shield-checkmark', color: Colors.warning },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        if (!silent) setIsLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                const msg = typeof error === 'object' && error !== null
                    ? (error as any).message || (error as any).details || JSON.stringify(error)
                    : String(error);
                setFetchError(msg);
                console.error('Notifications fetch error:', error);
            } else if (data) {
                setNotifications(data as Notification[]);
                setFetchError(null);
            }
        } catch (err: any) {
            setFetchError(err?.message || String(err));
            console.error('Failed to load notifications:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user?.id]);

    // Refetch every time the screen comes into focus (handles tab switching)
    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [fetchNotifications])
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchNotifications(true);
    }, [fetchNotifications]);

    const markAsRead = async (notifId: string) => {
        try {
            await insforge.database
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', notifId);

            setNotifications(prev =>
                prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await insforge.database
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('is_read', false);

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) {
        return (
            <ScreenWrapper title="Notifications">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            title="Notifications"
            subtitle={unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        >
            {/* Mark All Read Header */}
            {unreadCount > 0 && (
                <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
                    <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
                    <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
            )}

            {/* Error state */}
            {fetchError && (
                <View style={styles.errorState}>
                    <Ionicons name="alert-circle" size={20} color={Colors.error} />
                    <Text style={styles.errorText}>{fetchError}</Text>
                </View>
            )}

            {/* Empty state */}
            {!fetchError && notifications.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="notifications-off-outline" size={48} color={Colors.surfaceBorder} />
                    <Text style={styles.emptyTitle}>No Notifications</Text>
                    <Text style={styles.emptyDesc}>
                        You{"'"}re all caught up! We{"'"}ll notify you when something important happens.
                    </Text>
                </View>
            )}

            {/* Notification list */}
            {notifications.map((notif) => {
                const iconConfig = typeIcons[notif.type] || { icon: 'notifications', color: Colors.textMuted };
                return (
                    <TouchableOpacity
                        key={notif.id}
                        style={[styles.notifItem, !notif.is_read && styles.notifUnread]}
                        activeOpacity={0.7}
                        onPress={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                            if (notif.data?.cta_destination) router.push(notif.data.cta_destination);
                        }}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: `${iconConfig.color}20` }]}>
                            <Ionicons name={iconConfig.icon as any} size={20} color={iconConfig.color} />
                        </View>
                        <View style={styles.notifContent}>
                            <View style={styles.notifHeader}>
                                <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                                {!notif.is_read && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={styles.notifBody} numberOfLines={2}>{notif.message}</Text>
                            <View style={styles.notifFooter}>
                                <Text style={styles.notifTime}>{timeAgo(notif.created_at)}</Text>
                                {notif.data?.priority === 'high' && (
                                    <View style={styles.priorityChip}>
                                        <Ionicons name="alert-circle" size={10} color={Colors.warning} />
                                        <Text style={styles.priorityText}>High Priority</Text>
                                    </View>
                                )}
                                {notif.data?.priority === 'emergency' && (
                                    <View style={[styles.priorityChip, { backgroundColor: Colors.errorMuted }]}>
                                        <Ionicons name="warning" size={10} color={Colors.error} />
                                        <Text style={[styles.priorityText, { color: Colors.error }]}>Emergency</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing['3xl'],
        gap: Spacing.md,
    },
    loadingText: {
        ...Typography.body,
        color: Colors.textMuted,
    },
    markAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        gap: Spacing.xs,
        marginBottom: Spacing.lg,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
    },
    markAllText: {
        ...Typography.captionBold,
        color: Colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing['3xl'],
        gap: Spacing.md,
        marginTop: Spacing.xl,
    },
    emptyTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    emptyDesc: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    notifItem: {
        flexDirection: 'row',
        gap: Spacing.md,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    notifUnread: {
        backgroundColor: Colors.primaryMuted,
        marginHorizontal: -Spacing.xl,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifContent: { flex: 1, gap: Spacing.xs },
    notifHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    notifTitle: { ...Typography.bodyBold, color: Colors.textPrimary, flex: 1 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    notifBody: { ...Typography.body, color: Colors.textSecondary, lineHeight: 20 },
    notifFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    notifTime: { ...Typography.small, color: Colors.textMuted },
    priorityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: Colors.warningMuted,
        borderRadius: 6,
    },
    priorityText: { ...Typography.small, fontSize: 9, fontWeight: '700', color: Colors.warning },
    errorState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        backgroundColor: Colors.errorMuted,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    errorText: { ...Typography.small, color: Colors.error, flex: 1 },
});
