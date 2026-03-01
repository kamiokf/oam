import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

interface MultiSelectProps {
    label?: string;
    options: string[];
    selected: string[];
    onToggle: (item: string) => void;
    error?: string;
}

export function MultiSelect({ label, options, selected, onToggle, error }: MultiSelectProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.chipGrid}>
                {options.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                        <TouchableOpacity
                            key={option}
                            style={[styles.chip, isSelected && styles.chipActive]}
                            onPress={() => onToggle(option)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                                size={16}
                                color={isSelected ? '#fff' : Colors.primary}
                            />
                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]} numberOfLines={1}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
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
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md + 2,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primaryMuted,
        borderWidth: 1,
        borderColor: Colors.primary + '40',
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#fff',
    },
    error: {
        ...Typography.caption,
        color: Colors.error,
    },
});
