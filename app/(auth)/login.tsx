import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';


export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ role: string }>();
    const { login, isLoading } = useAuth();
    const [phone, setPhone] = useState('');
    const role = params.role || 'driver';

    const handleContinue = async () => {
        if (phone.length >= 7) {
            // Normalize phone to match database storing format
            const cleanPhone = phone.replace(/\D/g, '');
            const formattedPhone = `+1 876 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 7)}`;

            try {
                await login(formattedPhone);
                router.push(`/(auth)/verify?role=${role}&phone=${encodeURIComponent(formattedPhone)}`);
            } catch (error: any) {
                const message = error?.message || 'Failed to send verification code. Please try again.';
                if (Platform.OS === 'web') {
                    window.alert(message);
                } else {
                    Alert.alert('Error', message);
                }
            }
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

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome back{'\n'}or join us</Text>
                    <Text style={styles.subtitle}>
                        Enter your phone number. We'll send a code to log you in or start your registration.
                    </Text>
                </View>

                <View style={styles.phoneInput}>
                    <View style={styles.countryCode}>
                        <Text style={styles.flag}>🇯🇲</Text>
                        <Text style={styles.code}>+1 876</Text>
                        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
                    </View>
                    <Input
                        placeholder="555 0100"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                </View>
            </View>

            <View style={styles.bottom}>
                <Button
                    title="Send OTP"
                    onPress={handleContinue}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={phone.length < 7}
                />
            </View>

            {/* Invisible reCAPTCHA container for Firebase Phone Auth on web */}
            {Platform.OS === 'web' && <View nativeID="recaptcha-container" />}
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
        marginBottom: Spacing['3xl'],
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
        lineHeight: 24,
    },
    phoneInput: {
        flexDirection: 'row',
        gap: Spacing.md,
        alignItems: 'center',
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        paddingVertical: Spacing.md + 2,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    flag: {
        fontSize: 20,
    },
    code: {
        ...Typography.bodyBold,
        color: Colors.textPrimary,
    },
    input: {
        flex: 1,
    },
    bottom: {
        gap: Spacing.lg,
    },
});
