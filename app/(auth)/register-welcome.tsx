import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRegistration } from '../../context/RegistrationContext';
import { useRole } from '../../context/RoleContext';

export default function RegisterWelcomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { data, reset } = useRegistration();
    const { switchRole } = useRole();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const isOwner = data.selectedRole === 'owner';

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleGoToDashboard = () => {
        switchRole(isOwner ? 'owner' : 'driver');
        reset();
        router.replace(isOwner ? '/(owner)' : '/(driver)');
    };

    const verificationSteps = isOwner
        ? [
            { label: 'Account Created', done: true, icon: 'checkmark-circle' as const },
            { label: 'Upload Route Licence', done: false, icon: 'document-text-outline' as const },
            { label: 'Upload Vehicle Fitness', done: false, icon: 'car-outline' as const },
            { label: 'TRN Validation', done: false, icon: 'shield-outline' as const },
            { label: 'Admin Review', done: false, icon: 'eye-outline' as const },
        ]
        : [
            { label: 'Account Created', done: true, icon: 'checkmark-circle' as const },
            { label: 'Upload Licence Photo', done: false, icon: 'camera-outline' as const },
            { label: 'Selfie Verification', done: false, icon: 'person-outline' as const },
            { label: 'TRN Validation', done: false, icon: 'shield-outline' as const },
            { label: 'Background Check', done: false, icon: 'ribbon-outline' as const },
        ];

    return (
        <View style={styles.container}>
            {/* Celebration Header */}
            <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.celebrationCircle}>
                    <Text style={styles.emoji}>🎉</Text>
                </View>
                <Text style={styles.welcomeTitle}>Welcome to{'\n'}One'N'Move!</Text>
                <Text style={styles.welcomeSubtitle}>
                    {user?.name || 'Friend'}, your {isOwner ? 'owner' : 'driver'} account has been created successfully.
                </Text>
            </Animated.View>

            {/* Verification Progress */}
            <Animated.View style={[styles.verificationCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.verificationHeader}>
                    <Text style={styles.verificationTitle}>Verification Progress</Text>
                    <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>Tier 1: Registered</Text>
                    </View>
                </View>

                {verificationSteps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                        <View style={[styles.stepIcon, step.done ? styles.stepIconDone : styles.stepIconPending]}>
                            <Ionicons
                                name={step.done ? 'checkmark' : step.icon}
                                size={16}
                                color={step.done ? '#fff' : Colors.textMuted}
                            />
                        </View>
                        <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
                        {i < verificationSteps.length - 1 && <View style={[styles.stepLine, step.done && styles.stepLineDone]} />}
                    </View>
                ))}
            </Animated.View>

            {/* Actions */}
            <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
                <Button
                    title={isOwner ? 'Add Your First Vehicle' : 'Browse Available Jobs'}
                    onPress={() => {
                        switchRole(isOwner ? 'owner' : 'driver');
                        reset();
                        router.replace(isOwner ? '/(owner)/add-vehicle' : '/(driver)/jobs');
                    }}
                    size="lg"
                    fullWidth
                />
                <TouchableOpacity onPress={handleGoToDashboard}>
                    <Text style={styles.skipText}>Go to Dashboard</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
        paddingTop: 80,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    hero: {
        alignItems: 'center',
        gap: Spacing.md,
    },
    celebrationCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    emoji: {
        fontSize: 40,
    },
    welcomeTitle: {
        ...Typography.hero,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    verificationCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        gap: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    verificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verificationTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    tierBadge: {
        backgroundColor: Colors.primaryMuted,
        paddingVertical: 4,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    tierText: {
        ...Typography.small,
        color: Colors.primary,
        fontWeight: '700',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        position: 'relative',
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIconDone: {
        backgroundColor: Colors.success,
    },
    stepIconPending: {
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    stepLabel: {
        ...Typography.body,
        color: Colors.textMuted,
        flex: 1,
    },
    stepLabelDone: {
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    stepLine: {
        position: 'absolute',
        left: 15,
        top: 32,
        width: 2,
        height: 24,
        backgroundColor: Colors.surfaceBorder,
    },
    stepLineDone: {
        backgroundColor: Colors.success,
    },
    bottom: {
        gap: Spacing.lg,
        alignItems: 'center',
    },
    skipText: {
        ...Typography.bodyBold,
        color: Colors.textMuted,
    },
});
