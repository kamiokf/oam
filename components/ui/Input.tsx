import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
    secureTextEntry?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    icon?: React.ReactNode;
    error?: string;
    style?: ViewStyle;
}

export function Input({
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    secureTextEntry = false,
    multiline = false,
    numberOfLines = 1,
    icon,
    error,
    style,
}: InputProps) {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputWrapper, error && styles.inputError]}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <TextInput
                    style={[styles.input, multiline ? styles.multiline : undefined, icon ? styles.inputWithIcon : undefined]}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.sm,
    },
    label: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    inputError: {
        borderColor: Colors.error,
    },
    iconWrapper: {
        paddingLeft: Spacing.lg,
    },
    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
        paddingVertical: Spacing.md + 2,
        paddingHorizontal: Spacing.lg,
    },
    inputWithIcon: {
        paddingLeft: Spacing.md,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    error: {
        ...Typography.caption,
        color: Colors.error,
    },
});
