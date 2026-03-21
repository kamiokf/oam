import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';

const VEHICLE_TYPES = ['Minibus', 'Bus', 'Car', 'Coaster', 'SUV'];

export default function AddVehicleScreen() {
    const router = useRouter();
    const { addVehicle } = useData();
    const { user } = useAuth();

    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [plate, setPlate] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [fitnessExpiry, setFitnessExpiry] = useState('');
    const [insuranceExpiry, setInsuranceExpiry] = useState('');
    const [registrationExpiry, setRegistrationExpiry] = useState('');

    const isValid = make && model && year && plate && selectedType;

    const handleSubmit = () => {
        if (!isValid) {
            showAlert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        addVehicle({
            ownerId: user?.id || '',
            make: make.trim(),
            model: model.trim(),
            year: parseInt(year) || 2024,
            plate: plate.trim().toUpperCase(),
            type: selectedType,
            status: 'pending_verification',
            dailyRevenue: 0,
            fitnessExpiry: fitnessExpiry || '2027-01-01',
            insuranceExpiry: insuranceExpiry || '2027-01-01',
            registrationExpiry: registrationExpiry || '2027-01-01',
        });

        showAlert('Vehicle Added! 🚗', `${make} ${model} (${plate}) has been added to your fleet.`, [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    return (
        <ScreenWrapper title="Add Vehicle" subtitle="Register a new vehicle to your fleet">
            <Card variant="elevated" style={styles.formCard}>
                {/* Make */}
                <View style={styles.field}>
                    <Text style={styles.label}>Make *</Text>
                    <TextInput
                        style={styles.input}
                        value={make}
                        onChangeText={setMake}
                        placeholder="e.g. Toyota"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>

                {/* Model */}
                <View style={styles.field}>
                    <Text style={styles.label}>Model *</Text>
                    <TextInput
                        style={styles.input}
                        value={model}
                        onChangeText={setModel}
                        placeholder="e.g. Hiace"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>

                {/* Year */}
                <View style={styles.field}>
                    <Text style={styles.label}>Year *</Text>
                    <TextInput
                        style={styles.input}
                        value={year}
                        onChangeText={setYear}
                        placeholder="e.g. 2024"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                        maxLength={4}
                    />
                </View>

                {/* Plate */}
                <View style={styles.field}>
                    <Text style={styles.label}>License Plate *</Text>
                    <TextInput
                        style={styles.input}
                        value={plate}
                        onChangeText={setPlate}
                        placeholder="e.g. CF 1234"
                        placeholderTextColor={Colors.textMuted}
                        autoCapitalize="characters"
                    />
                </View>

                {/* Type */}
                <View style={styles.field}>
                    <Text style={styles.label}>Vehicle Type *</Text>
                    <View style={styles.typeRow}>
                        {VEHICLE_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
                                onPress={() => setSelectedType(type)}
                            >
                                <Text style={[styles.typeChipText, selectedType === type && styles.typeChipTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Fitness Expiry */}
                <View style={styles.field}>
                    <Text style={styles.label}>Fitness Expiry Date</Text>
                    <DatePicker
                        value={fitnessExpiry}
                        onChange={setFitnessExpiry}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                {/* Insurance Expiry */}
                <View style={styles.field}>
                    <Text style={styles.label}>Insurance Expiry Date</Text>
                    <DatePicker
                        value={insuranceExpiry}
                        onChange={setInsuranceExpiry}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                {/* Registration Expiry */}
                <View style={styles.field}>
                    <Text style={styles.label}>Registration Expiry Date</Text>
                    <DatePicker
                        value={registrationExpiry}
                        onChange={setRegistrationExpiry}
                        placeholder="YYYY-MM-DD"
                    />
                </View>
            </Card>

            {/* Actions */}
            <View style={styles.actions}>
                <Button title="Add Vehicle" variant="primary" fullWidth onPress={handleSubmit} disabled={!isValid} />
                <Button title="Cancel" variant="ghost" fullWidth onPress={() => router.back()} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formCard: {
        gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    field: {
        gap: Spacing.xs,
    },
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
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    typeChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    typeChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    typeChipText: {
        ...Typography.captionBold,
        color: Colors.textMuted,
    },
    typeChipTextActive: {
        color: '#fff',
    },
    actions: {
        gap: Spacing.md,
    },
});
