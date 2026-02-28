import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
    const router = useRouter();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Logo & Branding */}
            <View style={styles.hero}>
                <View style={styles.logoCircle}>
                    <Ionicons name="bus" size={36} color="#000" />
                </View>
                <Text style={styles.appName}>One'N'Move</Text>
                <Text style={styles.tagline}>Smart Transport Solutions</Text>
            </View>

            {/* Get Started Section */}
            <View style={styles.ctaSection}>
                <Text style={styles.getStarted}>Get Started</Text>
                <Text style={styles.joinText}>Join our transport community</Text>

                {/* Driver CTA */}
                <TouchableOpacity
                    style={styles.driverBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <View style={styles.btnRow}>
                        <View style={styles.btnIconWrap}>
                            <Ionicons name="car-sport" size={22} color="#000" />
                        </View>
                        <View style={styles.btnTextWrap}>
                            <Text style={styles.btnTitle}>Get Started as Driver</Text>
                            <Text style={styles.btnSubtitle}>Looking for driving opportunities</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Owner CTA */}
                <TouchableOpacity
                    style={styles.ownerBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <View style={styles.btnRow}>
                        <View style={[styles.btnIconWrap, styles.ownerIconWrap]}>
                            <Ionicons name="people" size={22} color={Colors.textSecondary} />
                        </View>
                        <View style={styles.btnTextWrap}>
                            <Text style={styles.ownerBtnTitle}>Get Started as Owner</Text>
                            <Text style={styles.ownerBtnSubtitle}>Let Your Car Earn – Driver Ready</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Dual Role Feature Banner */}
                <View style={styles.featureBanner}>
                    <Text style={styles.featureBadge}>✨ New Feature</Text>
                    <Text style={styles.featureText}>
                        You can now select both roles during registration and access a dual dashboard for maximum flexibility!
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Connecting drivers and vehicle owners efficiently
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing['2xl'],
        justifyContent: 'space-between',
        paddingTop: 70,
        paddingBottom: 40,
    },
    hero: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    appName: {
        ...Typography.hero,
        color: Colors.textPrimary,
        fontSize: 36,
        letterSpacing: 0.5,
    },
    tagline: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    ctaSection: {
        alignItems: 'center',
        gap: Spacing.lg,
    },
    getStarted: {
        ...Typography.h2,
        color: Colors.textPrimary,
        fontWeight: '800',
    },
    joinText: {
        ...Typography.body,
        color: Colors.textMuted,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.sm,
    },
    driverBtn: {
        width: '100%',
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.lg + 2,
        paddingHorizontal: Spacing.xl,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    ownerBtn: {
        width: '100%',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.lg + 2,
        paddingHorizontal: Spacing.xl,
        borderWidth: 1.5,
        borderColor: Colors.primaryDark,
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    btnIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ownerIconWrap: {
        backgroundColor: Colors.surfaceElevated,
    },
    btnTextWrap: {
        flex: 1,
        gap: 2,
    },
    btnTitle: {
        ...Typography.h4,
        color: '#000',
    },
    btnSubtitle: {
        ...Typography.caption,
        color: 'rgba(0,0,0,0.6)',
    },
    ownerBtnTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    ownerBtnSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    featureBanner: {
        width: '100%',
        backgroundColor: Colors.secondaryMuted,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1.5,
        borderColor: Colors.secondary,
        marginTop: Spacing.sm,
    },
    featureBadge: {
        ...Typography.bodyBold,
        color: Colors.secondaryLight,
    },
    featureText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
});
