import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/Spacing';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progress = currentStep / totalSteps;

    return (
        <View style={styles.container}>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.dots}>
                {Array.from({ length: totalSteps }, (_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i < currentStep && styles.dotCompleted,
                            i === currentStep - 1 && styles.dotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    track: {
        height: 4,
        backgroundColor: Colors.surfaceBorder,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.surfaceBorder,
    },
    dotCompleted: {
        backgroundColor: Colors.primary,
    },
    dotActive: {
        backgroundColor: Colors.primary,
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: -1,
    },
});
