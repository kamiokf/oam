import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import type { DeliveryMethod } from '../../utils/sms';

interface Notification {
    id: string;
    icon: string;
    title: string;
    body: string;
    time: string;
    color: string;
    unread: boolean;
    deliveredVia: DeliveryMethod;
}

const notifications: Notification[] = [
    { id: 'n1', icon: 'checkmark-circle', title: 'Application Accepted', body: 'Your application for Kingston → Montego Bay was accepted!', time: '30 min ago', color: Colors.success, unread: true, deliveredVia: 'push' },
    { id: 'n2', icon: 'cash', title: 'Payment Received', body: 'J$42,500 weekly payment has been processed.', time: '2h ago', color: Colors.primary, unread: true, deliveredVia: 'push' },
    { id: 'n3', icon: 'navigate', title: 'New Job Match (SMS Sent)', body: 'Kingston → Ocho Rios - J$12,000/day. Matched via SMS fallback.', time: '4h ago', color: Colors.info, unread: true, deliveredVia: 'both' },
    { id: 'n4', icon: 'document-text', title: 'Document Expiring', body: 'Your police record expires in 15 days. Renew to stay active.', time: '1d ago', color: Colors.warning, unread: false, deliveredVia: 'sms' },
    { id: 'n5', icon: 'alert-circle', title: 'Dispute Update', body: 'Dispute #002 (Non-Payment) is now under review.', time: '1d ago', color: Colors.error, unread: false, deliveredVia: 'both' },
    { id: 'n6', icon: 'people', title: 'Referral Completed', body: 'Michelle Grant completed registration. J$2,500 bonus pending!', time: '2d ago', color: Colors.secondary, unread: false, deliveredVia: 'push' },
    { id: 'n7', icon: 'briefcase', title: 'New Job Match', body: '3 new jobs match your profile in the Kingston area.', time: '3d ago', color: Colors.info, unread: false, deliveredVia: 'push' },
];

const deliveryIcons: Record<DeliveryMethod, { icon: string; label: string; color: string }> = {
    push: { icon: 'phone-portrait', label: 'Push', color: Colors.textMuted },
    sms: { icon: 'chatbubble', label: 'SMS', color: Colors.warning },
    both: { icon: 'sync', label: 'Push + SMS', color: Colors.info },
};

export default function NotificationsScreen() {
    const hasSmsFallback = notifications.some((n) => n.deliveredVia === 'sms' || n.deliveredVia === 'both');

    return (
        <ScreenWrapper title="Notifications" subtitle={`${notifications.filter((n) => n.unread).length} new`}>
            {/* SMS Fallback Banner */}
            {hasSmsFallback && (
                <Card style={styles.smsBanner}>
                    <View style={styles.smsRow}>
                        <View style={styles.smsIcon}>
                            <Ionicons name="chatbubble-ellipses" size={18} color={Colors.warning} />
                        </View>
                        <View style={styles.smsText}>
                            <Text style={styles.smsBannerTitle}>SMS Fallback Active</Text>
                            <Text style={styles.smsBannerDesc}>Critical alerts sent via SMS when data is spotty</Text>
                        </View>
                    </View>
                </Card>
            )}

            {notifications.map((notif) => {
                const delivery = deliveryIcons[notif.deliveredVia];
                return (
                    <TouchableOpacity key={notif.id} style={[styles.notifItem, notif.unread && styles.notifUnread]} activeOpacity={0.7}>
                        <View style={[styles.iconWrap, { backgroundColor: `${notif.color}20` }]}>
                            <Ionicons name={notif.icon as any} size={20} color={notif.color} />
                        </View>
                        <View style={styles.notifContent}>
                            <View style={styles.notifHeader}>
                                <Text style={styles.notifTitle}>{notif.title}</Text>
                                {notif.unread && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                            <View style={styles.notifFooter}>
                                <Text style={styles.notifTime}>{notif.time}</Text>
                                <View style={styles.deliveryChip}>
                                    <Ionicons name={delivery.icon as any} size={10} color={delivery.color} />
                                    <Text style={[styles.deliveryText, { color: delivery.color }]}>{delivery.label}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    smsBanner: { marginBottom: Spacing.lg, backgroundColor: Colors.warningMuted, borderWidth: 1, borderColor: Colors.warning },
    smsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    smsIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${Colors.warning}20`, alignItems: 'center', justifyContent: 'center' },
    smsText: { flex: 1, gap: 2 },
    smsBannerTitle: { ...Typography.captionBold, color: Colors.warning },
    smsBannerDesc: { ...Typography.small, color: Colors.textSecondary },
    notifItem: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    notifUnread: { backgroundColor: Colors.primaryMuted, marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md },
    iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    notifContent: { flex: 1, gap: Spacing.xs },
    notifHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    notifTitle: { ...Typography.bodyBold, color: Colors.textPrimary, flex: 1 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    notifBody: { ...Typography.body, color: Colors.textSecondary, lineHeight: 20 },
    notifFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    notifTime: { ...Typography.small, color: Colors.textMuted },
    deliveryChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: Colors.surfaceLight, borderRadius: 6 },
    deliveryText: { ...Typography.small, fontSize: 9, fontWeight: '700' },
});
