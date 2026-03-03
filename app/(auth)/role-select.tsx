import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, UserRole } from '../../context/AuthContext';

interface RoleOption {
    id: UserRole;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    color: string;
    bgColor: string;
}

const roles: RoleOption[] = [
    {
        id: 'driver',
        icon: 'car-sport',
        title: 'I\'m a Driver',
        description: 'Find vehicles to drive, manage your earnings, and build your reputation',
        color: Colors.primary,
        bgColor: Colors.primaryMuted,
    },
    {
        id: 'owner',
        icon: 'business',
        title: 'I\'m an Owner',
        description: 'Manage your fleet, recruit drivers, and track your revenue',
        color: Colors.secondary,
        bgColor: Colors.secondaryMuted,
    },
    {
        id: 'both',
        icon: 'swap-horizontal',
        title: 'Both',
        description: 'Drive vehicles and manage your own fleet with seamless role switching',
        color: Colors.accent,
        bgColor: Colors.accentMuted,
    },
];

export default function RoleSelectScreen() {
    const router = useRouter();
    const { setUserRole } = useAuth();
    const [selected, setSelected] = useState<UserRole | null>(null);

    const handleContinue = () => {
        if (selected) {
            setUserRole(selected);
            router.replace(selected === 'owner' ? '/(owner)' : '/(driver)');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>How will you{'\n'}use One'N'Move?</Text>
                    <Text style={styles.subtitle}>
                        Choose your role. You can always change this later.
                    </Text>
                </View>

                <View style={styles.roles}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={[styles.roleCard, selected === role.id && { borderColor: role.color, backgroundColor: role.bgColor }]}
                            onPress={() => setSelected(role.id)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.roleIcon, { backgroundColor: role.bgColor }]}>
                                <Ionicons name={role.icon} size={28} color={role.color} />
                            </View>
                            <View style={styles.roleText}>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDesc}>{role.description}</Text>
                            </View>
                            <View style={[styles.radio, selected === role.id && { borderColor: role.color }]}>
                                {selected === role.id && <View style={[styles.radioInner, { backgroundColor: role.color }]} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.bottom}>
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    size="lg"
                    fullWidth
                    disabled={!selected}
                />
            </View>
        </View>
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
        paddingTop: 80,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    content: {
        gap: Spacing['3xl'],
    },
    header: {
        gap: Spacing.md,
    },
    title: {
        ...Typography.hero,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    roles: {
        gap: Spacing.lg,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        gap: Spacing.lg,
    },
    roleIcon: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleText: {
        flex: 1,
        gap: Spacing.xs,
    },
    roleTitle: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },
    roleDesc: {
        ...Typography.caption,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    bottom: {
        gap: Spacing.lg,
    },
});
