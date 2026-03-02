import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, StarRating } from '../../components/ui/Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeDate } from '../../utils/formatting';
import { insforge } from '../../lib/insforge';

export default function ReviewsScreen() {
    const [reviews, setReviews] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchReviews() {
            try {
                const { data, error } = await insforge.database
                    .from('reviews')
                    .select(`
                        id,
                        rating,
                        comment,
                        date,
                        route_from,
                        route_to,
                        author:from_id ( name, avatar, role )
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const formatted = (data || []).map(r => {
                    const author = Array.isArray(r.author) ? r.author[0] : r.author;
                    return {
                        id: r.id,
                        rating: r.rating,
                        comment: r.comment,
                        date: r.date,
                        route: r.route_from ? { from: r.route_from, to: r.route_to } : undefined,
                        fromName: author?.name || 'Unknown',
                        fromAvatar: author?.avatar || '?',
                        fromRole: author?.role || 'driver'
                    };
                });

                setReviews(formatted);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReviews();
    }, []);

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return (
        <ScreenWrapper title="Reviews" subtitle={isLoading ? "Loading..." : `${reviews.length} reviews`}>
            {/* Average Rating */}
            <Card variant="highlighted" style={styles.avgCard}>
                <View style={styles.avgRow}>
                    <View style={styles.avgLeft}>
                        <Text style={styles.avgValue}>{avgRating.toFixed(1)}</Text>
                        <StarRating rating={avgRating} size={18} showValue={false} />
                        <Text style={styles.avgLabel}>Based on {reviews.length} reviews</Text>
                    </View>
                    <View style={styles.avgBreakdown}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter((r) => r.rating === star).length;
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <View key={star} style={styles.breakdownRow}>
                                    <Text style={styles.breakdownStar}>{star}</Text>
                                    <View style={styles.breakdownTrack}>
                                        <View style={[styles.breakdownBar, { width: `${pct}%` }]} />
                                    </View>
                                    <Text style={styles.breakdownCount}>{count}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </Card>

            {/* Review Cards */}
            {isLoading ? (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <Text style={{ ...Typography.body, color: Colors.textMuted }}>Loading reviews...</Text>
                </View>
            ) : reviews.map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                        <Avatar initials={review.fromAvatar} size={40} />
                        <View style={styles.reviewMeta}>
                            <Text style={styles.reviewName}>{review.fromName}</Text>
                            <View style={styles.reviewSubRow}>
                                <Badge label={review.fromRole === 'driver' ? 'Driver' : 'Owner'} variant={review.fromRole === 'driver' ? 'primary' : 'secondary'} size="sm" />
                                <Text style={styles.reviewDate}>{formatRelativeDate(review.date)}</Text>
                            </View>
                        </View>
                    </View>
                    <StarRating rating={review.rating} size={14} />
                    <Text style={styles.reviewText}>{review.comment}</Text>
                    {review.route && (
                        <View style={styles.routeChip}>
                            <Ionicons name="navigate" size={12} color={Colors.textMuted} />
                            <Text style={styles.routeText}>{review.route.from} → {review.route.to}</Text>
                        </View>
                    )}
                </Card>
            ))}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    avgCard: {
        marginBottom: Spacing.xl,
    },
    avgRow: {
        flexDirection: 'row',
        gap: Spacing.xl,
    },
    avgLeft: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    avgValue: {
        ...Typography.numberLarge,
        color: Colors.textPrimary,
        fontSize: 48,
    },
    avgLabel: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    avgBreakdown: {
        flex: 1,
        gap: 4,
        justifyContent: 'center',
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    breakdownStar: {
        ...Typography.small,
        color: Colors.textMuted,
        width: 12,
        textAlign: 'center',
    },
    breakdownTrack: {
        flex: 1,
        height: 6,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    breakdownBar: {
        height: '100%',
        backgroundColor: Colors.secondary,
        borderRadius: 3,
    },
    breakdownCount: {
        ...Typography.small,
        color: Colors.textMuted,
        width: 16,
        textAlign: 'right',
    },
    reviewCard: {
        marginBottom: Spacing.md,
        gap: Spacing.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    reviewMeta: {
        flex: 1,
        gap: Spacing.xs,
    },
    reviewName: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    reviewSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    reviewDate: {
        ...Typography.small,
        color: Colors.textMuted,
    },
    reviewText: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    routeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 8,
    },
    routeText: {
        ...Typography.small,
        color: Colors.textMuted,
    },
});
