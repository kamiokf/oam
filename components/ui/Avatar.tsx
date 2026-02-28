import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface AvatarProps {
    initials: string;
    size?: number;
    color?: string;
    bgColor?: string;
}

export function Avatar({ initials, size = 44, color, bgColor }: AvatarProps) {
    const bg = bgColor || Colors.primaryMuted;
    const textColor = color || Colors.primaryLight;
    const fontSize = size * 0.38;

    return (
        <View style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
            <Text style={[styles.text, { color: textColor, fontSize }]}>{initials}</Text>
        </View>
    );
}

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: number;
    showValue?: boolean;
}

export function StarRating({ rating, maxStars = 5, size = 14, showValue = true }: StarRatingProps) {
    return (
        <View style={styles.ratingContainer}>
            {Array.from({ length: maxStars }, (_, i) => (
                <Text key={i} style={{ fontSize: size, color: i < Math.round(rating) ? Colors.secondary : Colors.textMuted }}>
                    ★
                </Text>
            ))}
            {showValue && (
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
    },
    ratingText: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        marginLeft: Spacing.xs,
    },
});
