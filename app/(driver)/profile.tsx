import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
import { useData } from '../../context/DataContext';
import { showAlert } from '../../utils/alert';

export default function DriverProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { isDualRole } = useRole();
    const { reviews, trips, referrals, disputes } = useData();

    // Rating
    const myReviews = reviews.filter(r => r.toId === user?.id);
    const avgRating = myReviews.length > 0
        ? (myReviews.reduce((acc, r) => acc + r.rating, 0) / myReviews.length).toFixed(1)
        : '0.0';

    // Trips
    const myTrips = trips.filter(t => t.driverId === user?.id);
    const totalTrips = myTrips.length;

    // Years of Experience
    const yearsOfExp = user?.yearsOfExperience || 0;

    // License Class
    const licenceClass = user?.licenceClass || 'N/A';

    // Dynamic menu data
    const verificationLabel = user?.verificationTier === 'fully_verified' ? 'Fully verified' : user?.verificationTier === 'verified' ? 'Verified' : 'Basic';
    const reviewCount = myReviews.length;
    const reviewSubtitle = reviewCount > 0 ? `${avgRating} average • ${reviewCount} reviews` : 'No reviews yet';
    const myReferrals = referrals.filter(r => r.referredBy === user?.id);
    const referralEarned = myReferrals.filter(r => r.status === 'paid' || r.status === 'completed').reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
    const referralSubtitle = myReferrals.length > 0 ? `${myReferrals.length} referred • J$${referralEarned.toLocaleString()} earned` : 'Invite friends to earn bonuses';
    const activeDisputeCount = disputes.filter(d => ['open', 'under_review', 'escalated'].includes(d.status) && (d.filedBy === user?.id || d.against === user?.id)).length;
    const disputeSubtitle = activeDisputeCount > 0 ? `${activeDisputeCount} active dispute${activeDisputeCount > 1 ? 's' : ''}` : 'No active disputes';

    const menuItems = [
        { icon: 'person-circle' as const, label: 'Personal Information', subtitle: 'Name, phone, email', route: null },
        { icon: 'shield-checkmark' as const, label: 'Background Checks', subtitle: `${verificationLabel}`, route: '/(shared)/background-checks' },
        { icon: 'navigate' as const, label: 'Trip Log', subtitle: 'GPS-verified trips & mileage', route: '/(driver)/trip-logger' },
        { icon: 'document-text' as const, label: 'Documents', subtitle: 'License, badges, records', badge: '1 Expiring', route: '/(shared)/background-checks' },
        { icon: 'star' as const, label: 'Reviews & Ratings', subtitle: reviewSubtitle, route: '/(shared)/reviews' },
        { icon: 'gift' as const, label: 'Referrals', subtitle: referralSubtitle, route: '/(shared)/referrals' },
        { icon: 'alert-circle' as const, label: 'Disputes', subtitle: disputeSubtitle, route: '/(shared)/disputes' },
        { icon: 'notifications' as const, label: 'Notifications', subtitle: 'Push & SMS alerts', route: '/(shared)/notifications' },
        { icon: 'settings' as const, label: 'Settings', subtitle: 'Privacy, SMS, GPS tracking', route: '/(shared)/settings' },
    ];

    const handleMenuPress = (item: typeof menuItems[0]) => {
        if (item.route) {
            router.push(item.route as any);
        } else {
            showAlert(item.label, `${item.subtitle}\n\nEdit your personal details from the Settings screen.`);
        }
    };

    // Calculate initials dynamically
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <ScreenWrapper title="Profile" headerRight={isDualRole ? <RoleSwitcher /> : undefined}>
            {/* Profile Card */}
            <Card variant="elevated" style={styles.profileCard}>
                <View style={styles.profileHeader}>
                    <Avatar initials={user?.avatar || getInitials(user?.name)} size={64} bgColor={Colors.primaryMuted} color={Colors.primaryLight} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'Loading...'}</Text>
                        <Text style={styles.profilePhone}>{user?.phone || ''}</Text>
                        <View style={styles.profileBadges}>
                            <Badge label="Premium Verified" variant="primary" size="sm" />
                            <Badge label="Driver" variant="success" size="sm" />
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{avgRating}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{totalTrips}</Text>
                        <Text style={styles.statLabel}>Trips</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{yearsOfExp}</Text>
                        <Text style={styles.statLabel}>Years</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{licenceClass}</Text>
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
                {reviews
                    .filter((r) => r.toId === user?.id)
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
