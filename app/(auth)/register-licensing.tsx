import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dropdown } from '../../components/ui/Dropdown';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import { TRANSPORT_ROUTES, LICENCE_CLASSES } from '../../data/registration';

export default function RegisterLicensingScreen() {
    const router = useRouter();
    const { data, updateField, validateStep3 } = useRegistration();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const isOwner = data.selectedRole === 'owner';

    const licenceOptions = LICENCE_CLASSES.map((c) => ({
        label: c.label,
        value: c.id,
        description: c.description,
    }));

    const handleToggleRoute = (route: string) => {
        const field = isOwner ? 'primaryRoutes' : 'routeExperience';
        const current = isOwner ? data.primaryRoutes : data.routeExperience;
        const updated = current.includes(route)
            ? current.filter((r) => r !== route)
            : [...current, route];
        updateField(field, updated);
        setErrors((e) => ({ ...e, [field]: '' }));
    };

    const handleContinue = () => {
        const stepErrors = validateStep3();
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        router.push('/(auth)/register-terms');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <ProgressBar currentStep={3} totalSteps={4} />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.step}>STEP 3 OF 4</Text>
                    <Text style={styles.title}>
                        {isOwner ? 'Route &\nLicensing' : 'Driver\nLicensing'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isOwner
                            ? 'Tell us about your transport licence and routes'
                            : 'Enter your driving credentials and experience'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {isOwner ? (
                        <>
                            {/* Owner: Route Licence Number */}
                            <Input
                                label="Route Licence Number"
                                placeholder="e.g. RL-2024-0123"
                                value={data.routeLicenceNumber}
                                onChangeText={(v) => { updateField('routeLicenceNumber', v); setErrors((e) => ({ ...e, routeLicenceNumber: '' })); }}
                                error={errors.routeLicenceNumber}
                            />

                            {/* Owner: Primary Routes */}
                            <MultiSelect
                                label="Primary Route(s)"
                                options={TRANSPORT_ROUTES}
                                selected={data.primaryRoutes}
                                onToggle={handleToggleRoute}
                                error={errors.primaryRoutes}
                            />
                        </>
                    ) : (
                        <>
                            {/* Driver: Licence Number */}
                            <Input
                                label="Driver's Licence Number"
                                placeholder="e.g. DL-123456"
                                value={data.driversLicenceNumber}
                                onChangeText={(v) => { updateField('driversLicenceNumber', v); setErrors((e) => ({ ...e, driversLicenceNumber: '' })); }}
                                error={errors.driversLicenceNumber}
                            />

                            {/* Driver: Licence Class */}
                            <Dropdown
                                label="Licence Class"
                                placeholder="Select your licence class"
                                options={licenceOptions}
                                value={data.licenceClass}
                                onSelect={(v) => { updateField('licenceClass', v); setErrors((e) => ({ ...e, licenceClass: '' })); }}
                                error={errors.licenceClass}
                            />

                            {/* Driver: TLC Number */}
                            <Input
                                label="PPV Badge Number"
                                placeholder="e.g. PPV-78901"
                                value={data.tlcNumber}
                                onChangeText={(v) => { updateField('tlcNumber', v); setErrors((e) => ({ ...e, tlcNumber: '' })); }}
                                error={errors.tlcNumber}
                            />

                            {/* Driver: Route Experience */}
                            <MultiSelect
                                label="Primary Route Experience"
                                options={TRANSPORT_ROUTES}
                                selected={data.routeExperience}
                                onToggle={handleToggleRoute}
                                error={errors.routeExperience}
                            />

                            {/* Driver: Years of Experience */}
                            <View style={styles.experienceField}>
                                <Text style={styles.fieldLabel}>Years of Driving Experience</Text>
                                <View style={styles.counterRow}>
                                    <TouchableOpacity
                                        style={styles.counterBtn}
                                        onPress={() => updateField('yearsOfExperience', Math.max(0, data.yearsOfExperience - 1))}
                                    >
                                        <Ionicons name="remove" size={20} color={Colors.textPrimary} />
                                    </TouchableOpacity>
                                    <View style={styles.counterValue}>
                                        <Text style={styles.counterText}>{data.yearsOfExperience}</Text>
                                        <Text style={styles.counterUnit}>years</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.counterBtn}
                                        onPress={() => updateField('yearsOfExperience', Math.min(40, data.yearsOfExperience + 1))}
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
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    scroll: { flex: 1 },
    header: { gap: Spacing.sm, marginBottom: Spacing['3xl'] },
    step: {
        ...Typography.small,
        color: Colors.primary,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    title: { ...Typography.hero, color: Colors.textPrimary },
    subtitle: { ...Typography.body, color: Colors.textSecondary },
    form: { gap: Spacing.xl, paddingBottom: Spacing['3xl'] },
    fieldLabel: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    experienceField: { gap: Spacing.sm },
    counterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    counterBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1, borderColor: Colors.surfaceBorder,
        alignItems: 'center', justifyContent: 'center',
    },
    counterValue: { alignItems: 'center', width: 60 },
    counterText: { ...Typography.h2, color: Colors.textPrimary },
    counterUnit: { ...Typography.small, color: Colors.textMuted },
    bottom: { paddingTop: Spacing.lg },
});
