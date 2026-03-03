import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dropdown } from '../../components/ui/Dropdown';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import { JAMAICAN_PARISHES } from '../../data/registration';

export default function RegisterDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ role: string; phone: string }>();
    const { data, updateField, validateStep2 } = useRegistration();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const role = (params.role as 'driver' | 'owner') || data.selectedRole;

    // Initialize role and phone from params
    React.useEffect(() => {
        if (params.role) updateField('selectedRole', params.role as 'driver' | 'owner');
        if (params.phone) updateField('phone', params.phone);
    }, []);

    const parishOptions = JAMAICAN_PARISHES.map((p) => ({ label: p, value: p }));

    const handleContinue = () => {
        const stepErrors = validateStep2();
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        router.push('/(auth)/register-licensing');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <ProgressBar currentStep={2} totalSteps={4} />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.step}>STEP 2 OF 4</Text>
                    <Text style={styles.title}>
                        {role === 'owner' ? 'Personal &\nBusiness Details' : 'Personal\nDetails'}
                    </Text>
                    <Text style={styles.subtitle}>
                        Tell us about yourself{role === 'owner' ? ' and your business' : ''}
                    </Text>
                </View>

                <View style={styles.form}>
                    {/* Full Legal Name */}
                    <Input
                        label="Full Legal Name"
                        placeholder="Enter your full name"
                        value={data.fullName}
                        onChangeText={(v) => { updateField('fullName', v); setErrors((e) => ({ ...e, fullName: '' })); }}
                        error={errors.fullName}
                    />

                    {/* TRN */}
                    <Input
                        label="TRN (Taxpayer Registration Number)"
                        placeholder="9-digit number"
                        value={data.trn}
                        onChangeText={(v) => { updateField('trn', v.replace(/\D/g, '').slice(0, 9)); setErrors((e) => ({ ...e, trn: '' })); }}
                        keyboardType="numeric"
                        error={errors.trn}
                    />

                    {/* Contact Number — Driver only */}
                    {role === 'driver' && (
                        <Input
                            label="Contact Number"
                            placeholder="Pre-filled from verification"
                            value={data.phone}
                            onChangeText={(v) => updateField('phone', v)}
                            keyboardType="phone-pad"
                        />
                    )}

                    {/* Parish */}
                    <Dropdown
                        label="Parish"
                        placeholder="Select your parish"
                        options={parishOptions}
                        value={data.parish}
                        onSelect={(v) => { updateField('parish', v); setErrors((e) => ({ ...e, parish: '' })); }}
                        error={errors.parish}
                    />

                    {/* Owner-specific fields */}
                    {role === 'owner' && (
                        <>
                            <Input
                                label="Business Name (Optional)"
                                placeholder="e.g. Thompson Transport"
                                value={data.businessName}
                                onChangeText={(v) => updateField('businessName', v)}
                            />

                            <View style={styles.vehicleCountField}>
                                <Text style={styles.fieldLabel}>Number of Vehicles</Text>
                                <View style={styles.counterRow}>
                                    <TouchableOpacity
                                        style={styles.counterBtn}
                                        onPress={() => updateField('numberOfVehicles', Math.max(1, data.numberOfVehicles - 1))}
                                    >
                                        <Ionicons name="remove" size={20} color={Colors.textPrimary} />
                                    </TouchableOpacity>
                                    <View style={styles.counterValue}>
                                        <Text style={styles.counterText}>{data.numberOfVehicles}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.counterBtn}
                                        onPress={() => updateField('numberOfVehicles', Math.min(50, data.numberOfVehicles + 1))}
                                    >
                                        <Ionicons name="add" size={20} color={Colors.textPrimary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottom}>
                <Button title="Continue" onPress={handleContinue} size="lg" fullWidth />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        maxWidth: 1024,
        width: '100%',
        alignSelf: 'center',
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    back: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    scroll: {
        flex: 1,
    },
    header: {
        gap: Spacing.sm,
        marginBottom: Spacing['3xl'],
    },
    step: {
        ...Typography.small,
        color: Colors.primary,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    title: {
        ...Typography.hero,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    form: {
        gap: Spacing.xl,
        paddingBottom: Spacing['3xl'],
    },
    fieldLabel: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    vehicleCountField: {
        gap: Spacing.sm,
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    counterBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterValue: {
        width: 60,
        alignItems: 'center',
    },
    counterText: {
        ...Typography.h2,
        color: Colors.textPrimary,
    },
    bottom: {
        paddingTop: Spacing.lg,
    },
});
