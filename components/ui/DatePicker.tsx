import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface Props {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    placeholder?: string;
}

export const DatePicker: React.FC<Props> = ({ value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);

    const handleNativeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            onChange(selectedDate.toISOString().split('T')[0]);
        }
    };

    if (Platform.OS === 'web') {
        return (
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    backgroundColor: Colors.surfaceLight,
                    color: Colors.textPrimary,
                    borderRadius: BorderRadius.md,
                    padding: `${Spacing.md}px ${Spacing.lg}px`,
                    border: `1px solid ${Colors.surfaceBorder}`,
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: 16,
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            />
        );
    }

    return (
        <View>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShow(true)}
            >
                <Text style={value ? styles.text : styles.placeholder}>
                    {value || placeholder || 'YYYY-MM-DD'}
                </Text>
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleNativeChange}
                />
            )}

            {Platform.OS === 'ios' && show && (
                <TouchableOpacity onPress={() => setShow(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    text: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    placeholder: {
        ...Typography.body,
        color: Colors.textMuted,
    },
    closeBtn: {
        alignItems: 'center',
        padding: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        borderBottomLeftRadius: BorderRadius.md,
        borderBottomRightRadius: BorderRadius.md,
    },
    closeBtnText: {
        ...Typography.bodyBold,
        color: Colors.primary,
    }
});
