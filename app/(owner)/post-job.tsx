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

const SCHEDULES = ['Daily', 'Monday - Friday', 'Weekends', 'Flexible'];
const REQUIREMENTS = ['Valid TLC License', 'Valid PPV License', '3+ years experience', '5+ years experience', 'Clean record', 'Own phone'];

export default function PostJobScreen() {
    const router = useRouter();
    const { addJob, vehicles } = useData();

    const [routeFrom, setRouteFrom] = useState('');
    const [routeTo, setRouteTo] = useState('');
    const [dailyPay, setDailyPay] = useState('');
    const [schedule, setSchedule] = useState('');
    const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');

    const isValid = routeFrom && routeTo && dailyPay && schedule;

    const toggleReq = (req: string) => {
        setSelectedReqs((prev) =>
            prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
        );
    };

    const handleSubmit = () => {
        if (!isValid) {
            Alert.alert('Missing Fields', 'Please fill in route, pay, and schedule.');
            return;
        }

        const vehicle = vehicles.find((v) => v.id === selectedVehicle);

        addJob({
            ownerId: 'owner1',
            ownerName: 'You',
            ownerRating: 4.9,
            ownerAvatar: 'YO',
            vehicleType: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Any Vehicle',
            vehiclePlate: vehicle?.plate || 'TBD',
            route: { from: routeFrom.trim(), to: routeTo.trim() },
            dailyPay: parseInt(dailyPay) || 0,
            schedule,
            requirements: selectedReqs,
            description: description || `Looking for a reliable driver for the ${routeFrom} to ${routeTo} route.`,
            postedDate: new Date().toISOString().split('T')[0],
            status: 'open',
            applicants: 0,
            isSmartMatch: false,
        });

        Alert.alert('Job Posted! 📋', `Your job listing for ${routeFrom} → ${routeTo} is now live. Drivers can now apply.`, [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    return (
        <ScreenWrapper title="Post a Job" subtitle="Create a new job listing for drivers">
            <Card variant="elevated" style={styles.formCard}>
                {/* Route */}
                <View style={styles.field}>
                    <Text style={styles.label}>Route *</Text>
                    <View style={styles.routeRow}>
                        <TextInput
                            style={[styles.input, styles.routeInput]}
                            value={routeFrom}
                            onChangeText={setRouteFrom}
                            placeholder="From (e.g. Kingston)"
                            placeholderTextColor={Colors.textMuted}
                        />
                        <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                        <TextInput
                            style={[styles.input, styles.routeInput]}
                            value={routeTo}
                            onChangeText={setRouteTo}
                            placeholder="To (e.g. Montego Bay)"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>
                </View>

                {/* Daily Pay */}
                <View style={styles.field}>
                    <Text style={styles.label}>Daily Pay (J$) *</Text>
                    <TextInput
                        style={styles.input}
                        value={dailyPay}
                        onChangeText={setDailyPay}
                        placeholder="e.g. 8500"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                    />
                </View>

                {/* Vehicle */}
                <View style={styles.field}>
                    <Text style={styles.label}>Vehicle</Text>
                    <View style={styles.typeRow}>
                        {vehicles.filter((v) => v.status === 'active').map((v) => (
                            <TouchableOpacity
                                key={v.id}
                                style={[styles.typeChip, selectedVehicle === v.id && styles.typeChipActive]}
                                onPress={() => setSelectedVehicle(v.id)}
                            >
                                <Text style={[styles.typeChipText, selectedVehicle === v.id && styles.typeChipTextActive]}>
                                    {v.plate}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Schedule */}
                <View style={styles.field}>
                    <Text style={styles.label}>Schedule *</Text>
                    <View style={styles.typeRow}>
                        {SCHEDULES.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.typeChip, schedule === s && styles.typeChipActive]}
                                onPress={() => setSchedule(s)}
                            >
                                <Text style={[styles.typeChipText, schedule === s && styles.typeChipTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Requirements */}
                <View style={styles.field}>
                    <Text style={styles.label}>Requirements</Text>
                    <View style={styles.typeRow}>
                        {REQUIREMENTS.map((req) => (
                            <TouchableOpacity
                                key={req}
                                style={[styles.reqChip, selectedReqs.includes(req) && styles.reqChipActive]}
                                onPress={() => toggleReq(req)}
                            >
                                <Ionicons
                                    name={selectedReqs.includes(req) ? 'checkmark-circle' : 'add-circle-outline'}
                                    size={14}
                                    color={selectedReqs.includes(req) ? '#fff' : Colors.success}
                                />
                                <Text style={[styles.reqText, selectedReqs.includes(req) && styles.reqTextActive]}>{req}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Additional details about the job..."
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
            </Card>

            <View style={styles.actions}>
                <Button title="Post Job" variant="primary" fullWidth onPress={handleSubmit} disabled={!isValid} />
                <Button title="Cancel" variant="ghost" fullWidth onPress={() => router.back()} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    formCard: { gap: Spacing.lg, marginBottom: Spacing.xl },
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
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    routeInput: { flex: 1 },
    textArea: { minHeight: 100, paddingTop: Spacing.md },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeChipText: { ...Typography.captionBold, color: Colors.textMuted },
    typeChipTextActive: { color: '#fff' },
    reqChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.successMuted,
        borderWidth: 1,
        borderColor: Colors.success + '40',
    },
    reqChipActive: { backgroundColor: Colors.success, borderColor: Colors.success },
    reqText: { ...Typography.small, color: Colors.success },
    reqTextActive: { color: '#fff' },
    actions: { gap: Spacing.md },
});
