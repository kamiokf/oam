import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

interface SectionHeaderProps {
    title: string;
    action?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>
            {action && (
                <Text style={styles.action} onPress={onAction}>
                    {action}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    action: {
        ...Typography.captionBold,
        color: Colors.secondary,
    },
});
