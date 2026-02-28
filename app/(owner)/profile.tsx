import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { RoleSwitcher } from '../../components/layout/RoleSwitcher';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function OwnerProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: 'business' as const, label: 'Business Information', subtitle: 'Company name, TRN, address' },
        { icon: 'document-text' as const, label: 'Business Documents', subtitle: 'Registration, insurance, permits', badge: '2 Expiring' },
        { icon: 'shield-checkmark' as const, label: 'Verification Status', subtitle: 'Business verified' },
        { icon: 'wallet' as const, label: 'Payment Settings', subtitle: 'Bank accounts, payment methods' },
        { icon: 'people' as const, label: 'Team Access', subtitle: 'Manage team members' },
        { icon: 'notifications' as const, label: 'Notifications', subtitle: 'Alerts, reminders, updates' },
        { icon: 'help-circle' as const, label: 'Help & Support', subtitle: 'FAQ, contact support' },
        { icon: 'settings' as const, label: 'Settings', subtitle: 'Privacy, about, language' },
    ];

    return (
        <ScreenWrapper title="Profile" headerRight={<RoleSwitcher />}>
            <Card variant="elevated" style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    <Avatar initials={user?.avatar || 'AM'} size={64} bgColor={Colors.secondaryMuted} color={Colors.secondaryDark} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'Alex Morgan'}</Text>
                        <Text style={styles.profileType}>Fleet Owner</Text>
                        <View style={styles.profileBadges}>
                            <Badge label="Verified" variant="success" size="sm" />
                            <Badge label="Owner" variant="secondary" size="sm" />
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Vehicles</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>4</Text>
                        <Text style={styles.statLabel}>Drivers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>4.7</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>2yr</Text>
                        <Text style={styles.statLabel}>Member</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.menu}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
                        <View style={[styles.menuIconWrap, { backgroundColor: Colors.secondaryMuted }]}>
                            <Ionicons name={item.icon} size={22} color={Colors.secondary} />
                        </View>
                        <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        {item.badge && <Badge label={item.badge} variant="warning" size="sm" />}
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={() => {
                logout();
                router.replace('/(auth)/welcome');
            }}>
                <Ionicons name="log-out" size={20} color={Colors.error} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        marginBottom: Spacing.xl,
    },
    profileHeader: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    profileInfo: {
        flex: 1,
        gap: Spacing.xs,
    },
    profileName: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    profileType: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    profileBadges: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    statValue: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    statLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.surfaceBorder,
    },
    menu: {
        gap: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    menuIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextWrap: {
        flex: 1,
        gap: 2,
    },
    menuLabel: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    menuSubtitle: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing['3xl'],
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.errorMuted,
    },
    logoutText: {
        ...Typography.bodyBold,
        color: Colors.error,
    },
});
