import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';

export default function WelcomeScreen() {
    const router = useRouter();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const [showHelp, setShowHelp] = useState(false);

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
                <Text style={styles.getStarted}>Welcome</Text>
                <Text style={styles.joinText}>Log in or join our community</Text>

                {/* Driver CTA */}
                <TouchableOpacity
                    style={styles.driverBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(auth)/login?role=driver')}
                >
                    <View style={styles.btnRow}>
                        <View style={styles.btnIconWrap}>
                            <Ionicons name="car-sport" size={22} color="#000" />
                        </View>
                        <View style={styles.btnTextWrap}>
                            <Text style={styles.btnTitle}>Continue as Driver</Text>
                            <Text style={styles.btnSubtitle}>For new and existing drivers</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Owner CTA */}
                <TouchableOpacity
                    style={styles.ownerBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(auth)/login?role=owner')}
                >
                    <View style={styles.btnRow}>
                        <View style={[styles.btnIconWrap, styles.ownerIconWrap]}>
                            <Ionicons name="people" size={22} color={Colors.textSecondary} />
                        </View>
                        <View style={styles.btnTextWrap}>
                            <Text style={styles.ownerBtnTitle}>Continue as Owner</Text>
                            <Text style={styles.ownerBtnSubtitle}>For new and existing vehicle owners</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Help Trigger */}
                <TouchableOpacity style={styles.helpTrigger} onPress={() => setShowHelp(true)}>
                    <Ionicons name="help-circle-outline" size={20} color={Colors.primaryDark} />
                    <Text style={styles.helpTriggerText}>How does the app work?</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Connecting drivers and vehicle owners efficiently
                </Text>
            </View>

            {/* How it works modal */}
            <Modal visible={showHelp} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>How it works</Text>
                            <TouchableOpacity onPress={() => setShowHelp(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.helpStep}>
                                <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                                <View style={styles.stepTextContent}>
                                    <Text style={styles.stepTitle}>Log In / Sign Up</Text>
                                    <Text style={styles.stepDesc}>Simply enter your phone number. Existing users will instantly load their dashboard. New users will be guided to complete their profile.</Text>
                                </View>
                            </View>

                            <View style={styles.helpStep}>
                                <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                                <View style={styles.stepTextContent}>
                                    <Text style={styles.stepTitle}>Choose your Focus</Text>
                                    <Text style={styles.stepDesc}>If you're a driver, you can find jobs and track trips. If you're an owner, you can post vehicles and manage your fleet. You can even do both!</Text>
                                </View>
                            </View>

                            <View style={styles.helpStep}>
                                <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                                <View style={styles.stepTextContent}>
                                    <Text style={styles.stepTitle}>Navigate with Ease</Text>
                                    <Text style={styles.stepDesc}>Use the bottom tab bar to switch between your Home overview, Job Board, Active Trips, and Account Settings.</Text>
                                </View>
                            </View>

                            <Button title="Got it!" onPress={() => setShowHelp(false)} size="lg" style={{ marginTop: Spacing.xl }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    helpTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: Spacing.md,
        padding: Spacing.sm,
    },
    helpTriggerText: {
        ...Typography.bodyBold,
        color: Colors.primaryDark,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius['2xl'],
        borderTopRightRadius: BorderRadius['2xl'],
        padding: Spacing.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    closeBtn: {
        padding: Spacing.xs,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.full,
    },
    modalScroll: {
        paddingBottom: Spacing.xl,
    },
    helpStep: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    stepNum: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    stepNumText: {
        ...Typography.bodyBold,
        color: '#000',
    },
    stepTextContent: {
        flex: 1,
        gap: 4,
    },
    stepTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    stepDesc: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
