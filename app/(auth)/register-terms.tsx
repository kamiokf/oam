import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import { useAuth } from '../../context/AuthContext';
import { TERMS_OF_SERVICE, CODE_OF_CONDUCT, PRIVACY_POLICY_SUMMARY } from '../../data/registration';

export default function RegisterTermsScreen() {
    const router = useRouter();
    const { data, updateField, validateStep4 } = useRegistration();
    const { register, isLoading } = useAuth();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isDriver = data.selectedRole === 'driver';

    const handleComplete = async () => {
        const stepErrors = validateStep4();
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        try {
            // Create user from registration data
            await register({
                name: data.fullName,
                phone: data.phone,
                role: data.selectedRole,
                trn: data.trn,
                parish: data.parish,
                businessName: data.businessName || undefined,
                routeLicenceNumber: data.routeLicenceNumber || undefined,
                driversLicenceNumber: data.driversLicenceNumber || undefined,
                licenceClass: data.licenceClass || undefined,
                tlcNumber: data.tlcNumber || undefined,
                availableForHire: data.availableForHire,
                primaryRoutes: data.primaryRoutes,
                routeExperience: data.routeExperience,
                yearsOfExperience: data.yearsOfExperience,
                numberOfVehicles: data.numberOfVehicles,
            });

            router.replace('/(auth)/register-welcome');
        } catch (err) {
            // Error is handled/alerted in AuthContext
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            Alert.alert('Registration Failed', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <ProgressBar currentStep={4} totalSteps={4} />

            <View style={styles.header}>
                <Text style={styles.step}>STEP 4 OF 4</Text>
                <Text style={styles.title}>Terms &{'\n'}Confirmation</Text>
                <Text style={styles.subtitle}>Review and accept our terms to complete registration</Text>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Terms of Service */}
                <View style={styles.termsBox}>
                    <Text style={styles.termsLabel}>Terms of Service & Code of Conduct</Text>
                    <ScrollView
                        style={styles.termsScroll}
                        nestedScrollEnabled
                    >
                        <Text style={styles.termsText}>{TERMS_OF_SERVICE}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.termsText}>{CODE_OF_CONDUCT}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.privacyTitle}>Privacy Policy Summary</Text>
                        <Text style={styles.termsText}>{PRIVACY_POLICY_SUMMARY}</Text>
                    </ScrollView>
                </View>

                {/* Checkboxes */}
                <View style={styles.checkboxes}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => {
                            updateField('agreedToTerms', !data.agreedToTerms);
                            setErrors((e) => ({ ...e, agreedToTerms: '' }));
                        }}
                    >
                        <View style={[styles.checkbox, data.agreedToTerms && styles.checkboxActive]}>
                            {data.agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            I agree to the Terms of Service and Code of Conduct
                        </Text>
                    </TouchableOpacity>
                    {errors.agreedToTerms ? <Text style={styles.error}>{errors.agreedToTerms}</Text> : null}

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => {
                            updateField('agreedToPrivacy', !data.agreedToPrivacy);
                            setErrors((e) => ({ ...e, agreedToPrivacy: '' }));
                        }}
                    >
                        <View style={[styles.checkbox, data.agreedToPrivacy && styles.checkboxActive]}>
                            {data.agreedToPrivacy && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            I agree to the Privacy Policy and Data Usage terms
                        </Text>
                    </TouchableOpacity>
                    {errors.agreedToPrivacy ? <Text style={styles.error}>{errors.agreedToPrivacy}</Text> : null}
                </View>

                {/* Driver: Available for Hire toggle */}
                {isDriver && (
                    <View style={styles.toggleSection}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleText}>
                                <Text style={styles.toggleLabel}>Available for Hire</Text>
                                <Text style={styles.toggleDesc}>
                                    Owners looking for drivers will be able to see your profile when this is on
                                </Text>
                            </View>
                            <Switch
                                value={data.availableForHire}
                                onValueChange={(v) => updateField('availableForHire', v)}
                                trackColor={{ false: Colors.surfaceBorder, true: Colors.primary + '80' }}
                                thumbColor={data.availableForHire ? Colors.primary : Colors.textMuted}
                            />
                        </View>
                    </View>
                )}

                {/* Optional fields */}
                <View style={styles.optionalSection}>
                    <Text style={styles.optionalTitle}>Optional</Text>
                    <Input
                        label="Referral Code"
                        placeholder="Enter referral code"
                        value={data.referralCode}
                        onChangeText={(v) => updateField('referralCode', v)}
                    />
                    <Input
                        label="Emergency Contact Name"
                        placeholder="Name"
                        value={data.emergencyContactName}
                        onChangeText={(v) => updateField('emergencyContactName', v)}
                    />
                    <Input
                        label="Emergency Contact Phone"
                        placeholder="Phone number"
                        value={data.emergencyContactPhone}
                        onChangeText={(v) => updateField('emergencyContactPhone', v)}
                        keyboardType="phone-pad"
                    />
                </View>
            </ScrollView>

            <View style={styles.bottom}>
                <Button
                    title="Complete Registration"
                    onPress={handleComplete}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={!data.agreedToTerms || !data.agreedToPrivacy || isLoading}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    back: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    header: { gap: Spacing.sm, marginBottom: Spacing.xl },
    step: {
        ...Typography.small, color: Colors.primary,
        fontWeight: '700', letterSpacing: 1.5,
    },
    title: { ...Typography.hero, color: Colors.textPrimary },
    subtitle: { ...Typography.body, color: Colors.textSecondary },
    scroll: { flex: 1 },
    termsBox: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        marginBottom: Spacing.xl,
    },
    termsLabel: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    termsScroll: {
        maxHeight: 180,
        padding: Spacing.md,
    },
    termsText: {
        ...Typography.small,
        color: Colors.textMuted,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.surfaceBorder,
        marginVertical: Spacing.md,
    },
    privacyTitle: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    scrollHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
    },
    scrollHintText: {
        ...Typography.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    checkboxes: { gap: Spacing.md, marginBottom: Spacing.xl },
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    checkbox: {
        width: 24, height: 24, borderRadius: 6,
        borderWidth: 2, borderColor: Colors.surfaceBorder,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 2,
    },
    checkboxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxDisabled: { opacity: 0.4 },
    checkboxLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1, lineHeight: 22 },
    checkboxLabelDisabled: { color: Colors.textMuted },
    error: { ...Typography.caption, color: Colors.error, marginLeft: 36 },
    toggleSection: { marginBottom: Spacing.xl },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    toggleText: { flex: 1, gap: 2 },
    toggleLabel: { ...Typography.bodyBold, color: Colors.textPrimary },
    toggleDesc: { ...Typography.caption, color: Colors.textMuted, lineHeight: 18 },
    optionalSection: {
        gap: Spacing.lg,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
        marginBottom: Spacing['3xl'],
    },
    optionalTitle: {
        ...Typography.h4, color: Colors.textSecondary,
    },
    bottom: { paddingTop: Spacing.lg },
});
