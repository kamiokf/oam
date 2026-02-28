import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { RoleSwitcher } from '../../components/layout/RoleSwitcher';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, StarRating } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { mockReviews } from '../../data/reviews';

export default function DriverProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { isDualRole } = useRole();

    const menuItems = [
        { icon: 'person-circle' as const, label: 'Personal Information', subtitle: 'Name, phone, email', route: null },
        { icon: 'shield-checkmark' as const, label: 'Background Checks', subtitle: 'Premium verified • 3/3 complete', route: '/(shared)/background-checks' },
        { icon: 'navigate' as const, label: 'Trip Log', subtitle: 'GPS-verified trips & mileage', route: '/(driver)/trip-logger' },
        { icon: 'document-text' as const, label: 'Documents', subtitle: 'License, badges, records', badge: '1 Expiring', route: '/(shared)/background-checks' },
        { icon: 'star' as const, label: 'Reviews & Ratings', subtitle: '4.8 average • 23 reviews', route: '/(shared)/reviews' },
        { icon: 'gift' as const, label: 'Referrals', subtitle: '4 referred • J$5,000 earned', route: '/(shared)/referrals' },
        { icon: 'alert-circle' as const, label: 'Disputes', subtitle: '1 active dispute', route: '/(shared)/disputes' },
        { icon: 'notifications' as const, label: 'Notifications', subtitle: 'Push & SMS alerts', route: '/(shared)/notifications' },
        { icon: 'settings' as const, label: 'Settings', subtitle: 'Privacy, SMS, GPS tracking', route: '/(shared)/settings' },
    ];

    const handleMenuPress = (item: typeof menuItems[0]) => {
        if (item.route) {
            router.push(item.route as any);
        } else {
            Alert.alert(item.label, `${item.subtitle}\n\nEdit your personal details from the Settings screen.`);
        }
    };

    return (
        <ScreenWrapper title="Profile" headerRight={isDualRole ? <RoleSwitcher /> : undefined}>
            {/* Profile Card */}
            <Card variant="elevated" style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    <Avatar initials={user?.avatar || 'AM'} size={64} bgColor={Colors.primaryMuted} color={Colors.primaryLight} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'Alex Morgan'}</Text>
                        <Text style={styles.profilePhone}>{user?.phone || '+1 876 555 0100'}</Text>
                        <View style={styles.profileBadges}>
                            <Badge label="Premium Verified" variant="primary" size="sm" />
                            <Badge label="Driver" variant="success" size="sm" />
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>1,250</Text>
                        <Text style={styles.statLabel}>Trips</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Years</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>PPV</Text>
                        <Text style={styles.statLabel}>License</Text>
                    </View>
                </View>
            </Card>

            {/* Menu Items */}
            <View style={styles.menu}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7} onPress={() => handleMenuPress(item)}>
                        <View style={styles.menuIconWrap}>
                            <Ionicons name={item.icon} size={22} color={Colors.primary} />
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

            {/* Recent Reviews */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Reviews</Text>
                {mockReviews
                    .filter((r) => r.toName === 'Devon Smith')
                    .slice(0, 2)
                    .map((review) => (
                        <Card key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Avatar initials={review.fromAvatar} size={36} />
                                <View style={styles.reviewMeta}>
                                    <Text style={styles.reviewAuthor}>{review.fromName}</Text>
                                    <StarRating rating={review.rating} size={12} showValue={false} />
                                </View>
                            </View>
                            <Text style={styles.reviewText}>{review.comment}</Text>
                        </Card>
                    ))}
            </View>

            {/* Logout */}
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
    profilePhone: {
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
        backgroundColor: Colors.primaryMuted,
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
    section: {
        marginTop: Spacing['2xl'],
        gap: Spacing.md,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    reviewCard: {
        gap: Spacing.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    reviewMeta: {
        gap: 2,
    },
    reviewAuthor: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    reviewText: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 22,
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
