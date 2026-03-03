import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { useData } from '../../context/DataContext';
import { showAlert } from '../../utils/alert';

const VEHICLE_TYPES = ['Minibus', 'Bus', 'Car', 'Coaster', 'SUV'];
const VEHICLE_STATUSES = ['active', 'maintenance', 'inactive'];

export default function EditVehicleScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { vehicles, editVehicle } = useData();

    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [plate, setPlate] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [fitnessExpiry, setFitnessExpiry] = useState('');
    const [insuranceExpiry, setInsuranceExpiry] = useState('');
    const [registrationExpiry, setRegistrationExpiry] = useState('');

    useEffect(() => {
        const vehicle = vehicles.find(v => v.id === id);
        if (vehicle) {
            setMake(vehicle.make);
            setModel(vehicle.model);
            setYear(vehicle.year.toString());
            setPlate(vehicle.plate);
            setSelectedType(vehicle.type);
            setSelectedStatus(vehicle.status);
            setFitnessExpiry(vehicle.fitnessExpiry);
            setInsuranceExpiry(vehicle.insuranceExpiry);
            setRegistrationExpiry(vehicle.registrationExpiry || '');
        } else {
            router.back();
        }
    }, [id, vehicles]);

    const isValid = make && model && year && plate && selectedType && selectedStatus;

    const handleSubmit = () => {
        if (!isValid) {
            showAlert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        editVehicle(id as string, {
            make: make.trim(),
            model: model.trim(),
            year: parseInt(year) || 2024,
            plate: plate.trim().toUpperCase(),
            type: selectedType,
            status: selectedStatus as any,
            fitnessExpiry: fitnessExpiry || '2027-01-01',
            insuranceExpiry: insuranceExpiry || '2027-01-01',
            registrationExpiry: registrationExpiry || '2027-01-01',
        });

        showAlert('Vehicle Updated!', `Successfully updated ${make} ${model}.`, [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    return (
        <ScreenWrapper title="Edit Vehicle" subtitle="Update details for your vehicle">
            <Card variant="elevated" style={styles.formCard}>
                <View style={styles.field}>
                    <Text style={styles.label}>Make *</Text>
                    <TextInput style={styles.input} value={make} onChangeText={setMake} />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Model *</Text>
                    <TextInput style={styles.input} value={model} onChangeText={setModel} />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Year *</Text>
                    <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="number-pad" />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>License Plate *</Text>
                    <TextInput style={styles.input} value={plate} onChangeText={setPlate} autoCapitalize="characters" />
                </View>

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

                <View style={styles.field}>
                    <Text style={styles.label}>Status *</Text>
                    <View style={styles.typeRow}>
                        {VEHICLE_STATUSES.map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[styles.typeChip, selectedStatus === status && styles.typeChipActive]}
                                onPress={() => setSelectedStatus(status)}
                            >
                                <Text style={[styles.typeChipText, selectedStatus === status && styles.typeChipTextActive]}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Fitness Expiry Date</Text>
                    <DatePicker
                        value={fitnessExpiry}
                        onChange={setFitnessExpiry}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Insurance Expiry Date</Text>
                    <DatePicker
                        value={insuranceExpiry}
                        onChange={setInsuranceExpiry}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Registration Expiry Date</Text>
                    <DatePicker
                        value={registrationExpiry}
                        onChange={setRegistrationExpiry}
                        placeholder="YYYY-MM-DD"
                    />
                </View>
            </Card>

            <View style={styles.actions}>
                <Button title="Save Changes" variant="primary" fullWidth onPress={handleSubmit} disabled={!isValid} />
                <Button title="Cancel" variant="ghost" fullWidth onPress={() => router.back()} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formCard: { gap: Spacing.lg, marginBottom: Spacing.xl },
    field: { gap: Spacing.xs },
    label: { ...Typography.captionBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { ...Typography.body, color: Colors.textPrimary, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.surfaceBorder },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder },
    typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeChipText: { ...Typography.captionBold, color: Colors.textMuted },
    typeChipTextActive: { color: '#fff' },
    actions: { gap: Spacing.md },
});
