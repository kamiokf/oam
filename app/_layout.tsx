import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { RoleProvider } from '../context/RoleContext';
import { DataProvider } from '../context/DataContext';
import { RegistrationProvider } from '../context/RegistrationContext';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
    return (
        <AuthProvider>
            <RoleProvider>
                <DataProvider>
                    <RegistrationProvider>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: Colors.background },
                                animation: 'slide_from_right',
                            }}
                        >
                            <Stack.Screen name="index" />
                            <Stack.Screen name="(auth)" />
                            <Stack.Screen name="(driver)" />
                            <Stack.Screen name="(owner)" />
                            <Stack.Screen
                                name="(shared)"
                                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                            />
                        </Stack>
                    </RegistrationProvider>
                </DataProvider>
            </RoleProvider>
        </AuthProvider>
    );
}
