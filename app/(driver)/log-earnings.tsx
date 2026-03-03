import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { showAlert } from '../../utils/alert';

export default function LogEarningsScreen() {
    const router = useRouter();
    const { addEarning } = useData();

    const [routeFrom, setRouteFrom] = useState('Kingston');
    const [routeTo, setRouteTo] = useState('Spanish Town');
    const [amount, setAmount] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('CF 1234');
    const [trips, setTrips] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const isValid = amount && trips;

    const handleSubmit = () => {
        if (!isValid) {
            showAlert('Missing Fields', 'Please enter amount and number of trips.');
            return;
        }

        addEarning({
            date,
            amount: parseInt(amount) || 0,
            route: { from: routeFrom.trim(), to: routeTo.trim() },
            vehiclePlate: vehiclePlate.trim(),
            status: 'pending',
            trips: parseInt(trips) || 0,
        });

        showAlert(
            'Earnings Logged! 💰',
            `J$${parseInt(amount).toLocaleString()} from ${trips} trips recorded for ${date}.`,
            [{ text: 'OK', onPress: () => router.back() }]
        );
    };

    return (
        <ScreenWrapper title="Log Earnings" subtitle="Record today's earnings">
            <Card variant="elevated" style={styles.formCard}>
                {/* Date */}
                <View style={styles.field}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>

                {/* Route */}
                <View style={styles.field}>
                    <Text style={styles.label}>Route</Text>
                    <View style={styles.routeRow}>
                        <TextInput
                            style={[styles.input, styles.routeInput]}
                            value={routeFrom}
                            onChangeText={setRouteFrom}
                            placeholder="From"
                            placeholderTextColor={Colors.textMuted}
                        />
                        <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                        <TextInput
                            style={[styles.input, styles.routeInput]}
                            value={routeTo}
                            onChangeText={setRouteTo}
                            placeholder="To"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>
                </View>

                {/* Amount */}
                <View style={styles.field}>
                    <Text style={styles.label}>Total Amount (J$) *</Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="e.g. 8500"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                    />
                </View>

                {/* Vehicle */}
                <View style={styles.field}>
                    <Text style={styles.label}>Vehicle Plate</Text>
                    <TextInput
                        style={styles.input}
                        value={vehiclePlate}
                        onChangeText={setVehiclePlate}
                        placeholder="e.g. CF 1234"
                        placeholderTextColor={Colors.textMuted}
                        autoCapitalize="characters"
                    />
                </View>

                {/* Trips */}
                <View style={styles.field}>
                    <Text style={styles.label}>Number of Trips *</Text>
                    <TextInput
                        style={styles.input}
                        value={trips}
                        onChangeText={setTrips}
                        placeholder="e.g. 6"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                        maxLength={2}
                    />
                </View>
            </Card>

            <View style={styles.actions}>
                <Button title="Log Earnings" variant="primary" fullWidth onPress={handleSubmit} disabled={!isValid} />
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
    actions: { gap: Spacing.md },
});
