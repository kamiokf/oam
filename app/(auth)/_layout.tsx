import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="verify" />
            <Stack.Screen name="register-details" />
            <Stack.Screen name="register-licensing" />
            <Stack.Screen name="register-terms" />
            <Stack.Screen name="register-welcome" options={{ gestureEnabled: false }} />
            <Stack.Screen name="role-select" />
            <Stack.Screen name="profile-setup" />
        </Stack>
    );
}
