import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Set up your{'\n'}profile</Text>
                    <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
                </View>

                <View style={styles.avatarSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={40} color={Colors.textMuted} />
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.avatarAction}>Add Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Input label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} />
                    <Input label="Email (Optional)" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
                </View>
            </View>

            <View style={styles.bottom}>
                <Button
                    title="Complete Setup"
                    onPress={() => router.replace('/(driver)')}
                    size="lg"
                    fullWidth
                    disabled={!name}
                />
                <TouchableOpacity onPress={() => router.replace('/(driver)')}>
                    <Text style={styles.skip}>Skip for now</Text>
                </TouchableOpacity>
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
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    back: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    content: {
        flex: 1,
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
    avatarSection: {
        alignItems: 'center',
        gap: Spacing.md,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surfaceLight,
        borderWidth: 2,
        borderColor: Colors.surfaceBorder,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarAction: {
        ...Typography.bodyBold,
        color: Colors.secondary,
    },
    form: {
        gap: Spacing.xl,
    },
    bottom: {
        gap: Spacing.lg,
        alignItems: 'center',
    },
    skip: {
        ...Typography.bodyBold,
        color: Colors.textMuted,
    },
});
