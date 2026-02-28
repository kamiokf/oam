import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

const messages = [
    {
        id: 'm1',
        type: 'announcement' as const,
        title: 'System Update',
        body: 'One\'N\'Move v2.0 is now available with new fleet analytics features. Update your app to access the latest improvements.',
        date: '2026-02-27',
        time: '3:00 PM',
        read: false,
    },
    {
        id: 'm2',
        type: 'alert' as const,
        title: 'Document Expiry Reminder',
        body: 'Vehicle fitness for CF 1234 expires in 15 days. Please take action to renew your certification.',
        date: '2026-02-26',
        time: '10:00 AM',
        read: false,
    },
    {
        id: 'm3',
        type: 'announcement' as const,
        title: 'New Routes Available',
        body: 'Kingston to Port Antonio route now has 5 new job listings. Browse jobs to find opportunities.',
        date: '2026-02-25',
        time: '9:00 AM',
        read: true,
    },
    {
        id: 'm4',
        type: 'promotion' as const,
        title: 'Referral Bonus',
        body: 'Refer a driver or owner and earn J$5,000 when they complete their first transaction on One\'N\'Move.',
        date: '2026-02-24',
        time: '2:00 PM',
        read: true,
    },
];

export default function MessagesScreen() {
    const typeConfig = {
        announcement: { icon: 'megaphone' as const, color: Colors.info },
        alert: { icon: 'alert-circle' as const, color: Colors.warning },
        promotion: { icon: 'gift' as const, color: Colors.accent },
    };

    return (
        <ScreenWrapper title="Messages" subtitle={`${messages.filter((m) => !m.read).length} unread`}>
            {messages.map((msg) => {
                const config = typeConfig[msg.type];
                return (
                    <Card key={msg.id} variant={msg.read ? 'default' : 'highlighted'} style={styles.messageCard}>
                        <View style={styles.messageRow}>
                            <View style={[styles.iconWrap, { backgroundColor: `${config.color}20` }]}>
                                <Ionicons name={config.icon} size={22} color={config.color} />
                            </View>
                            <View style={styles.messageContent}>
                                <View style={styles.messageHeader}>
                                    <Text style={styles.messageTitle}>{msg.title}</Text>
                                    {!msg.read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.messageBody} numberOfLines={2}>{msg.body}</Text>
                                <Text style={styles.messageTime}>{msg.date} • {msg.time}</Text>
                            </View>
                        </View>
                    </Card>
                );
            })}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    messageCard: {
        marginBottom: Spacing.md,
    },
    messageRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageContent: {
        flex: 1,
        gap: Spacing.xs,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    messageTitle: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.secondary,
    },
    messageBody: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    messageTime: {
        ...Typography.small,
        color: Colors.textMuted,
        marginTop: 2,
    },
});
