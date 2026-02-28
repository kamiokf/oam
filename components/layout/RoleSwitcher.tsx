import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { BorderRadius, Spacing } from '../../constants/Spacing';
import { useRole, ActiveView } from '../../context/RoleContext';
import { Ionicons } from '@expo/vector-icons';

export function RoleSwitcher() {
    const { activeView, toggleRole, isDualRole } = useRole();

    if (!isDualRole) return null;

    return (
        <TouchableOpacity style={styles.container} onPress={toggleRole} activeOpacity={0.8}>
            <View style={styles.track}>
                <View
                    style={[
                        styles.indicator,
                        activeView === 'owner' && styles.indicatorRight,
                    ]}
                />
                <View style={styles.option}>
                    <Ionicons
                        name="car-sport"
                        size={14}
                        color={activeView === 'driver' ? Colors.textInverse : Colors.textMuted}
                    />
                    <Text
                        style={[
                            styles.label,
                            activeView === 'driver' && styles.labelActive,
                        ]}
                    >
                        Driver
                    </Text>
                </View>
                <View style={styles.option}>
                    <Ionicons
                        name="business"
                        size={14}
                        color={activeView === 'owner' ? Colors.textInverse : Colors.textMuted}
                    />
                    <Text
                        style={[
                            styles.label,
                            activeView === 'owner' && styles.labelActive,
                        ]}
                    >
                        Owner
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    track: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.full,
        padding: 3,
        position: 'relative',
        width: 170,
    },
    indicator: {
        position: 'absolute',
        top: 3,
        left: 3,
        width: '50%',
        height: '100%',
        backgroundColor: Colors.secondary,
        borderRadius: BorderRadius.full,
        zIndex: 0,
    },
    indicatorRight: {
        left: '50%',
    },
    option: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        gap: 4,
        zIndex: 1,
    },
    label: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    labelActive: {
        color: Colors.textInverse,
    },
});
