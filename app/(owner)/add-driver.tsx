import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';

const LICENSE_TYPES = ['PPV', 'TLC', 'General'];

export default function AddDriverScreen() {
    const router = useRouter();
    const { addDriver } = useData();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [licenseType, setLicenseType] = useState('');
    const [experience, setExperience] = useState('');

    const isValid = name && phone && licenseType;

    const handleSubmit = () => {
        if (!isValid) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        const initials = name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

        addDriver({
            name: name.trim(),
            avatar: initials,
            phone: phone.startsWith('+') ? phone : `+1 876 ${phone}`,
            rating: 0,
            totalTrips: 0,
            experience: parseInt(experience) || 0,
            licenseType,
            licenseExpiry: '2027-12-31',
            status: 'pending',
            weeklyEarnings: 0,
            joinedDate: new Date().toISOString().split('T')[0],
            verificationStatus: 'pending',
            documents: [
                { name: 'Driver License', status: 'pending' },
                { name: `${licenseType} Badge`, status: 'pending' },
                { name: 'Police Record', status: 'pending' },
            ],
            routeHistory: [],
            backgroundCheck: {
                policeRecord: 'not_submitted',
                licenseValidation: 'pending',
                references: 'not_submitted',
                overallStatus: 'basic',
            },
        });

        Alert.alert(
            'Driver Invited! 📩',
            `${name} has been added to your fleet as a pending driver. They'll receive an SMS to complete their profile.`,
            [{ text: 'OK', onPress: () => router.back() }]
        );
    };

    return (
        <ScreenWrapper title="Invite Driver" subtitle="Add a new driver to your fleet">
            <Card variant="elevated" style={styles.formCard}>
                {/* Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. John Williams"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>

                {/* Phone */}
                <View style={styles.field}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="e.g. 555 0200"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* License Type */}
                <View style={styles.field}>
                    <Text style={styles.label}>License Type *</Text>
                    <View style={styles.typeRow}>
                        {LICENSE_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeChip, licenseType === type && styles.typeChipActive]}
                                onPress={() => setLicenseType(type)}
                            >
                                <Text style={[styles.typeChipText, licenseType === type && styles.typeChipTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Experience */}
                <View style={styles.field}>
                    <Text style={styles.label}>Years of Experience</Text>
                    <TextInput
                        style={styles.input}
                        value={experience}
                        onChangeText={setExperience}
                        placeholder="e.g. 3"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                        maxLength={2}
                    />
                </View>
            </Card>

            {/* Info Card */}
            <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="information-circle" size={20} color={Colors.info} />
                    <Text style={styles.infoText}>
                        The driver will be added with "Pending" status. They'll need to submit their documents and complete verification before they can be assigned to a vehicle.
                    </Text>
                </View>
            </Card>

            {/* Actions */}
            <View style={styles.actions}>
                <Button title="Send Invite" variant="primary" fullWidth onPress={handleSubmit} disabled={!isValid} />
                <Button title="Cancel" variant="ghost" fullWidth onPress={() => router.back()} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formCard: { gap: Spacing.lg, marginBottom: Spacing.lg },
    field: { gap: Spacing.xs },
    label: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        ...Typography.body,
        color: Colors.textPrimary,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    typeRow: { flexDirection: 'row', gap: Spacing.sm },
    typeChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeChipText: { ...Typography.captionBold, color: Colors.textMuted },
    typeChipTextActive: { color: '#fff' },
    infoCard: { marginBottom: Spacing.xl },
    infoRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
    infoText: { ...Typography.caption, color: Colors.textMuted, flex: 1, lineHeight: 20 },
    actions: { gap: Spacing.md },
});
