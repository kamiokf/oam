import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'neutral';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

const variantColors = {
    success: { bg: Colors.successMuted, text: Colors.success },
    warning: { bg: Colors.warningMuted, text: Colors.warning },
    error: { bg: Colors.errorMuted, text: Colors.error },
    info: { bg: Colors.infoMuted, text: Colors.info },
    primary: { bg: Colors.primaryMuted, text: Colors.primaryLight },
    secondary: { bg: Colors.secondaryMuted, text: Colors.secondary },
    neutral: { bg: Colors.surfaceElevated, text: Colors.textSecondary },
};

export function Badge({ label, variant = 'primary', size = 'md', style }: BadgeProps) {
    const colors = variantColors[variant];
    return (
        <View style={[styles.base, size === 'sm' && styles.sm, { backgroundColor: colors.bg }, style]}>
            <Text style={[size === 'sm' ? styles.textSm : styles.text, { color: colors.text }]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 1,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
    },
    sm: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    text: {
        ...Typography.captionBold,
    },
    textSm: {
        ...Typography.small,
        fontWeight: '600',
    },
});
