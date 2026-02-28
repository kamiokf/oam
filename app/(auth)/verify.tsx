import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function VerifyScreen() {
    const router = useRouter();
    const { verifyOtp, isLoading } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-fill for demo
        const timer = setTimeout(() => {
            setCode(['1', '2', '3', '4', '5', '6']);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            const success = await verifyOtp(fullCode);
            if (success) {
                router.replace('/(driver)');
            } else {
                setError('Invalid code. Please try again.');
            }
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
                        Enter the 6-digit code sent to your phone
                    </Text>
                </View>

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

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.resend}>
                    <Text style={styles.resendText}>Didn't receive the code? </Text>
                    <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.bottom}>
                <Button
                    title="Verify"
                    onPress={handleVerify}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={fullCode.length < 6}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    codeInput: {
        flex: 1,
        height: 56,
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        textAlign: 'center',
        ...Typography.h2,
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
