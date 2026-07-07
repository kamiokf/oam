import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Branding pause: this screen is also the app's central router — every
        // cold start and role-based redirect passes through here after 2s.
        const timeout = setTimeout(() => {
            if (isAuthenticated && user) {
                if (user.role === 'owner') {
                    router.replace('/(owner)');
                } else {
                    router.replace('/(driver)');
                }
            } else {
                router.replace('/(auth)/welcome');
            }
        }, 2000);

        return () => clearTimeout(timeout);
    }, [isAuthenticated]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="bus" size={40} color="#000" />
                    </View>
                </View>
                <Text style={styles.title}>One'N'Move</Text>
                <Text style={styles.subtitle}>Smart Transport Solutions</Text>
                <Text style={styles.tagline}>Connecting Drivers & Owners{'\n'}Across Jamaica</Text>
            </Animated.View>

            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <View style={styles.dots}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        gap: Spacing.md,
    },
    logoContainer: {
        marginBottom: Spacing.lg,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        ...Typography.hero,
        color: Colors.textPrimary,
        fontSize: 42,
        letterSpacing: 1,
    },
    subtitle: {
        ...Typography.h4,
        color: Colors.textSecondary,
        marginTop: -Spacing.sm,
    },
    tagline: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.lg,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
    },
    dots: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.surfaceBorder,
    },
    dotActive: {
        backgroundColor: Colors.primary,
        width: 24,
    },
});
