import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'highlighted';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

export function Card({ children, variant = 'default', padding = 'md', style }: CardProps) {
    return (
        <View style={[styles.base, styles[variant], styles[`padding_${padding}`], style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    default: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    elevated: {
        backgroundColor: Colors.surfaceElevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
    },
    highlighted: {
        backgroundColor: Colors.primaryMuted,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    padding_none: {
        padding: 0,
    },
    padding_sm: {
        padding: Spacing.md,
    },
    padding_md: {
        padding: Spacing.lg,
    },
    padding_lg: {
        padding: Spacing.xl,
    },
});
