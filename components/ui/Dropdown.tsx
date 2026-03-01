import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

interface DropdownOption {
    label: string;
    value: string;
    description?: string;
}

interface DropdownProps {
    label?: string;
    placeholder?: string;
    options: DropdownOption[];
    value: string;
    onSelect: (value: string) => void;
    error?: string;
}

export function Dropdown({ label, placeholder = 'Select...', options, value, onSelect, error }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((o) => o.value === value);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={[styles.trigger, error && styles.triggerError]}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
                    {selectedOption?.label || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}

            <Modal visible={isOpen} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setIsOpen(false)}>
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                                <TouchableOpacity onPress={() => setIsOpen(false)}>
                                    <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.option, value === item.value && styles.optionActive]}
                                        onPress={() => {
                                            onSelect(item.value);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <View style={styles.optionText}>
                                            <Text style={[styles.optionLabel, value === item.value && styles.optionLabelActive]}>
                                                {item.label}
                                            </Text>
                                            {item.description && (
                                                <Text style={styles.optionDesc}>{item.description}</Text>
                                            )}
                                        </View>
                                        {value === item.value && (
                                            <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
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
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        paddingVertical: Spacing.md + 2,
        paddingHorizontal: Spacing.lg,
    },
    triggerError: {
        borderColor: Colors.error,
    },
    triggerText: {
        ...Typography.body,
        color: Colors.textPrimary,
        flex: 1,
    },
    placeholder: {
        color: Colors.textMuted,
    },
    error: {
        ...Typography.caption,
        color: Colors.error,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        maxHeight: '60%',
    },
    modal: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    modalTitle: {
        ...Typography.h3,
        color: Colors.textPrimary,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder + '60',
    },
    optionActive: {
        backgroundColor: Colors.primaryMuted,
    },
    optionText: {
        flex: 1,
        gap: 2,
    },
    optionLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    optionLabelActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    optionDesc: {
        ...Typography.small,
        color: Colors.textMuted,
    },
});
