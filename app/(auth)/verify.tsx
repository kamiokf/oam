import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ role: string; phone: string }>();
    const { verifyOtp, isLoading, isNewUser, user } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const role = params.role || 'driver';
    const phone = params.phone || '';
    const maxAttempts = 3;

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Lockout timer
    useEffect(() => {
        if (!lockedUntil) return;
        const remaining = lockedUntil - Date.now();
        if (remaining <= 0) {
            setLockedUntil(null);
            setAttempts(0);
            return;
        }
        const timer = setTimeout(() => {
            setLockedUntil(null);
            setAttempts(0);
        }, remaining);
        return () => clearTimeout(timer);
    }, [lockedUntil]);

    // Auto-fill removed — real SMS codes are now sent via Firebase Phone Auth

    const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
    const lockRemaining = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 60000) : 0;

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        setError('');

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerify = async () => {
        if (isLocked) return;

        const fullCode = code.join('');
        if (fullCode.length === 6) {
            const success = await verifyOtp(fullCode);
            if (success) {
                if (isNewUser) {
                    // Route to registration (new user flow)
                    router.replace(`/(auth)/register-details?role=${role}&phone=${encodeURIComponent(phone)}`);
                } else {
                    // Existing user
                    router.replace(user?.role === 'owner' ? '/(owner)' : '/(driver)');
                }
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                if (newAttempts >= maxAttempts) {
                    setLockedUntil(Date.now() + 15 * 60 * 1000); // 15 min lockout
                    setError('Too many attempts. Please try again in 15 minutes.');
                } else {
                    setError(`Invalid code. ${maxAttempts - newAttempts} attempt(s) remaining.`);
                }
            }
        }
    };

    const handleResend = () => {
        if (canResend && !isLocked) {
            setCountdown(60);
            setCanResend(false);
            setCode(['', '', '', '', '', '']);
            setError('');
        }
    };

    const fullCode = code.join('');

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verify your{'\n'}phone number</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to {phone || 'your phone'}
                    </Text>
                </View>

                {isLocked ? (
                    <View style={styles.lockoutBox}>
                        <Ionicons name="lock-closed" size={32} color={Colors.error} />
                        <Text style={styles.lockoutText}>
                            Too many failed attempts.{'\n'}Try again in ~{lockRemaining} minute(s).
                        </Text>
                    </View>
                ) : (
                    <View style={styles.codeContainer}>
                        {code.map((digit, i) => (
                            <TextInput
                                key={i}
                                ref={(ref) => { inputRefs.current[i] = ref; }}
                                style={[styles.codeInput, digit && styles.codeInputFilled, error && styles.codeInputError]}
                                value={digit}
                                onChangeText={(text) => handleCodeChange(text, i)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                )}

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.resend} onPress={handleResend} disabled={!canResend || isLocked}>
                    {canResend ? (
                        <>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <Text style={styles.resendLink}>Resend</Text>
                        </>
                    ) : (
                        <Text style={styles.resendText}>
                            Resend code in {countdown}s
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.bottom}>
                <Button
                    title="Verify"
                    onPress={handleVerify}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={fullCode.length < 6 || isLocked}
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
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    codeInput: {
        width: 44,
        maxWidth: 56,
        height: 52,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700' as const,
        color: Colors.textPrimary,
    },
    codeInputFilled: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryMuted,
    },
    codeInputError: {
        borderColor: Colors.error,
    },
    error: {
        ...Typography.caption,
        color: Colors.error,
        textAlign: 'center',
        marginTop: -Spacing.xl,
    },
    lockoutBox: {
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.surfaceLight,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.error + '40',
    },
    lockoutText: {
        ...Typography.body,
        color: Colors.error,
        textAlign: 'center',
        lineHeight: 22,
    },
    resend: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    resendText: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    resendLink: {
        ...Typography.bodyBold,
        color: Colors.secondary,
    },
    bottom: {
        gap: Spacing.lg,
    },
});
