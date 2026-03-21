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
import { useRole } from '../../context/RoleContext';
import { useData } from '../../context/DataContext';
import { showAlert } from '../../utils/alert';

export default function OwnerProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { isDualRole } = useRole();
    const { vehicles, reviews } = useData();

    // Calculate actual stats for owner
    const myVehicles = vehicles.filter(v => v.ownerId === user?.id);
    const vehicleCount = myVehicles.length || user?.numberOfVehicles || 0;

    // Drivers: count unique assigned drivers for owner's vehicles
    const activeDriversCount = new Set(myVehicles.filter(v => v.assignedDriver).map(v => v.assignedDriver)).size;

    // Rating: average from reviews where toId === user?.id
    const myReviews = reviews.filter(r => r.toId === user?.id);
    const avgRating = myReviews.length > 0
        ? (myReviews.reduce((acc, r) => acc + r.rating, 0) / myReviews.length).toFixed(1)
        : '0.0';

    // Membership tenure
    const getMembershipDuration = () => {
        if (!user?.joinedDate) return 'New';
        const joined = new Date(user.joinedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - joined.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return `${diffDays}d`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
        return `${Math.floor(diffDays / 365)}yr`;
    };
    const memberSince = getMembershipDuration();

    const menuItems = [
        { icon: 'business' as const, label: 'Business Information', subtitle: 'Company name, TRN, address', route: null },
        { icon: 'document-text' as const, label: 'Business Documents', subtitle: 'Registration, insurance, permits', badge: '2 Expiring', route: '/(shared)/background-checks' },
        { icon: 'shield-checkmark' as const, label: 'Verification Status', subtitle: 'Business verified', route: null },
        { icon: 'wallet' as const, label: 'Payment Settings', subtitle: 'Bank accounts, payment methods', route: null },
        { icon: 'people' as const, label: 'Team Access', subtitle: 'Manage team members', route: '/(owner)/drivers' },
        { icon: 'notifications' as const, label: 'Notifications', subtitle: 'Alerts, reminders, updates', route: '/(shared)/notifications' },
        { icon: 'help-circle' as const, label: 'Help & Support', subtitle: 'FAQ, contact support', route: null },
        { icon: 'settings' as const, label: 'Settings', subtitle: 'Privacy, about, language', route: '/(shared)/settings' },
    ];

    const handleMenuPress = (item: any) => {
        if (item.route) {
            router.push(item.route as any);
        } else {
            const messages: Record<string, string> = {
                'Business Information': 'View and edit your business details, TRN, and registered address.',
                'Verification Status': 'Your business is verified ✅\nAll documents are up to date.',
                'Payment Settings': 'Manage your bank accounts and payment methods for driver payouts.',
                'Help & Support': 'Need help? Contact us:\n📧 support@onenmove.app\n📞 1-876-555-HELP',
            };
            showAlert(item.label, messages[item.label] || item.subtitle);
        }
    };

    // Calculate expiring documents alert (mock dynamic logic based on actual data if available)
    const expiringDocsCount = vehicles.filter(v =>
        (v.fitnessExpiry && new Date(v.fitnessExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ||
        (v.insuranceExpiry && new Date(v.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    ).length;

    const documentBadge = expiringDocsCount > 0 ? `${expiringDocsCount} Expiring` : undefined;

    const getTierLabel = () => {
        switch (user?.verificationTier) {
            case 'fully_verified': return 'Fully Verified';
            case 'verified': return 'Verified';
            default: return 'Registered';
        }
    };

    const getTierVariant = () => {
        switch (user?.verificationTier) {
            case 'fully_verified': return 'primary';
            case 'verified': return 'success';
            default: return 'warning';
        }
    };

    // Update menuItems dynamically
    const dynamicMenuItems = menuItems.map(item => {
        if (item.label === 'Business Documents') {
            return { ...item, badge: documentBadge };
        }
        if (item.label === 'Verification Status') {
            return { ...item, subtitle: `Business ${user?.verificationTier === 'registered' ? 'pending verification' : 'verified'}` };
        }
        return item;
    });

    // Calculate initials dynamically
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <ScreenWrapper title="Profile" headerRight={isDualRole ? <RoleSwitcher /> : undefined}>
            <Card variant="elevated" style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    <Avatar initials={user?.avatar || getInitials(user?.name)} size={64} bgColor={Colors.secondaryMuted} color={Colors.secondaryDark} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'Loading...'}</Text>
                        <Text style={styles.profileType}>Fleet Owner</Text>
                        <View style={styles.profileBadges}>
                            <Badge label={getTierLabel()} variant={getTierVariant() as any} size="sm" />
                            <Badge label="Owner" variant="secondary" size="sm" />
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{vehicleCount}</Text>
                        <Text style={styles.statLabel}>Vehicles</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{activeDriversCount}</Text>
                        <Text style={styles.statLabel}>Drivers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{avgRating}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{memberSince}</Text>
                        <Text style={styles.statLabel}>Member</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.menu}>
                {dynamicMenuItems.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7} onPress={() => handleMenuPress(item)}>
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
