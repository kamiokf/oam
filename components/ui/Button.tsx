import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    style,
}: ButtonProps) {
    const buttonStyles: ViewStyle[] = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style as ViewStyle,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`text_${variant}`] as TextStyle,
        styles[`textSize_${size}`] as TextStyle,
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={buttonStyles}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'} />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: Colors.error,
    },
    size_sm: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    size_md: {
        paddingVertical: Spacing.md + 2,
        paddingHorizontal: Spacing.xl,
    },
    size_lg: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing['2xl'],
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...Typography.button,
        color: Colors.textPrimary,
    },
    text_primary: {
        color: '#FFFFFF',
    },
    text_secondary: {
        color: Colors.textInverse,
    },
    text_outline: {
        color: Colors.primary,
    },
    text_ghost: {
        color: Colors.primary,
    },
    text_danger: {
        color: '#FFFFFF',
    },
    textSize_sm: {
        fontSize: 13,
    },
    textSize_md: {},
    textSize_lg: {
        fontSize: 17,
    },
});
