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
import { mockReviews } from '../../data/reviews';
import { formatRelativeDate } from '../../utils/formatting';

export default function ReviewsScreen() {
    return (
        <ScreenWrapper title="Reviews" subtitle={`${mockReviews.length} reviews`}>
            {/* Average Rating */}
            <Card variant="highlighted" style={styles.avgCard}>
                <View style={styles.avgRow}>
                    <View style={styles.avgLeft}>
                        <Text style={styles.avgValue}>4.8</Text>
                        <StarRating rating={4.8} size={18} showValue={false} />
                        <Text style={styles.avgLabel}>Based on {mockReviews.length} reviews</Text>
                    </View>
                    <View style={styles.avgBreakdown}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = mockReviews.filter((r) => r.rating === star).length;
                            const pct = (count / mockReviews.length) * 100;
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
            {mockReviews.map((review) => (
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
