import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { RoleProvider, useRole } from '../context/RoleContext';
import { DataProvider } from '../context/DataContext';
import { RegistrationProvider } from '../context/RegistrationContext';
import { Colors } from '../constants/Colors';

// Route groups share URLs (e.g. /jobs exists in both (driver) and (owner)),
// so guards must disable the inactive role's group for URLs to resolve correctly.
function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();
    const { activeView } = useRole();

    // Wait for the stored session before mounting routes, so deep links
    // resolve against the correct guards instead of falling back to index.
    if (isLoading) return null;

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Protected guard={isAuthenticated && activeView === 'driver'}>
                <Stack.Screen name="(driver)" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated && activeView === 'owner'}>
                <Stack.Screen name="(owner)" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen
                    name="(shared)"
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RoleProvider>
                <DataProvider>
                    <RegistrationProvider>
                        <RootNavigator />
                    </RegistrationProvider>
                </DataProvider>
            </RoleProvider>
        </AuthProvider>
    );
}
